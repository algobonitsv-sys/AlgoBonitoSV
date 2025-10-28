require('dotenv').config({ path: '.env.local' });
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

async function listFiles() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      MaxKeys: 20
    });
    const response = await r2Client.send(command);
    console.log('Archivos en el bucket:');
    if (response.Contents && response.Contents.length > 0) {
      response.Contents.forEach(obj => {
        console.log(`- ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('No hay archivos en el bucket.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listFiles();