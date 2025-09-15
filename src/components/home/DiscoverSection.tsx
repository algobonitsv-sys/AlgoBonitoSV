import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DiscoverSection() {
  return (
    <section className="bg-muted/50">
      <div className="container py-12 sm:py-24">
        <div className="bg-background p-8 rounded-lg shadow-lg">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Descubre la Belleza, <br /> Encuentra tu Estilo
              </h2>
              <p className="text-lg text-muted-foreground">
                Explora nuestra exclusiva colección de joyas, diseñadas para capturar la esencia de la elegancia y la sofisticación. Cada pieza cuenta una historia.
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  Ver Colección
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div>
              <Image
                src="https://picsum.photos/600/400"
                alt="Anillo de compromiso"
                width={600}
                height={400}
                className="rounded-lg object-cover shadow-md"
                data-ai-hint="diamond ring"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
