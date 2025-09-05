"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import TransbankService from '@/modules/checkout/services/transbank';
import { useCart } from '@/contexts/CartContext';

interface PaymentResult {
  success: boolean;
  approved: boolean;
  transaction?: {
    buyOrder: string;
    amount: number;
    authorizationCode: string;
    paymentType: string;
    installments: number;
    cardDetail: any;
    responseCode: number;
    responseMessage: string;
    transactionDate: string;
    status: string;
  };
  error?: string;
}

function PaymentReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Obtener token desde URL
        const token = searchParams.get('token_ws');
        const tbkToken = searchParams.get('TBK_TOKEN');
        const tbkOrdenCompra = searchParams.get('TBK_ORDEN_COMPRA');
        const tbkIdSesion = searchParams.get('TBK_ID_SESION');

        // Si hay TBK_TOKEN, significa que el usuario canceló o hubo error
        if (tbkToken) {
          setResult({
            success: false,
            approved: false,
            error: 'Pago cancelado por el usuario'
          });
          setIsLoading(false);
          return;
        }

        if (!token) {
          setResult({
            success: false,
            approved: false,
            error: 'Token de transacción no encontrado'
          });
          setIsLoading(false);
          return;
        }

        // Confirmar pago con nuestro backend
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setResult(data);
          // Limpiar el carrito SOLO si el pago fue aprobado
          if (data.approved) {
            clearCart();
          }
        } else {
          setResult({
            success: false,
            approved: false,
            error: data.error || 'Error al procesar el pago'
          });
        }
      } catch (error) {
        console.error('Error procesando pago:', error);
        setResult({
          success: false,
          approved: false,
          error: 'Error de conexión'
        });
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (result?.approved) {
      router.push('/'); // Ir al inicio después de pago exitoso
    } else {
      router.push('/checkout'); // Volver al checkout si falló
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Procesando Pago
            </h2>
            <p className="text-gray-600">
              Confirmando tu transacción con Transbank...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarSimple />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          
          {/* Resultado del Pago */}
          <div className="text-center mb-8">
            {result?.approved ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-900 mb-2">
                  ¡Pago Exitoso!
                </h1>
                <p className="text-green-700">
                  Tu compra ha sido procesada correctamente
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-red-900 mb-2">
                  Pago No Procesado
                </h1>
                <p className="text-red-700">
                  {result?.error || 'Hubo un problema con tu pago'}
                </p>
              </div>
            )}
          </div>

          {/* Detalles de la Transacción */}
          {result?.transaction && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles de la Transacción
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Orden de Compra:</span>
                  <p className="font-medium">{result.transaction.buyOrder}</p>
                </div>
                
                <div>
                  <span className="text-gray-600">Monto:</span>
                  <p className="font-medium text-lg">
                    {TransbankService.formatChileanAmount(result.transaction.amount)}
                  </p>
                </div>
                
                {result.approved && (
                  <>
                    <div>
                      <span className="text-gray-600">Código de Autorización:</span>
                      <p className="font-medium">{result.transaction.authorizationCode}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Tipo de Pago:</span>
                      <p className="font-medium">{result.transaction.paymentType}</p>
                    </div>
                    
                    {result.transaction.installments > 1 && (
                      <div>
                        <span className="text-gray-600">Cuotas:</span>
                        <p className="font-medium">{result.transaction.installments} cuotas</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="font-medium">
                        {new Date(result.transaction.transactionDate).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2">
                  <span className="text-gray-600">Estado:</span>
                  <p className={`font-medium ${result.approved ? 'text-green-600' : 'text-red-600'}`}>
                    {result.transaction.responseMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información Adicional */}
          {result?.approved ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                ¿Qué sigue?
              </h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Recibirás un email de confirmación con los detalles de tu compra
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Nos pondremos en contacto contigo para coordinar el despacho
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Puedes revisar el estado de tu pedido en tu perfil de usuario
                </li>
              </ul>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-yellow-800 text-sm mb-3">
                Si tienes problemas con el pago, puedes:
              </p>
              <ul className="text-yellow-800 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Intentar nuevamente con otra tarjeta
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Contactarnos por WhatsApp: +56 9 6334 8909
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">•</span>
                  Escribirnos a: contacto@obraexpress.cl
                </li>
              </ul>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="text-center space-y-3">
            <button
              onClick={handleContinue}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                result?.approved 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {result?.approved ? 'Continuar Comprando' : 'Intentar Nuevamente'}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-6 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Procesando pago...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}