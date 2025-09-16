import Image from "next/image";
import Link from "next/link";
import { ProductsControlsClient } from "@/components/products/ProductsControlsClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const allProducts = [
  { name: "Collar 'Luna'", category: 'Collares', material: 'Acero quirúrgico', price: "$45.00", image: "https://picsum.photos/900/1600?v=10", hoverImage: "https://picsum.photos/900/1600?v=20", dataAiHint: "gold necklace" },
  { name: "Anillo 'Estelar'", category: 'Anillos', material: 'Plata 925', price: "$35.00", image: "https://picsum.photos/900/1600?v=11", hoverImage: "https://picsum.photos/900/1600?v=21", dataAiHint: "silver ring" },
  { name: "Aretes 'Gota'", category: 'Aretes', material: 'Acero dorado', price: "$25.00", image: "https://picsum.photos/900/1600?v=12", hoverImage: "https://picsum.photos/900/1600?v=22", dataAiHint: "pearl earrings" },
  { name: "Pulsera 'Infinito'", category: 'Pulseras', material: 'Acero blanco', price: "$40.00", image: "https://picsum.photos/900/1600?v=13", hoverImage: "https://picsum.photos/900/1600?v=23", dataAiHint: "charm bracelet" },
  { name: "Collar 'Sol'", category: 'Collares', material: 'Acero dorado', price: "$48.00", image: "https://picsum.photos/900/1600?v=14", hoverImage: "https://picsum.photos/900/1600?v=24", dataAiHint: "sun pendant" },
  { name: "Anillo 'Ondas'", category: 'Anillos', material: 'Acero quirúrgico', price: "$32.00", image: "https://picsum.photos/900/1600?v=15", hoverImage: "https://picsum.photos/900/1600?v=25", dataAiHint: "wave ring" },
  { name: "Aretes 'Aro'", category: 'Aretes', material: 'Plata 925', price: "$28.00", image: "https://picsum.photos/900/1600?v=16", hoverImage: "https://picsum.photos/900/1600?v=26", dataAiHint: "hoop earrings" },
  { name: "Pulsera 'Amor'", category: 'Pulseras', material: 'Acero dorado', price: "$38.00", image: "https://picsum.photos/900/1600?v=17", hoverImage: "https://picsum.photos/900/1600?v=27", dataAiHint: "heart bracelet" },
  { name: "Collar 'Corazón'", category: 'Collares', material: 'Plata 925', price: "$52.00", image: "https://picsum.photos/900/1600?v=18", hoverImage: "https://picsum.photos/900/1600?v=28", dataAiHint: "heart necklace" },
  { name: "Anillo 'Serpiente'", category: 'Anillos', material: 'Acero blanco', price: "$39.00", image: "https://picsum.photos/900/1600?v=19", hoverImage: "https://picsum.photos/900/1600?v=29", dataAiHint: "snake ring" },
  { name: "Aretes 'Cascada'", category: 'Aretes', material: 'Acero quirúrgico', price: "$33.00", image: "https://picsum.photos/900/1600?v=30", hoverImage: "https://picsum.photos/900/1600?v=40", dataAiHint: "dangle earrings" },
  { name: "Pulsera 'Clave de Sol'", category: 'Pulseras', material: 'Acero blanco', price: "$42.00", image: "https://picsum.photos/900/1600?v=31", hoverImage: "https://picsum.photos/900/1600?v=41", dataAiHint: "music bracelet" },
  { name: "Collar 'Luna Nueva'", category: 'Collares', material: 'Acero blanco', price: "$45.00", image: "https://picsum.photos/900/1600?v=42", hoverImage: "https://picsum.photos/900/1600?v=52", dataAiHint: "gold necklace" },
  { name: "Anillo 'Galaxia'", category: 'Anillos', material: 'Acero dorado', price: "$35.00", image: "https://picsum.photos/900/1600?v=43", hoverImage: "https://picsum.photos/900/1600?v=53", dataAiHint: "silver ring" },
];

const PRODUCTS_PER_PAGE = 12;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; material?: string; sort?: string; minPrice?: string; maxPrice?: string }> }) {
  const { page, sort, category, material, minPrice, maxPrice } = await searchParams;
  const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const categorySlug = (category || '').toLowerCase();
  const materialSlug = (material || '').toLowerCase();
  const rawPage = Number(page);
  let currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const numericPrices = allProducts.map(p => Number(p.price.replace(/[^0-9.]/g, '')) || 0);
  const globalMinPrice = Math.min(...numericPrices);
  const globalMaxPrice = Math.max(...numericPrices);
  const minPriceNum = Math.max(globalMinPrice, Number(minPrice) || globalMinPrice);
  const maxPriceNum = Math.min(globalMaxPrice, Number(maxPrice) || globalMaxPrice);
  let filtered = allProducts.filter(p => {
    const pCat = slugify(p.category);
    const pMat = slugify(p.material);
    const pPrice = Number(p.price.replace(/[^0-9.]/g, '')) || 0;
    if (categorySlug && pCat !== categorySlug) return false;
    if (materialSlug && pMat !== materialSlug) return false;
    if (pPrice < minPriceNum || pPrice > maxPriceNum) return false;
    return true;
  });
  const sortKey = (sort || '').toLowerCase();
  const withMeta = filtered.map((p, idx) => ({
    ...p,
    _price: Number(p.price.replace(/[^0-9.]/g, '')) || 0,
    _createdAt: new Date(Date.now() - (filtered.length - idx) * 86400000),
  }));
  switch (sortKey) {
    case 'nombre':
    case 'name':
      filtered = [...withMeta].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
      break;
    case 'nuevo':
    case 'newest':
      filtered = [...withMeta].sort((a, b) => b._createdAt.getTime() - a._createdAt.getTime());
      break;
    case 'precio':
    case 'price':
      filtered = [...withMeta].sort((a, b) => a._price - b._price);
      break;
    default:
      filtered = withMeta;
  }
  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const paginated = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
  return (
    <div className="bg-background">
      <div className="container pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="mb-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">Nuestra Colección</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Explora todas nuestras piezas, diseñadas con amor y cuidado para ti.</p>
          </div>
          <div className="flex flex-col gap-4">
            <ProductsControlsClient
              categories={[...new Set(allProducts.map(p => p.category))]}
              materials={[...new Set(allProducts.map(p => p.material))]}
              currentCategory={categorySlug}
              currentMaterial={materialSlug}
              currentMin={minPriceNum}
              currentMax={maxPriceNum}
              globalMin={globalMinPrice}
              globalMax={globalMaxPrice}
              currentSort={sortKey}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-background">
        {paginated.map(product => {
          const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <Link href={`/products/${slug}`} key={product.name}>
              <Card className="group overflow-hidden transition-shadow duration-300 border-none bg-background shadow-none rounded-none h-full flex flex-col">
                <CardContent className="p-0 flex-grow">
                  <div className="aspect-[9/16] overflow-hidden relative h-full">
                    <Image src={product.image} alt={product.name} width={900} height={1600} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0" data-ai-hint={product.dataAiHint} />
                    <Image src={product.hoverImage} alt={`${product.name} (hover)`} width={900} height={1600} className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" data-ai-hint={product.dataAiHint} />
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
                <PaginationPrevious href={currentPage > 1 ? buildProductsHref({ page: currentPage - 1, sort: sortKey, category: categorySlug, material: materialSlug, minPrice: minPriceNum, maxPrice: maxPriceNum, globalMin: globalMinPrice, globalMax: globalMaxPrice }) : '#'} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <PaginationItem key={p}>
                  <PaginationLink href={buildProductsHref({ page: p, sort: sortKey, category: categorySlug, material: materialSlug, minPrice: minPriceNum, maxPrice: maxPriceNum, globalMin: globalMinPrice, globalMax: globalMaxPrice })} isActive={currentPage === p}>{p}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href={currentPage < totalPages ? buildProductsHref({ page: currentPage + 1, sort: sortKey, category: categorySlug, material: materialSlug, minPrice: minPriceNum, maxPrice: maxPriceNum, globalMin: globalMinPrice, globalMax: globalMaxPrice }) : '#'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function buildProductsHref(args: { page?: number; sort?: string; category?: string; material?: string; minPrice?: number; maxPrice?: number; globalMin?: number; globalMax?: number }) {
  const params = new URLSearchParams();
  if (args.page && args.page > 1) params.set('page', String(args.page));
  if (args.sort) params.set('sort', args.sort);
  if (args.category) params.set('category', args.category);
  if (args.material) params.set('material', args.material);
  if (typeof args.minPrice === 'number' && typeof args.globalMin === 'number' && args.minPrice > args.globalMin) params.set('minPrice', String(args.minPrice));
  if (typeof args.maxPrice === 'number' && typeof args.globalMax === 'number' && args.maxPrice < args.globalMax) params.set('maxPrice', String(args.maxPrice));
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

