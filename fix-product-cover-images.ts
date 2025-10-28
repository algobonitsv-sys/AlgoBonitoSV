import {config} from 'dotenv';
import {createClient} from '@supabase/supabase-js';

config({path: '.env.local'});
config({path: '.env'});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration (URL or service role key).');
  process.exit(1);
}

type ProductRecord = {
  id: string;
  name: string | null;
  cover_image: string | null;
  hover_image: string | null;
  product_images: string[] | null;
};

const supabase = createClient(supabaseUrl, serviceRoleKey);

const manualOverrides: Record<string, string> = {
  '091abcc6-43bb-423e-862f-e7db851e7520':
    'https://pub-9b9ab0d0c1b54e4592cd963e04de2116.r2.dev/products/covers/389858ED-9FCC-4035-9379-1AA928366BAB-1759803057524-mce8xt.jpeg',
  'b8db7cb1-928f-4aa3-8825-6fe17847ca0f':
    'https://pub-9b9ab0d0c1b54e4592cd963e04de2116.r2.dev/products/covers/9D21E06C-CCBD-4A2F-8E74-85737D194FBF-1759803101926-rrw0fj.jpeg',
};

function normalizeUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

async function isAccessible(url: string): Promise<boolean> {
  try {
    const headResponse = await fetch(url, {method: 'HEAD'});
    if (headResponse.ok) {
      return true;
    }

    if (headResponse.status === 405 || headResponse.status === 403) {
      const getResponse = await fetch(url, {method: 'GET', headers: {Range: 'bytes=0-0'}});
      return getResponse.ok;
    }

    return false;
  } catch (error) {
    console.error(`⚠️  Error checking URL ${url}:`, error);
    return false;
  }
}

async function run(): Promise<void> {
  console.log('🔍 Buscando productos con cover_image inaccesible...');

  const {data: rawProducts, error} = await supabase
    .from('products')
    .select('id, name, cover_image, hover_image, product_images');

  if (error) {
    console.error('❌ Error al obtener productos:', error);
    process.exit(1);
  }

  const products = (rawProducts ?? []) as ProductRecord[];

  if (products.length === 0) {
    console.log('✅ No se encontraron productos. Nada que actualizar.');
    return;
  }

  let updates = 0;
  let withoutImages = 0;

  for (const product of products) {
    const normalizedCover = normalizeUrl(product.cover_image);
    const coverAccessible = normalizedCover ? await isAccessible(normalizedCover) : false;

    if (coverAccessible) {
      continue;
    }

    const candidates: string[] = [];

    const pushCandidate = (candidate?: string | null) => {
      const normalized = normalizeUrl(candidate);
      if (normalized && !candidates.includes(normalized)) {
        candidates.push(normalized);
      }
    };

    pushCandidate(product.cover_image);
    pushCandidate(product.hover_image);

    if (Array.isArray(product.product_images)) {
      product.product_images.forEach((image) => pushCandidate(image));
    }

    let fallback: string | null = null;
    const accessibility: Array<{url: string; ok: boolean}> = [];

    for (const candidate of candidates) {
      const ok = await isAccessible(candidate);
      accessibility.push({url: candidate, ok});
      if (!fallback && ok) {
        fallback = candidate;
      }
    }

    if (!fallback) {
      const override = manualOverrides[product.id];
      if (override) {
        fallback = override;
        console.log(`ℹ️  Usando override manual para «${product.name ?? product.id}».`);
      }
    }

    if (fallback) {
      console.log(`🔄 Actualizando cover_image para «${product.name ?? product.id}» -> ${fallback}`);
      const {error: updateError} = await supabase
        .from('products')
        .update({cover_image: fallback})
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error al actualizar ${product.id}:`, updateError);
      } else {
        updates += 1;
      }
    } else {
      withoutImages += 1;
      console.warn(`⚠️  No se encontró ninguna imagen accesible para «${product.name ?? product.id}».`);
      if (candidates.length > 0) {
        accessibility.forEach(({url, ok}) => {
          console.warn(`   - ${ok ? '✅' : '❌'} ${url}`);
        });
      } else {
        console.warn('   - Sin URLs candidatas registradas.');
        console.warn(
          `   - Valores actuales -> cover_image: ${product.cover_image ?? 'null'}, hover_image: ${product.hover_image ?? 'null'}, product_images: ${
            Array.isArray(product.product_images) && product.product_images.length > 0
              ? JSON.stringify(product.product_images)
              : '[]'
          }`
        );
      }
    }
  }

  console.log(`\n🏁 Script finalizado. Cover images actualizados: ${updates}. Productos sin imágenes disponibles: ${withoutImages}.`);
}

run().catch((err) => {
  console.error('❌ Error inesperado ejecutando el script:', err);
  process.exit(1);
});