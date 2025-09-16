import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const allProducts = [
  { name: "Collar 'Luna'", price: "$45.00", image: "https://picsum.photos/900/1600?v=10", hoverImage: "https://picsum.photos/900/1600?v=20", dataAiHint: "gold necklace" },
  { name: "Anillo 'Estelar'", price: "$35.00", image: "https://picsum.photos/900/1600?v=11", hoverImage: "https://picsum.photos/900/1600?v=21", dataAiHint: "silver ring" },
  { name: "Aretes 'Gota'", price: "$25.00", image: "https://picsum.photos/900/1600?v=12", hoverImage: "https://picsum.photos/900/1600?v=22", dataAiHint: "pearl earrings" },
  { name: "Pulsera 'Infinito'", price: "$40.00", image: "https://picsum.photos/900/1600?v=13", hoverImage: "https://picsum.photos/900/1600?v=23", dataAiHint: "charm bracelet" },
  { name: "Collar 'Sol'", price: "$48.00", image: "https://picsum.photos/900/1600?v=14", hoverImage: "https://picsum.photos/900/1600?v=24", dataAiHint: "sun pendant" },
  { name: "Anillo 'Ondas'", price: "$32.00", image: "https://picsum.photos/900/1600?v=15", hoverImage: "https://picsum.photos/900/1600?v=25", dataAiHint: "wave ring" },
  { name: "Aretes 'Aro'", price: "$28.00", image: "https://picsum.photos/900/1600?v=16", hoverImage: "https://picsum.photos/900/1600?v=26", dataAiHint: "hoop earrings" },
  { name: "Pulsera 'Amor'", price: "$38.00", image: "https://picsum.photos/900/1600?v=17", hoverImage: "https://picsum.photos/900/1600?v=27", dataAiHint: "heart bracelet" },
  { name: "Collar 'Corazón'", price: "$52.00", image: "https://picsum.photos/900/1600?v=18", hoverImage: "https://picsum.photos/900/1600?v=28", dataAiHint: "heart necklace" },
  { name: "Anillo 'Serpiente'", price: "$39.00", image: "https://picsum.photos/900/1600?v=19", hoverImage: "https://picsum.photos/900/1600?v=29", dataAiHint: "snake ring" },
  { name: "Aretes 'Cascada'", price: "$33.00", image: "https://picsum.photos/900/1600?v=30", hoverImage: "https://picsum.photos/900/1600?v=40", dataAiHint: "dangle earrings" },
  { name: "Pulsera 'Clave de Sol'", price: "$42.00", image: "https://picsum.photos/900/1600?v=31", hoverImage: "https://picsum.photos/900/1600?v=41", dataAiHint: "music bracelet" },
  { name: "Collar 'Luna Nueva'", price: "$45.00", image: "https://picsum.photos/900/1600?v=42", hoverImage: "https://picsum.photos/900/1600?v=52", dataAiHint: "gold necklace" },
  { name: "Anillo 'Galaxia'", price: "$35.00", image: "https://picsum.photos/900/1600?v=43", hoverImage: "https://picsum.photos/900/1600?v=53", dataAiHint: "silver ring" },
];

const PRODUCTS_PER_PAGE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  // In Next.js 15 dynamic APIs (searchParams) must be awaited
  searchParams: Promise<{ page?: string; category?: string; material?: string }>;
}) {
  const { page } = await searchParams;

  // Parse & sanitize page number
  const rawPage = Number(page);
  let currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  // (Placeholder) apply filters in future using awaited params if needed
  const filteredProducts = allProducts; // could filter by category/material here

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="bg-background">
      <div className="container pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
            Nuestra Colección
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explora todas nuestras piezas, diseñadas con amor y cuidado para ti.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-background">
        {paginatedProducts.map((product) => {
          const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <Link href={`/products/${slug}`} key={product.name}>
              <Card className="group overflow-hidden transition-shadow duration-300 border-none bg-background shadow-none rounded-none h-full flex flex-col">
                  <CardContent className="p-0 flex-grow">
                      <div className="aspect-[9/16] overflow-hidden relative h-full">
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
                  <div className="py-4 px-2 bg-background">
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
      <div className="container">
        <div className="my-16">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href={currentPage > 1 ? `/products?page=${currentPage - 1}` : '#'} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/products?page=${page}`}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext href={currentPage < totalPages ? `/products?page=${currentPage + 1}` : '#'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
