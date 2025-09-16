"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Pulseras",
    href: "/products?category=pulseras",
    image: "https://picsum.photos/800/600?v=90",
    dataAiHint: "bracelets collection",
  },
  {
    name: "Anillos",
    href: "/products?category=anillos",
    image: "https://picsum.photos/800/600?v=91",
    dataAiHint: "rings collection",
  },
  {
    name: "Cadenas/Conjuntos",
    href: "/products?category=collares",
    image: "https://picsum.photos/800/600?v=92",
    dataAiHint: "necklaces collection",
  },
  {
    name: "Aros",
    href: "/products?category=aros",
    image: "https://picsum.photos/800/600?v=93",
    dataAiHint: "earrings collection",
  },
  {
    name: "Piercings",
    href: "/products/piercings",
    image: "https://picsum.photos/800/600?v=94",
    dataAiHint: "piercings collection",
  },
  {
    name: "Accesorios",
    href: "/products/accesorios",
    image: "https://picsum.photos/800/600?v=95",
    dataAiHint: "accessories collection",
  },
];

export default function FullWidthCategoryCarousel() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="text-center mb-12 container">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Explora Nuestras Categorías
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Encuentra la joya perfecta para cada ocasión navegando por nuestras colecciones.
          </p>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {categories.map((category) => (
            <CarouselItem key={category.name} className="basis-full sm:basis-1/2 md:basis-1/3 pl-2 sm:pl-4">
              <Link href={category.href} className="group block overflow-hidden relative">
                <div className="relative aspect-video">
                  <Image
                    src={category.image}
                    alt={`Categoría ${category.name}`}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={category.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-0 left-0 p-4 pr-16 flex items-center justify-start w-full">
                    <h3 className="font-headline text-xl text-white font-semibold drop-shadow">
                      {category.name}
                    </h3>
                  </div>
                  {/* Fixed arrow button */}
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition group-hover:scale-110">
                      <ArrowRight className="h-5 w-5" />
                      <span className="sr-only">Ir a {category.name}</span>
                    </span>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
}
