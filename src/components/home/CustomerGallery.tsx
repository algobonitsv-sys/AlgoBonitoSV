'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const galleryImages = [
  {
    src: 'https://picsum.photos/400/800?v=50',
    alt: 'Comentario de cliente satisfecho en WhatsApp',
    dataAiHint: 'whatsapp chat',
    name: 'Maria Garcia',
    location: 'San Salvador',
  },
  {
    src: 'https://picsum.photos/400/800?v=51',
    alt: 'Comentario de cliente satisfecho en Instagram',
    dataAiHint: 'instagram chat',
    name: 'Ana Martinez',
    location: 'Santa Ana',
  },
  {
    src: 'https://picsum.photos/400/800?v=52',
    alt: 'Cliente mostrando su nueva joya',
    dataAiHint: 'whatsapp chat',
    name: 'Lucia Fernandez',
    location: 'San Miguel',
  },
  {
    src: 'https://picsum.photos/400/800?v=53',
    alt: 'Mensaje de agradecimiento de un cliente',
    dataAiHint: 'instagram chat',
    name: 'Sofia Lopez',
    location: 'La Libertad',
  },
  {
    src: 'https://picsum.photos/400/800?v=54',
    alt: 'Comentario de cliente satisfecho en WhatsApp',
    dataAiHint: 'whatsapp chat',
    name: 'Carmen Rodriguez',
    location: 'Ahuachapán',
  },
  {
    src: 'https://picsum.photos/400/800?v=55',
    alt: 'Comentario de cliente satisfecho en Instagram',
    dataAiHint: 'instagram chat',
    name: 'Elena Perez',
    location: 'Sonsonate',
  },
];

export default function CustomerGallery() {
  return (
    <section id="customer-gallery" className="py-12 sm:py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Una selección de los comentarios y fotos que nos comparten nuestros clientes felices.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8">
          {galleryImages.map((image, index) => (
            <div key={index}>
              <Card className="overflow-hidden border-none shadow-lg rounded-lg">
                <CardContent className="p-0">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={400}
                    height={800}
                    data-ai-hint={image.dataAiHint}
                    className="w-full h-auto object-cover aspect-[9/16]"
                  />
                </CardContent>
              </Card>
              <div className="mt-4 text-center">
                <p className="font-semibold text-lg">{image.name}</p>
                <p className="text-muted-foreground text-sm">{image.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
