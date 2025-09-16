import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const products = [
  {
    name: "Collar 'Luna'",
    price: "$45.00",
    image: "https://picsum.photos/900/1600?v=10",
    hoverImage: "https://picsum.photos/900/1600?v=20",
    dataAiHint: "gold necklace",
  },
  {
    name: "Anillo 'Estelar'",
    price: "$35.00",
    image: "https://picsum.photos/900/1600?v=11",
    hoverImage: "https://picsum.photos/900/1600?v=21",
    dataAiHint: "silver ring",
  },
  {
    name: "Aretes 'Gota'",
    price: "$25.00",
    image: "https://picsum.photos/900/1600?v=12",
    hoverImage: "https://picsum.photos/900/1600?v=22",
    dataAiHint: "pearl earrings",
  },
  {
    name: "Pulsera 'Infinito'",
    price: "$40.00",
    image: "https://picsum.photos/900/1600?v=13",
    hoverImage: "https://picsum.photos/900/1600?v=23",
    dataAiHint: "charm bracelet",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Productos Destacados
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Una selección de nuestras piezas más queridas, perfectas para cualquier ocasión.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
            return (
            <Link href={`/products/${slug}`} key={product.name}>
                <Card className="group overflow-hidden transition-shadow duration-300 border-none bg-transparent shadow-none rounded-none">
                    <CardContent className="p-0">
                        <div className="aspect-[9/16] overflow-hidden relative">
                          <Image
                              src={product.image}
                              alt={product.name}
                              width={900}
                              height={1600}
                              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                              data-ai-hint={product.dataAiHint}
                          />
                          <Image
                              src={product.hoverImage}
                              alt={`${product.name} (hover)`}
                              width={900}
                              height={1600}
                              className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              data-ai-hint={product.dataAiHint}
                          />
                        </div>
                    </CardContent>
                    <div className="py-4 px-2">
                        <CardHeader className="p-0">
                            <CardTitle className="font-headline text-xl tracking-normal text-left">{product.name}</CardTitle>
                        </CardHeader>
                        <CardFooter className="p-0 pt-2 justify-start">
                            <p className="text-lg font-semibold">{product.price}</p>
                        </CardFooter>
                    </div>
                </Card>
            </Link>
          );
          })}
        </div>
    </section>
  );
}
