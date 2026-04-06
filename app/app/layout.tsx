import AppSidebar from '@/components/app/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth check removed - open access for development
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
