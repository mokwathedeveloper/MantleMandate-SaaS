import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightRail } from '@/components/layout/RightRail'
import { AppAlertBanner } from '@/components/ui/AppAlertBanner'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <Sidebar />

      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">
        <AppAlertBanner />
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </main>

      <RightRail />
    </div>
  )
}
