'use client'

import { useState } from 'react'
import { LogIn, Check } from 'lucide-react'

interface SpaceJoinButtonProps {
  spaceId: string
  isMember: boolean
  onJoin?: () => void
}

export function SpaceJoinButton({ spaceId, isMember, onJoin }: SpaceJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(isMember)

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call to join space
      console.log('Joining space:', spaceId)
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsJoined(true)
      onJoin?.()
    } catch (error) {
      console.error('Error joining space:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isJoined) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-default"
      >
        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Miembro</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
    >
      <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline">{isLoading ? 'Uniéndose...' : 'Unirse'}</span>
      <span className="sm:hidden">{isLoading ? '...' : 'Entrar'}</span>
    </button>
  )
}
