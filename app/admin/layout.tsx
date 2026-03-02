import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export const metadata = {
  title: { default: 'Admin — Ecsendia Autos', template: '%s | Admin' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between md:px-6">
          <div className="md:hidden" /> {/* spacer for mobile hamburger */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{session.user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-maroon-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {(session.user?.name || session.user?.email || 'A')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
