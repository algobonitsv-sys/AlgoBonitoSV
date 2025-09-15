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

const categories = [
  {
    name: "Anillos",
    href: "/products?category=anillos",
    image: "https://picsum.photos/200/200?v=70",
    hoverImage: "https://picsum.photos/200/200?v=80",
    dataAiHint: "rings collection",
  },
  {
    name: "Collares",
    href: "/products?category=collares",
    image: "https://picsum.photos/200/200?v=71",
    hoverImage: "https://picsum.photos/200/200?v=81",
    dataAiHint: "necklaces collection",
  },
  {
    name: "Pulseras",
    href: "/products?category=pulseras",
    image: "https://picsum.photos/200/200?v=72",
    hoverImage: "https://picsum.photos/200/200?v=82",
    dataAiHint: "bracelets collection",
  },
  {
    name: "Aros",
    href: "/products?category=aros",
    image: "https://picsum.photos/200/200?v=73",
    hoverImage: "https://picsum.photos/200/200?v=83",
    dataAiHint: "earrings collection",
  },
  {
    name: "Piercings",
    href: "/products/piercings",
    image: "https://picsum.photos/200/200?v=74",
    hoverImage: "https://picsum.photos/200/200?v=84",
    dataAiHint: "piercings collection",
  },
  {
    name: "Accesorios",
    href: "/products/accesorios",
    image: "https://picsum.photos/200/200?v=75",
    hoverImage: "https://picsum.photos/200/200?v=85",
    dataAiHint: "accessories collection",
  },
];

export default function CategoryCarousel() {
  return (
    <section className="py-12 sm:py-16 bg-primary/10">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Nuestras Categorías
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Encuentra la joya perfecta para cada estilo.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {categories.map((category) => (
              <CarouselItem key={category.name} className="basis-[28%] sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                <Link href={category.href}>
                    <div className="flex flex-col items-center gap-2 sm:gap-4 group">
                         <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-2 sm:border-4 border-accent transition-all duration-300">
                             <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full overflow-hidden relative transition-all duration-300 group-hover:scale-105">
                                <Image
                                    src={category.image}
                                    alt={`Categoría ${category.name}`}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                                    data-ai-hint={category.dataAiHint}
                                />
                                <Image
                                    src={category.hoverImage}
                                    alt={`Categoría ${category.name}`}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    data-ai-hint={category.dataAiHint}
                                />
                            </div>
                        </div>
                        <h3 className="font-headline text-sm sm:text-xl text-center font-semibold">
                            {category.name}
                        </h3>
                    </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious variant="ghost" className="top-[40%] -left-6" />
          <CarouselNext variant="ghost" className="top-[40%] -right-6" />
        </Carousel>
      </div>
    </section>
  );
}
