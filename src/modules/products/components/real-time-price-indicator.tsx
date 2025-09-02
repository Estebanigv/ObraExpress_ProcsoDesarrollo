'use client';

import React from 'react';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

export function RealTimePriceIndicator() {
  const { isConnected, lastUpdate } = useRealTimeUpdates();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 shadow-lg ${
        isConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-white animate-pulse' : 'bg-red-200'
        }`} />
        <span>
          {isConnected ? 'Google Sheets Sync' : 'Sync Offline'}
        </span>
        {lastUpdate && (
          <span className="ml-2 text-xs opacity-90">
            {new Date(lastUpdate.timestamp).toLocaleTimeString('es-CL', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
      
      {lastUpdate && lastUpdate.type === 'PRICE_UPDATE' && (
        <div className="mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs animate-fade-in shadow-lg">
          <div className="font-medium">✅ Base de datos actualizada</div>
          <div className="opacity-90">
            {lastUpdate.data?.syncResult?.data?.variants_count || 0} productos sincronizados
          </div>
        </div>
      )}
    </div>
  );
}