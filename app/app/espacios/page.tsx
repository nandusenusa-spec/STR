'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function EspaciosPage() {
  const [spaces, setSpaces] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch spaces from API
    const fetchSpaces = async () => {
      try {
        // TODO: Replace with actual API call to fetch spaces
        setSpaces([
          {
            id: '1',
            name: 'Iniciación Surf',
            slug: 'iniciacion-surf',
            description: 'Aprende los fundamentos del surf en nuestras clases iniciales',
            members: 24,
            image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=500&h=300&fit=crop',
            level: 'Principiante'
          },
          {
            id: '2',
            name: 'Skate Avanzado',
            slug: 'skate-avanzado',
            description: 'Para skaters con experiencia que buscan mejorar técnicas avanzadas',
            members: 18,
            image: 'https://images.unsplash.com/photo-1556091160-980a08062df7?w=500&h=300&fit=crop',
            level: 'Avanzado'
          },
        ])
      } catch (error) {
        console.error('Error fetching spaces:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpaces()
  }, [])

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-5xl sm:text-7xl font-[var(--font-display)] font-bold mb-2 uppercase tracking-wide">
                <span className="text-black">ESPACIOS</span>
              </h1>
              <p className="text-gray-600 text-lg">Comunidades de entrenamientos especializadas</p>
            </div>
            <Link
              href="/espacios/nuevo"
              className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium uppercase tracking-wider"
            >
              <Plus className="w-5 h-5" />
              Crear espacio
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar espacios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Spaces Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Cargando espacios...</p>
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay espacios que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredSpaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/e/${space.slug}`}
                  className="group"
                >
                  <div className="h-full bg-white border border-black/10 overflow-hidden hover:border-black transition-colors">
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 right-3 px-2 py-1 bg-black text-white text-xs font-medium uppercase tracking-wider">
                        {space.level}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-black mb-1 uppercase tracking-wide">
                        {space.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {space.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {space.members} miembros
                        </span>
                        <span className="text-xs px-2 py-1 bg-black text-white uppercase tracking-wider">
                          Entrar →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
