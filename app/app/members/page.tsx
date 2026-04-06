import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Search, MessageCircle, UserPlus } from 'lucide-react'

export const metadata = {
  title: 'Directorio | STR Community',
  description: 'Conoce a otros miembros de la comunidad',
}

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: rows, error } = await supabase.from('user_profiles').select('*').limit(50)

  const members = (rows || []).map((m) => {
    const r = m as Record<string, unknown>
    return {
      ...m,
      discipline: r.discipline ?? r.favorite_discipline,
      followers_count: (r.followers_count as number) ?? 0,
      following_count: (r.following_count as number) ?? 0,
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Directorio de Miembros</h1>
          <p className="text-muted-foreground">
            Conecta con otros miembros de la comunidad STR
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar miembros..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Error al cargar miembros</p>
            </CardContent>
          </Card>
        ) : !members || members.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No hay miembros disponibles</p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => {
            const displayName = member.full_name || member.email?.split('@')[0] || 'Usuario'
            const initials = displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()

            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  {/* Avatar & Name */}
                  <div className="text-center space-y-3">
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarImage src={member.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{displayName}</h3>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.discipline && (
                      <Badge variant="secondary" className="capitalize">
                        {member.discipline}
                      </Badge>
                    )}
                    {member.level && (
                      <Badge variant="outline" className="capitalize">
                        {member.level}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 text-center text-sm">
                    <div>
                      <p className="font-semibold">{member.followers_count}</p>
                      <p className="text-xs text-muted-foreground">Seguidores</p>
                    </div>
                    <div>
                      <p className="font-semibold">{member.following_count}</p>
                      <p className="text-xs text-muted-foreground">Siguiendo</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Mensaje
                    </Button>
                    <Button size="sm" className="flex-1 gap-2">
                      <UserPlus className="w-4 h-4" />
                      Seguir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
