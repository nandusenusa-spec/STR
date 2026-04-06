import { Suspense } from 'react'
import AppSidebar from '@/components/app/sidebar'
import { AdminAccessNotice } from '@/components/app/admin-access-notice'
import { SidebarProvider } from '@/components/ui/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Suspense fallback={null}>
            <AdminAccessNotice />
          </Suspense>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
