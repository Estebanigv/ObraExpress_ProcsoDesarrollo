"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Order, OrderStatus, OrderSummary, OrderFilters, OrderMetrics } from '@/types/order.types';

// Componente principal del dashboard de órdenes
export default function OrdenesAdminPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listado' | 'metricas'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todas'>('todas');
  const [metrics, setMetrics] = useState<OrderMetrics | null>(null);

  // Datos mock para desarrollo - Solo despachos empresariales
  const mockOrders: OrderSummary[] = [
    {
      id: '1',
      numero_orden: 'ORD-2024-001',
      fecha_creacion: '2024-08-30T10:30:00',
      cliente_nombre: 'Juan Pérez - Constructora González Ltda.',
      cliente_telefono: '+56912345678',
      estado: 'pendiente',
      total: 125000,
      items_count: 3,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-09-05'
    },
    {
      id: '2',
      numero_orden: 'ORD-2024-002',
      fecha_creacion: '2024-08-30T14:15:00',
      cliente_nombre: 'María González - Inmobiliaria Del Sur SpA',
      cliente_telefono: '+56987654321',
      estado: 'procesando',
      total: 89000,
      items_count: 2,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-09-07'
    },
    {
      id: '3',
      numero_orden: 'ORD-2024-003',
      fecha_creacion: '2024-08-29T16:45:00',
      cliente_nombre: 'Carlos Silva - Arquitectura y Construcción Silva S.A.',
      cliente_telefono: '+56923456789',
      estado: 'entregada',
      total: 256000,
      items_count: 5,
      tipo_entrega: 'domicilio',
      fecha_entrega_programada: '2024-08-31'
    }
  ];

  const mockMetrics: OrderMetrics = {
    total_ordenes: 45,
    ordenes_pendientes: 8,
    ordenes_procesando: 12,
    ordenes_entregadas: 20,
    ordenes_canceladas: 5,
    ventas_total: 2340000,
    ventas_mes: 890000,
    ventas_dia: 45000,
    promedio_orden: 52000,
    tiempo_promedio_entrega: 3.5,
    tasa_cancelacion: 0.11
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setOrders(mockOrders);
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar órdenes basado en búsqueda y filtros
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente_telefono.includes(searchTerm);
    
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

  if (loading) {
    return (
      <AdminLayout title="Gestión de Órdenes" subtitle="Cargando órdenes...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestión de Órdenes" 
      subtitle="Administra todos los pedidos y coordinaciones de despacho"
    >
      {/* Navegación de tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '📊' },
              { key: 'listado', label: 'Listado de Órdenes', icon: '📋' },
              { key: 'metricas', label: 'Métricas', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-6">
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Órdenes</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_ordenes}</p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.ordenes_pendientes}</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.ordenes_procesando}</p>
                </div>
                <div className="text-3xl">🔄</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Entregadas</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.ordenes_entregadas}</p>
                </div>
                <div className="text-3xl">✨</div>
              </div>
            </div>
          </div>

          {/* Métricas de ventas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Ventas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hoy</span>
                  <span className="font-semibold">${metrics.ventas_dia.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Este mes</span>
                  <span className="font-semibold">${metrics.ventas_mes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-green-600">${metrics.ventas_total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Promedios</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor promedio orden</span>
                  <span className="font-semibold">${metrics.promedio_orden.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo entrega</span>
                  <span className="font-semibold">{metrics.tiempo_promedio_entrega} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa cancelación</span>
                  <span className="font-semibold text-red-600">{(metrics.tasa_cancelacion * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="font-medium text-blue-900">Ver órdenes pendientes</div>
                  <div className="text-sm text-blue-600">{metrics.ordenes_pendientes} órdenes</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="font-medium text-purple-900">Revisar en proceso</div>
                  <div className="text-sm text-purple-600">{metrics.ordenes_procesando} órdenes</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listado Tab */}
      {activeTab === 'listado' && (
        <div className="space-y-6">
          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Buscar órdenes
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por número de orden, cliente o teléfono..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'todas')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="procesando">En Proceso</option>
                  <option value="lista_despacho">Lista Despacho</option>
                  <option value="en_transito">En Tránsito</option>
                  <option value="entregada">Entregadas</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de órdenes */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Listado de Órdenes ({filteredOrders.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrega
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.numero_orden}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.fecha_creacion).toLocaleDateString('es-CL')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.cliente_nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.cliente_telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.estado)}`}>
                          <span className="mr-1">{getStatusEmoji(order.estado)}</span>
                          {order.estado.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items_count} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            🏢 Despacho Empresarial
                          </div>
                          {order.fecha_entrega_programada && (
                            <div className="text-sm text-gray-500">
                              {new Date(order.fecha_entrega_programada).toLocaleDateString('es-CL')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            👁️ Ver
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            ✏️ Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Métricas Tab */}
      {activeTab === 'metricas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Métricas Detalladas</h3>
            <p className="text-gray-600">Gráficos y análisis avanzados próximamente...</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}