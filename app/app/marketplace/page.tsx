'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Tag, Clock, Star, MessageCircle, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Listing = {
  id: string
  seller: { name: string; avatar: string | null; rating: number }
  board: {
    name: string
    length: number | null
    width: number | null
    thickness: number | null
    condition: string
    image: string | null
  }
  type: 'sale' | 'rent' | 'both'
  salePrice?: number
  rentPriceDay?: number
  rentPriceWeek?: number
  description: string
  posted: string
  likes: number
  sellerId?: string
}

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .or('active.eq.true,is_active.eq.true')
        .in('category', ['surfboards', 'skateboards', 'sup'])
        .order('created_at', { ascending: false })
        .limit(50)

      const rows = (data || []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        seller: {
          name: 'Comunidad',
          avatar: null,
          rating: 4.8,
        },
        board: {
          name: String(p.name || 'Tabla'),
          length: null,
          width: null,
          thickness: null,
          condition: String((p.condition as string) || 'Buen estado'),
          image: (p.image_url as string) || null,
        },
        type: 'sale' as const,
        salePrice: Number(p.price || 0),
        description: String((p.description as string) || 'Publicación de la comunidad'),
        posted: new Date(String(p.created_at || new Date().toISOString())).toLocaleDateString(
          'es-UY',
        ),
        likes: 0,
      }))

      setListings(rows)
      setLoading(false)
    }
    load()
  }, [])

  const filteredListings = useMemo(() => listings.filter((listing) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'sale') return listing.type === 'sale' || listing.type === 'both'
    if (activeFilter === 'rent') return listing.type === 'rent' || listing.type === 'both'
    return true
  }), [listings, activeFilter])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[var(--font-display)] text-4xl text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Compra, vende o alquila tablas con otros miembros de la comunidad</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-white/10 rounded-lg">
              <TabsTrigger value="all" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Todos ({listings.length})
              </TabsTrigger>
              <TabsTrigger value="sale" className="gap-2">
                <Tag className="w-4 h-4" />
                En Venta
              </TabsTrigger>
              <TabsTrigger value="rent" className="gap-2">
                <Clock className="w-4 h-4" />
                En Alquiler
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Listings Grid */}
        {loading && (
          <div className="text-center py-8 text-muted-foreground">Cargando publicaciones...</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="rounded-lg border border-white/10 bg-card/50 overflow-hidden hover:border-white/20 transition-colors group">
              {/* Board Image */}
              <div className="relative aspect-[3/4] bg-background/50 overflow-hidden">
                {listing.board.image ? (
                  <Image
                    src={listing.board.image}
                    alt={listing.board.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Foto Tabla
                  </div>
                )}
                
                {/* Listing Badge */}
                <div className="absolute top-3 right-3">
                  {listing.type === 'rent' && (
                    <span className="px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Alquiler
                    </span>
                  )}
                  {listing.type === 'sale' && (
                    <span className="px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Venta
                    </span>
                  )}
                  {listing.type === 'both' && (
                    <span className="px-3 py-1 rounded-full bg-primary/90 text-background text-xs font-bold">
                      Venta + Alquiler
                    </span>
                  )}
                </div>

                {/* Likes */}
                <button
                  type="button"
                  className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-all"
                >
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground ml-1">{listing.likes}</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Seller Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={listing.seller.avatar || undefined} />
                      <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{listing.seller.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-xs text-muted-foreground">{listing.seller.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Board Info */}
                <div>
                  <h3 className="font-[var(--font-display)] text-lg text-foreground">{listing.board.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {listing.board.length}" × {listing.board.width}" × {listing.board.thickness}" • {listing.board.condition}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

                {/* Pricing */}
                <div className="bg-background/50 p-3 rounded border border-white/5 space-y-2">
                  {listing.type === 'rent' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Por día:</span>
                        <span className="font-mono font-bold text-primary">${listing.rentPriceDay}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Por semana:</span>
                        <span className="font-mono font-bold text-primary">${listing.rentPriceWeek}</span>
                      </div>
                    </>
                  )}
                  {listing.type === 'sale' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-mono text-2xl font-bold text-primary">${listing.salePrice}</span>
                    </div>
                  )}
                  {listing.type === 'both' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Venta:</span>
                        <span className="font-mono font-bold text-primary">${listing.salePrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Alquiler/día:</span>
                        <span className="font-mono font-bold text-primary">${listing.rentPriceDay}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Posted Date */}
                <p className="text-xs text-muted-foreground">Publicado hace {listing.posted}</p>

                {/* CTA Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`https://wa.me/598099046165?text=Hola!%20Me%20interesa%20${encodeURIComponent(
                      listing.board.name,
                    )}`}
                    target="_blank"
                    className="flex-1"
                  >
                  <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-background">
                    <MessageCircle className="w-4 h-4" />
                    Contactar
                  </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No hay anuncios disponibles en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}
