import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <CheckCircle className="h-20 w-20 text-accent mb-6" />
      
      <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl mb-4">
        ¡GRACIAS!
      </h1>
      
      <p className="text-xl text-muted-foreground mb-2">
        Tu compra fue procesada correctamente
      </p>
      
      {order_id && (
        <p className="text-sm text-muted-foreground mb-8">
          Orden #{order_id.slice(0, 8)}
        </p>
      )}
      
      <p className="max-w-md text-muted-foreground mb-8">
        Te enviamos un email con los detalles de tu compra. 
        Nos pondremos en contacto para coordinar el envío.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg">
            VOLVER AL INICIO
          </Button>
        </Link>
        <Link href="/#tienda">
          <Button size="lg" variant="outline">
            SEGUIR COMPRANDO
          </Button>
        </Link>
      </div>
    </div>
  )
}
