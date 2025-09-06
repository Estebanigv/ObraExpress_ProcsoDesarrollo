"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePathname } from 'next/navigation';
import { SmartAssistantContext, SmartAssistantResponse } from '@/services/smart-assistant';

interface SmartGuideProps {
  checkoutData?: any;
  onActionClick?: (action: string) => void;
  isGlobalGuide?: boolean; // Para distinguir entre el guía global y el específico de checkout
}

export default function SmartGuide({ checkoutData, onActionClick, isGlobalGuide = false }: SmartGuideProps) {
  const [isVisible, setIsVisible] = useState(true); // Siempre visible inicialmente
  const [isExpanded, setIsExpanded] = useState(false);
  const [assistance, setAssistance] = useState<SmartAssistantResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<SmartAssistantContext | null>(null);
  const { state } = useCart();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Mapear pathname a página
  const getCurrentPage = (path: string): SmartAssistantContext['currentPage'] => {
    if (path === '/') return 'home';
    if (path.startsWith('/productos')) return 'products';
    if (path.startsWith('/carrito')) return 'cart';
    if (path.startsWith('/checkout')) return 'checkout';
    if (path.startsWith('/pago')) return 'payment';
    return 'home';
  };

  // Detectar información faltante
  const detectMissingInfo = (): string[] => {
    const missing: string[] = [];
    const currentPage = getCurrentPage(pathname);
    
    if (currentPage === 'checkout' && checkoutData) {
      if (!checkoutData.address?.street) missing.push('address');
      if (!checkoutData.deliveryDate) missing.push('delivery_date');
      if (!checkoutData.phone) missing.push('phone');
      if (!checkoutData.email) missing.push('email');
    }
    
    return missing;
  };

  // Actualizar contexto
  const updateContext = (): SmartAssistantContext => {
    const currentPage = getCurrentPage(pathname);
    const missingInfo = detectMissingInfo();
    
    const completedSteps: string[] = [];
    if (checkoutData?.address?.street) completedSteps.push('address');
    if (checkoutData?.deliveryDate) completedSteps.push('delivery_date');
    if (checkoutData?.phone) completedSteps.push('phone');
    if (checkoutData?.email) completedSteps.push('email');
    
    return {
      currentPage,
      cartItems: state.items,
      userInteractions: [],
      completedSteps,
      missingInformation: missingInfo,
      projectType: undefined,
      experience: 'principiante'
    };
  };

  // Obtener asistencia del servidor
  const getSmartAssistance = async (userQuery?: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const currentContext = updateContext();
      setContext(currentContext);
      
      const response = await fetch('/api/smart-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context: currentContext,
          userQuery
        })
      });

      if (!response.ok) {
        throw new Error('Error al obtener asistencia');
      }

      const data = await response.json();
      setAssistance(data.data);
      
      // Mostrar automáticamente si hay urgencia alta
      if (data.data.urgency === 'high') {
        setIsVisible(true);
        setIsExpanded(true);
      } else if (!isVisible && (data.data.urgency === 'medium' || currentContext.missingInformation.length > 0)) {
        setIsVisible(true);
      }
      
    } catch (error) {
      console.error('Error obteniendo asistencia smart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para monitorear cambios y mostrar guía automáticamente
  useEffect(() => {
    const currentPage = getCurrentPage(pathname);
    const missingInfo = detectMissingInfo();
    
    // Lógica para mostrar automáticamente la guía
    const shouldShowGuide = 
      // En checkout con información faltante
      (currentPage === 'checkout' && missingInfo.length > 0) ||
      // En home sin productos en carrito
      (currentPage === 'home' && state.items.length === 0) ||
      // En productos sin productos en carrito después de 30s
      (currentPage === 'products' && state.items.length === 0);
    
    if (shouldShowGuide) {
      // Delay para que no sea intrusivo
      const timer = setTimeout(() => {
        getSmartAssistance();
      }, currentPage === 'checkout' ? 1000 : 5000);
      
      return () => clearTimeout(timer);
    }
    
  }, [pathname, state.items.length, checkoutData]);

  // Monitoreo periódico en checkout
  useEffect(() => {
    if (getCurrentPage(pathname) === 'checkout') {
      intervalRef.current = setInterval(() => {
        const missingInfo = detectMissingInfo();
        if (missingInfo.length > 0) {
          getSmartAssistance();
        }
      }, 10000); // Verificar cada 10 segundos
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [pathname, checkoutData]);

  // Manejar clicks en acciones
  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
    
    // Auto-cerrar después de click
    setTimeout(() => {
      setIsExpanded(false);
    }, 1000);
  };

  // Obtener color según urgencia
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  // Obtener ícono según tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'recommendation':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'completion':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Si es el guía global y estamos en checkout, no mostrar (el checkout tiene su propio guía)
  if (isGlobalGuide && getCurrentPage(pathname) === 'checkout') {
    return null;
  }
  
  // Siempre mostrar el botón, pero el panel solo cuando hay asistencia
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-sm">
      {/* Botón principal siempre visible */}
      <div className="relative">
        <div
          className={`${assistance ? getUrgencyColor(assistance.urgency) : 'bg-gradient-to-r from-blue-500 to-purple-600'} ${
            assistance?.urgency === 'high' ? 'animate-pulse' : ''
          } rounded-full p-4 text-white shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl mb-2 hover:scale-110`}
        onClick={() => {
          if (!assistance) {
            // Si no hay asistencia, obtenerla
            getSmartAssistance('Hola, necesito ayuda con mi compra');
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {assistance ? getTypeIcon(assistance.type) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-sm font-medium">
            {assistance?.urgency === 'high' ? '¡Atención!' : 'Asistente IA'}
          </span>
          {!isExpanded && assistance?.urgency === 'high' && (
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          )}
        </div>
      </div>
      {/* Indicador IA */}
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
        IA
      </div>
    </div>

      {/* Panel expandido */}
      {isExpanded && assistance && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-full ${getUrgencyColor(assistance.urgency)} text-white`}>
                {getTypeIcon(assistance.type)}
              </div>
              <span className="font-medium text-gray-900 text-sm">
                Guía Inteligente
              </span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensaje principal */}
          <p className="text-sm text-gray-700 mb-3">{assistance.message}</p>

          {/* Acciones recomendadas */}
          {assistance.recommendations?.actions && assistance.recommendations.actions.length > 0 && (
            <div className="space-y-2 mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Acciones Recomendadas:
              </span>
              {assistance.recommendations.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-blue-50 rounded-md transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{action}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Próximos pasos */}
          {assistance.recommendations?.nextSteps && assistance.recommendations.nextSteps.length > 0 && (
            <div className="border-t pt-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Próximos Pasos:
              </span>
              <ul className="mt-2 space-y-1">
                {assistance.recommendations.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confianza */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Confianza: {assistance.confidence}%</span>
              <button
                onClick={() => getSmartAssistance('Necesito más ayuda')}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Actualizando...' : 'Actualizar guía'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}