import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()
  return data
}

async function getRelated(category: string, id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id,name,price,image_url')
    .eq('active', true)
    .eq('category', category)
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelated(product.category || '', product.id)
  const waText = encodeURIComponent(
    `Hola! Me interesa este producto: ${product.name} (${product.id})`,
  )

  return (
    <main className="min-h-screen bg-background pt-[100px]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <Link href="/tienda" className="hover:text-foreground">Tienda</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-card">
            <Image
              src={product.image_url || '/images/tienda-hero.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-5">
            {product.condition && (
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${
                product.condition === 'new'
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {product.condition === 'new' ? 'NUEVO' : 'USADO'}
              </span>
            )}
            <h1 className="font-[var(--font-display)] text-4xl text-foreground">{product.name}</h1>
            <p className="text-3xl font-bold text-neon-magenta">
              ${Number(product.price || 0).toLocaleString('es-UY')}
            </p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {product.description || 'Producto publicado en la tienda de la comunidad.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`https://wa.me/598099046165?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 text-white px-4 py-3 font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </a>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-magenta text-background px-4 py-3 font-bold hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="w-4 h-4" />
                Ir al checkout
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-[var(--font-display)] text-2xl mb-4">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link key={item.id} href={`/tienda/producto/${item.id}`} className="group block">
                  <div className="aspect-square relative rounded-lg overflow-hidden border border-white/10 bg-card">
                    <Image
                      src={item.image_url || '/images/tienda-hero.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="mt-2 text-sm line-clamp-1">{item.name}</p>
                  <p className="text-sm text-neon-magenta font-semibold">
                    ${Number(item.price || 0).toLocaleString('es-UY')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

