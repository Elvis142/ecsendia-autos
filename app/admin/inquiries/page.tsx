'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { formatNaira } from '@/lib/formatting';
import { cn } from '@/lib/utils';

type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

interface Inquiry {
  id: string;
  createdAt: string;
  car: { id: string; title: string; slug: string; price: number } | null;
  carId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredContact: string;
  vehiclePrice: number;
  customerOffer?: number | null;
  shippingNeeded: boolean;
  shippingCity?: string | null;
  shippingState?: string | null;
  paymentPlan?: string | null;
  status: InquiryStatus;
  notes?: string | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Closed', value: 'CLOSED' },
];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'NEW':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'CONTACTED':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'CLOSED':
      return 'bg-green-100 text-green-700 border border-green-200';
    default:
      return 'bg-gray-100 text-gray-500';
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

export default function AdminInquiriesPage() {
  const searchParams = useSearchParams();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [carFilter, setCarFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [cars, setCars] = useState<{ id: string; title: string }[]>([]);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (carFilter) params.set('carId', carFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      const json = await res.json();
      setInquiries(json.inquiries || []);
      setMeta(json.meta || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, carFilter, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('/api/admin/cars?limit=100');
        if (!res.ok) return;
        const json = await res.json();
        setCars(json.cars?.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title })) || []);
      } catch {}
    };
    fetchCars();
  }, []);

  const handleStatusChange = async (inquiry: Inquiry, newStatus: InquiryStatus) => {
    setUpdatingStatus(inquiry.id);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: newStatus } : i))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (carFilter) params.set('carId', carFilter);
      const res = await fetch(`/api/admin/inquiries/export?${params.toString()}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.total} inquiry{meta.total !== 1 ? 'ies' : ''}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              statusFilter === tab.value
                ? 'bg-white text-maroon-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Car Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Filter by car:
        </label>
        <select
          value={carFilter}
          onChange={(e) => {
            setCarFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 bg-white max-w-xs"
        >
          <option value="">All Cars</option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-20 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No inquiries found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try a different status filter or car
              </p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Car
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Listed ₦
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Offer ₦
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Shipping
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((inquiry) => (
                  <>
                    <tr
                      key={inquiry.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === inquiry.id ? null : inquiry.id)
                      }
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                        {formatDate(inquiry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/inventory/${inquiry.carId}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-maroon-700 hover:underline font-medium text-xs max-w-[140px] block truncate"
                        >
                          {inquiry.car?.title ?? '—'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {inquiry.fullName}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 text-xs">{inquiry.phone}</p>
                        <p className="text-gray-400 text-xs truncate max-w-[160px]">
                          {inquiry.email}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5 capitalize">
                          via {inquiry.preferredContact?.toLowerCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs font-medium">
                        {formatNaira(inquiry.vehiclePrice)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {inquiry.customerOffer ? (
                          <span className="font-medium text-emerald-700">
                            {formatNaira(inquiry.customerOffer)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {inquiry.shippingNeeded ? (
                          <div>
                            <span className="text-emerald-700 font-medium">Yes</span>
                            {inquiry.shippingCity && (
                              <p className="text-gray-400 truncate max-w-[100px]">
                                {inquiry.shippingCity}{inquiry.shippingState ? `, ${inquiry.shippingState}` : ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[100px] truncate">
                        {inquiry.paymentPlan || '—'}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inquiry.status}
                          onChange={(e) =>
                            handleStatusChange(inquiry, e.target.value as InquiryStatus)
                          }
                          disabled={updatingStatus === inquiry.id}
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-maroon-700/30 cursor-pointer',
                            statusBadgeClass(inquiry.status)
                          )}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {expandedRow === inquiry.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </td>
                    </tr>
                    {expandedRow === inquiry.id && (
                      <tr key={`${inquiry.id}-expanded`} className="bg-gray-50">
                        <td colSpan={10} className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-line">
                                {inquiry.notes || 'No notes provided.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && meta.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2">
                Page {meta.page} of {meta.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={meta.page >= meta.pages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
