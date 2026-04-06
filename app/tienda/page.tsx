'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, MessageCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const categories = [
  { slug: 'todo', name: 'Todo' },
  { slug: 'surfboards', name: 'Surfboards' },
  { slug: 'skateboards', name: 'Skateboards' },
  { slug: 'sup', name: 'SUP' },
  { slug: 'hombres', name: 'Hombres' },
  { slug: 'mujeres', name: 'Mujeres' },
  { slug: 'gorras', name: 'Gorras' },
  { slug: 'accesorios', name: 'Accesorios' },
]

type ShopRow = {
  id: string
  name: string
  price: number | string
  image_url: string | null
  category: string | null
  category_id: string | null
  categorySlug: string
}

export default function TiendaPage() {
  const [activeCategory, setActiveCategory] = useState('todo')
  const [products, setProducts] = useState<ShopRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('store_categories').select('id, slug').eq('is_active', true),
        supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
      ])

      const idToSlug = Object.fromEntries((cats || []).map((c) => [c.id, c.slug as string]))

      const rows: ShopRow[] = (prods || []).map((p: Record<string, unknown>) => {
        const categoryId = p.category_id as string | null
        const slugFromId = categoryId ? idToSlug[categoryId] : null
        const catText = ((p.category as string) || '').toLowerCase()
        const categorySlug =
          slugFromId ||
          (categories.find((c) => c.slug !== 'todo' && catText.includes(c.slug))?.slug ?? 'todo')

        return {
          id: p.id as string,
          name: p.name as string,
          price: Number(p.price),
          image_url: (p.image_url as string) || null,
          category: (p.category as string) || null,
          category_id: categoryId,
          categorySlug,
        }
      })

      setProducts(rows)
      setLoading(false)
    }

    load()
  }, [])

  const filtered =
    activeCategory === 'todo'
      ? products
      : products.filter((p) => p.categorySlug === activeCategory)

  return (
    <main className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tienda-hero.jpg"
            alt="Tienda"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-magenta/10 border border-neon-magenta/30 mb-4">
            <ShoppingBag className="w-4 h-4 text-neon-magenta" />
            <span className="text-sm font-mono text-neon-magenta">SHOP OFICIAL</span>
          </div>
          <h1 className="font-[var(--font-display)] text-6xl sm:text-9xl leading-[0.85] tracking-tight">
            <span className="block text-neon-cyan text-glow-cyan drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">TIENDA</span>
          </h1>
        </div>
      </section>

      {/* Category Nav Bar - sticky */}
      <div className="border-b border-white/10 sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-none py-4">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`text-sm font-medium whitespace-nowrap pb-1 border-b-2 shrink-0 transition-all ${
                  activeCategory === cat.slug
                    ? 'text-neon-cyan border-neon-cyan'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-neon-magenta'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-card/50 border border-white/5 hover:border-neon-cyan/30 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <Link href={`/tienda/producto/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-white/5">
                      <Image
                        src={product.image_url || '/images/tienda-hero.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/tienda/producto/${product.id}`}>
                      <h3 className="text-sm font-medium text-foreground group-hover:text-neon-cyan transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-neon-magenta font-bold mt-1 text-sm">
                      ${product.price.toLocaleString('es-UY')}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Link
                        href={`/tienda/producto/${product.id}`}
                        className="text-center text-xs py-1.5 rounded-lg bg-white/5 border border-white/20 text-foreground hover:bg-white/10 transition-colors"
                      >
                        Ver producto
                      </Link>
                      <button
                        onClick={() =>
                          window.open(`https://wa.me/598099046165?text=Hola! Me interesa: ${product.name}`, '_blank')
                        }
                        className="text-xs py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
                      >
                        Consultar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay productos en esta categoría aún</p>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-lime/10 rounded-full blur-[150px]" />
        <div className="relative mx-auto max-w-xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-lime/10 border border-neon-lime/30 mb-6">
            <MessageCircle className="w-4 h-4 text-neon-lime" />
            <span className="text-sm font-mono text-neon-lime">CONSULTAS</span>
          </div>
          <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl text-foreground mb-4">
            BUSCAS <span className="text-neon-lime text-glow-lime">ALGO</span>?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            También tenemos tablas usadas que no están publicadas. Escribinos!
          </p>
          <a
            href="https://wa.me/598099046165?text=Hola!%20Quiero%20info%20sobre%20productos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-neon-lime to-neon-cyan text-background px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            Consultar por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="Comunidad" width={40} height={40} className="h-10 w-10 object-contain" />
              <div>
                <span className="font-[var(--font-display)] text-lg">COMUNIDAD</span>
                <p className="text-xs text-muted-foreground">Montevideo, Uruguay</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-neon-cyan transition-colors">Inicio</Link>
              <Link href="/portal" className="hover:text-neon-magenta transition-colors">Portal</Link>
              <Link href="/admin" className="hover:text-foreground transition-colors opacity-50">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
