'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  MessageSquare,
  Users,
  Calendar,
  Store,
  ImageIcon,
  LogOut,
  User,
  Home,
  Radio,
  Zap,
  Trophy,
  ShoppingBag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const principalRoutes = [
  { label: 'Dashboard', href: '/app', icon: Home },
  { label: 'Mi Perfil', href: '/app/profile', icon: User },
]

const comunidadRoutes = [
  { label: 'Espacios', href: '/app/espacios', icon: Users },
  { label: 'Entrenadores', href: '/entrenadores', icon: Trophy },
  { label: 'Maniobras', href: '/app/maneuvers', icon: Zap },
]

const socialRoutes = [
  { label: 'Chat', href: '/app/chat', icon: MessageSquare },
  { label: 'Feed', href: '/app/feed', icon: ImageIcon },
  { label: 'Foros', href: '/app/forums', icon: Users },
  { label: 'Eventos', href: '/app/events', icon: Calendar },
]

const comercioRoutes = [
  { label: 'Marketplace', href: '/app/marketplace', icon: ShoppingBag },
  { label: 'Shop', href: '/app/shop', icon: Store },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/app" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Comunidad"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-lg">COMUNIDAD</span>
            <span className="text-xs text-muted-foreground">Surf & Skate</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground tracking-wider px-3 py-2">
            PRINCIPAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {principalRoutes.map((route) => {
                const Icon = route.icon
                const isActive = pathname === route.href
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'cursor-pointer rounded-lg transition-colors',
                        isActive 
                          ? 'bg-secondary text-foreground' 
                          : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Link href={route.href} className="flex items-center gap-3 py-2.5 px-3">
                        <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                        <span className="font-medium">{route.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Comunidad */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground tracking-wider px-3 py-2">
            COMUNIDAD
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comunidadRoutes.map((route) => {
                const Icon = route.icon
                const isActive = pathname === route.href
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'cursor-pointer rounded-lg transition-colors',
                        isActive 
                          ? 'bg-secondary text-foreground' 
                          : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Link href={route.href} className="flex items-center gap-3 py-2.5 px-3">
                        <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                        <span className="font-medium">{route.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Social */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground tracking-wider px-3 py-2">
            SOCIAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialRoutes.map((route) => {
                const Icon = route.icon
                const isActive = pathname === route.href
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'cursor-pointer rounded-lg transition-colors',
                        isActive 
                          ? 'bg-secondary text-foreground' 
                          : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Link href={route.href} className="flex items-center gap-3 py-2.5 px-3">
                        <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                        <span className="font-medium">{route.label}</span>
                        {route.label === 'Chat' && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Comercio */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground tracking-wider px-3 py-2">
            COMERCIO
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comercioRoutes.map((route) => {
                const Icon = route.icon
                const isActive = pathname === route.href
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'cursor-pointer rounded-lg transition-colors',
                        isActive 
                          ? 'bg-secondary text-foreground' 
                          : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Link href={route.href} className="flex items-center gap-3 py-2.5 px-3">
                        <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                        <span className="font-medium">{route.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Lives */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground tracking-wider px-3 py-2 flex items-center gap-2">
            <Radio className="w-3 h-3 text-destructive animate-pulse" />
            LIVES
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <div className="rounded-lg bg-card border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-secondary" />
                  <div>
                    <p className="text-sm font-medium">@pablo_surf</p>
                    <p className="text-xs text-muted-foreground">Playa Verde</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  En vivo ahora
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Mi Perfil</p>
            <p className="text-xs text-muted-foreground">Configurar</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
