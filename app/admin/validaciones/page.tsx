'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, MessageSquare, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ValidationItem {
  id: string
  studentName: string
  maneuver: string
  submittedDate: string
  status: string
  videoUrl: string
  feedback?: string | null
}

export default function ValidationPage() {
  const [validations, setValidations] = useState<ValidationItem[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_maneuver_progress')
        .select(`
          id,
          status,
          video_url,
          video_uploaded_at,
          instructor_feedback,
          maneuver:surf_maneuvers(name_es,name),
          user:user_profiles(full_name,email)
        `)
        .not('video_url', 'is', null)
        .order('video_uploaded_at', { ascending: false })

      if (!data) return
      const rows = data as any[]
      setValidations(
        rows.map((v) => ({
          id: v.id,
          studentName: v.user?.full_name || v.user?.email?.split('@')[0] || 'Usuario',
          maneuver: v.maneuver?.name_es || v.maneuver?.name || 'Maniobra',
          submittedDate: v.video_uploaded_at?.slice(0, 10) || '',
          status: v.status === 'pending_review' ? 'pending' : v.status,
          videoUrl: v.video_url || '#',
          feedback: v.instructor_feedback || null,
        })),
      )
    }
    load()
  }, [])

  const pendingCount = useMemo(() => validations.filter((v) => v.status === 'pending').length, [validations])
  const approvedCount = useMemo(() => validations.filter((v) => v.status === 'approved').length, [validations])

  const updateValidation = async (id: string, status: 'approved' | 'rejected', feedback?: string) => {
    const supabase = createClient()
    await supabase
      .from('user_maneuver_progress')
      .update({
        status,
        instructor_feedback: feedback ?? null,
        instructor_reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    setValidations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status, feedback: feedback ?? v.feedback } : v)),
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-[var(--font-display)] text-4xl text-neon-lime mb-8">
          Centro de Validaciones
        </h1>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Videos Pendientes</div>
            <div className="font-[var(--font-display)] text-3xl text-neon-magenta">{pendingCount}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Aprobados Hoy</div>
            <div className="font-[var(--font-display)] text-3xl text-neon-cyan">{approvedCount}</div>
          </div>
        </div>

        <div className="space-y-4">
          {validations.map((validation) => (
            <Card
              key={validation.id}
              className={`p-6 border transition-all ${
                validation.status === 'pending'
                  ? 'border-neon-magenta/50 bg-neon-magenta/5'
                  : 'border-neon-cyan/50 bg-neon-cyan/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-[var(--font-display)] text-xl text-foreground mb-2">
                    {validation.studentName}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Maniobra: <span className="text-neon-lime">{validation.maneuver}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Subido: {validation.submittedDate}
                  </p>

                  {validation.feedback && (
                    <div className="mt-4 bg-background/50 border border-white/10 rounded p-3">
                      <p className="text-sm">
                        <span className="text-neon-cyan font-medium">Tu Feedback:</span> {validation.feedback}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-neon-cyan text-background hover:bg-neon-cyan/80 gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Ver Video
                  </Button>

                  {validation.status === 'pending' && (
                    <>
                      <Button
                        className="bg-neon-lime text-background hover:bg-neon-lime/80 gap-2"
                        onClick={() => updateValidation(validation.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 gap-2"
                        onClick={() => {
                          const feedback = window.prompt('Feedback para el alumno:')
                          if (feedback !== null) void updateValidation(validation.id, 'pending', feedback)
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                      </Button>
                      <Button
                        variant="outline"
                        className="border-destructive/30 hover:bg-destructive/10 text-destructive gap-2"
                        onClick={() => updateValidation(validation.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </Button>
                    </>
                  )}

                  {validation.status === 'approved' && (
                    <div className="flex items-center gap-2 text-neon-cyan text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Aprobado
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {validations.every((v) => v.status !== 'pending') && (
          <Card className="mt-8 p-8 border-neon-cyan/50 bg-neon-cyan/5 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-neon-cyan mb-4" />
            <p className="text-lg text-foreground font-medium">
              ¡Todos los videos han sido revisados!
            </p>
            <p className="text-muted-foreground mt-2">
              Vuelve cuando haya nuevos videos para revisar
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
