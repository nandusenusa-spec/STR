'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, MapPin, Users, Radio, MessageCircle, Instagram, ExternalLink, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Attendee {
  id: string
  name: string
  username: string
  avatar: string
  instagram?: string
  isLive?: boolean
}

interface LiveEventPopupProps {
  isOpen: boolean
  onClose: () => void
  event?: {
    id: string
    title: string
    type: 'clase' | 'viaje' | 'meetup'
    discipline: 'surf' | 'skate' | 'sup'
    location: string
    locationUrl: string
    coordinates: { lat: number; lng: number }
    startTime: string
    instructor: string
    instructorAvatar: string
    attendees: Attendee[]
    maxAttendees: number
    image: string
    isLive: boolean
  }
}

export function LiveEventPopup({ isOpen, onClose, event }: LiveEventPopupProps) {
  const [hoveredAttendee, setHoveredAttendee] = useState<string | null>(null)

  if (!event) return null

  const disciplineColors = {
    surf: { bg: 'from-neon-cyan to-cyan-600', text: 'text-neon-cyan', glow: 'glow-cyan' },
    skate: { bg: 'from-neon-magenta to-pink-600', text: 'text-neon-magenta', glow: 'glow-magenta' },
    sup: { bg: 'from-neon-lime to-green-600', text: 'text-neon-lime', glow: 'glow-lime' },
  }

  const colors = disciplineColors[event.discipline]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-2 border-neon-cyan/30 rounded-2xl">
        <DialogTitle className="sr-only">{event.title}</DialogTitle>
        
        {/* Header Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          {/* Live badge */}
          {event.isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/90 backdrop-blur-sm border border-destructive animate-pulse-live">
              <Radio className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white tracking-wider">EN VIVO</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Event type badge */}
          <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r ${colors.bg} text-background text-sm font-bold uppercase`}>
            {event.type} de {event.discipline}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Instructor */}
          <div>
            <h2 className={`font-[var(--font-display)] text-4xl ${colors.text}`}>
              {event.title}
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="w-10 h-10 border-2 border-neon-cyan">
                <AvatarImage src={event.instructorAvatar} />
                <AvatarFallback>{event.instructor[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Instructor</p>
                <p className="font-medium">{event.instructor}</p>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background/50 border border-border">
              <div className="flex items-center gap-2 text-neon-cyan mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Horario</span>
              </div>
              <p className="font-[var(--font-display)] text-2xl">{event.startTime}</p>
            </div>
            
            <a
              href={event.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-background/50 border border-border hover:border-neon-magenta transition-colors group"
            >
              <div className="flex items-center gap-2 text-neon-magenta mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Ubicacion</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-medium text-sm truncate">{event.location}</p>
            </a>
          </div>

          {/* Google Maps Embed */}
          <div className="relative h-40 rounded-xl overflow-hidden border border-border">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${event.coordinates.lng}!3d${event.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDU0JzQ1LjAiUyA1NsKwMTAnMzAuMCJX!5e0!3m2!1sen!2suy!4v1234567890`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125"
            />
            <div className="absolute inset-0 pointer-events-none border border-neon-cyan/20 rounded-xl" />
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-lime" />
                <span className="font-medium">Asistiendo</span>
                <span className="text-muted-foreground">({event.attendees.length}/{event.maxAttendees})</span>
              </div>
              <div className="flex items-center gap-1">
                {event.attendees.filter(a => a.isLive).length > 0 && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    {event.attendees.filter(a => a.isLive).length} en vivo
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredAttendee(attendee.id)}
                  onMouseLeave={() => setHoveredAttendee(null)}
                >
                  <div className={`relative ${attendee.isLive ? 'ring-2 ring-destructive ring-offset-2 ring-offset-card' : ''}`}>
                    <Avatar className="w-12 h-12 border-2 border-border group-hover:border-neon-cyan transition-colors cursor-pointer">
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                    </Avatar>
                    {attendee.isLive && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                        <Radio className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  {hoveredAttendee === attendee.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl bg-popover border border-neon-cyan/30 shadow-2xl z-50 min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground">@{attendee.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {attendee.instagram && (
                          <a
                            href={`https://instagram.com/${attendee.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            Instagram
                          </a>
                        )}
                        <Link
                          href={`/app/chat?dm=${attendee.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neon-cyan text-background text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Mensaje
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className={`flex-1 bg-gradient-to-r ${colors.bg} text-background font-bold py-6 ${colors.glow} btn-neon`}
            >
              <Zap className="w-5 h-5 mr-2" />
              UNIRME AL EVENTO
            </Button>
            <Button
              variant="outline"
              className="border-border hover:border-neon-cyan hover:text-neon-cyan py-6"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
