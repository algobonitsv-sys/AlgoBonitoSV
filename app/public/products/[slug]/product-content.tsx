"use client";

import Image from "next/image";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Truck,
  Shield,
  RefreshCw,
  Gem,
  Leaf,
  Sparkles,
} from "lucide-react";
import AddToCartButton from "./add-to-cart-button";
import type { Product } from "@/types/database";

interface ProductContentProps {
  product: Product;
}

export default function ProductContent({ product }: ProductContentProps) {
  const galleryImages = product.product_images
    ? typeof product.product_images === "string"
      ? JSON.parse(product.product_images)
      : product.product_images
    : [];

  const allImages = [product.cover_image, product.hover_image, ...galleryImages].filter(Boolean);

  const productSlug = product.name.toLowerCase().replace(/\s+/g, "-");

  const productForCart = {
    id: product.id,
    slug: productSlug,
    name: product.name,
    price: product.price,
    description: product.description || "",
    images: allImages,
  };

  const [mainImage, setMainImage] = useState(allImages[0]);

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Columna izquierda - Galería */}
        <div className="space-y-4">
          {/* Imagen principal con recorte 9:16 */}
          <div
            className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border bg-muted shadow-md"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                Sin imágenes disponibles
              </div>
            )}
          </div>

          {/* Miniaturas cuadradas */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-lg border transition-transform ${
                    mainImage === img ? "ring-2 ring-primary scale-105" : ""
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha - Información */}
        <div className="flex flex-col gap-8">
          {/* Título, precio, descripción */}
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-primary">
              ${product.price.toFixed(2)}
            </p>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Botón de carrito */}
          <div className="space-y-3">
            <AddToCartButton product={productForCart} />
            <p className="text-xs text-muted-foreground">
              Este producto se añadirá a tu pedido y se confirmará por WhatsApp.
              No es un pago inmediato.
            </p>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={CreditCard}
              title="Pagos"
              desc="Tarjeta, transferencia o contra entrega."
            />
            <Feature
              icon={Truck}
              title="Envíos"
              desc="Local, nacional y retiro en tienda."
            />
            <Feature
              icon={Shield}
              title="Garantía"
              desc="Piezas revisadas y soporte personalizado."
            />
          </div>

          {/* Beneficios */}
          <div className="rounded-2xl border p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
              Beneficios adicionales
            </h2>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Gem className="h-4 w-4" /> Materiales premium y acabados de calidad
              </li>
              <li className="flex gap-2">
                <Leaf className="h-4 w-4" /> Hipoalergénico, ideal para uso diario
              </li>
              <li className="flex gap-2">
                <Sparkles className="h-4 w-4" /> Presentación lista para regalo
              </li>
              <li className="flex gap-2">
                <RefreshCw className="h-4 w-4" /> Cambios dentro de 7 días (sin uso)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-5 hover:shadow-md transition bg-card">
      <div className="h-12 w-12 rounded-lg flex items-center justify-center text-primary/80 border bg-muted">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
