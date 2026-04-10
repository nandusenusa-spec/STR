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
    surf: { bg: 'bg-black', text: 'text-black', glow: '' },
    skate: { bg: 'bg-black', text: 'text-black', glow: '' },
    sup: { bg: 'bg-black', text: 'text-black', glow: '' },
  }

  const colors = disciplineColors[event.discipline]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border border-black/20">
        <DialogTitle className="sr-only">{event.title}</DialogTitle>
        
        {/* Header Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
          
          {/* Live badge */}
          {event.isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 animate-pulse">
              <Radio className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white tracking-wider uppercase">En vivo</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>

          {/* Event type badge */}
          <div className={`absolute bottom-4 left-4 px-3 py-1 ${colors.bg} text-white text-sm font-bold uppercase tracking-wider`}>
            {event.type} de {event.discipline}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Instructor */}
          <div>
            <h2 className={`font-bold text-4xl ${colors.text} uppercase tracking-wide`}>
              {event.title}
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="w-10 h-10 border-2 border-black">
                <AvatarImage src={event.instructorAvatar} />
                <AvatarFallback className="bg-gray-100 text-black">{event.instructor[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Instructor</p>
                <p className="font-bold text-black">{event.instructor}</p>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-black/10">
              <div className="flex items-center gap-2 text-black mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Horario</span>
              </div>
              <p className="font-bold text-2xl text-black">{event.startTime}</p>
            </div>
            
            <a
              href={event.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gray-50 border border-black/10 hover:border-black transition-colors group"
            >
              <div className="flex items-center gap-2 text-black mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Ubicacion</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-medium text-sm truncate text-black">{event.location}</p>
            </a>
          </div>

          {/* Google Maps Embed */}
          <div className="relative h-40 overflow-hidden border border-black/10">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${event.coordinates.lat},${event.coordinates.lng}&zoom=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125"
            />
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-black" />
                <span className="font-bold text-black uppercase tracking-wider">Asistiendo</span>
                <span className="text-gray-500">({event.attendees.length}/{event.maxAttendees})</span>
              </div>
              <div className="flex items-center gap-1">
                {event.attendees.filter(a => a.isLive).length > 0 && (
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
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
                  <div className={`relative ${attendee.isLive ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-white' : ''}`}>
                    <Avatar className="w-12 h-12 border-2 border-black/10 group-hover:border-black transition-colors cursor-pointer">
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback className="bg-gray-100 text-black">{attendee.name[0]}</AvatarFallback>
                    </Avatar>
                    {attendee.isLive && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 flex items-center justify-center">
                        <Radio className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  {hoveredAttendee === attendee.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white border border-black/20 shadow-2xl z-50 min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="bg-gray-100 text-black">{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm text-black">{attendee.name}</p>
                          <p className="text-xs text-gray-500">@{attendee.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {attendee.instagram && (
                          <a
                            href={`https://instagram.com/${attendee.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors uppercase tracking-wider"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            Instagram
                          </a>
                        )}
                        <Link
                          href={`/app/chat?dm=${attendee.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-black text-xs font-medium hover:bg-gray-200 transition-colors uppercase tracking-wider"
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
              className="flex-1 bg-black text-white font-bold py-6 hover:bg-gray-800 uppercase tracking-wider"
            >
              <Zap className="w-5 h-5 mr-2" />
              UNIRME AL EVENTO
            </Button>
            <Button
              variant="outline"
              className="border-black/20 hover:border-black hover:bg-gray-50 py-6"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
