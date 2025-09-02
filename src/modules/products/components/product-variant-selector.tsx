"use client";

import React, { useState, useMemo } from 'react';

interface ProductVariant {
  codigo: string;
  nombre: string;
  precio_neto: number;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  stock: number;
  uso?: string;
  uv_protection?: boolean;
  garantia?: string;
}

interface ProductVariantSelectorProps {
  variantes: ProductVariant[];
  onVariantChange?: (variant: ProductVariant) => void;
  className?: string;
}

export function ProductVariantSelector({ 
  variantes, 
  onVariantChange, 
  className = '' 
}: ProductVariantSelectorProps) {
  // Extraer opciones únicas de las variantes
  const opciones = useMemo(() => {
    const colores = [...new Set(variantes.map(v => v.color))].filter(Boolean);
    const espesores = [...new Set(variantes.map(v => v.espesor))].filter(Boolean);
    const dimensiones = [...new Set(variantes.map(v => v.dimensiones))].filter(Boolean);
    
    return { colores, espesores, dimensiones };
  }, [variantes]);

  const [seleccion, setSeleccion] = useState({
    color: opciones.colores[0] || '',
    espesor: opciones.espesores[0] || '',
    dimensiones: opciones.dimensiones[0] || ''
  });

  // Encontrar la variante que coincide con la selección actual
  const varianteSeleccionada = useMemo(() => {
    return variantes.find(v => 
      v.color === seleccion.color &&
      v.espesor === seleccion.espesor &&
      v.dimensiones === seleccion.dimensiones
    ) || variantes[0];
  }, [variantes, seleccion]);

  // Notificar cambio de variante
  React.useEffect(() => {
    if (varianteSeleccionada && onVariantChange) {
      onVariantChange(varianteSeleccionada);
    }
  }, [varianteSeleccionada, onVariantChange]);

  const handleSelectionChange = (tipo: string, valor: string) => {
    setSeleccion(prev => ({ ...prev, [tipo]: valor }));
  };

  // Verificar si una combinación existe
  const esCombinacionValida = (color: string, espesor: string, dimensiones: string) => {
    return variantes.some(v => 
      v.color === color && v.espesor === espesor && v.dimensiones === dimensiones
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Información del producto seleccionado */}
      {varianteSeleccionada && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {varianteSeleccionada.nombre}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                SKU: <span className="font-mono font-medium">{varianteSeleccionada.codigo}</span>
              </p>
              {varianteSeleccionada.uso && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {varianteSeleccionada.uso}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                ${varianteSeleccionada.precio_con_iva.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                IVA incluido
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Stock: {varianteSeleccionada.stock} unidades
              </div>
            </div>
          </div>

          {/* Características destacadas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {varianteSeleccionada.uv_protection && (
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-yellow-500 text-sm font-medium">☀️ UV</div>
                <div className="text-xs text-gray-600">Protección</div>
              </div>
            )}
            {varianteSeleccionada.garantia && (
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <div className="text-green-500 text-sm font-medium">🛡️</div>
                <div className="text-xs text-gray-600">{varianteSeleccionada.garantia}</div>
              </div>
            )}
            <div className="bg-white/70 rounded-lg p-2 text-center">
              <div className="text-blue-500 text-sm font-medium">📏</div>
              <div className="text-xs text-gray-600">{varianteSeleccionada.dimensiones}</div>
            </div>
            <div className="bg-white/70 rounded-lg p-2 text-center">
              <div className="text-purple-500 text-sm font-medium">⚡</div>
              <div className="text-xs text-gray-600">{varianteSeleccionada.espesor}</div>
            </div>
          </div>
        </div>
      )}

      {/* Selectores de variantes */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Personaliza tu producto</h4>

        {/* Selector de Color */}
        {opciones.colores.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {opciones.colores.map(color => (
                <button
                  key={color}
                  onClick={() => handleSelectionChange('color', color)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    seleccion.color === color
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de Espesor */}
        {opciones.espesores.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Espesor
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {opciones.espesores.map(espesor => (
                <button
                  key={espesor}
                  onClick={() => handleSelectionChange('espesor', espesor)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    seleccion.espesor === espesor
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {espesor}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de Dimensiones */}
        {opciones.dimensiones.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dimensiones
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {opciones.dimensiones.map(dimension => (
                <button
                  key={dimension}
                  onClick={() => handleSelectionChange('dimensiones', dimension)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    seleccion.dimensiones === dimension
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {dimension}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Agregar al Carrito
        </button>
        <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
          Cotizar Ahora
        </button>
      </div>

      {/* Resumen de variantes disponibles */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          Variantes disponibles: {variantes.length}
        </h5>
        <div className="text-xs text-gray-500">
          <span>Colores: {opciones.colores.length}</span>
          <span className="mx-2">•</span>
          <span>Espesores: {opciones.espesores.length}</span>
          <span className="mx-2">•</span>
          <span>Dimensiones: {opciones.dimensiones.length}</span>
        </div>
      </div>
    </div>
  );
}