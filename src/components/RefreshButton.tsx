/**
 * Botón de actualización/recálculo más atractivo y claro
 * Reemplaza los botones confusos anteriores
 */

'use client';

import { useState } from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'analytics' | 'optimization';
  className?: string;
}

export default function RefreshButton({ 
  onClick, 
  isLoading = false, 
  variant = 'analytics',
  className = '' 
}: RefreshButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const configs = {
    analytics: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'from-blue-600 to-indigo-700',
      text: 'Actualizar Análisis',
      subtext: 'Refrescar predicciones'
    },
    optimization: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-green-600',
      hoverGradient: 'from-emerald-600 to-green-700',
      text: 'Recalcular',
      subtext: 'Optimizar inventario'
    }
  };

  const config = configs[variant];

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden group
        px-6 py-3 rounded-xl
        bg-gradient-to-r ${isHovered ? config.hoverGradient : config.gradient}
        text-white font-semibold text-sm
        shadow-lg hover:shadow-xl
        transform hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        flex items-center gap-3
        min-w-[160px]
        ${className}
      `}
    >
      {/* Icono con animación */}
      <div className={`transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12'}`}>
        {config.icon}
      </div>
      
      {/* Texto principal y subtexto */}
      <div className="flex flex-col items-start">
        <span className="font-semibold leading-tight">
          {isLoading ? 'Procesando...' : config.text}
        </span>
        <span className="text-xs opacity-90 leading-tight">
          {isLoading ? 'Analizando datos' : config.subtext}
        </span>
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full">
          <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      )}
    </button>
  );
}