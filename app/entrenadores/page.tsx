'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Filter, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function EntrenadoresPage() {
  const [trainers, setTrainers] = useState([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const specialties = ['Todos', 'Surf', 'Skate', 'Acondicionamiento Físico']

  useEffect(() => {
    // Fetch trainers from API
    const fetchTrainers = async () => {
      try {
        // TODO: Replace with actual API call to fetch trainers
        setTrainers([
          {
            id: '1',
            name: 'German Garcia',
            specialty: 'Surf',
            rating: 5.0,
            reviews: 89,
            experience: '12 años',
            image: '/images/trainers/german-garcia.jpg',
            description: 'Instructor de surf y skate. Fundador de la comunidad STR.'
          },
          {
            id: '2',
            name: 'Diego Ottonello',
            specialty: 'Skate',
            rating: 4.9,
            reviews: 72,
            experience: '10 años',
            image: '/images/trainers/diego-ottonello.jpg',
            description: 'Especialista en skate y acondicionamiento físico para riders.'
          },
          {
            id: '3',
            name: 'German Garcia',
            specialty: 'Acondicionamiento Físico',
            rating: 5.0,
            reviews: 89,
            experience: '12 años',
            image: '/images/trainers/german-garcia.jpg',
            description: 'Preparación física especializada para surfers y skaters.'
          },
        ])
      } catch (error) {
        console.error('Error fetching trainers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSpecialty = selectedSpecialty === 'Todos' || trainer.specialty === selectedSpecialty
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSpecialty && matchesSearch
  })

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-7xl font-[var(--font-display)] font-bold mb-2 uppercase tracking-wide">
              <span className="text-black">ENTRENADORES</span>
            </h1>
            <p className="text-gray-600 text-lg">Los mejores instructores de surf y skate en Montevideo</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar entrenadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 mr-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 uppercase tracking-wider">Especialidad:</span>
              </div>
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 font-medium transition-colors text-sm uppercase tracking-wider ${
                    selectedSpecialty === specialty
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/20 text-black hover:border-black'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Trainers Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Cargando entrenadores...</p>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay entrenadores que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="h-full bg-white border border-black/10 overflow-hidden hover:border-black transition-colors group"
                >
                  {/* Image - More vertical/rectangular and 30% smaller */}
                  <div className="relative h-72 overflow-hidden bg-gray-100">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-black text-white text-xs font-medium uppercase tracking-wider">
                      {trainer.specialty}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-black mb-1 uppercase tracking-wide">
                      {trainer.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {trainer.experience} de experiencia
                    </p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {trainer.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(trainer.rating)
                                ? 'fill-black text-black'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-black font-medium">
                        {trainer.rating} ({trainer.reviews})
                      </span>
                    </div>

                    {/* CTA */}
                    <button className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-medium text-sm uppercase tracking-wider">
                      Reservar sesion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Become a Trainer CTA */}
          <div className="mt-16 border-t border-black/10 pt-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 uppercase tracking-wide text-black">
                ¿Queres dar clases?
              </h2>
              <p className="text-gray-600 mb-8">
                Unite a nuestra comunidad de entrenadores. Comparte tu experiencia y pasión por el surf, skate o SUP con otros riders.
              </p>
              <a
                href="https://wa.me/59899123456?text=Hola%2C%20quiero%20ser%20entrenador%20de%20la%20comunidad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors font-bold uppercase tracking-wider"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contactanos por WhatsApp
              </a>
              <p className="text-sm text-gray-500 mt-4">
                Te responderemos a la brevedad con toda la información
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
