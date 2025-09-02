"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HoveredLink } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { CoordinadorDespacho } from "./coordinador-despacho";
import { safeWindow } from "@/lib/client-utils";
import { getDispatchMessage, formatDispatchDate, getNextDispatchDate } from "@/utils/dispatch-dates";
import DispatchCalendarModal from "./dispatch-calendar-modal";
import { BuscadorGlobal, useSearchShortcut } from "./buscador-global";
import { openElevenLabsWidget } from "@/utils/elevenlabs-widget";
import { EmailModalWrapper as EmailSelector } from "./email-modal-wrapper";
import dynamic from 'next/dynamic';
import { Calendar } from 'lucide-react';

// Dynamic import para evitar hydration issues con CartButton
const CartButton = dynamic(() => import("@/components/cart-button"), {
  ssr: false,
  loading: () => (
    <div className="relative flex items-center space-x-2 text-black py-1 px-2">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      <span className="hidden sm:inline text-sm font-medium bg-gray-200 rounded w-12 h-4 animate-pulse"></span>
    </div>
  )
});

export function NavbarSimple() {
  return (
    <div className="relative w-full">
      <Navbar />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [subMenuActive, setSubMenuActive] = useState<string | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [subMenuTimeout, setSubMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nextDispatchDate, setNextDispatchDate] = useState<Date | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState<string>("");
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarButtonRef, setCalendarButtonRef] = useState<HTMLButtonElement | null>(null);
  const [isCalendarButtonClicked, setIsCalendarButtonClicked] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ES' | 'EN'>('ES');
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const pathname = usePathname();

  // Función para determinar qué página está activa
  const getCurrentPage = () => {
    if (pathname === '/') return 'Home';
    if (pathname === '/nosotros') return 'Nosotros';
    if (pathname.startsWith('/productos')) return 'Productos';
    if (pathname === '/contacto') return 'Contacto';
    return null;
  };

  const currentPage = getCurrentPage();
  
  
  // Activar atajos de teclado para búsqueda
  useSearchShortcut();

  // Auto-focus en el input cuando se expande el buscador
  useEffect(() => {
    if (searchExpanded) {
      const timer = setTimeout(() => {
        const searchInput = document.querySelector('.sidebar-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchExpanded]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.length >= 3) {
      // Solo mostrar productos de categorías visibles (Policarbonato y Perfiles Alveolar)
      const mockProducts = [
        'Policarbonato Alveolar 4mm Clear',
        'Policarbonato Alveolar 6mm Bronce',
        'Policarbonato Alveolar 8mm Opal', 
        'Policarbonato Ondulado 0,5mm Clear',
        'Policarbonato Ondulado 0,7mm Bronce',
        'Policarbonato Ondulado 1mm Opal',
        'Policarbonato Compacto 2mm Clear',
        'Policarbonato Compacto 3mm Bronce',
        'Policarbonato Compacto 4mm Opal',
        'Perfil U',
        'Perfil Clip'
      ];
      
      const filtered = mockProducts
        .filter(product => 
          product.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(name => ({ name }));
      
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = safeWindow.getScrollY();
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    safeWindow.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => safeWindow.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout);
      if (subMenuTimeout) clearTimeout(subMenuTimeout);
    };
  }, [closeTimeout, subMenuTimeout]);


  // Calcular próxima fecha de despacho (usando policarbonato como default para el navbar)
  useEffect(() => {
    const calculateNextDispatch = () => {
      const nextDate = getNextDispatchDate('policarbonato');
      const message = formatDispatchDate(nextDate);
      setNextDispatchDate(nextDate);
      setDispatchMessage(message);
    };

    calculateNextDispatch();
    
    // Actualizar cada minuto para mantener la información actualizada
    const interval = setInterval(calculateNextDispatch, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnterMenu = (menu: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeaveMenu = () => {
    // NO hacer nada - El menú se mantiene abierto
    // Solo se cierra por acción explícita del usuario
  };

  const handleMouseEnterSubMenu = (submenu: string) => {
    // Solo establecer el submenu activo, sin timeouts
    setSubMenuActive(submenu);
  };

  const handleMouseLeaveSubMenu = () => {
    // NO hacer nada - Mantener siempre abierto
  };

  const handleMenuItemHover = (item: string) => {
    setActiveMenuItem(item);
  };

  const handleMenuLeave = () => {
    setActiveMenuItem(null);
  };

  // Función para cerrar el menú SOLO por acción del usuario (clic fuera o muy lejos del área)
  const handleForceClose = () => {
    setActiveDropdown(null);
    setSubMenuActive(null);
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    if (subMenuTimeout) {
      clearTimeout(subMenuTimeout);
      setSubMenuTimeout(null);
    }
  };

  // Cerrar menú solo cuando el usuario hace clic fuera del área completa
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const menuArea = document.querySelector('.menu-container');
      const dropdownAreas = document.querySelectorAll('[class*="absolute top-full"], [class*="absolute left-full"]');
      
      let isInsideMenu = false;
      if (menuArea && menuArea.contains(target)) {
        isInsideMenu = true;
      }
      
      dropdownAreas.forEach(area => {
        if (area && area.contains(target)) {
          isInsideMenu = true;
        }
      });
      
      if (!isInsideMenu) {
        handleForceClose();
      }
    };

    if (activeDropdown || subMenuActive) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown, subMenuActive]);

  return (
    <>
      {/* Menú lateral vertical - Solo en desktop */}
      <motion.div
        initial={false}
        animate={{ 
          x: !isVisible ? 0 : -100, 
          opacity: !isVisible ? 1 : 0 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.6
        }}
        className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-300/30 p-3">
          <div className="flex flex-col space-y-4">
            
            {/* Home */}
            <button
              onClick={() => {
                if (pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  window.location.href = '/';
                }
              }}
              className="p-3 rounded-xl transition-all duration-300 hover:bg-amber-50 hover:scale-110 text-gray-600 hover:text-amber-600 group"
              title={pathname === '/' ? 'Ir arriba' : 'Inicio'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </button>

            {/* Buscador fusionado */}
            <div className="relative">
              <button
                onClick={() => setSearchExpanded(!searchExpanded)}
                className={cn(
                  "p-3 rounded-xl transition-all duration-300 hover:scale-110 text-gray-600 hover:text-amber-600 group",
                  searchExpanded ? 'bg-amber-50 text-amber-600' : 'hover:bg-amber-50'
                )}
                title="Buscar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
              
              {/* Panel de búsqueda que se extiende hacia la derecha */}
              {searchExpanded && (
                <>
                  {/* Overlay para cerrar al hacer clic fuera */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => {
                      setSearchExpanded(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  />
                  <div className="absolute left-full top-0 ml-2 z-40">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-300/30 p-2 min-w-[300px] animate-in slide-in-from-left-2 duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Buscar productos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 sidebar-search-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setSearchExpanded(false);
                              setSearchQuery('');
                              setSearchResults([]);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            setSearchExpanded(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Resultados de búsqueda en tiempo real */}
                      {searchQuery && (
                        <div className="max-h-60 overflow-y-auto">
                          <div className="text-xs text-gray-500 mb-1">Resultados para "{searchQuery}":</div>
                          <div className="space-y-1">
                            {searchResults.length > 0 ? (
                              searchResults.map((result: any, index) => (
                                <div 
                                  key={index} 
                                  className="p-2 hover:bg-gray-50 rounded text-sm cursor-pointer transition-colors"
                                  onClick={() => {
                                    // Aquí puedes agregar navegación o acción al seleccionar un resultado
                                    console.log('Producto seleccionado:', result.name);
                                  }}
                                >
                                  {result.name}
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-400 p-2">
                                {searchQuery.length < 3 ? 'Escribe al menos 3 caracteres...' : 'No se encontraron productos'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Productos */}
            <Link
              href="/productos"
              className={cn(
                "p-3 rounded-xl transition-all duration-300 hover:bg-amber-50 hover:scale-110 group",
                pathname.startsWith('/productos') ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:text-amber-600'
              )}
              title="Productos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </Link>

            {/* Calendario de Despachos */}
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="p-3 rounded-xl transition-all duration-300 hover:bg-amber-50 hover:scale-110 text-gray-600 hover:text-amber-600 group"
              title="Calendario de Despachos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </button>

            {/* Contacto */}
            <Link
              href="/contacto"
              className={cn(
                "p-3 rounded-xl transition-all duration-300 hover:bg-amber-50 hover:scale-110 group",
                pathname === '/contacto' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:text-amber-600'
              )}
              title="Contacto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </Link>

            {/* Ubicación en tiempo real */}
            <div className="relative">
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                          // Obtener dirección usando geocoding reverso (si tienes API key de Google)
                          const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                          setUserLocation({ lat: latitude, lng: longitude, address });
                        } catch (error) {
                          setUserLocation({ lat: latitude, lng: longitude });
                        }
                      },
                      (error) => {
                        console.error('Error obteniendo ubicación:', error);
                        setUserLocation(null);
                      },
                      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                    );
                  } else {
                    alert('Geolocalización no disponible en este navegador');
                  }
                }}
                className={cn(
                  "p-3 rounded-xl transition-all duration-300 hover:scale-110 group",
                  userLocation 
                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                )}
                title="Obtener mi ubicación actual"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </button>
              
              {/* Mostrar ubicación actual */}
              {userLocation && (
                <div className="absolute left-full top-0 ml-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-300/30 p-3 min-w-[250px] z-50">
                  <div className="text-sm font-medium text-gray-800 mb-1">📍 Tu ubicación actual:</div>
                  <div className="text-xs text-gray-600">
                    <div>Lat: {userLocation.lat.toFixed(6)}</div>
                    <div>Lng: {userLocation.lng.toFixed(6)}</div>
                    {userLocation.address && (
                      <div className="mt-1 text-gray-500">{userLocation.address}</div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps/@${userLocation.lat},${userLocation.lng},15z`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Ver en Maps
                    </button>
                    <button
                      onClick={() => setUserLocation(null)}
                      className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </motion.div>

      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        className
      )}>
        {/* Top Sales Bar - Barra Amarilla Original */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-2 sm:py-3">
          <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            {/* Left: Mensaje de Venta Rápida */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 overflow-hidden">
              {/* Mensaje de venta - Sin logo duplicado */}
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-white/20 rounded-full">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <Link href="/" className="flex flex-col">
                  <span className="text-gray-900 font-black text-base leading-none drop-shadow-sm" style={{letterSpacing: '0.25em'}}>OBRAEXPRESS</span>
                  <span className="text-gray-900 text-xs font-semibold leading-none drop-shadow-sm" style={{letterSpacing: '0.25em'}}>Materiales de construcción</span>
                </Link>
              </div>
              
              {/* Calendario de Despacho - Info principal */}
              <div className="flex items-center space-x-2 text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-none">Próximo Despacho</span>
                  <span className="text-xs font-medium leading-none">{dispatchMessage}</span>
                </div>
                <button
                  ref={setCalendarButtonRef}
                  onClick={() => {
                    setIsCalendarButtonClicked(true);
                    setTimeout(() => {
                      setIsCalendarModalOpen(true);
                      setIsCalendarButtonClicked(false);
                    }, 100);
                  }}
                  className={`ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-green-500 flex items-center gap-2 ${
                    isCalendarButtonClicked ? 'scale-105 shadow-xl' : ''
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ver Calendario</span>
                </button>
              </div>
              
              {/* Contact Info - Solo iconos en responsive */}
              <span 
                onClick={() => {
                  console.log('🎯 Enlace llamar clickeado - abriendo widget Eleven Labs');
                  openElevenLabsWidget();
                }}
                className="text-gray-900 hover:text-gray-700 transition-colors duration-200 cursor-pointer p-1.5 hover:bg-gray-900/20 rounded-full"
                title="Llamar ahora - Asistente virtual"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </span>
              <EmailSelector
                email="info@obraexpress.cl"
                subject="Consulta desde ObraExpress"
                body="Hola, me gustaría hacer una consulta sobre sus servicios..."
                className="text-gray-900 hover:text-gray-700 transition-colors duration-200 cursor-pointer p-1.5 hover:bg-gray-900/20 rounded-full"
                title="Enviar email - info@obraexpress.cl"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </EmailSelector>
            </div>


            {/* Right: Acciones de Venta Rápida */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 min-w-0 flex-1 justify-end">
              {/* Botón Cotización Rápida - Solo icono en responsive */}
              <button
                onClick={() => {
                  window.location.href = '/cotizador-detallado';
                }}
                className="bg-white/20 hover:bg-white/30 text-white p-1.5 lg:px-3 lg:py-1.5 rounded-full lg:rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center cursor-pointer border border-white/30"
                title="Cotización Inmediata con IA"
                type="button"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="hidden lg:inline lg:ml-1 text-xs">Cotizar IA</span>
              </button>
              
              
              <div className="h-4 sm:h-6 w-px bg-white/30 hidden sm:block"></div>
              
              {/* Botón Ingresar/Registrar - Solo icono en responsive */}
              <button
                onClick={() => {
                  window.location.href = '/login';
                }}
                className="bg-white/20 hover:bg-white/30 text-white p-1.5 lg:px-3 lg:py-1.5 rounded-full lg:rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center cursor-pointer border border-white/30"
                title="Ingresar para compras rápidas y seguimiento"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden lg:inline lg:ml-1 text-xs">Ingresar</span>
              </button>
              
              <div className="h-4 sm:h-6 w-px bg-gray-700 hidden lg:block"></div>
              
              {/* Redes Sociales primero, luego Buscador Global */}
              <div className="hidden lg:flex items-center space-x-3">
                {/* Social Media - Ahora van primero */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Facebook */}
                  <a 
                    href="#" 
                    className="group relative p-1.5 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-105"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4 text-gray-800 hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="#" 
                    className="group relative p-1.5 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-105"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4 text-gray-800 hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 20.304c-2.987-.266-5.517-2.796-5.783-5.783-.266-2.987.523-7.251.523-7.251s4.264-.789 7.251-.523c2.987.266 5.517 2.796 5.783 5.783.266 2.987-.523 7.251-.523 7.251s-4.264.789-7.251.523z"/>
                      <path d="M12.017 7.075a4.912 4.912 0 100 9.825 4.912 4.912 0 000-9.825zm0 8.109a3.197 3.197 0 110-6.394 3.197 3.197 0 010 6.394z"/>
                      <circle cx="16.929" cy="7.071" r="1.142"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a 
                    href="#" 
                    className="group relative p-1.5 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-105"
                    title="YouTube"
                  >
                    <svg className="w-4 h-4 text-gray-800 hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href="#" 
                    className="group relative p-1.5 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-105"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4 text-gray-800 hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  {/* TikTok */}
                  <a 
                    href="#" 
                    className="group relative p-1.5 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-105"
                    title="TikTok"
                  >
                    <svg className="w-4 h-4 text-gray-800 hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.10-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
                
                {/* Buscador Global - Ahora a la derecha */}
                <div className="relative flex-shrink-0" style={{ zIndex: 9999 }}>
                  <BuscadorGlobal 
                    className="search-global-input w-32"
                    placeholder="Buscar..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={`relative transition-all duration-300 ${activeDropdown ? 'z-10' : 'z-40'}`}>
        {/* Desktop Navigation */}
        <div 
          className="hidden lg:flex justify-center pt-8 pb-8"
        >
          <div className="relative">
            {/* Navigation Container - Aumentado el tamaño */}
            <div className="bg-white/70 backdrop-blur-md rounded-full shadow-xl px-16 py-3 border border-gray-300/30">
              <div className="flex items-center justify-center w-full min-w-[600px]">
              {/* Centered Navigation */}
              <div 
                className="relative flex items-center space-x-12 menu-container"
                onMouseLeave={handleMenuLeave}
              >
                
                <div 
                  className="relative"
                  onMouseEnter={() => handleMenuItemHover('Home')}
                >
                  <Link 
                    href="/" 
                    className="cursor-pointer text-gray-800 font-medium text-sm tracking-[1px] uppercase hover:text-amber-600 transition-colors py-2 inline-block"
                  >
                    Home
                  </Link>
                  {activeMenuItem === 'Home' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -top-6 left-1/2 -translate-x-1/2"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      {/* Línea principal elegante */}
                      <div className="relative">
                        {/* Sombra sutil encima */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/10 rounded-full blur-lg"></div>
                        {/* Línea principal con degradado sutil */}
                        <div className="w-12 h-1 bg-gradient-to-r from-gray-600/80 via-black/90 to-gray-600/80 rounded-full shadow-lg"></div>
                        {/* Efectos decorativos sutiles */}
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-gray-500/15 rounded-full blur-md"></div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div 
                  className="relative"
                  onMouseEnter={() => handleMenuItemHover('Nosotros')}
                >
                  <Link 
                    href="/nosotros" 
                    className="cursor-pointer text-gray-800 font-medium text-sm tracking-[1px] uppercase hover:text-amber-600 transition-colors py-2 inline-block"
                  >
                    Nosotros
                  </Link>
                  {activeMenuItem === 'Nosotros' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -top-6 left-1/2 -translate-x-1/2"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      {/* Línea principal elegante */}
                      <div className="relative">
                        {/* Sombra sutil encima */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-18 h-3 bg-black/10 rounded-full blur-lg"></div>
                        {/* Línea principal con degradado sutil */}
                        <div className="w-16 h-1 bg-gradient-to-r from-gray-600/80 via-black/90 to-gray-600/80 rounded-full shadow-lg"></div>
                        {/* Efectos decorativos sutiles */}
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full blur-sm"></div>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-gray-500/15 rounded-full blur-md"></div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Productos Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => {
                    handleMouseEnterMenu("Productos");
                    handleMenuItemHover('Productos');
                  }}
                  onMouseLeave={handleMouseLeaveMenu}
                >
                  <div className="relative flex items-center">
                    <Link 
                      href="/productos" 
                      className="cursor-pointer text-gray-800 font-medium text-sm tracking-[1px] uppercase hover:text-amber-600 transition-colors py-2 inline-block"
                    >
                      Productos
                    </Link>
                    <svg className="w-4 h-4 ml-1 text-gray-800 transition-colors group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {activeMenuItem === 'Productos' && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -top-6 left-1/2 -translate-x-1/2"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        {/* Línea principal elegante - más ancha para Productos */}
                        <div className="relative">
                          {/* Sombra sutil encima */}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-22 h-3 bg-black/10 rounded-full blur-lg"></div>
                          {/* Línea principal con degradado sutil */}
                          <div className="w-20 h-1 bg-gradient-to-r from-gray-600/80 via-black/90 to-gray-600/80 rounded-full shadow-lg"></div>
                          {/* Efectos decorativos sutiles */}
                          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/20 rounded-full blur-sm"></div>
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-500/15 rounded-full blur-md"></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Productos Dropdown */}
                  {activeDropdown === "Productos" && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 w-48 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-2 z-[99999]">
                      
                      {/* Policarbonatos */}
                      <div 
                        className="relative px-3 py-2 hover:bg-amber-50 rounded transition-colors cursor-pointer flex items-center justify-between"
                        onMouseEnter={() => handleMouseEnterSubMenu("Policarbonatos")}
                        onMouseLeave={() => {
                          // No hacer nada - menú permanece estático
                        }}
                      >
                        <span className="text-sm text-gray-800 font-medium hover:text-amber-600">Policarbonatos</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        
                        {/* Extra hover area to the right for easier navigation - AMPLIADA */}
                        <div className="absolute right-0 top-0 w-16 h-full bg-transparent z-[140]"></div>
                      </div>

                      {/* Perfiles Alveolares */}
                      <div 
                        className="relative px-3 py-2 hover:bg-amber-50 rounded transition-colors cursor-pointer flex items-center justify-between"
                        onMouseEnter={() => handleMouseEnterSubMenu("Perfiles")}
                        onMouseLeave={() => {
                          // No hacer nada - menú permanece estático
                        }}
                      >
                        <span className="text-sm text-gray-800 font-medium hover:text-amber-600">Perfiles Alveolares</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        
                        {/* Extra hover area to the right for easier navigation - AMPLIADA */}
                        <div className="absolute right-0 top-0 w-16 h-full bg-transparent z-[140]"></div>
                      </div>
                      
                      {/* Policarbonatos Side Submenu */}
                      {subMenuActive === "Policarbonatos" && (
                          <>
                            {/* Invisible bridge to prevent gap issues - AMPLIADO */}
                            <div className="absolute left-full top-0 w-8 h-full bg-transparent z-[140]"></div>
                            <div 
                              className="absolute left-full top-[-10px] ml-2 w-72 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-4 z-[99999]"
                              onMouseEnter={() => handleMouseEnterSubMenu("Policarbonatos")}
                              onMouseLeave={() => {
                                // Solo cerrar si realmente sales del área completa del menú
                                // No cerrar automáticamente para mejor UX
                              }}
                            >
                              <div className="text-sm font-semibold text-gray-800 mb-3 border-b border-yellow-200 pb-2 flex justify-between items-center">
                                <span>Policarbonatos</span>
                                <button 
                                  onClick={() => setSubMenuActive(null)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            <div className="space-y-1">
                              <HoveredLink href="/productos?categoria=Policarbonato&tipo=Ondulado" className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded transition-colors hover:text-amber-600 cursor-pointer">
                                Ondulado
                              </HoveredLink>
                              <HoveredLink href="/productos?categoria=Policarbonato&tipo=Alveolar" className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded transition-colors hover:text-amber-600 cursor-pointer">
                                Alveolar
                              </HoveredLink>
                              <HoveredLink href="/productos?categoria=Policarbonato&tipo=Compacto" className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded transition-colors hover:text-amber-600 cursor-pointer">
                                Compacto
                              </HoveredLink>
                            </div>
                            </div>
                          </>
                        )}

                        {/* Perfiles Side Submenu */}
                        {subMenuActive === "Perfiles" && (
                          <>
                            {/* Invisible bridge to prevent gap issues - AMPLIADO */}
                            <div className="absolute left-full top-0 w-8 h-full bg-transparent z-[140]"></div>
                            <div 
                              className="absolute left-full top-[-10px] ml-2 w-72 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-4 z-[99999]"
                              onMouseEnter={() => handleMouseEnterSubMenu("Perfiles")}
                              onMouseLeave={() => {
                                // Solo cerrar si realmente sales del área completa del menú
                                // No cerrar automáticamente para mejor UX
                              }}
                            >
                              <div className="text-sm font-semibold text-gray-800 mb-3 border-b border-yellow-200 pb-2 flex justify-between items-center">
                                <span>Perfiles Alveolares</span>
                                <button 
                                  onClick={() => setSubMenuActive(null)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="space-y-1">
                                <HoveredLink href="/productos?categoria=Perfiles Alveolar&tipo=Perfil U" className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded transition-colors hover:text-amber-600 cursor-pointer">
                                  Perfil U
                                </HoveredLink>
                                <HoveredLink href="/productos?categoria=Perfiles Alveolar&tipo=Perfil Clip" className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded transition-colors hover:text-amber-600 cursor-pointer">
                                  Perfil Clip
                                </HoveredLink>
                              </div>
                            </div>
                          </>
                        )}
                      
                    </div>
                  )}
                </div>
                
                <div 
                  className="relative"
                  onMouseEnter={() => handleMenuItemHover('Contacto')}
                >
                  <Link 
                    href="/contacto" 
                    className="cursor-pointer text-gray-800 font-medium text-sm tracking-[1px] uppercase hover:text-amber-600 transition-colors py-2 inline-block"
                  >
                    Contacto
                  </Link>
                  {activeMenuItem === 'Contacto' && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -top-6 left-1/2 -translate-x-1/2"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      {/* Línea principal elegante */}
                      <div className="relative">
                        {/* Sombra sutil encima */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-18 h-3 bg-black/10 rounded-full blur-lg"></div>
                        {/* Línea principal con degradado sutil */}
                        <div className="w-16 h-1 bg-gradient-to-r from-gray-600/80 via-black/90 to-gray-600/80 rounded-full shadow-lg"></div>
                        {/* Efectos decorativos sutiles */}
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full blur-sm"></div>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-gray-500/15 rounded-full blur-md"></div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-300/40">
            <div className="flex items-center justify-between px-4 py-4">
              {/* Mobile Logo - Solo texto */}
              <HoveredLink href="/" className="flex items-center touch-target">
                <span className="text-xl font-bold text-gray-900">ObraExpress</span>
              </HoveredLink>
              
              {/* Mobile Cart and Menu Buttons */}
              <div className="flex items-center space-x-3">
                {/* Cart Button for Mobile */}
                <CartButton />
                
                {/* Hamburger Menu Button - Mejorado */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="relative text-gray-800 hover:text-amber-600 transition-all duration-300 p-3 rounded-lg hover:bg-amber-50 touch-target"
                  aria-label="Toggle mobile menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <div className="w-6 h-6 relative flex flex-col justify-center">
                    <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''
                    }`}></span>
                    <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 mt-1 ${
                      isMobileMenuOpen ? 'opacity-0' : ''
                    }`}></span>
                    <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 mt-1 ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}></span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Items - Mejorado con animaciones */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
                <div className="px-4 py-4 space-y-1">
                  {/* Buscador Global - Mobile */}
                  <div className="mb-4">
                    <BuscadorGlobal 
                      className="w-full"
                      placeholder="Buscar producto"
                    />
                  </div>
                  
                  {/* Botón de Calendario de Despacho para móviles */}
                  <button
                    onClick={() => {
                      setIsCalendarModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl mb-4 touch-target"
                    type="button"
                  >
                    <Calendar size={20} className="mr-2" />
                    Calendario de Despacho
                  </button>

                  {/* Enlaces principales con mejor diseño */}
                  <HoveredLink 
                    href="/" 
                    className="flex items-center text-gray-800 font-medium hover:text-amber-600 hover:bg-amber-50 transition-all duration-300 py-3 px-4 rounded-lg touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </HoveredLink>
                  
                  <HoveredLink 
                    href="/nosotros" 
                    className="flex items-center text-gray-800 font-medium hover:text-amber-600 hover:bg-amber-50 transition-all duration-300 py-3 px-4 rounded-lg touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Nosotros
                  </HoveredLink>
                  
                  <HoveredLink 
                    href="/productos" 
                    className="flex items-center text-gray-800 font-medium hover:text-amber-600 hover:bg-amber-50 transition-all duration-300 py-3 px-4 rounded-lg touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Productos
                  </HoveredLink>
                  
                  {/* Categorías con mejor organización */}
                  <div className="bg-gray-50 rounded-xl p-4 mt-3">
                    <div className="flex items-center text-sm text-gray-600 font-semibold mb-3">
                      <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Categorías de Productos
                    </div>
                    <div className="space-y-3">
                      {/* Policarbonatos */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          Policarbonatos
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <HoveredLink 
                            href="/productos?categoria=Policarbonato&tipo=Alveolar" 
                            className="text-gray-700 hover:text-amber-600 hover:bg-white transition-all duration-300 py-2 px-3 rounded-lg text-sm font-medium touch-target"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Alveolar
                          </HoveredLink>
                          <HoveredLink 
                            href="/productos?categoria=Policarbonato&tipo=Ondulado" 
                            className="text-gray-700 hover:text-amber-600 hover:bg-white transition-all duration-300 py-2 px-3 rounded-lg text-sm font-medium touch-target"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Ondulado
                          </HoveredLink>
                          <HoveredLink 
                            href="/productos?categoria=Policarbonato&tipo=Compacto" 
                            className="text-gray-700 hover:text-amber-600 hover:bg-white transition-all duration-300 py-2 px-3 rounded-lg text-sm font-medium touch-target"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Compacto
                          </HoveredLink>
                        </div>
                      </div>
                      
                      {/* Perfiles Alveolares */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                          Perfiles Alveolares
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <HoveredLink 
                            href="/productos?categoria=Perfiles Alveolar&tipo=Perfil U" 
                            className="text-gray-700 hover:text-amber-600 hover:bg-white transition-all duration-300 py-2 px-3 rounded-lg text-sm font-medium touch-target"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Perfil U
                          </HoveredLink>
                          <HoveredLink 
                            href="/productos?categoria=Perfiles Alveolar&tipo=Perfil Clip" 
                            className="text-gray-700 hover:text-amber-600 hover:bg-white transition-all duration-300 py-2 px-3 rounded-lg text-sm font-medium touch-target"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Perfil Clip
                          </HoveredLink>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contacto */}
                  <HoveredLink 
                    href="/contacto" 
                    className="flex items-center text-gray-800 font-medium hover:text-amber-600 hover:bg-amber-50 transition-all duration-300 py-3 px-4 rounded-lg mt-3 touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contacto
                  </HoveredLink>

                  {/* Información adicional para móvil */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="text-center space-y-2">
                      <button 
                        onClick={() => {
                          console.log('🎯 Botón móvil clickeado - abriendo widget Eleven Labs');
                          openElevenLabsWidget();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        title="Abrir asistente virtual de Eleven Labs"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        Llamar con Asistente Virtual
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Modal de buscador */}
      {showSearchModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowSearchModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Buscar productos</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BuscadorGlobal
              className="w-full"
              placeholder="¿Qué estás buscando?"
            />
          </motion.div>
        </motion.div>
      )}
      
      {/* Modal de Calendario de Despacho */}
      <DispatchCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        productType="Policarbonato (todas las variedades)"
        buttonRef={calendarButtonRef}
        onDateSelect={(date) => {
          // Aquí se puede agregar lógica adicional si es necesario
        }}
      />
    </div>
    </>
  );
}