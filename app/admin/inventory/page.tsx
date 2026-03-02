'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/formatting';
import { cn } from '@/lib/utils';

interface CarItem {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number;
  status: string;
  visibility: string;
  featured: boolean;
  photos: { url: string; isMain: boolean }[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-700';
    case 'SOLD':
      return 'bg-gray-100 text-gray-600';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const visibilityBadgeClass = (visibility: string) => {
  switch (visibility) {
    case 'PUBLISHED':
      return 'bg-blue-100 text-blue-700';
    case 'DRAFT':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

export default function AdminInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cars, setCars] = useState<CarItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [visibilityFilter, setVisibilityFilter] = useState(
    searchParams.get('visibility') || ''
  );
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [deleteTarget, setDeleteTarget] = useState<CarItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (visibilityFilter) params.set('visibility', visibilityFilter);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/cars?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch cars');
      const json = await res.json();
      setCars(json.cars || []);
      setMeta(json.meta || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, visibilityFilter, page]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCars();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cars/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchCars();
    } catch {
      toast.error('Failed to delete car');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (car: CarItem) => {
    setTogglingFeatured(car.id);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !car.featured }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      toast.success(
        `"${car.title}" ${!car.featured ? 'marked as featured' : 'removed from featured'}`
      );
      fetchCars();
    } catch {
      toast.error('Failed to update featured status');
    } finally {
      setTogglingFeatured(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.total} car{meta.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Car
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, make, model, VIN..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-maroon-700 text-white text-sm rounded-lg hover:bg-maroon-800 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 bg-white"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => {
            setVisibilityFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 bg-white"
        >
          <option value="">All Visibility</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cars.length === 0 ? (
            <div className="py-20 text-center">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No cars found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filters
              </p>
              <Link
                href="/admin/inventory/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-maroon-700 text-white text-sm rounded-lg hover:bg-maroon-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first car
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">
                    Photo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Visibility
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cars.map((car) => {
                  const thumb =
                    car.photos?.find((p) => p.isMain)?.url ||
                    car.photos?.[0]?.url ||
                    null;
                  return (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="relative w-[60px] h-[45px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={car.title}
                              fill
                              className="object-cover"
                              sizes="60px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Car className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 max-w-[220px] truncate">
                          {car.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {car.make} {car.model}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-maroon-700 whitespace-nowrap">
                        {formatNaira(car.price)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{car.year}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            statusBadgeClass(car.status)
                          )}
                        >
                          {car.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            visibilityBadgeClass(car.visibility)
                          )}
                        >
                          {car.visibility === 'PUBLISHED' ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {car.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(car)}
                          disabled={togglingFeatured === car.id}
                          className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            car.featured
                              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                          )}
                          title={car.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          {togglingFeatured === car.id ? (
                            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Star
                              className="w-4 h-4"
                              fill={car.featured ? 'currentColor' : 'none'}
                            />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/inventory/${car.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-maroon-700 hover:bg-maroon-700/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(car)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2">
                Page {meta.page} of {meta.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={meta.page >= meta.pages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Delete Car</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete{' '}
                  <strong className="text-gray-700">&quot;{deleteTarget.title}&quot;</strong>?
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => !deleting && setDeleteTarget(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
