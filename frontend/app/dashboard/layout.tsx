'use client'

import { useState } from 'react'
import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightRail } from '@/components/layout/RightRail'
import { TopBar } from '@/components/layout/TopBar'
import { AppAlertBanner } from '@/components/ui/AppAlertBanner'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <AppAlertBanner />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      <RightRail />
    </div>
  )
}
