"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatCurrency } from '@/utils/format-currency';

interface ProductOption {
  id: string;
  label: string;
  value: string;
  price?: number;
  stock?: number;
  available?: boolean;
}

interface ConfiguratorProps {
  productId: string;
  basePrice: number;
  options: {
    espesor?: ProductOption[];
    ancho?: ProductOption[];
    color?: ProductOption[];
    cantidad?: { min: number; step: number; max?: number };
  };
  onConfigurationChange: (config: ProductConfiguration) => void;
  className?: string;
}

export interface ProductConfiguration {
  espesor?: string;
  ancho?: string;
  color?: string;
  cantidad: number;
  totalPrice: number;
  isValid: boolean;
  nextDeliveryDate: string;
  userLocation?: {
    region: string;
    comuna: string;
  };
}

// Función para calcular próximo día hábil de despacho (jueves)
const getNextDeliveryDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Domingo, 4=Jueves
  
  let daysUntilThursday;
  if (dayOfWeek <= 2) { // Domingo, Lunes, Martes
    daysUntilThursday = 4 - dayOfWeek;
  } else { // Miércoles en adelante
    daysUntilThursday = 11 - dayOfWeek; // Próximo jueves
  }
  
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysUntilThursday);
  
  return nextThursday.toLocaleDateString('es-CL', { 
    weekday: 'long', 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export function ProductConfigurator({
  productId,
  basePrice,
  options,
  onConfigurationChange,
  className = ''
}: ConfiguratorProps) {
  const { location } = useGeolocation();
  
  const [configuration, setConfiguration] = useState<{
    espesor?: string;
    ancho?: string;
    color?: string;
    cantidad: number;
  }>({
    cantidad: options.cantidad?.min || 10
  });

  const [currentPrice, setCurrentPrice] = useState(basePrice);

  // Calcular precio actual basado en la configuración
  useEffect(() => {
    let price = basePrice;
    
    // Agregar costo por espesor si existe
    if (configuration.espesor && options.espesor) {
      const espesorOption = options.espesor.find(opt => opt.value === configuration.espesor);
      if (espesorOption?.price) {
        price = espesorOption.price;
      }
    }
    
    // Agregar costo por ancho si existe
    if (configuration.ancho && options.ancho) {
      const anchoOption = options.ancho.find(opt => opt.value === configuration.ancho);
      if (anchoOption?.price) {
        price += anchoOption.price - basePrice;
      }
    }

    setCurrentPrice(price);
  }, [configuration, basePrice, options]);

  // Emitir cambios de configuración
  useEffect(() => {
    const totalPrice = currentPrice * configuration.cantidad;
    const isValid = validateConfiguration();
    
    const config: ProductConfiguration = {
      ...configuration,
      totalPrice,
      isValid,
      nextDeliveryDate: getNextDeliveryDate(),
      userLocation: location ? {
        region: location.region,
        comuna: location.comuna
      } : undefined
    };

    onConfigurationChange(config);
  }, [configuration, currentPrice, location]);

  const validateConfiguration = (): boolean => {
    // Validar cantidad mínima
    if (options.cantidad && configuration.cantidad < options.cantidad.min) {
      return false;
    }

    // Validar que todas las opciones requeridas estén seleccionadas
    if (options.espesor && options.espesor.length > 0 && !configuration.espesor) {
      return false;
    }

    if (options.ancho && options.ancho.length > 0 && !configuration.ancho) {
      return false;
    }

    if (options.color && options.color.length > 0 && !configuration.color) {
      return false;
    }

    return true;
  };

  const handleOptionChange = (type: 'espesor' | 'ancho' | 'color', value: string) => {
    setConfiguration(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(
      options.cantidad?.min || 10,
      configuration.cantidad + change
    );
    
    if (options.cantidad?.max && newQuantity > options.cantidad.max) {
      return;
    }

    setConfiguration(prev => ({
      ...prev,
      cantidad: newQuantity
    }));
  };

  return (
    <div className={`bg-gray-50 rounded-xl p-6 space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Configurar Producto
      </h3>

      {/* Selector de Espesor */}
      {options.espesor && options.espesor.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Espesor: {configuration.espesor || 'Seleccionar'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.espesor.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionChange('espesor', option.value)}
                disabled={option.available === false}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  configuration.espesor === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : option.available === false
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div>{option.label}</div>
                {option.price && (
                  <div className="text-xs text-gray-500 mt-1">
                    ${option.price.toLocaleString()}
                  </div>
                )}
                {option.stock !== undefined && (
                  <div className="text-xs text-gray-500">
                    Stock: {option.stock}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Ancho */}
      {options.ancho && options.ancho.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ancho: {configuration.ancho || 'Seleccionar'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {options.ancho.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionChange('ancho', option.value)}
                disabled={option.available === false}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  configuration.ancho === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : option.available === false
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div>{option.label}</div>
                {option.price && (
                  <div className="text-xs text-gray-500 mt-1">
                    +${formatCurrency(option.price - basePrice)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Color */}
      {options.color && options.color.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Color: {configuration.color || 'Seleccionar'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {options.color.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionChange('color', option.value)}
                disabled={option.available === false}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  configuration.color === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : option.available === false
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Cantidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cantidad: {configuration.cantidad} unidades
        </label>
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => handleQuantityChange(-(options.cantidad?.step || 10))}
            disabled={configuration.cantidad <= (options.cantidad?.min || 10)}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <div className="px-6 py-3 text-center bg-gray-50 rounded-lg mx-2 min-w-[120px]">
            <div className="font-bold text-lg">{configuration.cantidad}</div>
            <div className="text-xs text-gray-500">
              Mín: {options.cantidad?.min || 10} unidades
            </div>
          </div>
          
          <button
            onClick={() => handleQuantityChange(options.cantidad?.step || 10)}
            disabled={options.cantidad?.max && configuration.cantidad >= options.cantidad.max}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        {options.cantidad?.step && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Cambios de {options.cantidad.step} en {options.cantidad.step}
          </div>
        )}
      </div>

      {/* Resumen de Configuración */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Resumen</h4>
        <div className="space-y-2 text-sm">
          {configuration.espesor && (
            <div className="flex justify-between">
              <span className="text-gray-600">Espesor:</span>
              <span className="font-medium">{configuration.espesor}</span>
            </div>
          )}
          {configuration.ancho && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ancho:</span>
              <span className="font-medium">{configuration.ancho}</span>
            </div>
          )}
          {configuration.color && (
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{configuration.color}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Cantidad:</span>
            <span className="font-medium">{configuration.cantidad} unidades</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Precio unitario:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">${formatCurrency(currentPrice)}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">IVA incluido</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-xl text-blue-600">
                ${formatCurrency(currentPrice * configuration.cantidad)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Despacho */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <div className="font-medium text-yellow-800 mb-1">
              🚚 Próximo despacho: {getNextDeliveryDate()}
            </div>
            {location && (
              <div className="text-yellow-700">
                📍 Disponible para {location.comuna}, {location.region}
              </div>
            )}
            <div className="text-yellow-600 mt-1">
              Pedidos realizados hasta el martes se despachan el jueves de la misma semana
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Validación */}
      {!validateConfiguration() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-700">
              <div className="font-medium mb-1">Configuración incompleta</div>
              <div>Por favor, completa todas las opciones requeridas para continuar.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}