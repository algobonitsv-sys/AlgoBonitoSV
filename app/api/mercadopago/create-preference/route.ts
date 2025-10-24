import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';

interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  description?: string;
  currency_id?: string;
  picture_url?: string;
  product_id?: string;
  name?: string;
  price?: number;
  category_id?: string;
}

interface PreferenceBody {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
  metadata?: Record<string, unknown>;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  notification_url?: string;
  external_reference?: string;
  shipments?: PreferenceRequest['shipments'];
  payment_methods?: PreferenceRequest['payment_methods'];
}

function createMercadoPagoPreferenceClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
  }

  const client = new MercadoPagoConfig({ accessToken });
  return new Preference(client);
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE PREFERENCE REQUEST ===');
    console.log('MERCADOPAGO_ACCESS_TOKEN exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);
    console.log('Token starts with:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10));

    const preferenceClient = createMercadoPagoPreferenceClient();
    console.log('Preference client created successfully');

    const body = (await request.json()) as PreferenceBody;
    console.log('Request body:', JSON.stringify(body, null, 2));
    const {
      items,
      payer,
      metadata,
      back_urls,
      notification_url,
      external_reference,
      shipments,
      payment_methods,
    } = body;

    const userAgent = request.headers.get('user-agent') ?? '';
    const isMobileDevice = isMobileUserAgent(userAgent);
    console.log('Incoming user agent indicates mobile device:', isMobileDevice);

    // Validar que tenemos items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No hay items en el carrito' },
        { status: 400 }
      );
    }

    const defaultCurrencyId = process.env.MERCADOPAGO_CURRENCY_ID ?? 'ARS';

    const normalizedItems = items.map(item => normalizePreferenceItem(item, defaultCurrencyId));
    const productItems = normalizedItems.filter(item => {
      const idLower = item.id.toLowerCase();
      const titleLower = item.title.toLowerCase();
      return !idLower.includes('mercadopago_surcharge') && !titleLower.includes('recargo:');
    });

    const hasMultipleItems = normalizedItems.length > 1;

    const consolidatedItems = hasMultipleItems
      ? buildConsolidatedItems(normalizedItems, productItems, defaultCurrencyId)
      : null;

    const mobilePrimaryItems = consolidatedItems
      ? consolidatedItems.map(applyMobileSafeTransform)
      : normalizedItems.map(applyMobileSafeTransform);

    const desktopPrimaryItems = consolidatedItems ?? normalizedItems;

    const preferenceItems = isMobileDevice ? mobilePrimaryItems : desktopPrimaryItems;

    const mobileFallbackItems = isMobileDevice
      ? normalizedItems.map(applyMobileSafeTransform)
      : null;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://tu-dominio.com');

    // Variables de validación
    const isMercadoPagoProduction = process.env.NEXT_PUBLIC_MERCADOPAGO_ENVIRONMENT === 'production';

    // Configurar URLs de retorno según las mejores prácticas de Mercado Pago
    const resolvedBackUrls = back_urls || {
      success: (isMercadoPagoProduction ? process.env.MERCADOPAGO_SUCCESS_URL : null) ?? `${baseUrl}/payment/success`,
      failure: (isMercadoPagoProduction ? process.env.MERCADOPAGO_FAILURE_URL : null) ?? `${baseUrl}/payment/failure`,
      pending: (isMercadoPagoProduction ? process.env.MERCADOPAGO_PENDING_URL : null) ?? `${baseUrl}/payment/pending`,
    };

    // En desarrollo con sandbox, permitir localhost para callbacks
    if (!isMercadoPagoProduction) {
      resolvedBackUrls.success = process.env.MERCADOPAGO_SUCCESS_URL || `${baseUrl}/payment/success`;
      resolvedBackUrls.failure = process.env.MERCADOPAGO_FAILURE_URL || `${baseUrl}/payment/failure`;
      resolvedBackUrls.pending = process.env.MERCADOPAGO_PENDING_URL || `${baseUrl}/payment/pending`;
    }

    // Validar URLs en producción - Mercado Pago requiere URLs válidas
    const hasInvalidUrls = Object.values(resolvedBackUrls).some(url =>
      !url || (isMercadoPagoProduction && (url.includes('localhost') || url.includes('127.0.0.1')))
    );

    if (isMercadoPagoProduction && hasInvalidUrls) {
      console.warn('Warning: Invalid back_urls detected in production. Mercado Pago may reject the preference.');
      console.warn('Back URLs:', resolvedBackUrls);
    }

    const resolvedNotificationUrl =
      notification_url ?? process.env.MERCADOPAGO_NOTIFICATION_URL ?? `${baseUrl}/api/mercadopago/webhook`;

    const mergedPaymentMethods: PreferenceRequest['payment_methods'] = {
      excluded_payment_methods: payment_methods?.excluded_payment_methods ?? [],
      excluded_payment_types: payment_methods?.excluded_payment_types ?? [],
      installments: payment_methods?.installments ?? 12,
    };

    if (payment_methods?.default_installments != null) {
      mergedPaymentMethods.default_installments = payment_methods.default_installments;
    }

    if (payment_methods?.default_payment_method_id) {
      const isExcluded = (payment_methods.excluded_payment_methods ?? []).some(
        method => method.id === payment_methods.default_payment_method_id
      );

      if (!isExcluded) {
        mergedPaymentMethods.default_payment_method_id = payment_methods.default_payment_method_id;
      }
    }

    const mobileItemsSummary = normalizedItems.map(item => ({
      id: item.id,
      title: truncateText(item.title, 60),
      quantity: item.quantity,
      unit_price: roundCurrency(item.unit_price),
    }));

    const baseMetadata: Record<string, unknown> = {
      ...metadata,
      integration_type: 'web',
      created_at: new Date().toISOString(),
      original_items: normalizedItems,
      product_items: productItems,
      device: isMobileDevice ? 'mobile' : 'desktop',
    };

    if (isMobileDevice) {
      baseMetadata.mobile_items_summary = mobileItemsSummary;
    }

    const preferenceMetadata: Record<string, unknown> = {
      ...baseMetadata,
      consolidated: isMobileDevice ? Boolean(consolidatedItems) : hasMultipleItems,
    };

    if (isMobileDevice) {
      preferenceMetadata.mobile_payload_strategy = consolidatedItems ? 'mobile_consolidated' : 'mobile_single';
    }

    const preferenceData: PreferenceRequest = {
      items: preferenceItems,
      back_urls: resolvedBackUrls,
      notification_url: resolvedNotificationUrl,
      metadata: preferenceMetadata,
      statement_descriptor: 'Compra en AlgoBonitoSV',
      external_reference: external_reference ?? `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shipments,
      payment_methods: mergedPaymentMethods,
      expires: false, // La preferencia no expira
      expiration_date_from: undefined,
      expiration_date_to: undefined,
    };

    const fallbackPreferenceData = (isMobileDevice && hasMultipleItems)
      ? {
          ...preferenceData,
          items: mobileFallbackItems ?? mobilePrimaryItems,
          metadata: {
            ...baseMetadata,
            consolidated: false,
            mobile_retry_strategy: 'split_items',
          },
          binary_mode: true,
        }
      : null;

    const shouldEnableAutoReturn = Boolean(
      resolvedBackUrls.success &&
      resolvedBackUrls.success.startsWith('https://') &&
      !resolvedBackUrls.success.includes('localhost') &&
      !resolvedBackUrls.success.includes('127.0.0.1')
    );

    if (shouldEnableAutoReturn) {
      preferenceData.auto_return = 'approved';
    }

    if (payer) {
      preferenceData.payer = {
        name: payer.name,
        email: payer.email,
        phone: payer.phone
          ? {
              area_code: payer.phone.area_code,
              number: payer.phone.number,
            }
          : undefined,
      };
    }

    console.log('Creating preference with data:', JSON.stringify(preferenceData, null, 2));
    console.log('Items being sent to MercadoPago:', JSON.stringify(preferenceItems, null, 2));

    let result;

    try {
      result = await preferenceClient.create({ body: preferenceData });
    } catch (creationError) {
      console.error('Primary preference creation failed:', getMercadoPagoErrorDetails(creationError));
      if (isMobileDevice && fallbackPreferenceData) {
        console.warn('Primary preference creation failed on mobile. Retrying with fallback payload.');
        try {
          result = await preferenceClient.create({ body: fallbackPreferenceData });
          console.log('Fallback preference created successfully for mobile device.');
        } catch (fallbackError) {
          console.error('Fallback preference creation also failed for mobile device.', getMercadoPagoErrorDetails(fallbackError));
          throw fallbackError;
        }
      } else {
        throw creationError;
      }
    }

    console.log('Preference created successfully:', result.id);

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });

  } catch (error) {
    console.error('Error creating preference:', error);
    console.error('Detailed Mercado Pago error info:', getMercadoPagoErrorDetails(error));

    let message = error instanceof Error ? error.message : 'Error interno del servidor';
    const extra: Record<string, unknown> = {};

    if (typeof error === 'object' && error !== null) {
      const maybeResponse = (error as { response?: { status?: number; data?: unknown } }).response;
      if (maybeResponse) {
        extra.mercadoPagoStatus = maybeResponse.status;
        extra.mercadoPagoData = maybeResponse.data;
        console.error('Mercado Pago response error:', maybeResponse.status, maybeResponse.data);
      }
    }

    return NextResponse.json({ error: message, ...extra }, { status: 500 });
  }
}

function getMercadoPagoErrorDetails(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      name?: string;
      message?: string;
      stack?: string;
      cause?: unknown;
      response?: { status?: number; data?: unknown };
    };

    return {
      name: err.name,
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      cause: err.cause,
    };
  }

  return { message: String(error) };
}

const MOBILE_USER_AGENT_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Silk/i;

function isMobileUserAgent(userAgent?: string | null): boolean {
  return Boolean(userAgent && MOBILE_USER_AGENT_REGEX.test(userAgent));
}

function roundCurrency(value: number): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.round(numericValue * 100) / 100;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const sliceLength = Math.max(0, maxLength - 3);
  return value.slice(0, sliceLength).trimEnd() + '...';
}

type NormalizedPreferenceItem = PreferenceRequest['items'][number];

function normalizePreferenceItem(
  item: PreferenceItem,
  defaultCurrencyId: string
): NormalizedPreferenceItem {
  const fallbackTitle = item.title || item.name || 'Producto';
  const unitPrice =
    item.unit_price != null
      ? roundCurrency(item.unit_price)
      : roundCurrency(item.price ?? 0);

  const normalizedQuantity = Number(item.quantity);
  const quantity = Number.isFinite(normalizedQuantity) && normalizedQuantity > 0
    ? Math.floor(normalizedQuantity)
    : 1;

  const normalized: NormalizedPreferenceItem = {
    id: String(item.product_id ?? item.id),
    title: fallbackTitle,
    description: item.description ?? fallbackTitle,
    unit_price: unitPrice,
    quantity,
    currency_id: item.currency_id ?? defaultCurrencyId,
    category_id: item.category_id ?? 'others',
  };

  if (item.picture_url) {
    normalized.picture_url = item.picture_url;
  }

  return normalized;
}

function balanceLines(descriptions: string[], maxLineLength = 50): string {
  const lines: string[] = [];
  let currentLine = '';

  for (const desc of descriptions) {
    if (currentLine.length + desc.length + (currentLine ? 2 : 0) <= maxLineLength) {
      currentLine += (currentLine ? ', ' : '') + desc;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = desc;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join(',\n');
}

function buildConsolidatedItems(
  normalizedItems: NormalizedPreferenceItem[],
  productItems: NormalizedPreferenceItem[],
  defaultCurrencyId: string
): NormalizedPreferenceItem[] {
  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + roundCurrency(item.unit_price) * item.quantity,
    0
  );

  const itemsForDescriptions = productItems.length > 0 ? productItems : normalizedItems;
  const productDescriptions = itemsForDescriptions.map(
    item => `${item.title} (x${item.quantity})`
  );

  const balancedDescriptions = balanceLines(productDescriptions);
  const normalizedDescription = balancedDescriptions.replace(/\n/g, ', ');

  return [{
    id: 'consolidated_purchase',
    title: `Compra de: ${balancedDescriptions}`,
    description: `Compra de productos: ${normalizedDescription}`,
    unit_price: roundCurrency(totalAmount),
    quantity: 1,
    currency_id: defaultCurrencyId,
    category_id: 'others',
  }];
}

function applyMobileSafeTransform(item: NormalizedPreferenceItem): NormalizedPreferenceItem {
  return {
    ...item,
    title: truncateText(item.title, 60),
    description: truncateText(item.description ?? item.title, 256),
    unit_price: roundCurrency(item.unit_price),
  };
}