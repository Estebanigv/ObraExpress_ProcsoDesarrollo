"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ObraExpressLoaderProps {
  message?: string;
  showPercentage?: boolean;
  duration?: number; // Duración en segundos para completar el porcentaje
}

export default function ObraExpressLoader({ 
  message = "Cargando productos...", 
  showPercentage = true,
  duration = 3 
}: ObraExpressLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showPercentage) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Incremento más rápido al inicio, más lento al final (efecto realista)
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 90 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, duration * 10); // Convertir duración a ms y dividir por incrementos

    return () => clearInterval(interval);
  }, [showPercentage, duration]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo container con animación */}
        <div className="relative mb-6">
          {/* Círculo de progreso de fondo */}
          <div className="relative w-32 h-32 mx-auto">
            {showPercentage && (
              <svg 
                className="w-32 h-32 transform -rotate-90" 
                viewBox="0 0 128 128"
              >
                {/* Círculo de fondo */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
            )}
            
            {/* Logo en el centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 relative">
                <Image
                  src="/assets/images/Logotipo/Gemini_Generated_Image_pl5okapl5okapl5o.webp"
                  alt="ObraExpress Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain animate-pulse"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Porcentaje */}
        {showPercentage && (
          <div className="mb-4">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {Math.round(progress)}%
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Mensaje */}
        <p className="text-gray-600 text-lg font-medium mb-2">
          {message}
        </p>
        
        {/* Submensaje con animación de puntos */}
        <div className="text-gray-500 text-sm">
          <span className="inline-flex">
            ObraExpress Chile
            <span className="ml-1 animate-bounce">.</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente más simple para casos donde no necesitas porcentaje
export function SimpleObraExpressLoader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 relative">
          <Image
            src="/assets/images/Logotipo/Gemini_Generated_Image_pl5okapl5okapl5o.webp"
            alt="ObraExpress Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain animate-spin"
            style={{ animationDuration: '2s' }}
          />
        </div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
}