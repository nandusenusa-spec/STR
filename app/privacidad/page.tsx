import type { Metadata } from 'next'
import Link from 'next/link'

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''

export const metadata: Metadata = {
  title: 'Política de privacidad | STR Comunidad',
  description:
    'Política de privacidad de STR Comunidad. Datos personales, cookies y uso con Meta / Facebook cuando aplique.',
  ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
  openGraph: {
    title: 'Política de privacidad | STR Comunidad',
    url: appUrl ? `${appUrl}/privacidad` : '/privacidad',
  },
}

export default function PrivacidadPage() {
  const external = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim()

  return (
    <div className="min-h-[60vh] mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-[var(--font-display)] text-4xl mb-6">Política de privacidad</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Esta URL (<code className="text-xs bg-muted px-1 rounded">/privacidad</code>) podés usarla en{' '}
        <strong>Meta for Developers</strong> → tu app → <em>Privacy Policy URL</em> (Facebook Login u otros
        productos que la requieran).
      </p>

      {external && external.startsWith('http') ? (
        <p className="text-sm mb-6">
          El documento completo está publicado en:{' '}
          <a href={external} className="text-neon-cyan hover:underline" target="_blank" rel="noopener noreferrer">
            {external}
          </a>
        </p>
      ) : null}

      <div className="prose prose-invert max-w-none space-y-4 text-sm text-muted-foreground border border-border rounded-xl p-6 bg-card/30">
        <p>
          <strong className="text-foreground">Responsable:</strong> STR Comunidad (Montevideo, Uruguay). Contacto: vía
          los canales indicados en la web.
        </p>
        <p>
          Recopilamos los datos necesarios para operar la comunidad (cuenta, perfil, actividad en la plataforma) y
          cumplir obligaciones legales. Si usás inicio de sesión con proveedores como Google o, en el futuro,
          Facebook/Meta, se aplican también las políticas de dichos proveedores respecto a los datos que ellos
          tratan.
        </p>
        <p>
          Podés solicitar acceso, rectificación o baja de tus datos según la normativa aplicable escribiéndonos por
          los medios de contacto del sitio.
        </p>
        <p className="text-xs italic">
          Texto orientativo: reemplazalo o complementalo con tu asesor legal y, si usás{' '}
          <code className="text-neon-cyan/80">NEXT_PUBLIC_PRIVACY_POLICY_URL</code>, enlazá al documento oficial.
        </p>
      </div>

      <p className="mt-10">
        <Link href="/" className="text-neon-cyan hover:underline text-sm">
          ← Volver al inicio
        </Link>
      </p>
    </div>
  )
}
