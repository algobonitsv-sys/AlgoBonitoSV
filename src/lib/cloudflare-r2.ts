import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Debug para verificar configuración
import './debug-r2';

// Configuración del cliente S3 para Cloudflare R2
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 usa 'auto' como región
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'algo-bonito-images';
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// Verificar configuración
export function isR2Configured(): boolean {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  
  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 R2 Configuration check:', {
      accountId: accountId ? `${accountId.substring(0, 8)}...` : 'MISSING',
      accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'MISSING',
      secretAccessKey: secretAccessKey ? `${secretAccessKey.substring(0, 8)}...` : 'MISSING',
      bucketName: bucketName || 'MISSING'
    });
  }
  
  const isConfigured = !!(accountId && accessKeyId && secretAccessKey && bucketName);
  
  if (!isConfigured) {
    console.error('❌ Cloudflare R2 configuration incomplete');
  }
  
  return isConfigured;
}

// Generar nombre único para archivos
export function generateUniqueFileName(originalName: string, folder?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
  
  const fileName = `${nameWithoutExt}-${timestamp}-${randomString}.${extension}`;
  
  return folder ? `${folder}/${fileName}` : fileName;
}

// Subir archivo a Cloudflare R2
export async function uploadFileToR2(
  file: File | Buffer, 
  fileName: string,
  contentType?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!isR2Configured()) {
      throw new Error('Cloudflare R2 no está configurado correctamente');
    }

    let fileBuffer: Buffer;
    let detectedContentType = contentType;

    if (file instanceof File) {
      fileBuffer = Buffer.from(await file.arrayBuffer());
      detectedContentType = contentType || file.type || 'application/octet-stream';
    } else {
      fileBuffer = file;
      detectedContentType = contentType || 'application/octet-stream';
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: detectedContentType,
      Metadata: {
        'uploaded-at': new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    // Construir URL pública
    const publicUrl = `${PUBLIC_URL}/${fileName}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Eliminar archivo de Cloudflare R2
export async function deleteFileFromR2(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isR2Configured()) {
      console.warn('⚠️ Cloudflare R2 no está configurado, saltando eliminación de archivo:', fileName);
      // No fallar completamente, solo retornar éxito con advertencia
      return { 
        success: true, 
        error: 'R2 no configurado - archivo no eliminado' 
      };
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await r2Client.send(command);
    console.log('✅ Archivo eliminado de R2:', fileName);

    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting from R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Verificar si un archivo existe en R2
export async function fileExistsInR2(fileName: string): Promise<boolean> {
  try {
    if (!isR2Configured()) {
      return false;
    }

    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// Obtener URL temporal firmada para subida directa (opcional)
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn = 3600 // 1 hora por defecto
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!isR2Configured()) {
      throw new Error('Cloudflare R2 no está configurado correctamente');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });

    return {
      success: true,
      url: signedUrl,
    };
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Extraer nombre de archivo de URL pública
export function extractFileNameFromUrl(url: string): string | null {
  try {
    if (!url || typeof url !== 'string') return null;
    
    // Patrones de URL de Cloudflare R2
    const r2Patterns = [
      PUBLIC_URL, // URL pública configurada
      'https://pub-', // URLs públicas de R2 con formato estándar
      `.r2.dev`, // Dominio de desarrollo de R2
      `.r2.cloudflarestorage.com` // Endpoint directo de R2
    ];
    
    // Verificar si la URL es de Cloudflare R2
    const isR2Url = r2Patterns.some(pattern => url.includes(pattern));
    
    if (isR2Url) {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;
      
      // Remover el '/' inicial
      if (pathname.startsWith('/')) {
        pathname = pathname.substring(1);
      }
      
      // Si no hay pathname, la URL no es válida
      if (!pathname) {
        console.warn('No se pudo extraer pathname de la URL:', url);
        return null;
      }
      
      return pathname;
    }
    
    console.warn('URL no reconocida como URL de Cloudflare R2:', url);
    return null;
  } catch (error) {
    console.error('Error extracting filename from URL:', error, 'URL:', url);
    return null;
  }
}

// Utilidades para diferentes tipos de archivos
export const R2Utils = {
  // Carpetas organizativas
  FOLDERS: {
    PRODUCTS: 'products',
    MATERIALS: 'materials',
    CAROUSEL: 'carousel',
    ABOUT: 'about',
    TESTIMONIALS: 'testimonials',
    TEMP: 'temp',
  },

  // Tipos de archivo permitidos
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],

  // Validar tipo de archivo
  isValidImageType: (contentType: string): boolean => {
    return R2Utils.ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase());
  },

  // Validar tamaño de archivo (5MB por defecto)
  isValidFileSize: (size: number, maxSizeMB = 5): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
  },

  // Subir imagen de producto
  uploadProductImage: async (file: File, productId?: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!R2Utils.isValidImageType(file.type)) {
      return { success: false, error: 'Tipo de archivo no válido. Solo se permiten imágenes.' };
    }

    if (!R2Utils.isValidFileSize(file.size)) {
      return { success: false, error: 'El archivo es demasiado grande. Máximo 5MB.' };
    }

    const fileName = generateUniqueFileName(
      file.name, 
      productId ? `${R2Utils.FOLDERS.PRODUCTS}/${productId}` : R2Utils.FOLDERS.PRODUCTS
    );

    return await uploadFileToR2(file, fileName, file.type);
  },

  // Eliminar imagen de producto por URL
  deleteProductImageByUrl: async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    const fileName = extractFileNameFromUrl(imageUrl);
    if (!fileName) {
      return { success: false, error: 'No se pudo extraer el nombre del archivo de la URL' };
    }

    return await deleteFileFromR2(fileName);
  },
};

export default r2Client;