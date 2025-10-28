console.log('Testing API route logic...');

// Simulate the folder detection logic
const testFolders = [
  'products',
  'products/covers',
  'products/gallery',
  'carousel',
  'materials',
  'general'
];

testFolders.forEach(folder => {
  const isProductFolder = folder === 'products' || folder?.startsWith('products/');
  console.log(`Folder: '${folder}' -> Product folder: ${isProductFolder}`);
});

console.log('✅ API route logic test completed');