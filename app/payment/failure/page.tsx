import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailurePage({ searchParams }: any) {
  const paymentId = typeof searchParams?.payment_id === 'string' ? searchParams.payment_id : null;
  const status = typeof searchParams?.status === 'string' ? searchParams.status : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Rechazado</h1>
          <p className="text-gray-600">Tu pago no pudo ser procesado en este momento.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">¿Qué puedes hacer?</h3>
          <ul className="text-sm text-red-700 text-left space-y-1">
            <li>• Verifica que los datos de tu tarjeta sean correctos</li>
            <li>• Asegúrate de tener fondos suficientes</li>
            <li>• Intenta con otra tarjeta o método de pago</li>
            <li>• Contacta con tu banco si el problema persiste</li>
          </ul>
        </div>

        {(paymentId || status) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-700 mb-3">Detalles del intento:</h3>
            <div className="space-y-2 text-sm">
              {paymentId && (
                <div>
                  <span className="text-gray-500">ID de transacción:</span>
                  <span className="ml-2 font-mono text-gray-800">{paymentId}</span>
                </div>
              )}
              {status && (
                <div>
                  <span className="text-gray-500">Estado:</span>
                  <span className="ml-2 capitalize text-red-600">{status}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" /> Intentar de nuevo
          </Button>

          <Link href="/">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">Si continúas teniendo problemas, contáctanos y te ayudaremos.</p>
      </div>
    </div>
  );
}