"use client";

import React, { useState, useEffect } from 'react';
import { OrderSummary, OrderStatus, Order } from '@/types/order.types';
import { formatCurrency } from '@/utils/format-currency';
import Link from 'next/link';

export default function MisOrdenesPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todas'>('todas');
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Datos mock para desarrollo
  const mockOrders: OrderSummary[] = [
    {
      id: '1',
      numero_orden: 'ORD-2024-001',
      fecha_creacion: '2024-08-30T10:30:00',
      cliente_nombre: 'Juan Pérez',
      cliente_telefono: '+56912345678',
      estado: 'entregada',
      total: 125000,
      items_count: 3,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-09-05'
    },
    {
      id: '2',
      numero_orden: 'ORD-2024-002',
      fecha_creacion: '2024-08-28T14:15:00',
      cliente_nombre: 'Juan Pérez',
      cliente_telefono: '+56912345678',
      estado: 'en_transito',
      total: 89000,
      items_count: 2,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-09-07'
    },
    {
      id: '3',
      numero_orden: 'ORD-2024-003',
      fecha_creacion: '2024-08-25T16:45:00',
      cliente_nombre: 'Juan Pérez',
      cliente_telefono: '+56912345678',
      estado: 'procesando',
      total: 256000,
      items_count: 5,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-09-10'
    },
    {
      id: '4',
      numero_orden: 'ORD-2024-004',
      fecha_creacion: '2024-08-20T09:15:00',
      cliente_nombre: 'Juan Pérez',
      cliente_telefono: '+56912345678',
      estado: 'cancelada',
      total: 45000,
      items_count: 1,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-08-25'
    }
  ];

  const mockOrderDetail: Order = {
    id: '1',
    numero_orden: 'ORD-2024-001',
    fecha_creacion: '2024-08-30T10:30:00',
    fecha_actualizacion: '2024-09-05T16:45:00',
    estado: 'entregada',
    cliente: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '+56912345678',
      rut: '12345678-9'
    },
    items: [
      {
        id: '1',
        producto_codigo: 'PC-ALV-6-CR',
        producto_nombre: 'Policarbonato Alveolar 6mm Cristal',
        cantidad: 2,
        precio_unitario: 45000,
        precio_total: 90000,
        especificaciones: ['6mm espesor', 'Color cristal', '2.10m x 5.80m'],
        tipo: 'producto'
      },
      {
        id: '2',
        producto_codigo: 'PF-U-6',
        producto_nombre: 'Perfil U para Policarbonato 6mm',
        cantidad: 4,
        precio_unitario: 8750,
        precio_total: 35000,
        especificaciones: ['6mm', 'Aluminio', '6m longitud'],
        tipo: 'producto'
      }
    ],
    subtotal: 125000,
    descuento: 0,
    costo_despacho: 0,
    total: 125000,
    entrega: {
      tipo: 'domicilio',
      direccion: 'Av. Las Condes 1234, Oficina 567',
      comuna: 'Las Condes',
      region: 'Metropolitana',
      fecha_programada: '2024-09-05',
      hora_programada: '14:00-18:00',
      instrucciones: 'Dejar en recepción del edificio',
      costo_despacho: 0
    },
    pago: {
      metodo: 'webpay',
      estado: 'pagado',
      monto: 125000,
      fecha_pago: '2024-08-30T10:35:00',
      transaccion_id: 'TRX-789456123'
    },
    canal_origen: 'web',
    fecha_confirmacion: '2024-08-30T11:00:00',
    fecha_procesamiento: '2024-09-02T09:00:00',
    fecha_despacho: '2024-09-05T08:00:00',
    fecha_entrega: '2024-09-05T16:30:00',
    tracking_codigo: 'TRK-2024-001',
    historial: [
      {
        id: '1',
        fecha: '2024-08-30T10:30:00',
        accion: 'Orden creada',
        descripcion: 'Orden generada desde la web',
        estado_nuevo: 'pendiente'
      },
      {
        id: '2',
        fecha: '2024-08-30T11:00:00',
        accion: 'Orden confirmada',
        descripcion: 'Pago procesado exitosamente',
        estado_anterior: 'pendiente',
        estado_nuevo: 'confirmada'
      },
      {
        id: '3',
        fecha: '2024-09-02T09:00:00',
        accion: 'En procesamiento',
        descripcion: 'Productos en preparación',
        estado_anterior: 'confirmada',
        estado_nuevo: 'procesando'
      },
      {
        id: '4',
        fecha: '2024-09-05T08:00:00',
        accion: 'Enviado',
        descripcion: 'Productos despachados - Código de seguimiento: TRK-2024-001',
        estado_anterior: 'procesando',
        estado_nuevo: 'en_transito'
      },
      {
        id: '5',
        fecha: '2024-09-05T16:30:00',
        accion: 'Entregado',
        descripcion: 'Entrega confirmada en destino',
        estado_anterior: 'en_transito',
        estado_nuevo: 'entregada'
      }
    ]
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.numero_orden.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todas' || order.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Función para obtener color del estado
  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmada': 'bg-blue-100 text-blue-800 border-blue-200',
      'procesando': 'bg-purple-100 text-purple-800 border-purple-200',
      'lista_despacho': 'bg-orange-100 text-orange-800 border-orange-200',
      'en_transito': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'entregada': 'bg-green-100 text-green-800 border-green-200',
      'cancelada': 'bg-red-100 text-red-800 border-red-200',
      'devuelta': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener emoji del estado
  const getStatusEmoji = (status: OrderStatus) => {
    const emojis = {
      'pendiente': '⏳',
      'confirmada': '✅', 
      'procesando': '🔄',
      'lista_despacho': '📦',
      'en_transito': '🚛',
      'entregada': '✨',
      'cancelada': '❌',
      'devuelta': '↩️'
    };
    return emojis[status] || '📋';
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: OrderStatus) => {
    const texts = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'procesando': 'En Proceso',
      'lista_despacho': 'Lista para Despacho',
      'en_transito': 'En Tránsito',
      'entregada': 'Entregada',
      'cancelada': 'Cancelada',
      'devuelta': 'Devuelta'
    };
    return texts[status] || status;
  };

  const handleViewOrder = (orderId: string) => {
    // En una implementación real, haríamos fetch del detalle de la orden
    setSelectedOrder(mockOrderDetail);
    setShowOrderDetail(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tus órdenes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-40">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mis Órdenes
          </h1>
          <p className="text-gray-600">
            Revisa el estado y detalle de tus cotizaciones y pedidos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por número de orden
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: ORD-2024-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'todas')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="procesando">En Proceso</option>
                <option value="en_transito">En Tránsito</option>
                <option value="entregada">Entregadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de órdenes */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Historial de Órdenes ({filteredOrders.length})
            </h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes órdenes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Cuando realices tu primera cotización aparecerá aquí
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    
                    {/* Info principal */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.numero_orden}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.estado)}`}>
                          <span className="mr-1">{getStatusEmoji(order.estado)}</span>
                          {getStatusText(order.estado)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>📅 {new Date(order.fecha_creacion).toLocaleDateString('es-CL')}</span>
                          <span>📦 {order.items_count} {order.items_count === 1 ? 'producto' : 'productos'}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                        </div>
                        {order.fecha_entrega_programada && (
                          <div>
                            🚚 Entrega programada: {new Date(order.fecha_entrega_programada).toLocaleDateString('es-CL')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalle
                      </button>
                      
                      {(order.estado === 'entregada' || order.estado === 'en_transito') && (
                        <Link
                          href="/productos"
                          className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Volver a Pedir
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de detalle de orden */}
        {showOrderDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              
              {/* Header del modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.numero_orden}</h2>
                    <p className="text-gray-600">Detalle completo de tu orden</p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetail(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 space-y-6">
                
                {/* Estado y fechas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.estado)}`}>
                      <span className="mr-1">{getStatusEmoji(selectedOrder.estado)}</span>
                      {getStatusText(selectedOrder.estado)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Creada el {new Date(selectedOrder.fecha_creacion).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  
                  {selectedOrder.tracking_codigo && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-700 font-medium">📍 Código de seguimiento:</span>
                        <span className="font-mono text-blue-900">{selectedOrder.tracking_codigo}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Productos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.producto_nombre}</h4>
                          <p className="text-sm text-gray-600">{item.producto_codigo}</p>
                          {item.especificaciones && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.especificaciones.map((spec, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatCurrency(item.precio_total)}</div>
                          <div className="text-sm text-gray-600">
                            {item.cantidad} × {formatCurrency(item.precio_unitario)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.descuento > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(selectedOrder.descuento)}</span>
                      </div>
                    )}
                    {selectedOrder.costo_despacho > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Despacho</span>
                        <span>{formatCurrency(selectedOrder.costo_despacho)}</span>
                      </div>
                    )}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Información de entrega */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Entrega</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Dirección</div>
                        <div className="font-medium">{selectedOrder.entrega.direccion}</div>
                        <div className="text-sm text-gray-600">
                          {selectedOrder.entrega.comuna}, {selectedOrder.entrega.region}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Fecha y hora programada</div>
                        <div className="font-medium">
                          {selectedOrder.entrega.fecha_programada && new Date(selectedOrder.entrega.fecha_programada).toLocaleDateString('es-CL')}
                        </div>
                        <div className="text-sm text-gray-600">{selectedOrder.entrega.hora_programada}</div>
                      </div>
                    </div>
                    {selectedOrder.entrega.instrucciones && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-1">Instrucciones especiales</div>
                        <div className="text-sm bg-white p-3 rounded border">
                          {selectedOrder.entrega.instrucciones}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historial */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de la Orden</h3>
                  <div className="space-y-4">
                    {selectedOrder.historial.map((entry, index) => (
                      <div key={entry.id} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{entry.accion}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.fecha).toLocaleString('es-CL')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{entry.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowOrderDetail(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                  
                  {selectedOrder.estado === 'entregada' && (
                    <Link
                      href="/productos"
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Volver a Pedir
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}