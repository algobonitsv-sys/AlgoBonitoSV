import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Landmark, HandCoins, Truck, Shield, RefreshCw, Gem, Leaf, Sparkles } from 'lucide-react';
import AddToCartButton from './add-to-cart-button';
import { api } from '@/lib/api/products';
import type { Metadata } from 'next';

interface ProductDetailProps {
  params: Promise<{ slug: string }>; // Next.js 15 async params
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await api.products.getBySlug(slug);
  
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
  const response = await api.products.getBySlug(slug);
  
  if (!response.data) {
    return notFound();
  }

  const product = response.data;

  // Parse gallery images from product_images field
  const galleryImages = product.product_images 
    ? (typeof product.product_images === 'string' 
        ? JSON.parse(product.product_images) 
        : product.product_images)
    : [];

  // Combine cover image with gallery images for display
  const allImages = [
    product.cover_image,
    product.hover_image,
    ...galleryImages
  ].filter(Boolean); // Remove null/undefined values

  // Generate slug from product name for consistency
  const productSlug = product.name.toLowerCase().replace(/\s+/g, '-');

  // Create product data compatible with AddToCartButton
  const productForCart = {
    id: product.id,
    slug: productSlug,
    name: product.name,
    price: product.price,
    description: product.description || '',
    images: allImages
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-5 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="space-y-4 sticky top-28">{/* sticky so images remain visible on scroll */}
            {allImages.length > 0 && (
              <>
                <div className="relative aspect-[9/16] w-full max-w-[70%] mx-auto overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border/50">
                  <Image src={allImages[0]} alt={product.name} fill className="object-cover" priority />
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/30" />
                </div>
                {allImages.length > 1 && (
                  <div className="grid grid-cols-3 gap-3 max-w-[70%] mx-auto">
                    {allImages.slice(1, 4).map((img, i) => (
                      <div key={i} className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
                        <Image src={img} alt={`${product.name} ${i+2}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {allImages.length === 0 && (
              <div className="aspect-[9/16] w-full max-w-[70%] mx-auto rounded-2xl bg-muted shadow-lg ring-1 ring-border/50 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg font-medium">Sin imágenes</div>
                  <div className="text-sm">No hay imágenes disponibles para este producto</div>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                {product.name}
              </h1>
              <p className="mt-4 text-2xl font-medium tracking-tight">${product.price.toFixed(2)}</p>
              <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground max-w-prose">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <AddToCartButton product={productForCart} />
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Este producto se añadirá a tu pedido para confirmar luego por WhatsApp. No es un pago inmediato.
              </p>
            </div>

            <Separator />

            {/* Payment / Shipping / Guarantee cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Feature icon={CreditCard} title="Pagos" desc="Tarjeta, transferencia y contra entrega según disponibilidad." />
              <Feature icon={Truck} title="Envíos" desc="Local, nacional y retiro en el local." />
              <Feature icon={Shield} title="Garantía" desc="Piezas revisadas y soporte personalizado." />
            </div>

            <div className="rounded-2xl border p-6 space-y-6">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Detalles & Beneficios</h2>
              <ul className="grid gap-3 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2"><Gem className="h-4 w-4 text-muted-foreground" /> Materiales seleccionados y acabados pulidos</li>
                <li className="flex gap-2"><Leaf className="h-4 w-4 text-muted-foreground" /> Hipoalergénico y cómodo para uso diario</li>
                <li className="flex gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" /> Empaque listo para regalo</li>
                <li className="flex gap-2"><RefreshCw className="h-4 w-4 text-muted-foreground" /> Cambios dentro de 7 días (sin uso)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Suspense>
        <RelatedProducts currentSlug={productSlug} />
      </Suspense>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border p-5 group bg-transparent">
      <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-1 text-muted-foreground ring-1 ring-border group-hover:shadow-sm transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-medium leading-tight">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

async function RelatedProducts({ currentSlug }: { currentSlug: string }) {
  // Get related products from API
  const response = await api.products.getAll();
  const allProducts = response.data || [];
  
  // Filter out current product and get random 4 products
  const related = allProducts
    .filter(p => {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-');
      return slug !== currentSlug && p.is_active;
    })
    .slice(0, 4);
  
  return (
    <div className="container pb-20">
      <Separator className="mb-10" />
      <h2 className="font-headline text-2xl md:text-3xl font-semibold tracking-tight mb-8">También te puede gustar</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(r => {
          const slug = r.name.toLowerCase().replace(/\s+/g, '-');
          const image = r.cover_image || r.hover_image || '/placeholder-product.jpg';
          return (
            <a key={r.id} href={`/products/${slug}`} className="group block">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
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
