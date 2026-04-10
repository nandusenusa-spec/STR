'use client'

import { Toaster } from 'sonner'

/** Raíz: avisos de moderación en chat y otras pantallas que usan `toast` de sonner. */
export function SonnerToaster() {
  return <Toaster richColors theme="dark" position="top-center" />
}
