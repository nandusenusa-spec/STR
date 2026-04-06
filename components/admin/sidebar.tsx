'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Plane, 
  Calendar, 
  ShoppingCart,
  Home,
  Video,
  LinkIcon,
  Megaphone,
  MessageCircle,
  GraduationCap,
  CreditCard,
  Radio,
  CheckCircle,
  Zap,
  Shield,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/validaciones', label: 'Validaciones', icon: CheckCircle },
  { href: '/admin/maniobras', label: 'Maniobras', icon: Zap },
  { href: '/admin/events', label: 'Eventos', icon: Calendar },
  { href: '/admin/clases-en-vivo', label: 'Clases en Vivo', icon: Radio },
  { href: '/admin/pagos', label: 'Pagos Alumnos', icon: CreditCard },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/links', label: 'Links', icon: LinkIcon },
  { href: '/admin/clases-offline', label: 'Clases Offline', icon: GraduationCap },
  { href: '/admin/products', label: 'Articulos / Tienda', icon: Package },
  { href: '/admin/promociones', label: 'Promociones', icon: Megaphone },
  { href: '/admin/contacto', label: 'Contacto', icon: MessageCircle },
  { href: '/admin/trips', label: 'Viajes', icon: Plane },
  { href: '/admin/schedule', label: 'Horarios', icon: Calendar },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/security', label: 'Seguridad', icon: Shield },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/logo-cstr.png"
            alt="Comunidad"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-[var(--font-display)] text-xl">COMUNIDAD</span>
            <span className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">CRM Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
                    isActive 
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' 
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors rounded-lg"
        >
          <Home className="h-5 w-5" />
          Ver sitio
        </Link>
      </div>
    </aside>
  )
}
