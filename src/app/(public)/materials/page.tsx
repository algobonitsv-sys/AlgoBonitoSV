import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, ShieldCheck, Wrench } from 'lucide-react';

const materials = [
  {
    title: 'Oro de Calidad',
    description: 'Utilizamos oro de 14k y 18k, conocido por su durabilidad y brillo atemporal. Perfecto para piezas que durarán toda la vida.',
    image: 'https://picsum.photos/500/300?v=20',
    dataAiHint: 'gold texture',
  },
  {
    title: 'Plata de Ley 925',
    description: 'Nuestra plata de ley es 92.5% plata pura, ofreciendo un balance ideal entre belleza y resistencia. Ideal para diseños modernos y elegantes.',
    image: 'https://picsum.photos/500/300?v=21',
    dataAiHint: 'silver texture',
  },
  {
    title: 'Piedras Preciosas y Semipreciosas',
    description: 'Seleccionamos cuidadosamente cada gema, desde diamantes hasta cuarzos, por su color, corte y claridad para añadir un toque especial a cada joya.',
    image: 'https://picsum.photos/500/300?v=22',
    dataAiHint: 'gemstone background',
  },
];

export default function MaterialsPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
            Nuestros Materiales
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Calidad y transparencia en cada pieza que creamos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {materials.map((material) => (
            <Card key={material.title} className="overflow-hidden border-none bg-primary/20">
              <Image
                src={material.image}
                alt={material.title}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
                data-ai-hint={material.dataAiHint}
              />
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center">
                  <Gem className="mr-3 h-6 w-6 text-primary-foreground/80" />
                  {material.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{material.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 text-lg">
          <div className="space-y-4">
            <h2 className="font-headline text-3xl flex items-center">
                <ShieldCheck className="mr-3 h-8 w-8 text-primary-foreground/80"/>
                Cuidado de tus Joyas
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Guarda tus piezas individualmente para evitar que se rayen.</li>
              <li>Evita el contacto con perfumes, cremas y productos de limpieza.</li>
              <li>Quítate las joyas antes de nadar, bañarte o hacer ejercicio.</li>
              <li>Límpialas suavemente con un paño seco y suave después de usarlas.</li>
            </ul>
          </div>
           <div className="space-y-4">
            <h2 className="font-headline text-3xl flex items-center">
                <Wrench className="mr-3 h-8 w-8 text-primary-foreground/80"/>
                Mantenimiento
            </h2>
            <p className="text-muted-foreground">
              Para una limpieza más profunda, puedes usar agua tibia y un jabón neutro. Usa un cepillo de dientes suave para llegar a las zonas difíciles y seca completamente la pieza antes de guardarla. Para piezas con piedras preciosas, recomendamos una limpieza profesional una vez al año.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
