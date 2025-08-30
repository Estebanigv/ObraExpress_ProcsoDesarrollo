"use client"

import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface AuthStatus {
  success: boolean
  connection: string
  tables: Record<string, string>
  authConfig: Record<string, string>
  projectUrl: string
  timestamp: string
}

interface ProductsStatus {
  success: boolean
  totalProductos: number
  categorias: Record<string, number>
  muestra: Array<{
    codigo: string
    nombre: string
    precio: number
    stock: number
  }>
  mensaje: string
}

export default function ControlSupabasePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [productsStatus, setProductsStatus] = useState<ProductsStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState('')

  // Cargar estado inicial
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setIsLoading(true)
    try {
      // Cargar estado de autenticación
      const authResponse = await fetch('/api/test-auth')
      const authData = await authResponse.json()
      setAuthStatus(authData)

      // Cargar estado de productos
      const productsResponse = await fetch('/api/sync-initial-products')
      const productsData = await productsResponse.json()
      setProductsStatus(productsData)

    } catch (error) {
      console.error('Error cargando estado:', error)
      setMessage('Error cargando estado del sistema')
    } finally {
      setIsLoading(false)
    }
  }

  const syncProducts = async () => {
    setIsSyncing(true)
    setMessage('')
    try {
      const response = await fetch('/api/sync-initial-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorization: 'admin-sync' })
      })

      const result = await response.json()
      if (result.success) {
        setMessage(`✅ Sincronización exitosa: ${result.estadisticas.productosInsertados} productos`)
        loadStatus() // Recargar estado
      } else {
        setMessage(`❌ Error en sincronización: ${result.message}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    return status.includes('✅') ? '✅' : '❌'
  }

  return (
    <AdminLayout title="Control Supabase">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
          <h1 className="text-3xl font-bold mb-2">Panel de Control Supabase</h1>
          <p className="text-blue-100">Gestiona la conexión y sincronización con tu base de datos</p>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={loadStatus}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? '🔄 Cargando...' : '🔍 Verificar Estado'}
          </button>
          
          <button
            onClick={syncProducts}
            disabled={isSyncing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSyncing ? '⏳ Sincronizando...' : '🔄 Sincronizar Productos'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Estado de Conexión */}
          <div className="bg-white rounded-xl shadow-lg p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                🔗
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Estado de Conexión</h2>
            </div>

            {authStatus ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Conexión Supabase</span>
                  <span className="text-green-600">{authStatus.connection}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Configuración:</h3>
                  {Object.entries(authStatus.authConfig).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{key}</span>
                      <span className={value.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Tablas:</h3>
                  {Object.entries(authStatus.tables).map(([table, status]) => (
                    <div key={table} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{table}</span>
                      <span className={status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                        {getStatusIcon(status)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Proyecto:</span> {authStatus.projectUrl}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Última verificación: {new Date(authStatus.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Cargando estado...</p>
                </div>
              </div>
            )}
          </div>

          {/* Estado de Productos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                📦
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Estado de Productos</h2>
            </div>

            {productsStatus ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Total de Productos</span>
                  <span className="text-2xl font-bold text-green-600">{productsStatus.totalProductos}</span>
                </div>

                {Object.keys(productsStatus.categorias).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Por Categoría:</h3>
                    {Object.entries(productsStatus.categorias).map(([categoria, count]) => (
                      <div key={categoria} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{categoria}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {productsStatus.muestra && productsStatus.muestra.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Muestra de Productos:</h3>
                    {productsStatus.muestra.map((producto, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium">{producto.nombre}</div>
                        <div className="text-gray-600">
                          Código: {producto.codigo} | Precio: ${producto.precio.toLocaleString()} | Stock: {producto.stock}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">{productsStatus.mensaje}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Cargando productos...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones para RLS */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              ⚠️
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Configuración RLS Pendiente</h3>
              <p className="text-amber-700 mb-3">
                Para completar la seguridad, ejecuta el script RLS en tu Dashboard de Supabase:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700 text-sm">
                <li>Ve a <a href="https://supabase.com/dashboard/project/lbjslbhglvanctbtoehi/sql/new" className="underline hover:text-amber-600" target="_blank">Supabase SQL Editor</a></li>
                <li>Copia el contenido de <code className="bg-amber-100 px-1 rounded">scripts/setup-rls-security.sql</code></li>
                <li>Pégalo en el editor y ejecuta</li>
                <li>Esto configurará todas las políticas de seguridad</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">✅</div>
              <div className="text-sm text-blue-700">Configuración Supabase</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">🔐</div>
              <div className="text-sm text-green-700">Seguridad Activa</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">🔄</div>
              <div className="text-sm text-purple-700">Sincronización Lista</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">📊</div>
              <div className="text-sm text-orange-700">Datos Integrados</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}