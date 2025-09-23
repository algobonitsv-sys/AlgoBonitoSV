"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { productApi } from '@/lib/api';
import type { Novedad } from '@/types/database';

export default function DiscoverSection() {
  const [novedad, setNovedad] = useState<Novedad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNovedad = async () => {
      try {
        setLoading(true);
        const response = await productApi.novedad.getActive();
        
        if (response.error) {
          console.error('Error loading novedad:', response.error);
          setError('Error al cargar el contenido');
          return;
        }

        setNovedad(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading novedad:', err);
        setError('Error al cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    loadNovedad();
  }, []);

  // Fallback content when no data is available
  const fallbackData = {
    titulo: 'Descubre la Belleza, Encuentra tu Estilo',
    descripcion: 'Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.',
    enlace: '/products',
    enlace_texto: 'Ver Colección',
    imagen: 'https://picsum.photos/600/400'
  };

  // Use loaded data or fallback
  const displayData = novedad || fallbackData;

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return fallbackData.imagen;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If it's a relative path, you might need to prefix with your storage URL
    // For now, return the URL as is
    return imageUrl;
  };

  return (
    <section className="bg-muted/50">
      <div className="container py-10 sm:py-24">
        <div className="bg-background p-5 sm:p-8 rounded-lg shadow-lg">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 order-2 md:order-1">
              <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {displayData.titulo.split(', ').map((part, index) => (
                  <span key={index}>
                    {part}
                    {index === 0 && displayData.titulo.includes(', ') && (
                      <br className="hidden sm:block" />
                    )}
                    {index > 0 && index < displayData.titulo.split(', ').length - 1 && ', '}
                  </span>
                ))}
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground">
                {displayData.descripcion}
              </p>
              <Button asChild size="lg" className="w-full xs:w-auto">
                <Link href={displayData.enlace}>
                  {displayData.enlace_texto}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="order-1 md:order-2 mb-6 md:mb-0">
              <Image
                src={getImageUrl(displayData.imagen)}
                alt={displayData.titulo}
                width={600}
                height={400}
                className="rounded-lg object-cover shadow-md w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
