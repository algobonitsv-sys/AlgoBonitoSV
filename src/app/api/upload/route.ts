import { NextRequest, NextResponse } from 'next/server';
import { R2Utils } from '@/lib/cloudflare-r2';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validaciones
    if (!R2Utils.isValidImageType(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF).' },
        { status: 400 }
      );
    }

    if (!R2Utils.isValidFileSize(file.size, 5)) {
      return NextResponse.json(
        { success: false, error: 'El archivo es demasiado grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Subir según el tipo
    let result;
    if (folder === 'products') {
      result = await R2Utils.uploadProductImage(file, productId);
    } else {
      // Para otros tipos (materiales, carousel, etc.)
      const { generateUniqueFileName, uploadFileToR2 } = await import('@/lib/cloudflare-r2');
      const fileName = generateUniqueFileName(file.name, folder || 'general');
      result = await uploadFileToR2(file, fileName, file.type);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      message: 'Archivo subido exitosamente'
    });

  } catch (error) {
    console.error('Error en upload API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó URL de imagen' },
        { status: 400 }
      );
    }

    const result = await R2Utils.deleteProductImageByUrl(imageUrl);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en delete API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}