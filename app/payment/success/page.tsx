import Link from 'next/link';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClearCartOnMount from '@/components/ClearCartOnMount';

export default function PaymentSuccessPage({ searchParams }: any) {
  const paymentId = typeof searchParams?.payment_id === 'string' ? searchParams.payment_id : null;
  const status = typeof searchParams?.status === 'string' ? searchParams.status : null;
  const externalReference = typeof searchParams?.external_reference === 'string' ? searchParams.external_reference : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <ClearCartOnMount />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
          <p className="text-gray-600">Tu pago ha sido procesado correctamente.</p>
        </div>

        {(paymentId || status || externalReference) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-700 mb-3">Detalles del pago:</h3>
            <div className="space-y-2 text-sm">
              {paymentId && (
                <div>
                  <span className="text-gray-500">ID de pago:</span>
                  <span className="ml-2 font-mono text-gray-800">{paymentId}</span>
                </div>
              )}
              {status && (
                <div>
                  <span className="text-gray-500">Estado:</span>
                  <span className="ml-2 capitalize text-green-600">{status}</span>
                </div>
              )}
              {externalReference && (
                <div>
                  <span className="text-gray-500">Referencia:</span>
                  <span className="ml-2 font-mono text-gray-800">{externalReference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
            <Package className="h-4 w-4 mr-2" /> Recibirás un email con los detalles de tu pedido
          </div>

          <Link href="/">
            <Button className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Button>
          </Link>

          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Ver mis pedidos
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
      </div>
    </div>
  );
}