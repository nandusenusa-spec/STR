'use client'

import React from "react"

import { useEffect, useState, useCallback } from 'react'
import { Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const slides = [
  {
    id: 'flow',
    title: 'ENTRENA TU FLOW.',
    description: 'Comunidad de entrenamientos en tierra para surf, skate y SUP.',
    image: '/images/hero-community.jpg',
    cta: { label: 'Unite ahora', href: '/portal' },
    ctaSecondary: { label: 'Ver horarios', href: '#horarios' },
  },
  {
    id: 'nicaragua',
    title: 'NICARAGUA 2026.',
    description: 'Mayo y Junio. Inscribite, no pierdas tu lugar.',
    image: '/images/trip-nicaragua.jpg',
    cta: { label: 'Reservar', href: '#viajes' },
    ctaSecondary: { label: 'Ver fechas', href: '#viajes' },
  },
  {
    id: 'peru',
    title: 'PERÚ 2026.',
    description: 'Octubre. Los mejores spots, todo incluido.',
    image: '/images/trip-peru.jpg',
    cta: { label: 'Quiero ir', href: '#viajes' },
    ctaSecondary: { label: 'Más info', href: '#viajes' },
  },
  {
    id: 'tienda',
    title: 'TIENDA STR.',
    description: 'Merch oficial de la comunidad. Representá el flow.',
    image: '/images/discipline-skate.jpg',
    cta: { label: 'Comprar', href: '#tienda' },
    ctaSecondary: { label: 'Ver todo', href: '#tienda' },
  },
]

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveIndex(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const handlePrev = useCallback(() => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length)
  }, [activeIndex, goToSlide])

  const handleNext = useCallback(() => {
    goToSlide((activeIndex + 1) % slides.length)
  }, [activeIndex, goToSlide])

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      handleNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [isPlaying, handleNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(p => !p)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }

  const currentSlide = slides[activeIndex]

  return (
    <section 
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-foreground"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-foreground/40" />
        </div>
      ))}

      {/* Content - Centered like Nike */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-24 pb-32">
        {/* Title - Large, bold, white */}
        <h1 
          className={`font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background tracking-tight mb-4 transition-all duration-500 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {currentSlide.title}
        </h1>

        {/* Description - Small, subtle */}
        <p 
          className={`text-sm sm:text-base text-background/80 max-w-md mb-8 transition-all duration-500 delay-75 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {currentSlide.description}
        </p>

        {/* CTAs - White buttons like Nike */}
        <div 
          className={`flex flex-wrap items-center justify-center gap-3 transition-all duration-500 delay-100 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <Link 
            href={currentSlide.cta.href}
            className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground text-sm font-medium rounded-full hover:bg-background/90 transition-colors"
          >
            {currentSlide.cta.label}
          </Link>
          <a 
            href={currentSlide.ctaSecondary.href}
            className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground text-sm font-medium rounded-full hover:bg-background/90 transition-colors"
          >
            {currentSlide.ctaSecondary.label}
          </a>
        </div>
      </div>

      {/* Dots - Center bottom like Nike */}
      <div className="absolute bottom-20 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-background w-6' 
                : 'bg-background/40 hover:bg-background/60'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Controls - Bottom right like Nike */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-20 flex items-center gap-2">
        {/* Pause/Play */}
        <button
          onClick={() => setIsPlaying(p => !p)}
          className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center hover:border-background/60 transition-colors"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-background/70" />
          ) : (
            <Play className="w-4 h-4 text-background/70 ml-0.5" />
          )}
        </button>
        
        {/* Prev */}
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center hover:border-background/60 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-background/70" />
        </button>
        
        {/* Next */}
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center hover:border-background/60 transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 text-background/70" />
        </button>
      </div>
    </section>
  )
}
