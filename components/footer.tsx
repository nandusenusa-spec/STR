'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'Tienda', href: '/tienda' },
    { label: 'Hombres', href: '/tienda/hombres' },
    { label: 'Mujeres', href: '/tienda/mujeres' },
    { label: 'Accesorios', href: '/tienda/accesorios' },
  ],
  experience: [
    { label: 'Clases', href: '/clases' },
    { label: 'Viajes', href: '/viajes' },
    { label: 'Portal Alumnos', href: '/portal' },
  ],
  info: [
    { label: 'Contacto', href: '#contacto' },
    { label: 'Sobre Nosotros', href: '#' },
  ],
}

const WHATSAPP_NUMBER = '598099046165'

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image
                src="/images/logo.png"
                alt="STR"
                width={40}
                height={40}
                className="invert"
              />
              <span className="font-[var(--font-display)] text-2xl font-bold">STR</span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed mb-6 max-w-xs">
              Comunidad de entrenamientos para Surf, Skate y Stand Up Paddle en Montevideo.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/comunidad_str/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com/strcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-medium mb-4">Tienda</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience Links */}
          <div>
            <h4 className="text-sm font-medium mb-4">Experiencia</h4>
            <ul className="space-y-3">
              {footerLinks.experience.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +598 099 046 165
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/comunidad_str/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  @comunidad_str
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-sm text-background/60">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Montevideo, Uruguay
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-background/40">
            <p>© {new Date().getFullYear()} STR Comunidad. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <Link href="/admin" className="hover:text-background/70 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
