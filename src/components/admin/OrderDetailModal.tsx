"use client";

import React, { useState } from 'react';
import { Order, OrderStatus, OrderHistoryEntry } from '@/types/order.types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAddNote: (orderId: string, note: string) => void;
}

export default function OrderDetailModal({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onAddNote 
}: OrderDetailModalProps) {
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

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

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      await onUpdateStatus(order.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(order.id, newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              📋 Orden {order.numero_orden}
            </h2>
            <p className="text-sm text-gray-600">
              Creada el {new Date(order.fecha_creacion).toLocaleDateString('es-CL')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.estado)}`}>
              {order.estado.replace('_', ' ').toUpperCase()}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del cliente */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">👤 Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800">Nombre</label>
                <p className="text-gray-900">{order.cliente.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800">Email</label>
                <p className="text-gray-900">{order.cliente.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800">Teléfono</label>
                <p className="text-gray-900">{order.cliente.telefono}</p>
              </div>
              {order.cliente.rut && (
                <div>
                  <label className="block text-sm font-medium text-blue-800">RUT</label>
                  <p className="text-gray-900">{order.cliente.rut}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items del pedido */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🛍️ Items del Pedido</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {item.producto_imagen && (
                            <img 
                              src={item.producto_imagen} 
                              alt={item.producto_nombre}
                              className="h-12 w-12 rounded-md object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.producto_nombre}
                            </div>
                            {item.variante && (
                              <div className="text-sm text-gray-500">{item.variante}</div>
                            )}
                            <div className="text-xs text-blue-600">
                              {item.tipo === 'coordinacion' ? '📞 Coordinación' : '📦 Producto'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.cantidad}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ${item.precio_unitario.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        ${item.precio_total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.subtotal.toLocaleString()}</span>
              </div>
              {order.descuento > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Descuento</span>
                  <span className="font-medium text-red-600">-${order.descuento.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Costo despacho</span>
                <span className="font-medium">${order.costo_despacho.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-green-600">${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Información de entrega */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">🚛 Información de Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800">Tipo de entrega</label>
                <p className="text-gray-900">
                  {order.entrega.tipo === 'domicilio' && '🏠 Despacho a domicilio'}
                  {order.entrega.tipo === 'retiro_tienda' && '🏪 Retiro en tienda'}
                  {order.entrega.tipo === 'coordinacion' && '📞 Coordinación especial'}
                </p>
              </div>
              {order.entrega.direccion && (
                <div>
                  <label className="block text-sm font-medium text-green-800">Dirección</label>
                  <p className="text-gray-900">
                    {order.entrega.direccion}, {order.entrega.comuna}, {order.entrega.region}
                  </p>
                </div>
              )}
              {order.entrega.fecha_programada && (
                <div>
                  <label className="block text-sm font-medium text-green-800">Fecha programada</label>
                  <p className="text-gray-900">
                    {new Date(order.entrega.fecha_programada).toLocaleDateString('es-CL')}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-green-800">Costo despacho</label>
                <p className="text-gray-900">${order.entrega.costo_despacho.toLocaleString()}</p>
              </div>
            </div>
            {order.entrega.instrucciones && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-green-800">Instrucciones</label>
                <p className="text-gray-900">{order.entrega.instrucciones}</p>
              </div>
            )}
          </div>

          {/* Acciones de administración */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">⚙️ Acciones de Administración</h3>
            
            {/* Cambiar estado */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-800 mb-2">Cambiar estado</label>
              <div className="flex flex-wrap gap-2">
                {['pendiente', 'confirmada', 'procesando', 'lista_despacho', 'en_transito', 'entregada'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status as OrderStatus)}
                    disabled={updatingStatus || order.estado === status}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      order.estado === status 
                        ? getStatusColor(status as OrderStatus)
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Agregar nota */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-2">Agregar nota interna</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escribir nota..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Historial */}
          {order.historial && order.historial.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Historial</h3>
              <div className="space-y-3">
                {order.historial.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{entry.accion}</p>
                        <p className="text-sm text-gray-600">{entry.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(entry.fecha).toLocaleString('es-CL')}
                        </p>
                        {entry.usuario && (
                          <p className="text-xs text-gray-400">{entry.usuario}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}