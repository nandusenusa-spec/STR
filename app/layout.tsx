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
  title: 'Comunidad | Surf Skate',
  description: 'Comunidad de entrenamientos para Surf y Skate en Montevideo. Clases, viajes y tienda.',
  icons: {
    icon: [
      { url: '/images/logo-white.png', type: 'image/png', sizes: '32x32' },
      { url: '/images/logo-white.png', type: 'image/png', sizes: '16x16' },
      { url: '/images/logo-white.png', type: 'image/png', sizes: 'any' }
    ],
    apple: '/images/logo-white.png',
    shortcut: '/images/logo-white.png',
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
