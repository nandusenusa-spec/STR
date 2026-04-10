'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, MessageCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/footer'

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
    <main className="min-h-screen bg-white">

      {/* Header Section - ESPACIOS Style */}
      <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-7xl font-bold mb-2 uppercase tracking-wide text-black">
              SHOP
            </h1>
            <p className="text-gray-600 text-lg">Merch oficial, tablas y accesorios</p>
          </div>
        </div>
      </div>

      {/* Category Nav Bar - sticky */}
      <div className="border-b border-black/10 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-none py-4">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`text-sm font-medium whitespace-nowrap pb-1 border-b-2 shrink-0 transition-all uppercase tracking-wide ${
                  activeCategory === cat.slug
                    ? 'text-black border-black'
                    : 'text-gray-500 border-transparent hover:text-black hover:border-black'
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
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-white border border-black/10 overflow-hidden transition-all duration-300 hover:border-black cursor-pointer"
                >
                  <Link href={`/tienda/producto/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Image
                        src={product.image_url || '/images/tienda-hero.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/tienda/producto/${product.id}`}>
                      <h3 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1 uppercase tracking-wide">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-black font-bold mt-1 text-sm">
                      ${product.price.toLocaleString('es-UY')}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Link
                        href={`/tienda/producto/${product.id}`}
                        className="text-center text-xs py-1.5 bg-white border border-black/20 text-black hover:bg-gray-50 transition-colors uppercase tracking-wider"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() =>
                          window.open(`https://wa.me/598099046165?text=Hola! Me interesa: ${product.name}`, '_blank')
                        }
                        className="text-xs py-1.5 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-wider"
                      >
                        Consultar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay productos en esta categoría aún</p>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 sm:py-24 bg-black text-white">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="font-bold text-4xl sm:text-5xl mb-4 uppercase tracking-wide">
            BUSCAS ALGO?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Tambien tenemos tablas usadas que no estan publicadas. Escribinos!
          </p>
          <a
            href="https://wa.me/598099046165?text=Hola!%20Quiero%20info%20sobre%20productos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold text-lg hover:bg-gray-100 transition-colors uppercase tracking-wide"
          >
            <MessageCircle className="w-5 h-5" />
            Consultar por WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
