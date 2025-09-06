"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { 
  calculateAlveolarRecommendationsAdvanced, 
  getAlveolarQuantityFromCart,
  getAlveolarProductsFromCart,
  type AlveolarRecommendations as AlveolarRecsType 
} from '@/services/alveolar-recommendations';

interface AlveolarRecommendationsProps {
  showInCheckout?: boolean;
  className?: string;
}

export default function AlveolarRecommendations({ 
  showInCheckout = false, 
  className = '' 
}: AlveolarRecommendationsProps) {
  const { state } = useCart();
  const [recommendations, setRecommendations] = useState<AlveolarRecsType | null>(null);
  const [alveolarQuantity, setAlveolarQuantity] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const quantity = getAlveolarQuantityFromCart(state.items);
    setAlveolarQuantity(quantity);
    
    if (quantity > 0) {
      // Usar la nueva lógica avanzada con especificaciones detalladas
      const alveolarProducts = getAlveolarProductsFromCart(state.items);
      const recs = calculateAlveolarRecommendationsAdvanced(alveolarProducts);
      setRecommendations(recs);
      // Auto-expandir en checkout si hay recomendaciones
      if (showInCheckout && recs.recommendations.length > 0) {
        setIsExpanded(true);
      }
    } else {
      setRecommendations(null);
      setIsExpanded(false);
    }
  }, [state.items, showInCheckout]);

  // No mostrar nada si no hay policarbonato alveolar
  if (!recommendations || alveolarQuantity === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              🎯 Solución Completa para tu Pedido
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Accesorios técnicos requeridos para {alveolarQuantity} plancha{alveolarQuantity > 1 ? 's' : ''} de policarbonato alveolar
            </p>
            <div className="flex items-center mt-2">
              <div className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Recomendación de ObraExpress
              </div>
            </div>
          </div>
        </div>
        <div className="text-blue-600">
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Recomendaciones */}
          <div className="grid gap-3">
            {recommendations.recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5 border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                        {rec.quantity}×
                      </span>
                      <h4 className="font-bold text-gray-900 text-base">{rec.productName}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">{rec.reason}</p>
                    {rec.specifications && (
                      <div className="bg-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
                        <strong>Especificaciones:</strong> {rec.specifications}
                      </div>
                    )}
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guía de Instalación */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
            <h4 className="font-semibold text-gray-800 mb-2">📋 Guía de Instalación Profesional</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-medium">1.</span>
                <span>Instalar {alveolarQuantity * 2} perfiles U en extremos superior e inferior de las planchas</span>
              </div>
              {alveolarQuantity > 1 && (
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium">2.</span>
                  <span>Unir planchas con {alveolarQuantity - 1} perfil{alveolarQuantity - 1 > 1 ? 'es' : ''} clip plano (entre planchas)</span>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-medium">{alveolarQuantity > 1 ? '3.' : '2.'}</span>
                <span>Fijar con tornillos de los {Math.ceil(alveolarQuantity / 2)} kit{Math.ceil(alveolarQuantity / 2) > 1 ? 's' : ''} alveolar (incluye arandelas y cintas de sellado)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-medium">{alveolarQuantity > 1 ? '4.' : '3.'}</span>
                <span>Cada kit cubre área de instalación para 2 planchas de 1.05×2.90m</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ IMPORTANTE:</strong> Los perfiles garantizan sellado hermético y durabilidad de 10+ años. 
                Sin estos accesorios la instalación no será profesional ni duradera.
              </p>
            </div>
          </div>

          {/* Botón de acción global */}
          {showInCheckout && (
            <div className="flex justify-center pt-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                🛒 Agregar Todos los Accesorios Requeridos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Indicador compacto cuando está colapsado */}
      {!isExpanded && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {recommendations.recommendations.length} accesorios requeridos para instalación profesional
            </span>
            <span className="text-blue-600 font-medium">Click para ver detalles</span>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {recommendations.recommendations.map((rec, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {rec.quantity}× {rec.productName.split(' ')[0]} {rec.productName.split(' ')[1]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}