import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import ProductContent from './product-content';
import { api } from '@/lib/api/products';
import type { Metadata } from 'next';
import { buildProductSlug, parseProductSlug } from '@/lib/utils/productSlug';

interface ProductDetailProps {
  params: Promise<{ slug: string }>; // Next.js 15 async params
}

async function fetchProductBySlug(slug: string) {
  const { id } = parseProductSlug(slug);

  if (id) {
    const byIdResponse = await api.products.getById(id);
    if (byIdResponse.data) {
      return byIdResponse;
    }
  }

  return api.products.getBySlug(slug);
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await fetchProductBySlug(slug);
  
  if (!response.data) {
    return {
      title: 'Producto no encontrado - AlgoBonito SV',
      description: 'El producto que buscas no fue encontrado.'
    };
  }

  const product = response.data;
  
  return {
    title: `${product.name} - $${product.price} | AlgoBonito SV`,
    description: product.description || `Compra ${product.name} en AlgoBonito SV. Joyería de calidad con diseños únicos.`,
    openGraph: {
      title: `${product.name} - AlgoBonito SV`,
      description: product.description || `Descubre ${product.name} en AlgoBonito SV`,
      images: product.cover_image ? [{ url: product.cover_image }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;
  
  // Get product from database
  const response = await fetchProductBySlug(slug);
  
  if (!response.data) {
    return notFound();
  }

  const product = response.data;

  return (
    <div className="min-h-screen bg-background">
      <ProductContent product={product} />
      <Suspense>
        <RelatedProducts currentProductId={product.id} />
      </Suspense>
    </div>
  );
}

async function RelatedProducts({ currentProductId }: { currentProductId: string }) {
  // Get related products from API
  const response = await api.products.getAll();
  const allProducts = response.data || [];
  
  // Filter out current product and get random 4 products
  const related = allProducts
    .filter(p => {
      return p.id !== currentProductId && p.is_active;
    })
    .slice(0, 4);
  
  return (
    <div className="container pb-20">
  <Separator className="mb-10" />
  <h2 className="font-headline text-2xl md:text-3xl font-semibold tracking-tight mb-8 mt-12">También te puede gustar</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(r => {
          const slug = buildProductSlug({ id: r.id, name: r.name });
          const image = r.cover_image || r.hover_image || '/placeholder-product.jpg';
          return (
            <a key={r.id} href={`/public/products/${slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
                <Image src={image} alt={r.name} fill className="object-cover transition-all duration-500 group-hover:scale-105" />
              </div>
              <div className="pt-3">
                <p className="text-sm font-medium leading-tight line-clamp-1">{r.name}</p>
                <p className="text-sm text-muted-foreground">${r.price.toFixed(2)}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
