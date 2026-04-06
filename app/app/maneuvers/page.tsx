'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, CheckCircle, Clock, AlertCircle, Play, Maximize2, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function ManeuversPage() {
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null)

  const maneuvers = [
    {
      id: 1,
      name: 'Bottom Turn',
      level: 1,
      description: 'Giro básico en la base de la ola',
      status: 'unlocked',
      videoSubmitted: true,
      instructorReview: 'Excelente técnica',
      youtubeUrl: 'https://www.youtube.com/embed/lxY5z9sxEbQ',
      tips: 'Mantén los pies en la parte trasera, inclina el cuerpo hacia adentro y presiona la cola para girar',
    },
    {
      id: 2,
      name: 'Cutback',
      level: 2,
      description: 'Giro cambio de dirección en la cara de la ola',
      status: 'pending',
      videoSubmitted: true,
      instructorReview: 'Pendiente de revisión del instructor',
      youtubeUrl: 'https://www.youtube.com/embed/KLJWUfAUP2Y',
      tips: 'Sube a la cresta, gira con potencia y vuelve a la cara. Usa el rail trasero para pivotear.',
    },
    {
      id: 3,
      name: 'Barrel Roll',
      level: 3,
      description: 'Maniobra dentro del barril de la ola',
      status: 'locked',
      videoSubmitted: false,
      instructorReview: null,
      youtubeUrl: null,
      tips: null,
    },
  ]

  const statusConfig = {
    unlocked: { icon: CheckCircle, label: 'Desbloqueado', color: 'text-neon-cyan', border: 'border-neon-cyan/40', bg: 'bg-neon-cyan/5', badge: 'bg-neon-cyan/20 text-neon-cyan' },
    pending:  { icon: Clock,        label: 'Pendiente revisión', color: 'text-neon-magenta', border: 'border-neon-magenta/40', bg: 'bg-neon-magenta/5', badge: 'bg-neon-magenta/20 text-neon-magenta' },
    locked:   { icon: AlertCircle,  label: 'Bloqueado', color: 'text-muted-foreground', border: 'border-white/10', bg: 'bg-background/50 opacity-70', badge: 'bg-white/10 text-muted-foreground' },
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-display)] text-4xl text-neon-cyan mb-1">
          Maniobras & Niveles
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">Aprende, practica y sube de nivel con validación del instructor</p>

        <div className="space-y-4">
          {maneuvers.map((maneuver) => {
            const cfg = statusConfig[maneuver.status]
            const StatusIcon = cfg.icon
            const isExpanded = expandedVideo === maneuver.id

            return (
              <Card key={maneuver.id} className={`border transition-all overflow-hidden ${cfg.border} ${cfg.bg}`}>
                <div className="p-5">

                  {/* ── Row principal ── */}
                  <div className="flex gap-4">

                    {/* Thumbnail / video pequeño */}
                    {maneuver.youtubeUrl ? (
                      <div className="flex-shrink-0 relative rounded-lg overflow-hidden bg-black" style={{ width: 160, height: 90 }}>
                        <iframe
                          className="w-full h-full border-0 pointer-events-none"
                          src={`${maneuver.youtubeUrl}?controls=0&modestbranding=1`}
                          title={maneuver.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                        {/* Overlay con botón expandir */}
                        <button
                          onClick={() => setExpandedVideo(isExpanded ? null : maneuver.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                        >
                          {isExpanded
                            ? <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded">Cerrar</span>
                            : <Maximize2 className="w-5 h-5 text-white opacity-80 group-hover:opacity-100" />
                          }
                        </button>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center" style={{ width: 160, height: 90 }}>
                        <Play className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-[var(--font-display)] text-xl text-foreground leading-tight">{maneuver.name}</h3>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                          NIV. {maneuver.level}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{maneuver.description}</p>

                      <div className="flex items-center justify-between gap-3">
                        {/* Estado */}
                        <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{cfg.label}</span>
                        </div>

                        {/* Botones */}
                        <div className="flex items-center gap-2">
                          {/* Compartir en feed */}
                          <Link href={`/app/feed?action=post-maneuver&maneuver=${maneuver.name}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-background text-xs h-8 px-3"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              Postear
                            </Button>
                          </Link>
                          
                          {/* Botón subir video — SIEMPRE visible */}
                          <Button
                            size="sm"
                            className="gap-1.5 bg-neon-magenta hover:bg-neon-magenta/90 text-background text-xs h-8 px-3"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Subir Video
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Video expandido ── */}
                  {isExpanded && maneuver.youtubeUrl && (
                    <div className="mt-4">
                      <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full border-0"
                          src={`${maneuver.youtubeUrl}?autoplay=1`}
                          title={maneuver.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Tips ── */}
                  {maneuver.tips && (
                    <div className="mt-4 bg-background/50 border border-neon-lime/20 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-neon-lime mb-1">Tips del Instructor</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{maneuver.tips}</p>
                    </div>
                  )}

                  {/* ── Observaciones ── */}
                  {maneuver.instructorReview && (
                    <div className="mt-3 bg-background/50 border border-white/10 rounded-lg px-4 py-3">
                      <p className="text-xs">
                        <span className="font-semibold text-foreground">Observaciones: </span>
                        <span className="text-muted-foreground">{maneuver.instructorReview}</span>
                      </p>
                    </div>
                  )}

                </div>
              </Card>
            )
          })}
        </div>

        {/* Instrucciones */}
        <Card className="mt-10 p-5 border-white/10 bg-card/50">
          <h3 className="font-[var(--font-display)] text-lg text-neon-lime mb-3">Como desbloquear maniobras</h3>
          <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
            <li>Mira el <span className="text-foreground">video tutorial</span> del instructor (click en el thumbnail para expandir)</li>
            <li>Lee los <span className="text-foreground">tips</span> y practica la técnica</li>
            <li>Graba tu sesión y usa el botón <span className="text-foreground">Subir Video</span></li>
            <li>El instructor revisa y valida tu ejecucion</li>
            <li>Se desbloquea la maniobra y subes de nivel</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
