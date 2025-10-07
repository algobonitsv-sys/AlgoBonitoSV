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

// Products with invalid URLs that need to be fixed
const productsToFix = [
  { id: '091abcc6-43bb-423e-862f-e7db851e7520', name: 'Conjunto cubic rosa', tempId: '1759800705444_igh3zo2bk' },
  { id: 'b8db7cb1-928f-4aa3-8825-6fe17847ca0f', name: 'Conjunto cubic negro', tempId: '1759803647261_en6xz6mtt' },
  { id: '2f642166-8eec-42b4-8696-4fd29705b366', name: 'Pulsera puntos de luz', tempId: '1759854845209_8buzycwav' },
  { id: '72dfcfe0-8d94-4205-a04c-8586acc423c6', name: 'Pulsera san Cayetano', tempId: '1759854900693_xd0bqte3g' }
];

async function fixInvalidImageUrls() {
  console.log('🔧 Starting to fix products with invalid image URLs...');

  const r2BaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!r2BaseUrl) {
    console.error('❌ Missing CLOUDFLARE_R2_PUBLIC_URL environment variable');
    return;
  }

  console.log(`🌐 R2 Base URL: ${r2BaseUrl}`);

  for (const product of productsToFix) {
    console.log(`\n🔄 Processing product: ${product.name} (ID: ${product.id})`);
    console.log(`📋 Temp ID: ${product.tempId}`);

    // Try different possible R2 URLs
    const possibleUrls = [
      `${r2BaseUrl}/products/covers/${product.tempId}.jpg`,
      `${r2BaseUrl}/products/covers/${product.tempId}.jpeg`,
      `${r2BaseUrl}/products/covers/${product.tempId}.png`,
      `${r2BaseUrl}/products/covers/${product.tempId}.webp`,
      `${r2BaseUrl}/products/${product.tempId}.jpg`,
      `${r2BaseUrl}/products/${product.tempId}.jpeg`,
      `${r2BaseUrl}/products/${product.tempId}.png`,
      `${r2BaseUrl}/products/${product.tempId}.webp`
    ];

    let foundUrl: string | null = null;

    // Check if any of the possible URLs exist (basic check)
    for (const url of possibleUrls) {
      try {
        console.log(`🔍 Checking URL: ${url}`);
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          foundUrl = url;
          console.log(`✅ Found valid URL: ${url}`);
          break;
        }
      } catch (error) {
        // URL doesn't exist or is not accessible
      }
    }

    if (foundUrl) {
      console.log(`🔄 Updating product ${product.id} with URL: ${foundUrl}`);
      const { error } = await supabase
        .from('products')
        .update({ cover_image: foundUrl })
        .eq('id', product.id);

      if (error) {
        console.error(`❌ Error updating product ${product.id}:`, error);
      } else {
        console.log(`✅ Successfully updated product ${product.id}`);
      }
    } else {
      console.log(`❌ No valid URL found for product ${product.id}, setting cover_image to null`);
      const { error } = await supabase
        .from('products')
        .update({ cover_image: null })
        .eq('id', product.id);

      if (error) {
        console.error(`❌ Error updating product ${product.id}:`, error);
      } else {
        console.log(`✅ Successfully set cover_image to null for product ${product.id}`);
      }
    }
  }

  console.log('\n🏁 Finished fixing products with invalid URLs');
}

// Run the fix
fixInvalidImageUrls().catch(console.error);