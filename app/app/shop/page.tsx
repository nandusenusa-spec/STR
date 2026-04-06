import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Tienda | STR Community',
  description: 'Productos, cursos y reservas',
}

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Tienda STR</h1>
        <p className="text-muted-foreground">
          Productos, cursos en línea y reserva de clases y viajes
        </p>
      </div>

      {/* Shop Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Productos Físicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ropa, accesorios y equipos para Surf, Skate y SUP
            </p>
            <Button className="w-full" asChild>
              <Link href="/tienda">Ver productos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Cursos en Línea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Videos de entrenamiento y guías exclusivas de la comunidad
            </p>
            <Button className="w-full" variant="outline">
              Próximamente
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Inscripción a clases individuales y viajes de la comunidad
            </p>
            <Button className="w-full" variant="outline">
              Próximamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
