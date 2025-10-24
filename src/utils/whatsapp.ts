export const sanitizeWhatsAppNumber = (phone: string): string => phone.replace(/[^\d]/g, '');

export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = sanitizeWhatsAppNumber(phone);
  const params = new URLSearchParams();
  params.set('phone', digits);
  params.set('text', message.normalize('NFC'));

  return `https://api.whatsapp.com/send?${params.toString()}`;
};
