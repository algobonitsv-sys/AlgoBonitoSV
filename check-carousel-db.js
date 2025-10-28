require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCarouselImages() {
  console.log('🔍 Checking carousel images in database...');

  const { data, error } = await supabase
    .from('carousel_images')
    .select('id, title, image_url, is_active')
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    console.error('❌ Error fetching carousel images:', error);
    return;
  }

  console.log('📋 Active carousel images:');
  data.forEach((img, index) => {
    console.log(`${index + 1}. ${img.title}: ${img.image_url}`);
  });

  console.log(`\n� Full URLs:`);
  data.forEach((img, index) => {
    console.log(`${index + 1}. ${img.image_url}`);
  });

  console.log(`\n�📊 Total active images: ${data.length}`);
}

checkCarouselImages();