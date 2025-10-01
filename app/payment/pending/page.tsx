import Link from 'next/link';
import { Clock, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClearCartOnMount from '@/components/ClearCartOnMount';

export default function PaymentPendingPage({ searchParams }: any) {
  const paymentId = typeof searchParams?.payment_id === 'string' ? searchParams.payment_id : null;
  const status = typeof searchParams?.status === 'string' ? searchParams.status : null;
  const externalReference = typeof searchParams?.external_reference === 'string' ? searchParams.external_reference : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Pendiente</h1>
          <p className="text-gray-600">Tu pago está siendo procesado.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">¿Qué significa esto?</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>Tu pago está siendo verificado por el banco o entidad financiera.</p>
                <p>Este proceso puede tomar desde unos minutos hasta 2 días hábiles.</p>
              </div>
            </div>
          </div>
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
                  <span className="ml-2 capitalize text-yellow-600">{status}</span>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Te notificaremos</h3>
          <p className="text-sm text-blue-700">Te enviaremos un email tan pronto como tu pago sea confirmado. También puedes verificar el estado en "Mis pedidos".</p>
        </div>

        <div className="space-y-3">
          <Link href="/orders" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" /> Ver estado del pedido
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">Guarda este número de referencia para futuras consultas.</p>
      </div>
    </div>
  );
}