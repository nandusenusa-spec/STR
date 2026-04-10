'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { User, Waves, Zap, TrendingUp, Activity, Save } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type BioState = {
  name: string
  email: string
  age: number
  height: number
  weight: number
  favoriteSpot: string
}

type QuiverFormState = {
  boardName: string
  boardType: string
  lengthFeet: number
  widthInches: number
  thicknessInches: number
}

type QuiverMeta = {
  galleryUrls: string[]
  listedProductId?: string
  listedAt?: string
  notesText?: string
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('bio')
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [bio, setBio] = useState<BioState>({
    name: '',
    email: '',
    age: 0,
    height: 0,
    weight: 0,
    favoriteSpot: '',
  })
  const [quiver, setQuiver] = useState<any[]>([])
  const [quiverForm, setQuiverForm] = useState<QuiverFormState>({
    boardName: '',
    boardType: 'shortboard',
    lengthFeet: 0,
    widthInches: 0,
    thicknessInches: 0,
  })
  const [quiverSaving, setQuiverSaving] = useState(false)
  const [quiverError, setQuiverError] = useState<string | null>(null)
  const [quiverMessage, setQuiverMessage] = useState<string | null>(null)
  const [selectedQuiverId, setSelectedQuiverId] = useState<string | null>(null)
  const [photoSaving, setPhotoSaving] = useState(false)
  const [sellPrice, setSellPrice] = useState<number>(0)
  const [selling, setSelling] = useState(false)
  const [timeline, setTimeline] = useState<any[]>([])
  const [timelineForm, setTimelineForm] = useState({
    title: '',
    description: '',
    mediaUrl: '',
  })
  const [timelineSaving, setTimelineSaving] = useState(false)
  const [timelineError, setTimelineError] = useState<string | null>(null)
  const [timelineMessage, setTimelineMessage] = useState<string | null>(null)
  const [metrics, setMetrics] = useState({
    heartRate: 0,
    vo2Max: 0,
    muscularEndurance: 0,
    flexibility: 0,
    bodyFatPercentage: 0,
  })
  const [connections, setConnections] = useState({
    strava: false,
    appleHealth: false,
    googleFit: false,
    stravaAthleteId: '',
  })
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null)
  const [integrationError, setIntegrationError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const [profileRes, bioRes, quiverRes, timelineRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('surfer_biometrics').select('*').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('surfer_quiver')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('evolution_timeline')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const profile = profileRes.data as Record<string, any> | null
      const biom = bioRes.data as Record<string, any> | null
      setBio({
        name: profile?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        age: Number(biom?.age || 0),
        height: Number(biom?.height_cm || 0),
        weight: Number(biom?.weight_kg || 0),
        favoriteSpot: '',
      })
      setQuiver((quiverRes.data as any[]) || [])
      setTimeline((timelineRes.data as any[]) || [])
      setMetrics({
        heartRate: 65,
        vo2Max: 45,
        muscularEndurance: 8,
        flexibility: 7,
        bodyFatPercentage: 12,
      })
      setConnections({
        strava: Boolean(biom?.strava_connected),
        appleHealth: Boolean(biom?.apple_health_connected),
        googleFit: Boolean(biom?.google_fit_connected),
        stravaAthleteId: biom?.strava_athlete_id || '',
      })
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('integration') !== 'strava') return
    const status = params.get('status')
    if (status === 'connected') {
      setIntegrationMessage('Strava conectado. Ya podés sincronizar actividades.')
      setConnections((prev) => ({ ...prev, strava: true }))
    } else if (status === 'error') {
      setIntegrationError('No se pudo conectar Strava. Revisá Client ID/Secret y callback.')
    }
  }, [])

  const statsQuiver = useMemo(() => quiver.length, [quiver])
  const selectedQuiver = useMemo(
    () => quiver.find((q) => q.id === selectedQuiverId) ?? null,
    [quiver, selectedQuiverId],
  )

  const parseQuiverMeta = (notes?: string | null): QuiverMeta => {
    if (!notes) return { galleryUrls: [] }
    try {
      const parsed = JSON.parse(notes) as {
        __quiverMeta?: boolean
        galleryUrls?: string[]
        listedProductId?: string
        listedAt?: string
        notesText?: string
      }
      if (parsed.__quiverMeta) {
        return {
          galleryUrls: parsed.galleryUrls || [],
          listedProductId: parsed.listedProductId,
          listedAt: parsed.listedAt,
          notesText: parsed.notesText,
        }
      }
    } catch {
      return { galleryUrls: [], notesText: notes }
    }
    return { galleryUrls: [], notesText: notes }
  }

  const stringifyQuiverMeta = (meta: QuiverMeta) =>
    JSON.stringify({
      __quiverMeta: true,
      galleryUrls: meta.galleryUrls,
      listedProductId: meta.listedProductId,
      listedAt: meta.listedAt,
      notesText: meta.notesText,
    })

  const getQuiverPhotos = (board: any): string[] => {
    const meta = parseQuiverMeta(board?.notes)
    const all = [board?.image_url, ...(meta.galleryUrls || [])].filter(Boolean) as string[]
    return [...new Set(all)]
  }

  const saveBio = async () => {
    setSaveMessage(null)
    setSaveError(null)
    if (!userId) {
      setSaveError('Tu sesión expiró. Volvé a iniciar sesión para guardar cambios.')
      return
    }
    if (!bio.name.trim()) {
      setSaveError('El nombre es obligatorio para guardar el perfil.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      id: userId,
      full_name: bio.name.trim(),
    })
    if (profileError) {
      setSaveError(`No se pudo guardar el perfil: ${profileError.message}`)
      setSaving(false)
      return
    }

    const { error: biometricsError } = await supabase.from('surfer_biometrics').upsert({
      user_id: userId,
      age: bio.age || null,
      height_cm: bio.height || null,
      weight_kg: bio.weight || null,
    })
    if (biometricsError) {
      setSaveError(`No se pudieron guardar los datos físicos: ${biometricsError.message}`)
      setSaving(false)
      return
    }

    setSaving(false)
    setEditMode(false)
    setSaveMessage('Perfil actualizado correctamente.')
  }

  const addBoardToQuiver = async () => {
    setQuiverError(null)
    setQuiverMessage(null)
    if (!userId) {
      setQuiverError('Tu sesión expiró. Volvé a iniciar sesión para agregar una tabla.')
      return
    }
    if (!quiverForm.boardName.trim()) {
      setQuiverError('El nombre de la tabla es obligatorio.')
      return
    }

    setQuiverSaving(true)
    const supabase = createClient()
    const payload = {
      user_id: userId,
      board_name: quiverForm.boardName.trim(),
      board_type: quiverForm.boardType,
      length_feet: quiverForm.lengthFeet || null,
      width_inches: quiverForm.widthInches || null,
      thickness_inches: quiverForm.thicknessInches || null,
    }
    const { data, error } = await supabase
      .from('surfer_quiver')
      .insert(payload)
      .select('*')
      .maybeSingle()

    if (error) {
      setQuiverSaving(false)
      setQuiverError(`No se pudo agregar la tabla: ${error.message}`)
      return
    }

    if (data) {
      setQuiver((prev) => [data, ...prev])
    }
    setQuiverForm({
      boardName: '',
      boardType: 'shortboard',
      lengthFeet: 0,
      widthInches: 0,
      thicknessInches: 0,
    })
    setQuiverSaving(false)
    setQuiverMessage('Tabla agregada al quiver.')
  }

  const addPhotoToBoard = async (filesInput: File[] | FileList) => {
    setQuiverError(null)
    setQuiverMessage(null)
    if (!selectedQuiver || !userId) {
      setQuiverError('Seleccioná una tabla para agregar fotos.')
      return
    }
    const files = Array.from(filesInput).filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) {
      setQuiverError('Seleccioná al menos una imagen válida.')
      return
    }

    setPhotoSaving(true)
    const formData = new FormData()
    formData.append('quiverId', selectedQuiver.id)
    files.forEach((file) => formData.append('photos', file))

    const response = await fetch('/api/quiver/upload-photo', {
      method: 'POST',
      body: formData,
    })
    const result = (await response.json()) as { error?: string; imageUrl?: string; notes?: string }

    if (!response.ok) {
      setPhotoSaving(false)
      setQuiverError(result.error || 'No se pudo subir la foto.')
      return
    }

    setQuiver((prev) =>
      prev.map((item) =>
        item.id === selectedQuiver.id
          ? {
              ...item,
              image_url: result.imageUrl ?? item.image_url,
              notes: result.notes ?? item.notes,
            }
          : item,
      ),
    )
    setPhotoSaving(false)
    setQuiverMessage(files.length > 1 ? 'Fotos agregadas correctamente.' : 'Foto agregada correctamente.')
  }

  const publishBoardForSale = async () => {
    setQuiverError(null)
    setQuiverMessage(null)
    if (!selectedQuiver) {
      setQuiverError('Seleccioná una tabla para vender.')
      return
    }
    if (!sellPrice || sellPrice <= 0) {
      setQuiverError('Ingresá un precio válido para publicar.')
      return
    }

    setSelling(true)
    const response = await fetch('/api/quiver/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiverId: selectedQuiver.id,
        price: sellPrice,
      }),
    })
    const result = (await response.json()) as { error?: string; productId?: string; categorySlug?: string }

    if (!response.ok) {
      setSelling(false)
      setQuiverError(result.error || 'No se pudo publicar en tienda.')
      return
    }

    const meta = parseQuiverMeta(selectedQuiver.notes)
    const nextMeta: QuiverMeta = {
      ...meta,
      listedProductId: result.productId,
      listedAt: new Date().toISOString(),
    }
    setQuiver((prev) =>
      prev.map((item) =>
        item.id === selectedQuiver.id ? { ...item, notes: stringifyQuiverMeta(nextMeta) } : item,
      ),
    )
    setSelling(false)
    setQuiverMessage('Tabla publicada en tienda. Abriendo categoría...')
    if (result.categorySlug) {
      setTimeout(() => {
        window.location.href = `/tienda/${result.categorySlug}`
      }, 500)
    }
  }

  const addTimelineVideo = async () => {
    setTimelineError(null)
    setTimelineMessage(null)
    if (!userId) {
      setTimelineError('Tu sesión expiró. Volvé a iniciar sesión para cargar videos.')
      return
    }
    if (!timelineForm.mediaUrl.trim()) {
      setTimelineError('La URL del video es obligatoria.')
      return
    }

    setTimelineSaving(true)
    const supabase = createClient()
    const payload = {
      user_id: userId,
      entry_type: 'video',
      title: timelineForm.title.trim() || 'Video de evolución',
      description: timelineForm.description.trim() || null,
      media_url: timelineForm.mediaUrl.trim(),
      is_public: true,
    }
    const { data, error } = await supabase
      .from('evolution_timeline')
      .insert(payload)
      .select('*')
      .maybeSingle()

    if (error) {
      setTimelineSaving(false)
      setTimelineError(`No se pudo guardar el video: ${error.message}`)
      return
    }

    if (data) {
      setTimeline((prev) => [data, ...prev])
    }
    setTimelineForm({
      title: '',
      description: '',
      mediaUrl: '',
    })
    setTimelineSaving(false)
    setTimelineMessage('Video agregado a tu timeline.')
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Cargando perfil...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-4xl text-foreground">Mi Perfil</h1>
            <p className="text-muted-foreground">Datos reales conectados a tu cuenta</p>
          </div>
          <Button
            onClick={() => {
              setSaveMessage(null)
              setSaveError(null)
              setEditMode(!editMode)
            }}
            variant={editMode ? 'destructive' : 'default'}
            className="gap-2"
          >
            {editMode ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-white/10 rounded-lg">
            <TabsTrigger value="bio" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Bio</span>
            </TabsTrigger>
            <TabsTrigger value="quiver" className="gap-2">
              <Waves className="w-4 h-4" />
              <span className="hidden sm:inline">Quiver</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="maneuvers" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Maniobras</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bio" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Nombre', 'name'],
                ['Email', 'email'],
                ['Edad', 'age'],
                ['Altura (cm)', 'height'],
                ['Peso (kg)', 'weight'],
                ['Playa Favorita', 'favoriteSpot'],
              ].map(([label, key]) => (
                <div key={key} className="rounded-lg border border-white/10 bg-card/50 p-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {label}
                  </label>
                  <input
                    type={key === 'email' ? 'email' : key === 'age' || key === 'height' || key === 'weight' ? 'number' : 'text'}
                    value={(bio as any)[key] ?? ''}
                    onChange={(e) =>
                      setBio((prev) => ({
                        ...prev,
                        [key]:
                          key === 'age' || key === 'height' || key === 'weight'
                            ? Number(e.target.value)
                            : e.target.value,
                      }))
                    }
                    disabled={!editMode || key === 'email'}
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
            {!editMode && (
              <p className="text-sm text-muted-foreground">
                Tocá "Editar" para modificar tu bio y luego "Guardar Cambios".
              </p>
            )}
            {saveError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {saveError}
              </div>
            )}
            {saveMessage && (
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
                {saveMessage}
              </div>
            )}
            {editMode && (
              <Button
                onClick={saveBio}
                disabled={saving}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="quiver" className="space-y-6 mt-6">
            <div className="rounded-lg border border-white/10 bg-card/50 p-6 space-y-4">
              <h3 className="font-[var(--font-display)] text-xl text-foreground">Agregar tabla</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Nombre</label>
                  <input
                    type="text"
                    value={quiverForm.boardName}
                    onChange={(e) =>
                      setQuiverForm((prev) => ({ ...prev, boardName: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                    placeholder="Ej: SharpEye Storms"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Tipo</label>
                  <select
                    value={quiverForm.boardType}
                    onChange={(e) =>
                      setQuiverForm((prev) => ({ ...prev, boardType: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                  >
                    {['shortboard', 'longboard', 'fish', 'funboard', 'gun', 'sup'].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Largo (pies)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={quiverForm.lengthFeet || ''}
                    onChange={(e) =>
                      setQuiverForm((prev) => ({
                        ...prev,
                        lengthFeet: Number(e.target.value || 0),
                      }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                    placeholder="6.0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Ancho (in)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={quiverForm.widthInches || ''}
                    onChange={(e) =>
                      setQuiverForm((prev) => ({
                        ...prev,
                        widthInches: Number(e.target.value || 0),
                      }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                    placeholder="19.75"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Espesor (in)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={quiverForm.thicknessInches || ''}
                    onChange={(e) =>
                      setQuiverForm((prev) => ({
                        ...prev,
                        thicknessInches: Number(e.target.value || 0),
                      }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                    placeholder="2.50"
                  />
                </div>
              </div>
              {quiverError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {quiverError}
                </div>
              )}
              {quiverMessage && (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
                  {quiverMessage}
                </div>
              )}
              <Button
                onClick={addBoardToQuiver}
                disabled={quiverSaving}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Waves className="w-4 h-4" />
                {quiverSaving ? 'Agregando...' : 'Agregar tabla'}
              </Button>
            </div>
            <div className="rounded-lg border border-white/10 bg-card/50 p-4">
              <p className="text-sm text-muted-foreground">Tablas registradas: {statsQuiver}</p>
            </div>
            {selectedQuiver && (
              <div className="rounded-lg border border-white/10 bg-card/50 p-6 space-y-4">
                <h3 className="font-[var(--font-display)] text-xl text-foreground">
                  {selectedQuiver.board_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedQuiver.board_type} • {selectedQuiver.length_feet || '-'}' •{' '}
                  {selectedQuiver.width_inches || '-'}" • {selectedQuiver.thickness_inches || '-'}"
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getQuiverPhotos(selectedQuiver).length === 0 ? (
                    <div className="col-span-full rounded-lg border border-white/10 p-4 text-sm text-muted-foreground">
                      Esta tabla aún no tiene fotos.
                    </div>
                  ) : (
                    getQuiverPhotos(selectedQuiver).map((photo, idx) => (
                      <a
                        key={`${selectedQuiver.id}-${idx}`}
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block aspect-square overflow-hidden rounded-lg border border-white/10 bg-background"
                      >
                        <Image
                          src={photo}
                          alt={`Foto ${idx + 1} de ${selectedQuiver.board_name}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 45vw, 15vw"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <span className="text-[11px] text-white font-medium">Foto {idx + 1}</span>
                        </div>
                      </a>
                    ))
                  )}
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    void addPhotoToBoard(e.dataTransfer.files)
                  }}
                  className="rounded-lg border border-dashed border-white/20 bg-background/60 p-4"
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Arrastrá fotos desde tu celu/computadora o seleccioná archivos.
                  </p>
                  <input
                    id="quiver-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) void addPhotoToBoard(e.target.files)
                      e.currentTarget.value = ''
                    }}
                  />
                  <label htmlFor="quiver-photo-upload" className="inline-block">
                    <Button type="button" disabled={photoSaving} className="w-full">
                      {photoSaving ? 'Subiendo fotos...' : 'Seleccionar fotos'}
                    </Button>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Precio de venta</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={sellPrice || ''}
                      onChange={(e) => setSellPrice(Number(e.target.value || 0))}
                      className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                      placeholder="Ej: 450"
                    />
                  </div>
                  <Button
                    onClick={publishBoardForSale}
                    disabled={selling}
                    className="md:col-span-2 bg-primary hover:bg-primary/90"
                  >
                    {selling ? 'Publicando...' : 'Vender (publicar en tienda)'}
                  </Button>
                </div>
              </div>
            )}
            {quiverError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {quiverError}
              </div>
            )}
            {quiverMessage && (
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
                {quiverMessage}
              </div>
            )}
            <div className="grid gap-4">
              {quiver.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-card/50 p-6 text-muted-foreground">
                  Aun no tienes tablas registradas.
                </div>
              ) : (
                quiver.map((q) => (
                  <div key={q.id} className="rounded-lg border border-white/10 bg-card/50 p-6">
                    <h3 className="font-[var(--font-display)] text-xl text-foreground">
                      {q.board_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {q.board_type} • {q.length_feet || '-'}' • {q.width_inches || '-'}" •{' '}
                      {q.thickness_inches || '-'}"
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setSelectedQuiverId(q.id)
                          setSellPrice(0)
                        }}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Ver detalle
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-6">
            <div className="rounded-lg border border-white/10 bg-card/50 p-6 space-y-4">
              <h3 className="font-[var(--font-display)] text-xl text-foreground">
                Cargar video de evolución
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Título</label>
                  <input
                    type="text"
                    value={timelineForm.title}
                    onChange={(e) =>
                      setTimelineForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                    placeholder="Ej: Sesión en Punta del Este"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">URL del video</label>
                  <input
                    type="url"
                    value={timelineForm.mediaUrl}
                    onChange={(e) =>
                      setTimelineForm((prev) => ({ ...prev, mediaUrl: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Descripción</label>
                <textarea
                  value={timelineForm.description}
                  onChange={(e) =>
                    setTimelineForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground min-h-[90px]"
                  placeholder="Qué trabajaste en esta sesión, condiciones, progreso..."
                />
              </div>
              {timelineError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {timelineError}
                </div>
              )}
              {timelineMessage && (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
                  {timelineMessage}
                </div>
              )}
              <Button
                onClick={addTimelineVideo}
                disabled={timelineSaving}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <TrendingUp className="w-4 h-4" />
                {timelineSaving ? 'Guardando...' : 'Agregar video al timeline'}
              </Button>
            </div>
            {timeline.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-card/50 p-6 text-muted-foreground">
                Sin registros en timeline.
              </div>
            ) : (
              timeline.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-white/10 bg-card/50 p-6">
                  <p className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString('es-UY')}
                  </p>
                  <h3 className="font-[var(--font-display)] text-xl text-foreground mt-1">
                    {entry.title || entry.entry_type}
                  </h3>
                  <p className="text-muted-foreground">{entry.description}</p>
                  {entry.media_url && (
                    <a
                      href={entry.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      Ver video
                    </a>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Frecuencia Cardíaca (bpm)', metrics.heartRate, 'text-primary'],
                ['VO2 Max', metrics.vo2Max, 'text-primary'],
                ['Resistencia (1-10)', metrics.muscularEndurance, 'text-primary'],
                ['Flexibilidad (1-10)', metrics.flexibility, 'text-primary'],
                ['% Grasa Corporal', `${metrics.bodyFatPercentage}%`, 'text-primary'],
              ].map(([label, value, cls]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-card/50 p-6">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <p className={`font-[var(--font-display)] text-3xl mt-2 ${cls}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-card/50 p-6 space-y-4">
              <h3 className="font-[var(--font-display)] text-xl text-foreground">
                Integraciones de señales biométricas
              </h3>
              {integrationError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {integrationError}
                </div>
              )}
              {integrationMessage && (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
                  {integrationMessage}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <p className="text-sm text-muted-foreground">Strava</p>
                  <p className={connections.strava ? 'text-primary text-sm mt-1' : 'text-muted-foreground text-sm mt-1'}>
                    {connections.strava ? `Conectado${connections.stravaAthleteId ? ` (ID ${connections.stravaAthleteId})` : ''}` : 'No conectado'}
                  </p>
                  {!connections.strava && (
                    <a
                      href="/api/integrations/strava/connect"
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      Conectar con Strava
                    </a>
                  )}
                </div>

                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <p className="text-sm text-muted-foreground">Apple Health</p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {connections.appleHealth ? 'Conectado' : 'Proximamente (iOS app)'}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-background p-4">
                  <p className="text-sm text-muted-foreground">Google Fit / Health Connect</p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {connections.googleFit ? 'Conectado' : 'Proximamente (Android app)'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maneuvers" className="space-y-6 mt-6">
            <div className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Ve a la sección "Maniobras" para gestionar tu progreso en técnicas de surf
              </p>
              <Link href="/app/maneuvers">
                <Button className="mt-6 gap-2">
                  <Zap className="w-4 h-4" />
                  Ir a Maniobras
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
