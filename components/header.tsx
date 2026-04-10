'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

const navLinks = [
  { href: '/clases', label: 'Clases' },
  { href: '/viajes', label: 'Viajes' },
  { href: '/entrenadores', label: 'Entrenadores' },
  { href: '/tienda', label: 'Shop' },
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
          ? 'bg-white border-b border-black/10' 
          : 'bg-white'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Brand - Left */}
          <Link 
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="Comunidad"
              width={40}
              height={40}
              className="h-10 w-10 object-contain filter invert"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-base text-black uppercase tracking-wide">COMUNIDAD</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Surf & Skate</span>
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-black hover:text-gray-500 transition-colors uppercase tracking-wider font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-black"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              className="hidden sm:flex p-2 text-black hover:text-gray-500 transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Portal */}
            <Link
              href="/socios"
              className="hidden sm:flex p-2 text-black hover:text-gray-500 transition-colors"
              aria-label="Ser socio / portal"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-black hover:text-gray-500 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-black text-white text-[10px] font-medium">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-white ${
          mobileMenuOpen ? 'max-h-[400px] border-b border-black/10' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-base text-black uppercase tracking-wider font-medium border-b border-black/10 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            onClick={() => setMobileMenuOpen(false)}
            className="py-3 text-base text-black uppercase tracking-wider font-bold mt-2"
          >
            Ingresar
          </Link>
        </nav>
      </div>
    </header>
  )
}
