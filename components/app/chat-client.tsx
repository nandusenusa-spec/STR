'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
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

const globalChannels = [
  { id: 'general', name: 'General', discipline: 'general' },
  { id: 'surf', name: 'Surf', discipline: 'surf' },
  { id: 'skate', name: 'Skate', discipline: 'skate' },
  { id: 'sup', name: 'SUP', discipline: 'sup' },
]

export type ChatClientProps = {
  /** Chat de un espacio (un solo canal) */
  spaceId?: string | null
  spaceSlug?: string
  showComposer?: boolean
}

function ChatInner({ spaceId, spaceSlug, showComposer = true }: ChatClientProps) {
  const searchParams = useSearchParams()
  const selectedSlug = searchParams.get('channel') || 'general'
  const supabase = createClient()

  const [channelId, setChannelId] = useState<string | null>(null)
  const [channelLabel, setChannelLabel] = useState<{ id: string; name: string; discipline: string } | null>(
    null,
  )
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    void (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u)
    })()
  }, [supabase])

  useEffect(() => {
    let cancelled = false

    const resolveChannel = async () => {
      if (spaceId) {
        const { data: ch } = await supabase
          .from('chat_channels')
          .select('id, name, slug')
          .eq('space_id', spaceId)
          .maybeSingle()

        if (cancelled) return
        setChannelId(ch?.id ?? null)
        if (ch) {
          setChannelLabel({
            id: ch.slug,
            name: ch.name,
            discipline: 'general',
          })
        } else {
          setChannelLabel(null)
        }
        return
      }

      const { data: ch } = await supabase
        .from('chat_channels')
        .select('id, slug')
        .eq('slug', selectedSlug)
        .maybeSingle()

      if (cancelled) return
      setChannelId(ch?.id ?? null)
      const meta = globalChannels.find((c) => c.id === selectedSlug)
      setChannelLabel(
        meta
          ? { id: meta.id, name: meta.name, discipline: meta.discipline }
          : { id: selectedSlug, name: 'Chat', discipline: 'general' },
      )
    }

    void resolveChannel()
    return () => {
      cancelled = true
    }
  }, [selectedSlug, supabase, spaceId])

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

    void loadMessages()

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
    if (!newMessage.trim() || !user || !channelId || !showComposer) return

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

  return (
    <div className="flex flex-col h-full min-h-[420px]">
      <ChatChannelHeader channel={channelLabel ?? undefined} />

      {spaceId && !showComposer && (
        <div className="px-4 py-2 text-sm border-b border-border bg-amber-500/5 text-muted-foreground">
          Unite al espacio para chatear.
          {spaceSlug && (
            <Link className="ml-2 text-neon-cyan hover:underline" href={`/e/${spaceSlug}`}>
              Volver
            </Link>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {!channelId ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">
                {spaceId ? 'Canal del espacio no disponible (¿migración 022 aplicada?)' : 'Canal no disponible'}
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
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
          <Button type="button" variant="ghost" size="icon" disabled={!showComposer}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={showComposer ? 'Escribe un mensaje...' : 'Solo miembros pueden escribir'}
            className="flex-1"
            disabled={!showComposer}
          />
          <Button type="submit" size="icon" disabled={!channelId || !user || !showComposer}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ChatClient(props: ChatClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full min-h-[320px] items-center justify-center">
          <p className="text-muted-foreground">Cargando chat…</p>
        </div>
      }
    >
      <ChatInner {...props} />
    </Suspense>
  )
}
