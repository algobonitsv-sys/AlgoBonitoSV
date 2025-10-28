'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { api } from '@/lib/api/products';
import type { CustomerTestimonial } from '@/types/database';

// Fallback data (same as original) for when API is not available
const fallbackGalleryImages = [
  {
    src: 'https://picsum.photos/400/800?v=50',
    alt: 'Comentario de cliente satisfecho en WhatsApp',
    dataAiHint: 'whatsapp chat',
    name: 'Maria Garcia',
    location: 'San Salvador',
    hasRealImage: true,
  },
  {
    src: 'https://picsum.photos/400/800?v=51',
    alt: 'Comentario de cliente satisfecho en Instagram',
    dataAiHint: 'instagram chat',
    name: 'Ana Martinez',
    location: 'Santa Ana',
    hasRealImage: true,
  },
  {
    src: 'https://picsum.photos/400/800?v=52',
    alt: 'Cliente mostrando su nueva joya',
    dataAiHint: 'whatsapp chat',
    name: 'Lucia Fernandez',
    location: 'San Miguel',
    hasRealImage: true,
  },
  {
    src: 'https://picsum.photos/400/800?v=53',
    alt: 'Mensaje de agradecimiento de un cliente',
    dataAiHint: 'instagram chat',
    name: 'Sofia Lopez',
    location: 'La Libertad',
    hasRealImage: true,
  },
  {
    src: 'https://picsum.photos/400/800?v=54',
    alt: 'Comentario de cliente satisfecho en WhatsApp',
    dataAiHint: 'whatsapp chat',
    name: 'Carmen Rodriguez',
    location: 'Ahuachapán',
    hasRealImage: true,
  },
  {
    src: 'https://picsum.photos/400/800?v=55',
    alt: 'Comentario de cliente satisfecho en Instagram',
    dataAiHint: 'instagram chat',
    name: 'Elena Perez',
    location: 'Sonsonate',
    hasRealImage: true,
  },
];

export default function CustomerGallery() {
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.testimonials.getAll({ 
        includeInactive: false, // Only show active testimonials
        limit: 20 // Limit to reasonable number for gallery
      });
      
      if (response.error) {
        console.log('Error loading testimonials, using fallback data:', response.error);
        // Don't set error state, just use fallback data
      } else {
        setTestimonials(response.data || []);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Use fallback data on error
    } finally {
      setLoading(false);
    }
  };

  // Convert testimonials to gallery format or use fallback
  const galleryImages = testimonials.length > 0 
    ? testimonials
        .filter(testimonial => testimonial.is_active) // Only show active testimonials
        .map((testimonial) => ({
          src: testimonial.image_url && !testimonial.image_url.includes('picsum.photos') 
            ? testimonial.image_url 
            : null, // Will show placeholder
          alt: `Testimonio de ${testimonial.customer_name}`,
          dataAiHint: 'customer testimonial',
          name: testimonial.customer_name,
          location: testimonial.customer_location,
          hasRealImage: testimonial.image_url && !testimonial.image_url.includes('picsum.photos')
        }))
        .filter(item => item.hasRealImage || testimonials.length === 0) // Only show items with real images, or fallback if no testimonials
    : fallbackGalleryImages;

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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8">
            {galleryImages.map((image, index) => (
              <div key={index}>
                <Card className="overflow-hidden border-none shadow-lg rounded-lg">
                  <CardContent className="p-0">
                    {image.hasRealImage && image.src ? (
                      <img
                        src={image.src}
                        alt={image.alt}
                        data-ai-hint={image.dataAiHint}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          // Fallback to placeholder on error
                          e.currentTarget.src = 'https://picsum.photos/400/800?v=' + (index + 50);
                        }}
                      />
                    ) : (
                      <div className="w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center min-h-[300px]">
                        <div className="text-center text-gray-500">
                          <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-medium">Imagen próximamente</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="mt-4 text-center">
                  <p className="font-semibold text-lg">{image.name}</p>
                  <p className="text-muted-foreground text-sm">{image.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
