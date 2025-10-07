import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInvalidImageUrls() {
  console.log('🔍 Checking for products with invalid image URLs...');

  try {
    const { data: products, error } = await supabase!
      .from('products')
      .select('id, name, cover_image, hover_image, product_images');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`📊 Found ${products?.length || 0} products`);

    const invalidProducts: any[] = [];

    products?.forEach((product: any) => {
      const issues: string[] = [];

      // Check cover_image
      if (product.cover_image && !isValidUrl(product.cover_image)) {
        issues.push(`cover_image: ${product.cover_image}`);
      }

      // Check hover_image
      if (product.hover_image && !isValidUrl(product.hover_image)) {
        issues.push(`hover_image: ${product.hover_image}`);
      }

      // Check product_images array
      if (product.product_images && Array.isArray(product.product_images)) {
        product.product_images.forEach((url: string, index: number) => {
          if (url && !isValidUrl(url)) {
            issues.push(`product_images[${index}]: ${url}`);
          }
        });
      }

      if (issues.length > 0) {
        invalidProducts.push({
          id: product.id,
          name: product.name,
          issues
        });
      }
    });

    console.log(`\n❌ Found ${invalidProducts.length} products with invalid URLs:`);

    invalidProducts.forEach((product: any) => {
      console.log(`\n📦 Product: ${product.name} (ID: ${product.id})`);
      product.issues.forEach((issue: string) => {
        console.log(`   - ${issue}`);
      });
    });

    if (invalidProducts.length === 0) {
      console.log('✅ All products have valid image URLs!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

// Run the check
checkInvalidImageUrls();