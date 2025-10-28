console.log('🔍 Checking environment variables for R2 configuration...');

// Check Cloudflare R2 environment variables
const r2AccountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

console.log('Cloudflare R2 Configuration:');
console.log('- Account ID:', r2AccountId ? '✅ Set' : '❌ Missing');
console.log('- Access Key ID:', r2AccessKeyId ? '✅ Set' : '❌ Missing');
console.log('- Secret Access Key:', r2SecretAccessKey ? '✅ Set' : '❌ Missing');
console.log('- Bucket Name:', r2BucketName ? '✅ Set' : '❌ Missing');
console.log('- Public URL:', r2PublicUrl || '❌ Missing');

// Check Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\nSupabase Configuration:');
console.log('- URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- Anon Key:', supabaseKey ? '✅ Set' : '❌ Missing');

// Check if URLs are valid
if (r2PublicUrl) {
  try {
    const url = new URL(r2PublicUrl);
    console.log('- R2 Public URL format:', url.protocol === 'https:' ? '✅ HTTPS' : '❌ Not HTTPS');
  } catch (error) {
    console.log('- R2 Public URL format:', '❌ Invalid URL');
  }
}

console.log('\n📋 Full R2 Public URL:', r2PublicUrl);