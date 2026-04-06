import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getCategory(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('store_categories')
    .select('*')
    .eq('slug', slug)
    .single()
  
  return data
}

async function getProducts(categorySlug: string, categoryId: string | null) {
  const supabase = await createClient()
  let q = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (categoryId) {
    q = q.eq('category_id', categoryId)
  } else {
    q = q.eq('category', categorySlug)
  }

  const { data } = await q
  return data || []
}

// Fallback data for categories
const fallbackCategories: Record<string, { name: string; description: string; image: string }> = {
  surfboards: { name: 'Surfboards', description: 'Tablas nuevas y usadas para todos los niveles', image: '/images/cat-surfboards.jpg' },
  skateboards: { name: 'Skateboards', description: 'Completos, tablas, trucks y ruedas', image: '/images/cat-skateboards.jpg' },
  sup: { name: 'SUP', description: 'Stand Up Paddle boards y accesorios', image: '/images/cat-sup.jpg' },
  hombres: { name: 'Hombres', description: 'Remeras, buzos, boardshorts y más', image: '/images/cat-hombres.jpg' },
  mujeres: { name: 'Mujeres', description: 'Remeras, buzos, bikinis y más', image: '/images/cat-mujeres.jpg' },
  gorras: { name: 'Gorras', description: 'Caps, truckers y beanies', image: '/images/cat-gorras.jpg' },
  accesorios: { name: 'Accesorios', description: 'Leashes, quillas, wax, fundas y más', image: '/images/cat-accesorios.jpg' },
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const dbCategory = await getCategory(category)
  const fallback = fallbackCategories[category]
  
  const name = dbCategory?.name || fallback?.name || 'Categoría'
  const description = dbCategory?.description || fallback?.description || ''
  
  return {
    title: `${name} | Tienda STR`,
    description,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  
  const dbCategory = await getCategory(category)
  const products = await getProducts(category, dbCategory?.id ?? null)
  
  const fallback = fallbackCategories[category]
  
  // If no category found in DB or fallback
  if (!dbCategory && !fallback) {
    notFound()
  }

  const categoryName = dbCategory?.name || fallback?.name || ''
  const categoryDescription = dbCategory?.description || fallback?.description || ''
  const categoryImage = dbCategory?.image_url || fallback?.image || `/images/cat-${category}.jpg`

  return (
    <main className="min-h-screen bg-background pt-[120px]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link>
          <span>/</span>
          <span className="text-foreground">{categoryName}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[35vh] min-h-[250px] flex items-center justify-center">
        <Image
          src={categoryImage || "/placeholder.svg"}
          alt={categoryName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl text-white mb-2">
            {categoryName.toUpperCase()}
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            {categoryDescription}
          </p>
          {products.length > 0 && (
            <span className="inline-block mt-4 bg-accent text-background px-3 py-1 text-sm font-bold">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group bg-secondary overflow-hidden"
              >
                <Link href={`/tienda/producto/${product.id}`} className="block">
                  <div className="aspect-square relative overflow-hidden">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url || "/placeholder.svg"} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-foreground/10">
                        <span className="font-[var(--font-display)] text-3xl text-foreground/20">
                          STR
                        </span>
                      </div>
                    )}
                    
                    {/* Condition Badge */}
                    {product.condition && (
                      <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold ${
                        product.condition === 'new' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-black'
                      }`}>
                        {product.condition === 'new' ? 'NUEVO' : 'USADO'}
                      </span>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link href={`/tienda/producto/${product.id}`}>
                    <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-[var(--font-display)] text-xl text-accent">
                      ${product.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tienda/producto/${product.id}`}
                        className="px-2 py-1 text-xs bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                      >
                        Ver
                      </Link>
                      <a
                        href={`https://wa.me/598099046165?text=Hola!%20Me%20interesa%20${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-[var(--font-display)] text-3xl sm:text-4xl text-muted-foreground mb-4">
              PROXIMAMENTE
            </p>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Estamos preparando los productos de esta categoría. 
              Consultanos por WhatsApp si buscas algo específico.
            </p>
            <a
              href={`https://wa.me/598099046165?text=Hola!%20Quiero%20info%20sobre%20${encodeURIComponent(categoryName.toLowerCase())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-foreground/5 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            ¿No encontras lo que buscas? Tenemos más productos que no están publicados.
          </p>
          <a
            href={`https://wa.me/598099046165?text=Hola!%20Quiero%20info%20sobre%20${encodeURIComponent(categoryName.toLowerCase())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
