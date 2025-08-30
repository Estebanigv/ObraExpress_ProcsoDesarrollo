"use client";

import React, { useState, useEffect } from 'react';
import { useSheetSync } from '@/hooks/useSheetSync';

interface SheetSyncManagerProps {
  className?: string;
}

export function SheetSyncManager({ className = '' }: SheetSyncManagerProps) {
  const { status, syncSheets, getSyncStatus, scheduleAutoSync } = useSheetSync();
  const [sheetId, setSheetId] = useState('1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState(60); // minutes
  const [showSettings, setShowSettings] = useState(false);
  const [syncHistory, setSyncHistory] = useState<string[]>([]);

  useEffect(() => {
    getSyncStatus();
  }, [getSyncStatus]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (autoSyncEnabled && sheetId) {
      cleanup = scheduleAutoSync(sheetId, autoSyncInterval);
    }
    
    return cleanup;
  }, [autoSyncEnabled, sheetId, autoSyncInterval, scheduleAutoSync]);

  const handleManualSync = async () => {
    if (!sheetId.trim()) {
      alert('Por favor ingresa un Sheet ID válido');
      return;
    }

    try {
      const result = await syncSheets(sheetId);
      const timestamp = new Date().toLocaleString();
      setSyncHistory(prev => [
        `${timestamp}: Sincronización exitosa - ${result.data?.products_count} productos`,
        ...prev.slice(0, 4)
      ]);
      alert(`Sincronización exitosa! Se importaron ${result.data?.products_count} productos con ${result.data?.variants_count} variantes.`);
    } catch (error) {
      const timestamp = new Date().toLocaleString();
      setSyncHistory(prev => [
        `${timestamp}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`,
        ...prev.slice(0, 4)
      ]);
      alert(`Error en la sincronización: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V6a2 2 0 012-2h2M4 7h16m0 0V6a2 2 0 00-2-2h-2m-4-2v2m0 0V2m0 2h4m-4 0H8" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sincronización Google Sheets</h3>
            <p className="text-sm text-gray-600">Gestiona la importación de datos de proveedores</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Estado actual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${status.isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">Estado</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {status.isLoading ? 'Sincronizando...' : 'Listo'}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Última sincronización</span>
          </div>
          <p className="text-sm text-gray-900">{formatDate(status.lastSync)}</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Productos</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{status.productsCount}</p>
        </div>
      </div>

      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-800">Error de sincronización</p>
              <p className="text-red-700 text-sm">{status.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Configuración */}
      {showSettings && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Configuración</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheets ID
              </label>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID de la hoja de Google Sheets (extraído de la URL)
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSync"
                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoSync" className="ml-2 text-sm text-gray-700">
                  Sincronización automática
                </label>
              </div>
              
              {autoSyncEnabled && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Cada</span>
                  <select
                    value={autoSyncInterval}
                    onChange={(e) => setAutoSyncInterval(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={240}>4 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleManualSync}
          disabled={status.isLoading || !sheetId.trim()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {status.isLoading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span>{status.isLoading ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
        </button>

        <button
          onClick={getSyncStatus}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verificar estado</span>
        </button>
      </div>

      {/* Historial */}
      {syncHistory.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Historial de sincronización</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {syncHistory.map((entry, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded ${
                  entry.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}