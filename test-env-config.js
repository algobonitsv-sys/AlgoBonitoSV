require('dotenv').config({ path: './.env.local' });

console.log('=== TESTING ENVIRONMENT CONFIG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_MERCADOPAGO_ENVIRONMENT:', process.env.NEXT_PUBLIC_MERCADOPAGO_ENVIRONMENT);
console.log('MERCADOPAGO_SUCCESS_URL:', process.env.MERCADOPAGO_SUCCESS_URL);
console.log('MERCADOPAGO_FAILURE_URL:', process.env.MERCADOPAGO_FAILURE_URL);
console.log('MERCADOPAGO_PENDING_URL:', process.env.MERCADOPAGO_PENDING_URL);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

const isProduction = process.env.NODE_ENV === 'production';
const isMercadoPagoProduction = process.env.NEXT_PUBLIC_MERCADOPAGO_ENVIRONMENT === 'production';
console.log('isProduction (NODE_ENV):', isProduction);
console.log('isMercadoPagoProduction:', isMercadoPagoProduction);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://tu-dominio.com');
console.log('baseUrl:', baseUrl);

const resolvedBackUrls = {
  success: (isMercadoPagoProduction ? process.env.MERCADOPAGO_SUCCESS_URL : null) ?? `${baseUrl}/payment/success`,
  failure: (isMercadoPagoProduction ? process.env.MERCADOPAGO_FAILURE_URL : null) ?? `${baseUrl}/payment/failure`,
  pending: (isMercadoPagoProduction ? process.env.MERCADOPAGO_PENDING_URL : null) ?? `${baseUrl}/payment/pending`,
};

console.log('Resolved back URLs:', resolvedBackUrls);