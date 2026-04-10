'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/animated-section'

// Instagram posts data - Fotos reales de @comunidad_str
const instagramPosts = [
  {
    id: '1',
    image: '/images/ig-post-1.jpg',
    likes: 234,
    comments: 18,
    caption: 'La crew en el bowl',
  },
  {
    id: '2',
    image: '/images/ig-post-2.jpg',
    likes: 189,
    comments: 12,
    caption: 'Surf Training Comunidad',
  },
  {
    id: '3',
    image: '/images/ig-post-3.jpg',
    likes: 312,
    comments: 24,
    caption: 'Carving nocturno',
  },
  {
    id: '4',
    image: '/images/ig-post-4.jpg',
    likes: 156,
    comments: 8,
    caption: 'Juntada post-session',
  },
  {
    id: '5',
    image: '/images/ig-post-5.jpg',
    likes: 445,
    comments: 32,
    caption: 'DJ set bajo las estrellas',
  },
  {
    id: '6',
    image: '/images/ig-post-6.jpg',
    likes: 278,
    comments: 15,
    caption: 'Surfeando olas perfectas',
  },
]

// Demo stories data
const stories = [
  { id: '1', username: 'comunidad_str', avatar: '/images/logo.png', isLive: true },
  { id: '2', username: 'martin_surf', avatar: null, hasNew: true },
  { id: '3', username: 'lu_skate', avatar: null, hasNew: true },
  { id: '4', username: 'santi_sup', avatar: null, hasNew: false },
  { id: '5', username: 'vale_waves', avatar: null, hasNew: true },
  { id: '6', username: 'nico_flow', avatar: null, hasNew: false },
]

export function InstagramFeed() {
  const [activeStory, setActiveStory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-24 bg-foreground text-background overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <AnimatedSection className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl">
                @COMUNIDAD_STR
              </h2>
              <p className="text-background/60 text-sm">Seguinos en Instagram</p>
            </div>
          </div>
          <a
            href="https://www.instagram.com/comunidad_str/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-background text-foreground px-6 py-3 font-medium text-sm tracking-wide hover:bg-background/90 transition-colors magnetic-btn"
          >
            SEGUIR
            <ExternalLink className="h-4 w-4" />
          </a>
        </AnimatedSection>

        {/* Stories */}
        <AnimatedSection delay={200} className="mb-12">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" ref={scrollRef}>
            {stories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => setActiveStory(story.id)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative p-1 rounded-full ${
                  story.hasNew || story.isLive
                    ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
                    : 'bg-background/30'
                }`}>
                  <div className="w-16 h-16 rounded-full bg-foreground overflow-hidden border-2 border-foreground">
                    {story.avatar ? (
                      <Image
                        src={story.avatar || "/placeholder.svg"}
                        alt={story.username}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-background/20 to-background/10 flex items-center justify-center text-background/60 font-bold text-lg">
                        {story.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  {story.isLive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      LIVE
                    </span>
                  )}
                </div>
                <span className="text-xs text-background/70 group-hover:text-background transition-colors truncate max-w-[80px]">
                  {story.username}
                </span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
          {instagramPosts.map((post, index) => (
            <AnimatedSection
              key={post.id}
              animation="scale-in"
              delay={index * 100}
              className="aspect-square relative group cursor-pointer overflow-hidden"
            >
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-background">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-bold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-background">
                  <MessageCircle className="h-5 w-5 fill-current" />
                  <span className="font-bold">{post.comments}</span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Floating hashtags */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['#ComunidadSTR', '#SurfLife', '#SkateFlow', '#SUPMontevideo', '#EntrenaConNosotros'].map((tag) => (
            <span key={tag} className="text-sm text-background/40 hover:text-background/70 transition-colors cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Story Modal */}
      {activeStory && (
        <div 
          className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center"
          onClick={() => setActiveStory(null)}
        >
          <div className="w-full max-w-sm aspect-[9/16] bg-gradient-to-br from-background/20 to-background/5 relative overflow-hidden">
            <Image
              src="/images/hero-surf.jpg"
              alt="Story"
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4 right-4">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 h-0.5 bg-background/30 rounded-full overflow-hidden">
                    <div className={`h-full bg-background ${i === 1 ? 'animate-[progress_5s_linear]' : ''}`} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-background/20" />
                <span className="text-background font-medium text-sm">comunidad_str</span>
                <span className="text-background/60 text-xs">2h</span>
              </div>
            </div>
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 text-background/80 hover:text-background"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
