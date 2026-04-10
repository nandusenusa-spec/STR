'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Save, Phone, Mail, MapPin, Instagram, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface ContactInfo {
  whatsapp: string
  whatsappMessage: string
  email: string
  instagram: string
  direccion: string
  horarioAtencion: string
}

const initialContact: ContactInfo = {
  whatsapp: '+598 99 123 456',
  whatsappMessage: 'Hola! Me gustaria obtener informacion sobre las clases de surf/skate.',
  email: 'info@comunidadstr.com',
  instagram: '@comunidadstr',
  direccion: 'Montevideo, Uruguay',
  horarioAtencion: 'Lunes a Viernes 9:00 - 18:00'
}

export default function AdminContactoPage() {
  const [contact, setContact] = useState<ContactInfo>(initialContact)
  const [saved, setSaved] = useState(false)
  const [rowId, setRowId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('admin_contact_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!data) return
      setRowId(data.id)
      setContact({
        whatsapp: data.whatsapp || '',
        whatsappMessage: data.whatsapp_message || '',
        email: data.email || '',
        instagram: data.instagram || '',
        direccion: data.direccion || '',
        horarioAtencion: data.horario_atencion || '',
      })
    }
    load()
  }, [])

  const handleSave = async () => {
    const supabase = createClient()
    const payload = {
      whatsapp: contact.whatsapp,
      whatsapp_message: contact.whatsappMessage,
      email: contact.email,
      instagram: contact.instagram,
      direccion: contact.direccion,
      horario_atencion: contact.horarioAtencion,
      updated_at: new Date().toISOString(),
    }
    if (rowId) {
      await supabase.from('admin_contact_info').update(payload).eq('id', rowId)
    } else {
      const { data } = await supabase.from('admin_contact_info').insert(payload).select('id').single()
      if (data?.id) setRowId(data.id)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const whatsappLink = `https://wa.me/${contact.whatsapp.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(contact.whatsappMessage)}`

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacto</h1>
          <p className="text-muted-foreground mt-1">Configura los datos de contacto</p>
        </div>
        <Button 
          onClick={handleSave}
          className={`${saved ? 'bg-primary' : 'bg-primary'} text-background hover:opacity-80`}
        >
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Guardado!' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Phone className="w-5 h-5" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Numero de WhatsApp</label>
              <Input
                value={contact.whatsapp}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                placeholder="+598 99 123 456"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mensaje predeterminado</label>
              <Textarea
                value={contact.whatsappMessage}
                onChange={(e) => setContact({ ...contact, whatsappMessage: e.target.value })}
                rows={3}
                placeholder="Mensaje que se envia automaticamente..."
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Probar link
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email de contacto</label>
              <Input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="info@tudominio.com"
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${contact.email}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Probar email
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Instagram className="w-5 h-5" />
              Instagram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Usuario de Instagram</label>
              <Input
                value={contact.instagram}
                onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
                placeholder="@tuusuario"
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver perfil
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Ubicacion */}
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Ubicacion y Horarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Direccion</label>
              <Input
                value={contact.direccion}
                onChange={(e) => setContact({ ...contact, direccion: e.target.value })}
                placeholder="Ciudad, Pais"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Horario de atencion</label>
              <Input
                value={contact.horarioAtencion}
                onChange={(e) => setContact({ ...contact, horarioAtencion: e.target.value })}
                placeholder="Lunes a Viernes 9:00 - 18:00"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card className="mt-8 border-white/10">
        <CardHeader>
          <CardTitle>Vista Previa - Botones de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-background font-medium hover:opacity-80 transition-opacity"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <a 
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-background font-medium hover:opacity-80 transition-opacity"
            >
              <Mail className="w-5 h-5" />
              Email
            </a>
            <a 
              href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-background font-medium hover:opacity-80 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
