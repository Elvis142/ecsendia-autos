'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bot,
  ExternalLink,
  Settings,
  Play,
  Loader2,
  Car,
  TrendingDown,
  X,
  CheckCircle,
  Clock,
  Bookmark,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { formatUSD, formatNaira } from '@/lib/formatting';
import { cn } from '@/lib/utils';

type TabValue = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SAVED';

interface PriceHistoryEntry {
  price: number;
  date: string;
}

interface AISuggestion {
  id: string;
  title: string;
  price: number;
  location: string;
  mileage?: number;
  year?: number;
  make?: string;
  model?: string;
  description?: string;
  sourceUrl: string;
  photos: string[];
  opportunityScore: number;
  scoreReasons: string[];
  priceHistory: PriceHistoryEntry[];
  status: TabValue;
  createdAt: string;
}

/** Parse the structured description blocks built by the agent */
function parseDescription(raw?: string): { attrs: string[]; sellerText: string } {
  if (!raw) return { attrs: [], sellerText: '' };
  const attrsMatch = raw.match(/---\s*Vehicle Details\s*---\n([\s\S]*?)(?=\n---|\s*$)/i);
  // Only show actual Seller Description — not "Listing Text" which is raw card metadata
  const sellerMatch = raw.match(/---\s*Seller Description\s*---\n([\s\S]*?)(?=\n---|\s*$)/i);
  const attrs = attrsMatch
    ? attrsMatch[1].split('\n').map(l => l.trim()).filter(Boolean)
    : [];
  const sellerText = sellerMatch ? sellerMatch[1].trim() : '';
  return { attrs, sellerText };
}

const TABS: { label: string; value: TabValue; icon: React.ElementType }[] = [
  { label: 'New Suggestions', value: 'PENDING', icon: Clock },
  { label: 'Approved', value: 'APPROVED', icon: CheckCircle },
  { label: 'Rejected', value: 'REJECTED', icon: XCircle },
  { label: 'Saved for Later', value: 'SAVED', icon: Bookmark },
];

const scoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const scoreDotColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const hasPriceDrop = (history: PriceHistoryEntry[]) => {
  if (!history || history.length < 2) return false;
  return history[history.length - 1].price < history[0].price;
};

interface RejectModalProps {
  suggestion: AISuggestion;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

function RejectModal({ suggestion, onConfirm, onClose }: RejectModalProps) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Reject Suggestion</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Rejecting: <strong>{suggestion.title}</strong>
        </p>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why is this suggestion not suitable?"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

interface RunStatus {
  isRunning: boolean;
  latestRun: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    listingsFound: number | null;
    listingsQueued: number | null;
    error: string | null;
  } | null;
}

export default function AISourcePage() {
  const [activeTab, setActiveTab] = useState<TabValue>('PENDING');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<RunStatus>({ isRunning: false, latestRun: null });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AISuggestion | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [photoIndexes, setPhotoIndexes] = useState<Record<string, number>>({});
  // Photos the admin has removed per suggestion (not persisted — only affects what gets imported)
  const [removedPhotos, setRemovedPhotos] = useState<Record<string, string[]>>({});
  const [usdRate, setUsdRate] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasRunningRef = useRef(false);

  // Persist USD exchange rate in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ecsendia_usd_rate');
    if (stored) setUsdRate(Number(stored));
  }, []);
  useEffect(() => {
    if (usdRate > 0) localStorage.setItem('ecsendia_usd_rate', String(usdRate));
  }, [usdRate]);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-sourcing?status=${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const json = await res.json();
      setSuggestions(json.suggestions || []);
    } catch {
      toast.error('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Poll run status every 5 seconds; auto-refresh when run completes
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ai-sourcing/status');
      if (!res.ok) return;
      const data: RunStatus = await res.json();
      setRunStatus(data);

      // Detect transition: was running → now done
      if (wasRunningRef.current && !data.isRunning) {
        wasRunningRef.current = false;
        const run = data.latestRun;
        if (run?.status === 'COMPLETED') {
          toast.success(
            `Search complete — found ${run.listingsFound ?? 0} listings, queued ${run.listingsQueued ?? 0} new suggestions`
          );
          fetchSuggestions();
        } else if (run?.status === 'FAILED') {
          toast.error(`Search failed: ${run.error || 'Unknown error'}`);
        }
      }

      if (data.isRunning) {
        wasRunningRef.current = true;
      }
    } catch {
      // silently ignore polling errors
    }
  }, [fetchSuggestions]);

  useEffect(() => {
    checkStatus(); // check immediately on mount
    pollRef.current = setInterval(checkStatus, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkStatus]);

  const handleRunSearch = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/ai-sourcing/run', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to run AI search');
        return;
      }
      toast.success('AI search started. Results will appear automatically when done.');
      wasRunningRef.current = true;
    } catch {
      toast.error('Failed to run AI search');
    } finally {
      setRunning(false);
    }
  };

  const handleAction = async (
    suggestion: AISuggestion,
    action: 'approve_draft' | 'approve_publish' | 'save' | 'reject',
    reason?: string
  ) => {
    setActionLoading(`${suggestion.id}-${action}`);
    try {
      let res: Response;
      if (action === 'approve_draft' || action === 'approve_publish') {
        // Pass the curated photo list (excluding ones the admin removed from the carousel)
        const removedSet = new Set(removedPhotos[suggestion.id] ?? []);
        const keptPhotos = suggestion.photos.filter((url) => !removedSet.has(url));
        // Convert USD price to Naira if a rate is set
        const nairaPrice =
          usdRate > 0 && suggestion.price > 0
            ? Math.round(suggestion.price * usdRate)
            : suggestion.price;
        res = await fetch(`/api/admin/ai-sourcing/${suggestion.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publish: action === 'approve_publish', photos: keptPhotos, price: nairaPrice }),
        });
      } else {
        res = await fetch(`/api/admin/ai-sourcing/${suggestion.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ saveForLater: action === 'save', reason }),
        });
      }
      if (!res.ok) throw new Error('Action failed');
      const messages: Record<string, string> = {
        approve_draft: 'Added to inventory as Draft',
        approve_publish: 'Added to inventory and Published',
        save: 'Saved for later',
        reject: 'Suggestion rejected',
      };
      toast.success(messages[action]);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      if (rejectTarget) setRejectTarget(null);
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClear = async () => {
    if (!confirm(`Clear all ${activeTab.toLowerCase()} suggestions? This cannot be undone.`)) return;
    setClearing(true);
    try {
      const res = await fetch(`/api/admin/ai-sourcing?status=${activeTab}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`Cleared ${data.deleted} suggestion${data.deleted !== 1 ? 's' : ''}`);
      setSuggestions([]);
    } catch {
      toast.error('Failed to clear suggestions');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-maroon-700" />
            AI Sourcing
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-powered car suggestions from Facebook Marketplace
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* USD → Naira exchange rate input */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm text-amber-700 font-medium whitespace-nowrap">1 USD =</span>
            <input
              type="number"
              min={0}
              value={usdRate || ''}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              placeholder="e.g. 1620"
              className="w-24 text-sm font-bold text-amber-900 bg-transparent focus:outline-none placeholder:text-amber-300 placeholder:font-normal"
            />
            <span className="text-sm text-amber-700 font-medium">₦</span>
          </div>
          <Link
            href="/admin/ai-sourcing/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleRunSearch}
            disabled={running || runStatus.isRunning}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
          >
            {running || runStatus.isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {running || runStatus.isRunning ? 'Running...' : 'Run AI Search'}
          </button>
        </div>
      </div>

      {/* In-progress banner */}
      {runStatus.isRunning && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <span className="font-semibold">Search in progress</span>
            <span className="text-blue-600 ml-2">
              Visiting each listing page to collect full details — this takes 3–5 minutes. Stay on this page or come back later; results appear automatically.
            </span>
          </div>
          <button
            onClick={fetchSuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      )}

      {/* Last run summary (when not running) */}
      {!runStatus.isRunning && runStatus.latestRun && (
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          <Clock className="w-3.5 h-3.5" />
          Last run:{' '}
          {runStatus.latestRun.completedAt
            ? new Date(runStatus.latestRun.completedAt).toLocaleString('en-NG')
            : 'in progress'}{' '}
          {runStatus.latestRun.status === 'COMPLETED' && (
            <span className="text-emerald-600 font-medium">
              — {runStatus.latestRun.listingsFound ?? 0} found,{' '}
              {runStatus.latestRun.listingsQueued ?? 0} queued
            </span>
          )}
          {runStatus.latestRun.status === 'FAILED' && (
            <span className="text-red-600 font-medium">— Failed</span>
          )}
        </div>
      )}

      {/* Tabs + Clear button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.value
                    ? 'bg-white text-maroon-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        {suggestions.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            Clear {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bot className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium text-lg">No suggestions here</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === 'PENDING'
              ? 'Run AI Search to find new car opportunities'
              : `No ${activeTab.toLowerCase()} suggestions yet`}
          </p>
          {activeTab === 'PENDING' && (
            <button
              onClick={handleRunSearch}
              disabled={running}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white text-sm rounded-lg hover:bg-maroon-800 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run AI Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {suggestions.map((suggestion) => {
            const mainPhoto = suggestion.photos?.[0];
            const priceDrop = hasPriceDrop(suggestion.priceHistory);
            const isActing = (action: string) =>
              actionLoading === `${suggestion.id}-${action}`;

            return (
              <div
                key={suggestion.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Photo carousel */}
                {(() => {
                  // Filter out photos the admin has removed
                  const removedSet = new Set(removedPhotos[suggestion.id] ?? []);
                  const photos = suggestion.photos.filter((u) => u && !removedSet.has(u));
                  const idx = Math.min(photoIndexes[suggestion.id] ?? 0, Math.max(photos.length - 1, 0));
                  const currentPhoto = photos[idx];
                  const total = photos.length;
                  const prev = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setPhotoIndexes((p) => ({ ...p, [suggestion.id]: (idx - 1 + total) % total }));
                  };
                  const next = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setPhotoIndexes((p) => ({ ...p, [suggestion.id]: (idx + 1) % total }));
                  };
                  const removeCurrentPhoto = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!currentPhoto) return;
                    setRemovedPhotos((prev) => ({
                      ...prev,
                      [suggestion.id]: [...(prev[suggestion.id] ?? []), currentPhoto],
                    }));
                    // Clamp index so we don't land out of bounds
                    const newTotal = total - 1;
                    if (newTotal > 0) {
                      setPhotoIndexes((p) => ({ ...p, [suggestion.id]: Math.min(idx, newTotal - 1) }));
                    }
                  };
                  return (
                    <div className="relative w-full aspect-[16/9] bg-gray-100">
                      {currentPhoto && !brokenImages.has(`${suggestion.id}-${idx}`) ? (
                        <Image
                          key={currentPhoto}
                          src={currentPhoto}
                          alt={`${suggestion.title} photo ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          onError={() =>
                            setBrokenImages((prev) => new Set([...prev, `${suggestion.id}-${idx}`]))
                          }
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Car className="w-10 h-10 text-gray-300" />
                        </div>
                      )}

                      {/* Prev / Next arrows */}
                      {total > 1 && (
                        <>
                          <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Remove current photo button — only on actionable tabs */}
                      {(activeTab === 'PENDING' || activeTab === 'SAVED') && currentPhoto && (
                        <button
                          onClick={removeCurrentPhoto}
                          title="Remove this photo"
                          className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Score Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                            scoreColor(suggestion.opportunityScore)
                          )}
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              scoreDotColor(suggestion.opportunityScore)
                            )}
                          />
                          {suggestion.opportunityScore}/100
                        </span>
                      </div>

                      {/* Price Drop */}
                      {priceDrop && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                            <TrendingDown className="w-3 h-3" />
                            Price Drop
                          </span>
                        </div>
                      )}

                      {/* Photo counter */}
                      {total > 1 && (
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                            {idx + 1} / {total}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">
                      {suggestion.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
                      {suggestion.year && <span>{suggestion.year}</span>}
                      {suggestion.mileage && (
                        <span>{suggestion.mileage.toLocaleString()} mi</span>
                      )}
                      {suggestion.location && <span>{suggestion.location}</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-500">
                      {formatUSD(suggestion.price)}
                    </p>
                    {usdRate > 0 && suggestion.price > 0 ? (
                      <p className="text-xl font-bold text-maroon-700">
                        {formatNaira(Math.round(suggestion.price * usdRate))}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 font-medium">Set USD rate above to convert price</p>
                    )}
                  </div>

                  {/* Vehicle details + seller description */}
                  {(() => {
                    const { attrs, sellerText } = parseDescription(suggestion.description);
                    return (
                      <>
                        {attrs.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                            {attrs.map((attr, i) => (
                              <div key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className="text-gray-400 mt-0.5 flex-shrink-0">›</span>
                                {attr}
                              </div>
                            ))}
                          </div>
                        )}
                        {sellerText && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                              Seller Says
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                              {sellerText}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Price History */}
                  {priceDrop && suggestion.priceHistory.length >= 2 && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      <span className="font-medium">Original:</span>{' '}
                      {formatUSD(suggestion.priceHistory[0].price)}
                      {' → '}
                      <span className="font-medium text-emerald-700">
                        {formatUSD(
                          suggestion.priceHistory[suggestion.priceHistory.length - 1].price
                        )}
                      </span>
                    </div>
                  )}

                  {/* Source Link */}
                  {suggestion.sourceUrl && (
                    <a
                      href={suggestion.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Original Listing
                    </a>
                  )}

                  {/* Action Buttons — PENDING and SAVED tabs */}
                  {(activeTab === 'PENDING' || activeTab === 'SAVED') && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleAction(suggestion, 'approve_draft')}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isActing('approve_draft') ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Approve Draft
                      </button>
                      <button
                        onClick={() => handleAction(suggestion, 'approve_publish')}
                        disabled={!!actionLoading}
                        className="flex items-center justify-center gap-1.5 px-2 py-2 bg-maroon-700 text-white text-xs font-medium rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
                      >
                        {isActing('approve_publish') ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Publish
                      </button>
                      {activeTab === 'PENDING' && (
                        <button
                          onClick={() => handleAction(suggestion, 'save')}
                          disabled={!!actionLoading}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          {isActing('save') ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Bookmark className="w-3 h-3" />
                          )}
                          Save for Later
                        </button>
                      )}
                      <button
                        onClick={() => setRejectTarget(suggestion)}
                        disabled={!!actionLoading}
                        className={cn(
                          'flex items-center justify-center gap-1.5 px-2 py-2 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50',
                          activeTab === 'SAVED' && 'col-span-2'
                        )}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Status badges for Approved and Rejected tabs */}
                  {(activeTab === 'APPROVED' || activeTab === 'REJECTED') && (
                    <div className="pt-1">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                          activeTab === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {activeTab === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                        {activeTab === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          suggestion={rejectTarget}
          onConfirm={(reason) => handleAction(rejectTarget, 'reject', reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
