'use client'

import { useEffect, useState } from 'react'
import { Radio, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface LiveEvent {
  activo: boolean
  titulo: string
  descripcion: string
  url: string
  instructor: string
  capacidad: number
}

export default function AdminClasesEnVivoPage() {
  const [liveEvent, setLiveEvent] = useState<LiveEvent>({
    activo: true,
    titulo: 'Clase de Surf Principiantes',
    descripcion: 'Una clase introductoria para aprender los fundamentos del surf con nuestro instructor certificado.',
    url: 'https://meet.google.com/abc-defg-hij',
    instructor: 'Juan Martinez',
    capacidad: 30
  })
  const [rowId, setRowId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('admin_live_classes')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!data) return
      setRowId(data.id)
      setLiveEvent({
        activo: !!data.activo,
        titulo: data.titulo || '',
        descripcion: data.descripcion || '',
        url: data.url || '',
        instructor: data.instructor || '',
        capacidad: Number(data.capacidad || 0),
      })
    }
    load()
  }, [])

  const handleToggle = () => {
    setLiveEvent(prev => ({ ...prev, activo: !prev.activo }))
    setSaved(false)
  }

  const handleChange = (field: keyof LiveEvent, value: any) => {
    setLiveEvent(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    const supabase = createClient()
    const payload = {
      activo: liveEvent.activo,
      titulo: liveEvent.titulo,
      descripcion: liveEvent.descripcion,
      url: liveEvent.url,
      instructor: liveEvent.instructor,
      capacidad: liveEvent.capacidad,
      updated_at: new Date().toISOString(),
    }
    if (rowId) {
      await supabase.from('admin_live_classes').update(payload).eq('id', rowId)
    } else {
      const { data } = await supabase.from('admin_live_classes').insert(payload).select('id').single()
      if (data?.id) setRowId(data.id)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Radio className="w-8 h-8 text-destructive animate-pulse" />
          <div>
            <h1 className="text-3xl font-[var(--font-display)] text-foreground">Clases en Vivo</h1>
            <p className="text-muted-foreground">Gestiona la transmisión en vivo de clases</p>
          </div>
        </div>

        <Card className="border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado de la Clase</span>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-mono px-3 py-1 rounded-full ${
                  liveEvent.activo 
                    ? 'bg-destructive/20 text-destructive' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {liveEvent.activo ? 'EN VIVO' : 'APAGADO'}
                </span>
                <Button
                  onClick={handleToggle}
                  variant={liveEvent.activo ? "destructive" : "outline"}
                  size="sm"
                >
                  {liveEvent.activo ? 'Apagar Clase' : 'Encender Clase'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!liveEvent.activo && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">La clase en vivo está apagada. No se mostrará en la página de inicio.</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Título de la Clase</label>
                <Input
                  value={liveEvent.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  placeholder="Ej: Clase de Surf Principiantes"
                  className="bg-background/50 border-white/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Descripción</label>
                <Textarea
                  value={liveEvent.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Describe el contenido de la clase..."
                  className="bg-background/50 border-white/10 min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Instructor</label>
                  <Input
                    value={liveEvent.instructor}
                    onChange={(e) => handleChange('instructor', e.target.value)}
                    placeholder="Nombre del instructor"
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Capacidad</label>
                  <Input
                    type="number"
                    value={liveEvent.capacidad}
                    onChange={(e) => handleChange('capacidad', parseInt(e.target.value))}
                    placeholder="30"
                    className="bg-background/50 border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">URL de la Transmisión</label>
                <Input
                  value={liveEvent.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="bg-background/50 border-white/10 font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-2">Puede ser Google Meet, Zoom, YouTube Live, etc.</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                size="lg"
                className="bg-primary text-background font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              {saved && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium">
                  ✓ Guardado exitosamente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 mt-6">
          <CardHeader>
            <CardTitle>Vista Previa en Landing</CardTitle>
          </CardHeader>
          <CardContent>
            {liveEvent.activo && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-destructive/20 border border-destructive/50">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                </span>
                <span className="text-sm font-mono text-destructive">CLASE EN VIVO</span>
              </div>
            )}
            {!liveEvent.activo && (
              <p className="text-muted-foreground text-sm">El banner de clase en vivo no se mostrará en la página de inicio.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
