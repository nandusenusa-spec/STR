import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Eventos | STR Community',
  description: 'Clases, viajes y meetups de la comunidad',
}

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(20)

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Eventos y Clases</h1>
        <p className="text-muted-foreground">
          Mantente actualizado con las próximas clases, viajes y meetups
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Error al cargar eventos</p>
            </CardContent>
          </Card>
        ) : !events || events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No hay eventos programados</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4 md:gap-6">
                {/* Image */}
                {event.image_url && (
                  <div className="hidden md:block w-40 h-40 flex-shrink-0">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <CardContent className="flex-1 p-6">
                  <div className="space-y-4">
                    {/* Title & Type */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {(event as { event_type?: string }).event_type || (event as { type?: string }).type}
                        </Badge>
                        <Badge className="capitalize">{(event as { discipline?: string }).discipline}</Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {format(new Date(event.start_date), 'd MMM, HH:mm', {
                            locale: es,
                          })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.max_participants && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {((event as { current_participants?: number }).current_participants ?? 0)}
                            /{event.max_participants} inscriptos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex gap-2 pt-2">
                      <Button>Inscribirse</Button>
                      <Button variant="outline">Ver detalles</Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
