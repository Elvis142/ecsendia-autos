'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  MessageSquare,
  Bot,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  BarChart2,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatNaira } from '@/lib/formatting';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  totalInquiries: number;
  newInquiries: number;
  aiPendingSuggestions: number;
}

interface RecentInquiry {
  id: string;
  createdAt: string;
  carTitle: string;
  carId: string;
  customerName: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
}

interface RecentCar {
  id: string;
  title: string;
  price: number;
  status: string;
  visibility: string;
  photos: { url: string; isMain: boolean }[];
}

interface DashboardData {
  stats: DashboardStats;
  recentInquiries: RecentInquiry[];
  recentCars: RecentCar[];
}

interface InquiryChartPoint {
  date: string;
  label: string;
  count: number;
}

interface TopCar {
  id: string;
  title: string;
  viewCount: number;
  slug: string;
  make: string;
  model: string;
  year: number;
}

interface ChartData {
  inquiryChart: InquiryChartPoint[];
  topCars: TopCar[];
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'NEW':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'CONTACTED':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'CLOSED':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'SOLD':
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/dashboard/charts'),
        ]);
        if (!dashRes.ok) throw new Error('Failed to fetch dashboard data');
        const [json, chartJson] = await Promise.all([dashRes.json(), chartRes.json()]);
        setData(json);
        if (chartRes.ok) setCharts(chartJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Failed to load dashboard</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-maroon-700 text-white rounded-lg text-sm hover:bg-maroon-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentInquiries, recentCars } = data;

  const statCards = [
    {
      label: 'Total Cars',
      value: stats.totalCars,
      icon: Car,
      href: '/admin/inventory',
      color: 'text-maroon-700',
      bg: 'bg-maroon-700/10',
    },
    {
      label: 'Available Cars',
      value: stats.availableCars,
      icon: CheckCircle,
      href: '/admin/inventory?status=AVAILABLE',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Sold Cars',
      value: stats.soldCars,
      icon: TrendingUp,
      href: '/admin/inventory?status=SOLD',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      href: '/admin/inquiries',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'New Inquiries',
      value: stats.newInquiries,
      icon: Clock,
      href: '/admin/inquiries?status=NEW',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      badge: stats.newInquiries > 0,
    },
    {
      label: 'AI Pending',
      value: stats.aiPendingSuggestions,
      icon: Bot,
      href: '/admin/ai-sourcing',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back. Here&apos;s what&apos;s happening with Ecsendia Autos.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-maroon-700/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    {card.badge && card.value > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                        !
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn('p-2.5 rounded-lg', card.bg)}>
                  <Icon className={cn('w-5 h-5', card.color)} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs text-gray-400 group-hover:text-maroon-700 transition-colors">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Inquiries over 30 days */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-maroon-700" />
              <h2 className="font-semibold text-gray-900">Inquiries — Last 30 Days</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={charts.inquiryChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inquiryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v: number | undefined) => [v ?? 0, 'Inquiries']}
                  labelFormatter={(l) => l}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#047857"
                  strokeWidth={2}
                  fill="url(#inquiryGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#047857' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Most viewed cars */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-maroon-700" />
              <h2 className="font-semibold text-gray-900">Most Viewed Cars</h2>
            </div>
            {charts.topCars.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No view data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={charts.topCars.map((c) => ({ name: `${c.year} ${c.make}`, views: c.viewCount }))}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number | undefined) => [v ?? 0, 'Views']}
                  />
                  <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                    {charts.topCars.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#047857' : i === 1 ? '#059669' : '#6ee7b7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Recent Inquiries */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-maroon-700" />
            Recent Inquiries
          </h2>
          <Link
            href="/admin/inquiries"
            className="text-sm text-maroon-700 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentInquiries.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No inquiries yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Car
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentInquiries.slice(0, 5).map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/inventory/${inquiry.carId}/edit`}
                        className="text-maroon-700 hover:underline font-medium truncate max-w-[200px] block"
                      >
                        {inquiry.carTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{inquiry.customerName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusBadgeClass(inquiry.status)
                        )}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/inquiries?id=${inquiry.id}`}
                        className="text-maroon-700 hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Cars */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-maroon-700" />
            Recent Cars
          </h2>
          <Link
            href="/admin/inventory"
            className="text-sm text-maroon-700 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="p-6">
          {recentCars.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-sm">
              No cars listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {recentCars.slice(0, 5).map((car) => {
                const mainPhoto =
                  car.photos?.find((p) => p.isMain)?.url ||
                  car.photos?.[0]?.url ||
                  null;
                return (
                  <Link
                    key={car.id}
                    href={`/admin/inventory/${car.id}/edit`}
                    className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-maroon-700/30 transition-all duration-200"
                  >
                    <div className="relative w-full aspect-[4/3] bg-gray-100">
                      {mainPhoto ? (
                        <Image
                          src={mainPhoto}
                          alt={car.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Car className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                        {car.title}
                      </p>
                      <p className="text-sm font-bold text-maroon-700 mt-0.5">
                        {formatNaira(car.price)}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                          statusBadgeClass(car.status)
                        )}
                      >
                        {car.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
