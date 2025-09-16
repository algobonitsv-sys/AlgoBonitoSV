import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Landmark, HandCoins, Truck, Shield, RefreshCw, Gem, Leaf, Sparkles } from 'lucide-react';
import AddToCartButton from './add-to-cart-button';

// Temporary local dataset mirroring list pages; will be replaced by Supabase fetch
const products = [
  { slug: 'collar-luna', name: "Collar 'Luna'", price: 45, description: 'Un collar inspirado en la serenidad de la luna, elaborado con materiales hipoalergénicos y un brillo sutil que ilumina cualquier look.', images: ['https://picsum.photos/900/1600?v=10','https://picsum.photos/900/1600?v=20'], variants: ['Plateado','Dorado'] },
  { slug: 'anillo-estelar', name: "Anillo 'Estelar'", price: 35, description: 'Anillo minimalista con destellos que evocan un cielo estrellado. Ligero, cómodo y perfecto para usar todos los días.', images: ['https://picsum.photos/900/1600?v=11','https://picsum.photos/900/1600?v=21'], variants: ['6','7','8','9'] },
  { slug: 'aretes-gota', name: "Aretes 'Gota'", price: 25, description: 'Diseño elegante en forma de gota que aporta movimiento y luz al rostro. Acabado pulido y cierre seguro.', images: ['https://picsum.photos/900/1600?v=12','https://picsum.photos/900/1600?v=22'] },
];

interface ProductDetailProps {
  params: Promise<{ slug: string }>; // Next.js 15 async params
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;
  const product = products.find(p => p.slug === slug);
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="space-y-4 sticky top-28">{/* sticky so images remain visible on scroll */}
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border/50">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/30" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img, i) => (
                <div key={i} className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
                  <Image src={img} alt={`${product.name} ${i+1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
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
              <AddToCartButton product={product} />
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
        <RelatedProducts currentSlug={product.slug} />
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
  const related = products.filter(p => p.slug !== currentSlug).slice(0, 4);
  return (
    <div className="container pb-20">
      <Separator className="mb-10" />
      <h2 className="font-headline text-2xl md:text-3xl font-semibold tracking-tight mb-8">También te puede gustar</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(r => (
          <a key={r.slug} href={`/products/${r.slug}`} className="group block">
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
              <Image src={r.images[0]} alt={r.name} fill className="object-cover transition-all duration-500 group-hover:scale-105" />
            </div>
            <div className="pt-3">
              <p className="text-sm font-medium leading-tight line-clamp-1">{r.name}</p>
              <p className="text-sm text-muted-foreground">${r.price.toFixed(2)}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
