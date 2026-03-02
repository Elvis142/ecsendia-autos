'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Plus,
  X,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIConfig {
  city: string;
  state: string;
  zipCode: string;
  searchRadius: number;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  maxMileage: number;
  keywords: string[];
  excludeKeywords: string[];
  preferredMakes: string[];
  preferredModels: string[];
  resultsPerDay: number;
  minOpportunityScore: number;
  emailNotifications: boolean;
  adminEmail: string;
  smsNotifications: boolean;
  adminPhone: string;
  scheduledTime: string;
  isActive: boolean;
  fbCookies: string;
}

interface RunLog {
  id: string;
  createdAt: string;
  status: 'SUCCESS' | 'ERROR' | 'RUNNING';
  found: number;
  queued: number;
  errors: number;
  message?: string;
}

const defaultConfig: AIConfig = {
  city: '',
  state: '',
  zipCode: '',
  searchRadius: 50,
  minPrice: 0,
  maxPrice: 10000000,
  minYear: 2010,
  maxYear: new Date().getFullYear(),
  maxMileage: 150000,
  keywords: [],
  excludeKeywords: [],
  preferredMakes: [],
  preferredModels: [],
  resultsPerDay: 20,
  minOpportunityScore: 60,
  emailNotifications: false,
  adminEmail: '',
  smsNotifications: false,
  adminPhone: '',
  scheduledTime: '09:00',
  isActive: true,
  fbCookies: '',
};

const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 transition bg-white';

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) {
      onChange([...tags, t]);
      setInput('');
    }
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder || 'Type and press Enter'}
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2.5 bg-maroon-700/10 text-maroon-700 rounded-lg hover:bg-maroon-700/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-maroon-700/10 text-maroon-700 text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-maroon-700/60 hover:text-maroon-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const runLogStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case 'ERROR':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'RUNNING':
      return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
    default:
      return null;
  }
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AISourceSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runLogs, setRunLogs] = useState<RunLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/ai-sourcing/config');
        if (!res.ok) return;
        const data = await res.json();
        setConfig({ ...defaultConfig, ...data });
      } catch {}
      finally {
        setLoading(false);
      }
    };
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/ai-sourcing/logs?limit=10');
        if (!res.ok) return;
        const data = await res.json();
        setRunLogs(data.logs || []);
      } catch {}
      finally {
        setLogsLoading(false);
      }
    };
    fetchConfig();
    fetchLogs();
  }, []);

  const update = <K extends keyof AIConfig>(key: K, value: AIConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ai-sourcing/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/ai-sourcing')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Search Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure how the AI searches for car opportunities
          </p>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">AI Search Active</p>
          <p className="text-sm text-gray-500">
            Enable or disable the automated AI search
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) => update('isActive', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-maroon-700 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {config.isActive ? 'Active' : 'Inactive'}
          </span>
        </label>
      </div>

      {/* Search Settings */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Search Location
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={config.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. Lagos"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              value={config.state}
              onChange={(e) => update('state', e.target.value)}
              placeholder="e.g. Lagos State"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Zip Code</label>
            <input
              type="text"
              value={config.zipCode}
              onChange={(e) => update('zipCode', e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Search Radius: <span className="text-maroon-700 font-semibold">{config.searchRadius} miles</span>
            </label>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={config.searchRadius}
            onChange={(e) => update('searchRadius', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-maroon-700"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5 miles</span>
            <span>100 miles</span>
          </div>
        </div>
      </section>

      {/* Budget */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Budget Range ($)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Min Price ($)</label>
            <input
              type="number"
              value={config.minPrice}
              onChange={(e) => update('minPrice', Number(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Max Price ($)</label>
            <input
              type="number"
              value={config.maxPrice}
              onChange={(e) => update('maxPrice', Number(e.target.value))}
              placeholder="20000"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Vehicle Filters */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Vehicle Filters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Min Year</label>
            <input
              type="number"
              value={config.minYear}
              onChange={(e) => update('minYear', Number(e.target.value))}
              min={1990}
              max={new Date().getFullYear()}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Max Year</label>
            <input
              type="number"
              value={config.maxYear}
              onChange={(e) => update('maxYear', Number(e.target.value))}
              min={1990}
              max={new Date().getFullYear() + 1}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Max Mileage (miles)</label>
            <input
              type="number"
              value={config.maxMileage}
              onChange={(e) => update('maxMileage', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TagInput
            label="Preferred Makes"
            tags={config.preferredMakes}
            onChange={(t) => update('preferredMakes', t)}
            placeholder="e.g. Toyota, Honda"
          />
          <TagInput
            label="Preferred Models"
            tags={config.preferredModels}
            onChange={(t) => update('preferredModels', t)}
            placeholder="e.g. Camry, Accord"
          />
          <TagInput
            label="Keywords to Include"
            tags={config.keywords}
            onChange={(t) => update('keywords', t)}
            placeholder="e.g. leather seats, sunroof"
          />
          <TagInput
            label="Keywords to Exclude"
            tags={config.excludeKeywords}
            onChange={(t) => update('excludeKeywords', t)}
            placeholder="e.g. salvage, flood damage"
          />
        </div>
      </section>

      {/* AI Settings */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
          AI Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Results Per Day</label>
            <input
              type="number"
              value={config.resultsPerDay}
              onChange={(e) => update('resultsPerDay', Number(e.target.value))}
              min={1}
              max={100}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Schedule Time (daily run)</label>
            <input
              type="time"
              value={config.scheduledTime}
              onChange={(e) => update('scheduledTime', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Min Opportunity Score:{' '}
              <span className="text-maroon-700 font-semibold">{config.minOpportunityScore}</span>
            </label>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={config.minOpportunityScore}
            onChange={(e) => update('minOpportunityScore', Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-maroon-700"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0 (any)</span>
            <span>100 (perfect)</span>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
          Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.emailNotifications}
              onChange={(e) => update('emailNotifications', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700"
            />
            <span className="text-sm font-medium text-gray-700">Email Notifications</span>
          </label>
          {config.emailNotifications && (
            <div className="ml-7 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Admin Email</label>
              <input
                type="email"
                value={config.adminEmail}
                onChange={(e) => update('adminEmail', e.target.value)}
                placeholder="admin@example.com"
                className={inputClass}
              />
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.smsNotifications}
              onChange={(e) => update('smsNotifications', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-700"
            />
            <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
          </label>
          {config.smsNotifications && (
            <div className="ml-7 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Admin Phone</label>
              <input
                type="tel"
                value={config.adminPhone}
                onChange={(e) => update('adminPhone', e.target.value)}
                placeholder="+234 800 000 0000"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </section>

      {/* Facebook Session Cookies */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <h2 className="font-semibold text-gray-900">Facebook Session Cookies</h2>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
            Sensitive
          </span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Paste your Facebook session cookies as JSON. This is required for the AI to
            access Facebook Marketplace listings. Never share this with anyone.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Session Cookies (JSON)</label>
            <button
              type="button"
              onClick={() => setShowCookies((s) => !s)}
              className="text-xs text-maroon-700 hover:underline"
            >
              {showCookies ? 'Hide' : 'Show'}
            </button>
          </div>
          <textarea
            value={showCookies ? config.fbCookies : config.fbCookies ? '••••••••••••••••••••' : ''}
            onChange={(e) => showCookies && update('fbCookies', e.target.value)}
            readOnly={!showCookies}
            rows={5}
            placeholder='[{"name": "c_user", "value": "...", ...}]'
            className={cn(
              inputClass,
              'resize-y min-h-[100px] font-mono text-xs',
              !showCookies && 'text-gray-400 cursor-not-allowed bg-gray-50'
            )}
          />
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Run Logs */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Run Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Last 10 AI search runs</p>
        </div>
        <div className="overflow-x-auto">
          {logsLoading ? (
            <div className="py-10 flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-maroon-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : runLogs.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No runs yet. Click &quot;Run AI Search&quot; to start.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Found
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Queued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600 whitespace-nowrap text-xs">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {runLogStatusIcon(log.status)}
                        <span
                          className={cn(
                            'text-xs font-medium',
                            log.status === 'SUCCESS'
                              ? 'text-emerald-700'
                              : log.status === 'ERROR'
                              ? 'text-red-700'
                              : 'text-yellow-700'
                          )}
                        >
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-700 font-medium">{log.found}</td>
                    <td className="px-6 py-3 text-gray-700 font-medium">{log.queued}</td>
                    <td className="px-6 py-3">
                      {log.errors > 0 ? (
                        <span className="text-red-600 font-medium">{log.errors}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
