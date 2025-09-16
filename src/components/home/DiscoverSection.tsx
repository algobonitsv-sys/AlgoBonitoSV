import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DiscoverSection() {
  return (
    <section className="bg-muted/50">
      <div className="container py-10 sm:py-24">
        <div className="bg-background p-5 sm:p-8 rounded-lg shadow-lg">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-center">
            <div className="space-y-5 sm:space-y-6 order-2 md:order-1">
              <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Descubre la Belleza, <br className="hidden sm:block" /> Encuentra tu Estilo
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground">
                Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.
              </p>
              <Button asChild size="lg" className="w-full xs:w-auto">
                <Link href="/products">
                  Ver Colección
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="order-1 md:order-2 mb-6 md:mb-0">
              <Image
                src="https://picsum.photos/600/400"
                alt="Anillo de compromiso"
                width={600}
                height={400}
                className="rounded-lg object-cover shadow-md w-full h-auto"
                data-ai-hint="diamond ring"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
