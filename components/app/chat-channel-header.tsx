'use client'

import { Card } from '@/components/ui/card'
import { Hash } from 'lucide-react'

interface ChatChannelHeaderProps {
  channel?: {
    id: string
    name: string
    discipline: string
  }
}

export default function ChatChannelHeader({ channel }: ChatChannelHeaderProps) {
  return (
    <Card className="rounded-none border-b border-t-0 border-l-0 border-r-0">
      <div className="p-4 flex items-center gap-3">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <div>
          <h2 className="font-semibold text-lg">{channel?.name || 'Chat'}</h2>
          <p className="text-xs text-muted-foreground">
            {channel?.discipline === 'general'
              ? 'Conversaciones generales de la comunidad'
              : `Canal dedicado a ${channel?.name?.toLowerCase()}`}
          </p>
        </div>
      </div>
    </Card>
  )
}
