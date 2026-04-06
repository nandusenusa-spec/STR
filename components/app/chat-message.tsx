'use client'

import { ChatMessage as ChatMessageType } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const displayName =
    message.user?.user_profile?.full_name || message.user?.email?.split('@')[0] || 'Usuario'
  const avatar = message.user?.user_profile?.avatar_url
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const timestamp = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className="flex gap-3 group">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={avatar || undefined} alt={displayName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="font-semibold text-sm">{displayName}</p>
          <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp}
          </p>
        </div>
        <p className="text-sm text-foreground break-words">{message.content}</p>
      </div>
    </div>
  )
}
