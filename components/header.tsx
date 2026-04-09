'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

const navLinks = [
  { href: '/entrenadores', label: 'Entrenadores' },
  { href: '/clases', label: 'Clases' },
  { href: '/viajes', label: 'Viajes' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/socios', label: 'Socios' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { getTotalItems, toggleCart } = useCartStore()
  const totalItems = getTotalItems()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background border-b border-border' 
          : 'bg-background'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Brand - Left */}
          <Link 
            href="/"
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="Comunidad"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-[var(--font-display)] text-base font-bold text-foreground">STR</span>
              <span className="text-xs text-neon-lime">Comunidad</span>
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground hover:text-muted-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-foreground"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              className="hidden sm:flex p-2 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Portal */}
            <Link
              href="/socios"
              className="hidden sm:flex p-2 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Ser socio / portal"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-foreground text-background text-[10px] font-medium rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-background ${
          mobileMenuOpen ? 'max-h-[380px] border-b border-border' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-lg text-foreground border-b border-border/50 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/socios"
            onClick={() => setMobileMenuOpen(false)}
            className="py-3 text-lg text-foreground"
          >
            Socios / ingresar
          </Link>
        </nav>
      </div>
    </header>
  )
}
