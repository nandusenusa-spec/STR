import React from "react"
import type { Metadata } from 'next'
import { Inter, Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const bebasNeue = Bebas_Neue({ 
  subsets: ["latin"], 
  variable: "--font-display",
  weight: ["400"]
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"]
});
export const metadata: Metadata = {
  title: 'STR Comunidad | Surf Skate SUP',
  description:
    'Plataforma para entrenadores y alumnos: espacio compartido, clases, eventos, comunidad y tienda. Empezá en Fase 1 con la base actual.',
  icons: {
    icon: [{ url: '/images/logo.svg', type: 'image/svg+xml', sizes: 'any' }],
    apple: '/images/logo.svg',
    shortcut: '/images/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} font-sans antialiased dark`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
