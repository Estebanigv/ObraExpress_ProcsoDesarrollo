"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { OptimizedImage } from '@/components/optimized-image';

// Tipos para el pedido
interface OrderItem {
  id: string;
  nombre: string;
  codigo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen?: string;
}

interface OrderDetails {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  payment_method: string;
  estimated_delivery: string;
  created_at: string;
  status: string;
  items: OrderItem[];
}

// Componente de confirmación
function ConfirmacionPedidoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const token = searchParams.get('token');
    
    if (!orderId) {
      setError('ID de pedido no encontrado');
      setLoading(false);
      return;
    }

    // Simular obtención de datos del pedido (en producción vendría de la API)
    setTimeout(() => {
      // Datos simulados del pedido
      const mockOrderData: OrderDetails = {
        order_id: orderId,
        customer_name: 'Cliente Ejemplo',
        customer_email: 'cliente@ejemplo.com',
        customer_phone: '+56 9 1234 5678',
        customer_address: 'Av. Providencia 1234, Providencia, Santiago',
        total: 156000,
        subtotal: 131000,
        shipping: 8000,
        tax: 25000,
        payment_method: 'Transbank Webpay',
        estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        status: 'confirmed',
        items: [
          {
            id: '1',
            nombre: 'Policarbonato Alveolar 6mm Cristal',
            codigo: 'PA-6MM-CR',
            cantidad: 10,
            precio_unitario: 8500,
            subtotal: 85000,
            imagen: '/assets/images/Productos/policarbonato_alveolar_6mm_cristal.webp'
          },
          {
            id: '2',
            nombre: 'Perfil H Unión 10mm',
            codigo: 'PH-10MM',
            cantidad: 5,
            precio_unitario: 9200,
            subtotal: 46000,
            imagen: '/assets/images/Productos/perfil_h_union_10mm.webp'
          }
        ]
      };

      setOrderDetails(mockOrderData);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información del pedido'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Volver
            </button>
            <Link href="/productos" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center">
              Ver Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Encabezado de éxito */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-lg text-gray-600">Tu pedido #{orderDetails.order_id} ha sido procesado exitosamente</p>
          <p className="text-sm text-gray-500 mt-2">
            Fecha: {new Date(orderDetails.created_at).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Información del pedido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Detalles principales */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Productos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Productos Pedidos</h2>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imagen ? (
                        <OptimizedImage
                          src={item.imagen}
                          alt={item.nombre}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{item.nombre}</h3>
                      <p className="text-sm text-gray-500">Código: {item.codigo}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.subtotal.toLocaleString('es-CL')}</p>
                      <p className="text-sm text-gray-500">${item.precio_unitario.toLocaleString('es-CL')} c/u</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información de entrega */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Dirección de Entrega</h3>
                  <p className="text-gray-600 text-sm">{orderDetails.customer_address}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Fecha Estimada</h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(orderDetails.estimated_delivery).toLocaleDateString('es-CL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Seguimiento del pedido</p>
                    <p className="text-sm text-blue-700">Te enviaremos actualizaciones por email y SMS sobre el estado de tu pedido.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Resumen lateral */}
          <div className="space-y-6">
            
            {/* Resumen del pedido */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${orderDetails.subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-900">${orderDetails.shipping.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="text-gray-900">${orderDetails.tax.toLocaleString('es-CL')}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-green-600">${orderDetails.total.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Método de pago:</strong> {orderDetails.payment_method}
                </p>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos de Contacto</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-medium text-gray-900">{orderDetails.customer_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{orderDetails.customer_email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Teléfono:</span>
                  <p className="font-medium text-gray-900">{orderDetails.customer_phone}</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">¿Qué sigue?</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir Pedido
                </button>
                
                <Link href="/productos" className="block">
                  <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Seguir Comprando
                  </button>
                </Link>
                
                <a
                  href="https://wa.me/56963348909?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Contactar Soporte
                  </button>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Próximos pasos */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximos Pasos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Confirmación</h3>
              <p className="text-sm text-gray-600">Recibirás un email con los detalles completos de tu pedido</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Preparación</h3>
              <p className="text-sm text-gray-600">Nuestro equipo preparará tu pedido en 1-2 días hábiles</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Entrega</h3>
              <p className="text-sm text-gray-600">Te contactaremos para coordinar la entrega en tu dirección</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function ConfirmacionPedido() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando confirmación...</p>
        </div>
      </div>
    }>
      <ConfirmacionPedidoContent />
    </Suspense>
  );
}