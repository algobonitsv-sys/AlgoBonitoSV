"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartStore } from '@/lib/cart-store';

interface ProductMinimal {
  slug: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  variants?: string[]; // optional variant names
}

export default function AddToCartButton({ product }: { product: ProductMinimal }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [variant, setVariant] = useState<string | undefined>(product.variants?.[0]);
  // We no longer rely on cart-mounted events; global store handles persistence.

  const add = () => setQty(q => q + 1);
  const sub = () => setQty(q => Math.max(1, q - 1));

  const handleAdd = () => {
    const compositeId = variant ? `${product.slug}__${variant}` : product.slug;
    cartStore.addItem({
      id: compositeId,
      name: product.name,
      price: product.price,
      qty,
      image: product.images?.[0],
    });
    toast({ title: 'Añadido al pedido', description: `${qty} × ${product.name}${variant ? ' ('+variant+')' : ''}` });
    // Open cart after adding
    try { window.dispatchEvent(new CustomEvent('open-cart')); } catch {}
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {product.variants && product.variants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {product.variants.map(v => {
            const active = v === variant;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/60'}`}
              >{v}</button>
            );
          })}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-2 w-full sm:w-auto">
        <button type="button" onClick={sub} aria-label="Disminuir" className="p-1 disabled:opacity-40" disabled={qty <= 1}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-base font-medium tabular-nums">{qty}</span>
        <button type="button" onClick={add} aria-label="Aumentar" className="p-1">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button type="button" onClick={handleAdd} className="flex-1 rounded-full text-base font-medium py-6 shadow-md hover:shadow-xl transition-all">
        {added ? <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Añadido</span> : 'Añadir al pedido'}
      </Button>
      </div>
    </div>
  );
}
