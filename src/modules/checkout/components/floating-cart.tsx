"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { logger } from '@/lib/logger';
import { safeDocument } from '@/lib/client-utils';
import { CartThumbnail } from '@/components/optimized-image';

function CartModal() {
  const { state, toggleCart, removeItem, updateQuantity, updateItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  logger.log('🛒 FloatingCart render - items:', state.items.length, 'isOpen:', state.isOpen);
  
  // Calcular totales con descuento de usuario
  const subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
  const descuentoPorcentaje = user?.porcentajeDescuento || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;

  const handleCheckout = () => {
    router.push('/checkout');
    handleClose();
  };

  const handleClose = () => {
    console.log('🛒 handleClose called');
    setIsClosing(true);
    setTimeout(() => {
      console.log('🛒 About to close cart with toggleCart');
      toggleCart();
      setIsClosing(false);
      setIsVisible(false);
    }, 300);
  };

  const handleOpen = () => {
    console.log('🛒 handleOpen clicked - pathname:', pathname);
    setIsButtonAnimating(true);
    setTimeout(() => {
      console.log('🛒 About to toggleCart');
      toggleCart();
      setIsButtonAnimating(false);
    }, 300);
  };

  // Detectar si estamos en el cotizador guiado por IA
  const isOnCotizadorIA = pathname === '/cotizador-detallado';

  // Manejar apertura del modal
  useEffect(() => {
    if (state.isOpen && !isVisible) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (!state.isOpen && isVisible) {
      setIsVisible(false);
    }
  }, [state.isOpen]);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isVisible) {
      // Guardar la posición actual del scroll
      const currentScrollY = window.scrollY;
      setSavedScrollPosition(currentScrollY);
      const body = document.body;
      
      // Aplicar estilos para prevenir el salto
      body.style.position = 'fixed';
      body.style.top = `-${currentScrollY}px`;
      body.style.width = '100%';
      body.style.left = '0';
      body.style.right = '0';
    } else {
      // Restaurar la posición del scroll
      const body = document.body;
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.left = '';
      body.style.right = '';
      
      // Usar requestAnimationFrame para asegurar que el scroll se restaure correctamente
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollPosition);
      });
    }

    return () => {
      // Limpiar estilos al desmontar si es necesario
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.left = '';
        document.body.style.right = '';
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollPosition);
        });
      }
    };
  }, [isVisible, savedScrollPosition]);

  return (
    <>
      <style jsx>{`
        @keyframes subtle-pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.95;
            transform: scale(1.02);
          }
        }
        
        @keyframes slide-in-smooth {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        @keyframes slide-out-smooth {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes backdrop-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes backdrop-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes content-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) rotate(-15deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes cart-button-scale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes cart-button-move {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes panel-slide-expand {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes button-fly-to-right {
          0% {
            transform: scale(1) translateX(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.8) translateX(150px);
            opacity: 0;
          }
        }
        
        @keyframes icon-appear-header {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .cart-modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
          animation: backdrop-fade-in 0.3s ease-out;
        }
        
        .cart-modal-panel {
          animation: panel-slide-expand 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .cart-button-flying {
          animation: button-fly-to-right 0.3s ease-out forwards;
        }
        
        .cart-icon-header {
          animation: icon-appear-header 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }
        
        .cart-modal-closing .cart-modal-backdrop {
          animation: backdrop-fade-out 0.3s ease-out forwards;
        }
        
        .cart-modal-closing .cart-modal-panel {
          animation: slide-out-smooth 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      {/* Botón flotante del carrito - posición elegante - OCULTO EN MÓVIL */}
      {!state.isOpen && (
        <div 
          className={`fixed hidden lg:block z-[9999999] ${
            state.items.length > 0 ? 'top-20 right-6' : 'top-4 right-6'
          } ${isButtonAnimating ? 'cart-button-flying' : ''}`}
          style={{
            transition: isButtonAnimating ? 'none' : 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            animation: !isButtonAnimating && state.items.length > 0 ? 'cart-button-move 0.8s ease-in-out' : undefined
          }}
        >
          <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpen();
              }}
              className={`relative transition-all duration-500 group ${
                state.items.length > 0
                  ? 'w-16 h-16 rounded-full shadow-lg bg-white hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:scale-110 ring-2 ring-yellow-400'
                  : 'w-8 h-8 hover:bg-gray-200/20 rounded-lg p-1'
              }`}
              style={state.items.length > 0 ? {
                animation: 'subtle-pulse 3s ease-in-out infinite'
              } : {}}
              title="Ver carrito de compras"
            >
              {/* Ícono del carrito */}
              <div className="flex items-center justify-center h-full transition-transform duration-300 group-hover:scale-110">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={state.items.length > 0 ? 1.8 : 1.5} 
                  stroke="currentColor" 
                  className={`transition-all duration-500 ${
                    state.items.length > 0 
                      ? 'w-7 h-7 text-black transform scale-100' 
                      : 'w-6 h-6 text-black transform scale-95'
                  }`}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" 
                  />
                </svg>
              </div>
              
              {/* Badge de cantidad - mejor posicionado para no tapar el ícono */}
              {state.items.length > 0 && (
                <div 
                  className="absolute bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg border-2 border-white transition-all duration-300"
                  style={{
                    top: '-8px',
                    right: '-10px',
                    animation: 'bounce-in 0.6s ease-out'
                  }}
                >
                  {state.items.reduce((sum, item) => sum + item.cantidad, 0)}
                </div>
              )}
            </button>
        </div>
      )}

      {/* Modal del carrito - usando posición fixed directa sin portal */}
      {isVisible && (
        <div 
          className={`fixed inset-0 flex justify-end ${isClosing ? 'cart-modal-closing' : ''}`}
          style={{ zIndex: 10000 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 cart-modal-backdrop"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
          />
          
          {/* Panel lateral del carrito */}
          <div 
            className="relative bg-white h-full flex flex-col shadow-2xl overflow-hidden cart-modal-panel"
            style={{ 
              width: '500px',
              maxWidth: '90vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del carrito */}
            <div 
              className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50"
              style={{
                animation: 'content-fade-in 0.4s ease-out 0.2s both'
              }}
            >
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Carrito de Compras</h2>
                  <p className="text-sm text-gray-600">
                    {state.items.length} producto{state.items.length !== 1 ? 's' : ''} • {state.items.reduce((sum, item) => sum + item.cantidad, 0)} unidades
                  </p>
                </div>
                <div className={`relative ${!isClosing ? 'cart-icon-header' : ''}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.8} 
                    stroke="currentColor" 
                    className="w-7 h-7 text-black"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" 
                    />
                  </svg>
                  {/* Badge de cantidad en el header */}
                  {state.items.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
                      {state.items.reduce((sum, item) => sum + item.cantidad, 0)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {state.items.length === 0 ? (
              /* Carrito vacío */
              <div 
                className="flex-1 flex items-center justify-center p-8"
                style={{
                  animation: 'content-fade-in 0.5s ease-out 0.3s both'
                }}
              >
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-10 h-10 text-gray-400"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
                  >
                    Continuar Navegando
                  </button>
                </div>
              </div>
            ) : (
              /* Carrito con productos */
              <>
                {/* Lista de productos - scrolleable */}
                <div 
                  className="flex-1 overflow-y-auto p-6"
                  style={{
                    animation: 'content-fade-in 0.5s ease-out 0.3s both'
                  }}
                >
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex gap-4">
                          {/* Imagen del producto */}
                          <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                            {item.imagen ? (
                              <CartThumbnail
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 pr-2">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.nombre}</h3>
                                {item.descripcion && (
                                  <p className="text-xs text-gray-600 mb-1">{item.descripcion}</p>
                                )}
                                {item.fechaDespacho && (
                                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md mb-1 font-medium">
                                    📅 Despacho: {(item.fechaDespacho instanceof Date ? item.fechaDespacho : new Date(item.fechaDespacho)).toLocaleDateString('es-CL', { 
                                      weekday: 'long', 
                                      day: 'numeric', 
                                      month: 'long' 
                                    })}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  ${(item.precioUnitario || 0).toLocaleString()} por unidad
                                </div>
                              </div>
                              
                              {/* Botón eliminar */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                                title="Eliminar producto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            {/* Controles de cantidad */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-white rounded-lg border border-gray-300">
                                <button
                                  onClick={() => {
                                    const newQuantity = Math.max(10, item.cantidad - 10);
                                    if (newQuantity < 10) {
                                      removeItem(item.id);
                                    } else {
                                      updateQuantity(item.id, newQuantity);
                                    }
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                                  title="Quitar 10 unidades"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                
                                <div className="px-4 py-2 bg-gray-50 border-x border-gray-300 min-w-[70px] text-center">
                                  <div className="font-semibold text-sm">{item.cantidad}</div>
                                  <div className="text-xs text-gray-500">uds</div>
                                </div>
                                
                                <button
                                  onClick={() => updateQuantity(item.id, item.cantidad + 10)}
                                  className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                                  title="Agregar 10 unidades"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>

                              {/* Total del item */}
                              <div className="text-right">
                                <div className="font-bold text-gray-900">${(item.total || 0).toLocaleString()}</div>
                              </div>
                            </div>

                            {/* Información adicional según tipo */}
                            {item.tipo === 'coordinacion' && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-xs text-blue-700 space-y-1">
                                  <div>📅 {item.fechaDespacho?.toLocaleDateString('es-CL')}</div>
                                  <div>📍 {item.region}, {item.comuna}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer con totales y botón de compra - SIEMPRE VISIBLE */}
                <div 
                  className="border-t border-gray-200 bg-white p-6 flex-shrink-0"
                  style={{
                    animation: 'content-fade-in 0.5s ease-out 0.4s both'
                  }}
                >
                  {/* Totales */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${(subtotal || 0).toLocaleString()}</span>
                      </div>
                      
                      {user?.tieneDescuento && descuentoMonto > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Descuento ({descuentoPorcentaje}%):
                          </span>
                          <span className="font-medium">-${(descuentoMonto || 0).toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío:</span>
                        <span className="font-medium text-green-600">Gratis</span>
                      </div>
                      
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-xl font-bold text-yellow-600">${(total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de compra - GARANTIZADO VISIBLE */}
                  <div className="space-y-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCheckout();
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Proceder al Pago</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClose();
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Continuar Navegando
                    </button>
                  </div>

                  {/* Badges de confianza */}
                  <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Compra Segura
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Entrega Rápida
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CartModal;