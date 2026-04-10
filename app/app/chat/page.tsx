'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Paperclip } from 'lucide-react'
import { ChatMessage as ChatMessageType } from '@/lib/types'
import ChatMessage from '@/components/app/chat-message'
import ChatChannelHeader from '@/components/app/chat-channel-header'
import {
  enrichRowsWithUsers,
  fetchProfilesByIds,
} from '@/lib/supabase/enrich-profiles'

const channels = [
  { id: 'general', name: 'General', discipline: 'general' },
  { id: 'surf', name: 'Surf', discipline: 'surf' },
  { id: 'skate', name: 'Skate', discipline: 'skate' },
  { id: 'sup', name: 'SUP', discipline: 'sup' },
]

function ChatPageContent() {
  const searchParams = useSearchParams()
  const selectedSlug = searchParams.get('channel') || 'general'
  const supabase = createClient()

  const [channelId, setChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    let cancelled = false

    const resolveChannel = async () => {
      const { data: ch } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('slug', selectedSlug)
        .maybeSingle()

      if (!cancelled) {
        setChannelId(ch?.id ?? null)
      }
    }

    resolveChannel()
    return () => {
      cancelled = true
    }
  }, [selectedSlug, supabase])

  useEffect(() => {
    if (!channelId) {
      setLoading(false)
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error || !data) {
        setMessages([])
        setLoading(false)
        return
      }

      const profileMap = await fetchProfilesByIds(
        supabase,
        data.map((m) => m.user_id),
      )
      const enriched = enrichRowsWithUsers(data, profileMap)
      setMessages(enriched as unknown as ChatMessageType[])
      setLoading(false)
    }

    loadMessages()

    const subscription = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const row = payload.new as { id: string; user_id: string }
          const profileMap = await fetchProfilesByIds(supabase, [row.user_id])
          const [enriched] = enrichRowsWithUsers([row as { user_id: string }], profileMap)
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [...prev, enriched as unknown as ChatMessageType],
          )
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !channelId) return

    const { error } = await supabase.from('chat_messages').insert([
      {
        channel_id: channelId,
        user_id: user.id,
        content: newMessage,
      },
    ])

    if (!error) {
      setNewMessage('')
    }
  }

  const currentChannel = channels.find((c) => c.id === selectedSlug)

  return (
    <div className="flex flex-col h-full">
      <ChatChannelHeader channel={currentChannel} />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {!channelId ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Canal no disponible</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No hay mensajes aún</p>
                <p className="text-sm text-muted-foreground">
                  ¡Sé el primero en escribir!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!channelId || !user}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full items-center justify-center">
          <p className="text-muted-foreground">Cargando chat…</p>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  )
}
