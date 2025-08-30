/**
 * Tooltip Informativo Profesional
 * Componente reutilizable para mostrar información contextual
 */

'use client';

import { useState } from 'react';

interface InfoTooltipProps {
  title: string;
  description: string;
  details?: string[];
  benefits?: string[];
  className?: string;
}

export default function InfoTooltip({ 
  title, 
  description, 
  details = [], 
  benefits = [],
  className = '' 
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Icono Elegante de Información */}
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className={`ml-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 group ${className}`}
        title={`Información sobre ${title}`}
      >
        <svg 
          className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </button>

      {/* Tooltip Content */}
      {isVisible && (
        <div className="absolute left-6 top-0 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Arrow */}
          <div className="absolute -left-2 top-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
          <div className="absolute -left-2.5 top-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-200"></div>

          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
            {description}
          </p>

          {/* Details */}
          {details.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-800 text-xs uppercase tracking-wide mb-2">
                ¿Cómo funciona?
              </h5>
              <ul className="space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-gray-600 text-xs flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {benefits.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 text-xs uppercase tracking-wide mb-2">
                Beneficios
              </h5>
              <ul className="space-y-1">
                {benefits.map((benefit, index) => (
                  <li key={index} className="text-green-700 text-xs flex items-start gap-2">
                    <svg className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}