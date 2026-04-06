'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const fallbackCategories = [
  {
    id: 'surfboards',
    name: 'SURFBOARDS',
    description: 'Tablas nuevas y usadas',
    image: '/images/cat-surfboards.jpg',
    href: '/tienda/surfboards',
  },
  {
    id: 'skateboards',
    name: 'SKATEBOARDS',
    description: 'Completos y partes',
    image: '/images/cat-skateboards.jpg',
    href: '/tienda/skateboards',
  },
  {
    id: 'sup',
    name: 'SUP',
    description: 'Stand Up Paddle',
    image: '/images/cat-sup.jpg',
    href: '/tienda/sup',
  },
  {
    id: 'hombres',
    name: 'HOMBRES',
    description: 'Ropa y accesorios',
    image: '/images/cat-hombres.jpg',
    href: '/tienda/hombres',
  },
  {
    id: 'mujeres',
    name: 'MUJERES',
    description: 'Ropa y accesorios',
    image: '/images/cat-mujeres.jpg',
    href: '/tienda/mujeres',
  },
  {
    id: 'gorras',
    name: 'GORRAS',
    description: 'Caps y beanies',
    image: '/images/cat-gorras.jpg',
    href: '/tienda/gorras',
  },
  {
    id: 'accesorios',
    name: 'ACCESORIOS',
    description: 'Leashes, wax, fins y más',
    image: '/images/cat-accesorios.jpg',
    href: '/tienda/accesorios',
  },
]

export function StoreSection() {
  const [categories, setCategories] = useState(fallbackCategories)

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('store_categories')
        .select('id, name, slug, description, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(12)

      if (!data || data.length === 0) return

      const mapped = data.map((c) => ({
        id: c.slug,
        name: String(c.name || c.slug || '').toUpperCase(),
        description: c.description || 'Categoria de tienda',
        image: c.image_url || `/images/cat-${c.slug}.jpg`,
        href: `/tienda/${c.slug}`,
      }))
      setCategories(mapped)
    }
    loadCategories()
  }, [])

  return (
    <section id="tienda" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-[var(--font-display)] text-5xl sm:text-6xl text-foreground mb-4">
            TIENDA
          </h2>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto">
            Ropa, accesorios, tablas nuevas y usadas
          </p>
        </div>
        {/* Main Categories - Large */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {categories.slice(0, 3).map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative aspect-[4/5] overflow-hidden bg-secondary"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 text-white text-sm font-medium group-hover:gap-3 transition-all">
                  <span>Ver productos</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Secondary Categories - Medium */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(3).map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden bg-secondary"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                <h3 className="font-[var(--font-display)] text-xl sm:text-2xl text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 font-medium tracking-wide hover:bg-foreground/90 transition-colors"
          >
            VER TODA LA TIENDA
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
