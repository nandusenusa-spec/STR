'use client'

import { AlertCircle } from 'lucide-react'

interface AdminAccessNoticeProps {
  message?: string
  variant?: 'info' | 'warning'
}

export function AdminAccessNotice({ 
  message = 'Acceso de administrador activo',
  variant = 'info'
}: AdminAccessNoticeProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
      variant === 'warning' 
        ? 'bg-destructive/10 border-destructive/30 text-destructive' 
        : 'bg-primary/10 border-primary/30 text-primary'
    }`}>
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
