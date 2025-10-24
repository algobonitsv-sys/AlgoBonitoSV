'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  userAgent: string;
  requestData?: any;
}

export default function MercadoPagoDebugPage() {
  const [userAgent, setUserAgent] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testData, setTestData] = useState<string>(JSON.stringify({
    items: [
      {
        id: 'test-product-1',
        title: 'Producto de Prueba con Título Muy Largo para Verificar Truncamiento en Móviles',
        quantity: 1,
        unit_price: 100.50,
        description: 'Esta es una descripción muy larga que debería ser truncada en dispositivos móviles para evitar errores de Mercado Pago. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      },
      {
        id: 'test-product-2',
        title: 'Segundo Producto',
        quantity: 2,
        unit_price: 50.25,
        description: 'Descripción del segundo producto'
      }
    ],
    payer: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: {
        area_code: '11',
        number: '12345678'
      }
    }
  }, null, 2));

  useEffect(() => {
    // Detectar user agent y si es móvil
    const ua = navigator.userAgent;
    setUserAgent(ua);

    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Silk/i;
    setIsMobile(mobileRegex.test(ua));

    console.log('User Agent:', ua);
    console.log('Is Mobile:', mobileRegex.test(ua));
  }, []);

  const testPreferenceCreation = async () => {
    setIsLoading(true);

    try {
      const requestData = JSON.parse(testData);

      console.log('Sending test data:', requestData);

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      const result: TestResult = {
        success: response.ok,
        data: responseData,
        timestamp: new Date().toISOString(),
        userAgent: userAgent,
        requestData: requestData,
      };

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${responseData.error || 'Unknown error'}`;
      }

      setTestResults(prev => [result, ...prev]);

      console.log('Test result:', result);

    } catch (error) {
      console.error('Test error:', error);

      const result: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        userAgent: userAgent,
        requestData: JSON.parse(testData),
      };

      setTestResults(prev => [result, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🐛 Debug Mercado Pago - Create Preference
        </h1>

        {/* Información del dispositivo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📱 Información del Dispositivo</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Tipo:</span>
              <span className={`px-2 py-1 rounded text-sm ${isMobile ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isMobile ? '📱 Móvil' : '💻 Desktop'}
              </span>
            </div>
            <div>
              <span className="font-medium">User Agent:</span>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono break-all">
                {userAgent}
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de prueba */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🧪 Datos de Prueba</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON de Prueba (items, payer, etc.)
              </label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="Ingresa el JSON de prueba..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={testPreferenceCreation}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Probando...' : '🚀 Probar API'}
              </button>
              <button
                onClick={clearResults}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                🗑️ Limpiar Resultados
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📊 Resultados de Pruebas</h2>

          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay resultados aún. Haz clic en "Probar API" para comenzar.
            </p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.success ? '✅' : '❌'}
                      </span>
                      <span className="font-medium">
                        {result.success ? 'Éxito' : 'Error'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {result.error && (
                    <div className="mb-3">
                      <span className="font-medium text-red-700">Error:</span>
                      <div className="mt-1 p-2 bg-red-100 rounded text-sm">
                        {result.error}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Request Data:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.requestData, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Response Data:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Instrucciones</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Esta página detecta automáticamente si estás en móvil o desktop</li>
            <li>• Los datos de prueba incluyen productos con títulos largos para probar truncamiento</li>
            <li>• Revisa la consola del navegador (F12) para ver logs detallados</li>
            <li>• Los resultados se muestran en orden cronológico inverso (más recientes primero)</li>
            <li>• Si hay errores, revisa también los logs del servidor</li>
          </ul>
        </div>
      </div>
    </div>
  );
}