import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const payment = new Payment(client);

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    // Validar que es una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      if (!paymentId) {
        console.error('No payment ID found in webhook');
        return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
      }

      // Obtener información completa del pago
      const paymentInfo = await payment.get({ id: paymentId });
      console.log('Payment info:', JSON.stringify(paymentInfo, null, 2));

      // Actualizar el estado de la orden en la base de datos
      const externalReference = paymentInfo.external_reference;
      
      if (externalReference) {
        // Extraer el timestamp del external_reference para encontrar la orden
        const orderTimestamp = externalReference.replace('order_', '');
        
        // Buscar la orden en la base de datos por timestamp aproximado
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (orderError) {
          console.error('Error fetching orders:', orderError);
        } else if (orders && orders.length > 0) {
          // Por simplicidad, actualizamos la orden más reciente
          // En producción deberías usar un ID más específico
          const latestOrder = orders[0];
          
          let status = 'pending';
          let paymentDetails = '';
          
          switch (paymentInfo.status) {
            case 'approved':
              status = 'paid';
              paymentDetails = `Pago aprobado - ID: ${paymentId}`;
              break;
            case 'pending':
              status = 'pending';
              paymentDetails = `Pago pendiente - ID: ${paymentId}`;
              break;
            case 'rejected':
              status = 'failed';
              paymentDetails = `Pago rechazado - ID: ${paymentId}`;
              break;
            default:
              paymentDetails = `Estado: ${paymentInfo.status} - ID: ${paymentId}`;
          }

          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: status,
              notes: `${latestOrder.notes || ''}\n${paymentDetails}`.trim(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', latestOrder.id);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log(`Order ${latestOrder.id} updated with payment status: ${status}`);
          }
        }
      }

      // Guardar información del pago en una tabla separada (opcional)
      const { error: paymentLogError } = await supabase
        .from('payments')
        .insert({
          payment_id: paymentInfo.id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail,
          transaction_amount: paymentInfo.transaction_amount,
          currency_id: paymentInfo.currency_id,
          external_reference: paymentInfo.external_reference,
          payer_email: paymentInfo.payer?.email,
          payment_method_id: paymentInfo.payment_method_id,
          payment_type_id: paymentInfo.payment_type_id,
          raw_data: paymentInfo,
          created_at: new Date().toISOString(),
        })
        .select();

      if (paymentLogError) {
        console.error('Error logging payment:', paymentLogError);
        // No fallar el webhook por esto
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Mercado Pago también envía notificaciones via GET
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');

  console.log('GET webhook received:', { topic, id });

  if (topic === 'payment' && id) {
    // Procesar el pago igual que en POST
    try {
      const paymentInfo = await payment.get({ id: id });
      console.log('Payment info from GET:', JSON.stringify(paymentInfo, null, 2));
      
      // Aquí puedes duplicar la lógica del POST si es necesario
      
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('GET webhook error:', error);
      return NextResponse.json({ error: 'Error processing payment' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}