"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";

const featuredItems = [
  {
    src: "https://picsum.photos/1200/800?v=1",
    alt: "Elegante collar de oro",
    title: "Colección Verano",
    description: "Brilla con nuestra nueva colección de verano.",
    dataAiHint: "jewelry necklace",
  },
  {
    src: "https://picsum.photos/1200/800?v=2",
    alt: "Anillos de plata con gemas",
    title: "Anillos Únicos",
    description: "Encuentra el anillo perfecto para cada ocasión.",
    dataAiHint: "jewelry rings",
  },
  {
    src: "https://picsum.photos/1200/800?v=3",
    alt: "Aretes minimalistas",
    title: "Detalles que Enamoran",
    description: "Aretes diseñados para resaltar tu belleza.",
    dataAiHint: "jewelry earrings",
  },
];

export default function Hero() {
  return (
    <section className="w-full">
      <Carousel
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {featuredItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative h-screen md:h-[80vh] w-full">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  data-ai-hint={item.dataAiHint}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl drop-shadow-md">
                      {item.title}
                    </h1>
                    <p className="mt-4 max-w-lg text-lg md:text-xl drop-shadow">
                      {item.description}
                    </p>
                    <Button size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
                      Ver Colección
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex" />
      </Carousel>
    </section>
  );
}
