'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function NuevoEspacioPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'Principiante',
    category: 'Surf',
    isPublic: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Replace with actual API call to create space
      console.log('Creating space:', formData)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Redirect to spaces list
      window.location.href = '/espacios'
    } catch (error) {
      console.error('Error creating space:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <Link
            href="/espacios"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a espacios
          </Link>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-[var(--font-display)] font-bold mb-2">
            CREAR <span className="text-primary ">ESPACIO</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Crea una comunidad personalizada para entrenamientos especializados
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nombre del espacio
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Iniciación Surf"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe el propósito y contenido del espacio..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Category and Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Surf">Surf</option>
                  <option value="Skate">Skate</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-foreground mb-2">
                  Nivel
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border bg-background"
              />
              <label htmlFor="isPublic" className="text-sm text-foreground">
                Espacio público (visible para todos)
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary text-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
              >
                {isSubmitting ? 'Creando...' : 'Crear espacio'}
              </button>
              <Link
                href="/espacios"
                className="px-6 py-3 bg-border text-foreground rounded-lg hover:bg-border/80 transition-colors font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}
