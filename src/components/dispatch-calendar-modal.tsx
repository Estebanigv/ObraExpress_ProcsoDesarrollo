"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { safeDocument } from '@/lib/client-utils';
import { getNextDispatchDate, formatDispatchDate, getDispatchRuleForProduct, getDispatchDescription } from '@/utils/dispatch-dates';
import { DateRoller } from './date-roller';

interface DispatchCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
  productType?: string;
  buttonRef?: HTMLButtonElement | null;
}

function DispatchCalendarModal({ isOpen, onClose, onDateSelect, productType = "Policarbonato", buttonRef }: DispatchCalendarModalProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nextDispatchDate, setNextDispatchDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentProductType, setCurrentProductType] = useState(productType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Detectar dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Capturar posición del botón si existe
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
        setButtonPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
      
      // Prevenir el salto del scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      setIsAnimatingOut(false);
      // Iniciar animación después de un pequeño delay
      setTimeout(() => setIsAnimatingIn(true), 50);
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      setIsAnimatingIn(false);
      setIsAnimatingOut(false);
      setButtonPosition(null);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, buttonRef]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    const nextDate = getNextDispatchDate(currentProductType);
    setNextDispatchDate(nextDate);
    setSelectedDate(nextDate);
  }, [currentProductType]);

  useEffect(() => {
    setCurrentProductType(productType);
  }, [productType]);

  if (!mounted || !isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateStatus = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const isPast = checkDate < today;
    const isToday = checkDate.getTime() === today.getTime();
    
    // Usar las reglas de despacho configuradas
    const rule = getDispatchRuleForProduct(currentProductType);
    
    if (isToday && rule.availableDays.includes(dayOfWeek)) {
      // Si es hoy y es un día disponible, verificar si aún no pasó la hora límite
      const currentHour = new Date().getHours();
      if (rule.cutoffHour && currentHour < rule.cutoffHour) {
        return 'available'; // Disponible hoy
      } else {
        return 'today'; // Es hoy pero ya pasó la hora límite
      }
    }
    
    if (isToday) return 'today';
    
    // Para fechas futuras, verificar si el día de la semana es disponible
    if (rule.availableDays.includes(dayOfWeek) && !isPast) {
      return 'available';
    }
    
    return isPast ? 'past' : 'unavailable';
  };

  const formatDate = (date: Date) => {
    const formatted = date.toLocaleDateString('es-CL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    // Capitalizar la primera letra
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatDateWithHighlightedNumber = (date: Date) => {
    const weekday = date.toLocaleDateString('es-CL', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('es-CL', { month: 'long' });
    
    return {
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      day: day,
      month: month
    };
  };

  const handleDateSelect = (date: Date) => {
    const status = getDateStatus(date);
    if (status === 'available') {
      setSelectedDate(date);
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    // Ajustar para que empiece en lunes (getDay() devuelve 0=domingo, 1=lunes, etc.)
    const dayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    startDate.setDate(firstDay.getDate() - dayOffset);
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const calendarDays = generateCalendarDays();

  const modalContent = (
    <>
      <style jsx>{`
        @keyframes modal-backdrop-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modal-backdrop-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes modal-grow-from-button {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(-10px);
          }
        }
        
        @keyframes modal-shrink-to-button {
          0% {
            opacity: 1;
            transform: scale(1) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
        }
        
        .modal-backdrop {
          animation: modal-backdrop-fade-in 0.3s ease-out;
        }
        
        .modal-backdrop-exit {
          animation: modal-backdrop-fade-out 0.25s ease-in;
        }
        
        .modal-content-enter {
          animation: modal-grow-from-button 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .modal-content-exit {
          animation: modal-shrink-to-button 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
      <div 
        className={`fixed inset-0 flex items-center justify-center ${
          isAnimatingOut ? 'modal-backdrop-exit' : 'modal-backdrop'
        }`}
        style={{ 
          zIndex: 9999999,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={handleClose}
      >
        {/* Modal Content */}
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${
            isAnimatingOut ? 'modal-content-exit' : 
            isAnimatingIn ? 'modal-content-enter' : ''
          }`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-10px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Disponibilidad de Despacho</h3>
              <p className="text-emerald-100 text-sm mt-1">
                {getDispatchDescription(currentProductType)}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selector de categoría de producto */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría de producto
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 transition-colors"
            >
              <span className="block truncate font-medium text-gray-900">{currentProductType}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-gray-200">
                <div
                  onClick={() => {
                    setCurrentProductType('Policarbonato');
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-emerald-50 group"
                >
                  <span className="block truncate font-medium text-gray-900 group-hover:text-emerald-700">
                    Policarbonato
                  </span>
                  <span className="text-gray-500 text-sm group-hover:text-emerald-600">
                    Solo jueves de 9:00 a 18:00 hrs
                  </span>
                  {currentProductType.includes('Policarbonato') && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <div
                  onClick={() => {
                    setCurrentProductType('Herramientas Especializadas');
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-emerald-50 group"
                >
                  <span className="block truncate font-medium text-gray-900 group-hover:text-emerald-700">
                    Herramientas Especializadas
                  </span>
                  <span className="text-gray-500 text-sm group-hover:text-emerald-600">
                    Lunes a viernes de 9:00 a 18:00 hrs
                  </span>
                  {currentProductType.includes('Herramienta') && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Próximo despacho - Premium */}
        {nextDispatchDate && (
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800 p-6 border-b border-slate-600/30 shadow-xl">
            {/* Efecto sutil de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/10 to-transparent"></div>
            
            <div className="relative text-center">
              {/* Texto principal elegante */}
              <p className="text-slate-300 text-sm font-medium mb-2 tracking-wide uppercase">
                Próximo Despacho Disponible
              </p>
              <p className="text-white text-3xl font-light mb-4 tracking-tight">
                {formatDate(nextDispatchDate)}
              </p>
              
              {/* Badge minimalista */}
              <div className="inline-flex items-center bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600/30">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></div>
                <span className="text-slate-200 text-sm font-medium">Fecha más próxima</span>
              </div>
              
              <p className="text-slate-400 text-xs font-normal mt-3">
                También puedes seleccionar otra fecha disponible
              </p>
            </div>
          </div>
        )}

        {/* Navegación del mes */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-lg font-semibold text-gray-800 capitalize">
            {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h4>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 p-4 pb-2 bg-gray-50">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
            <div 
              key={day} 
              className={`text-center text-xs font-medium py-2 ${
                index === 3 ? 'text-emerald-600 font-bold' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className={`grid grid-cols-7 gap-1 p-4 pt-0 pb-4 ${isMobile ? 'hidden' : ''}`}>
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const status = getDateStatus(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            let buttonClass = 'h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center relative ';
            
            if (!isCurrentMonth) {
              // Para fechas de otros meses, verificar si son jueves disponibles
              if (status === 'available') {
                if (isSelected) {
                  buttonClass += 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300 shadow-lg transform scale-110 hover:scale-150 hover:shadow-2xl cursor-pointer transition-all duration-300';
                } else {
                  buttonClass += 'border-2 border-emerald-500 text-emerald-600 hover:border-emerald-600 hover:text-emerald-700 cursor-pointer font-bold hover:shadow-lg hover:scale-110 hover:bg-emerald-50 bg-white transform transition-all duration-300';
                }
              } else {
                buttonClass += 'text-gray-300 cursor-default';
              }
            } else if (status === 'today') {
              buttonClass += 'border-2 border-blue-500 text-blue-600 font-bold bg-white';
            } else if (status === 'available') {
              if (isSelected) {
                buttonClass += 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300 shadow-lg transform scale-110 hover:scale-150 hover:shadow-2xl cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-green-600 hover:ring-1 hover:ring-yellow-400';
              } else {
                buttonClass += 'border-2 border-emerald-500 text-emerald-600 hover:border-emerald-600 hover:text-emerald-700 cursor-pointer font-bold hover:shadow-lg hover:scale-110 hover:bg-emerald-50 bg-white transform transition-all duration-300 hover:animate-pulse';
              }
            } else if (status === 'past') {
              buttonClass += 'text-gray-400 cursor-default';
            } else {
              buttonClass += 'text-gray-500 hover:bg-gray-100 cursor-default';
            }

            return (
              <button
                key={index}
                onClick={() => status === 'available' ? handleDateSelect(date) : null}
                disabled={status !== 'available'}
                className={buttonClass}
                title={
                  status === 'today' ? `Hoy - ${date.getDate()}` :
                  status === 'available' ? 
                    `Despacho disponible - ${date.getDate()}${!isCurrentMonth ? ` (${date.toLocaleDateString('es-CL', { month: 'short' })})` : ''}` :
                  `${date.getDate()} - No disponible`
                }
              >
                {date.getDate()}
                {status === 'available' && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Date Roller para móviles */}
        {isMobile && (
          <div className="p-4 border-t border-gray-200">
            <DateRoller 
              onDateSelect={(date) => {
                setSelectedDate(date);
                if (onDateSelect) {
                  onDateSelect(date);
                }
              }}
              selectedDate={selectedDate || undefined}
            />
          </div>
        )}

        {/* Información seleccionada */}
        {selectedDate && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-blue-200">
            <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-6">
              <div className="text-center">
                <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">FECHA SELECCIONADA PARA TU DESPACHO</h4>
                
                <div className="flex items-center justify-center mb-3">
                  <p className="text-2xl font-bold text-blue-900">{formatDate(selectedDate)}</p>
                </div>
                
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-yellow-800 font-medium mb-1">
                      Despacho solo jueves
                    </div>
                    <div className="text-xs text-yellow-700">
                      Horario: <span className="font-bold">{getDispatchRuleForProduct(currentProductType).timeRange.start}:00 a {getDispatchRuleForProduct(currentProductType).timeRange.end}:00 hrs</span>
                    </div>
                  </div>
                </div>
                
                {/* Botón de acción centrado */}
                <button
                  onClick={() => {
                    const dateParam = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
                    handleClose(); // Cerrar el modal primero
                    setTimeout(() => {
                      router.push(`/productos?categoria=Policarbonatos&fecha=${dateParam}`);
                    }, 250);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
                  </svg>
                  <span>Ver productos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-blue-500 rounded bg-white"></div>
              <span className="text-gray-600">Hoy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-emerald-500 rounded bg-white"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-emerald-600 rounded ring-2 ring-emerald-300"></div>
              <span className="text-gray-600 font-medium">Seleccionada</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-gray-600">No disponible</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {getDispatchDescription(currentProductType)}
          </p>
        </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

export default DispatchCalendarModal;