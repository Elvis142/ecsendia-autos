'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Car, LayoutDashboard, MessageSquare, Bot, Settings, LogOut,
  ChevronLeft, ChevronRight, ExternalLink, Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/inventory', label: 'Inventory', icon: Car },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/admin/ai-sourcing', label: 'AI Sourcing', icon: Bot },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn('flex items-center border-b border-charcoal-900 py-4', collapsed ? 'px-3 justify-center' : 'px-5 gap-3')}>
        <Image src="/logo.svg" alt="Ecsendia Autos" width={32} height={32} className="rounded-lg shrink-0" />
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-none">Ecsendia</p>
            <p className="text-maroon-400 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-maroon-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-charcoal-900 p-2 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'View Site' : undefined}
        >
          <ExternalLink size={18} className="shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-charcoal-800 transition-all duration-300 relative shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-charcoal-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <button
          className="fixed top-3 left-3 z-50 p-2 bg-charcoal-800 text-white rounded-lg shadow-lg"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </button>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-0 bottom-0 w-60 bg-charcoal-800 z-50 flex flex-col">
              <SidebarContent />
            </aside>
          </>
        )}
      </div>
    </>
  )
}
