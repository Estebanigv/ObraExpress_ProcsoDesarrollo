"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './notification-bell';
// import { NotificationSystem } from './notification-system'; // Temporalmente comentado para debug

export function UserMenu() {
  console.log('🚀 UserMenu component renderizando...');
  
  const { user, logout, isLoading } = useAuth();
  
  console.log('🔍 UserMenu - Hook Auth obtenido:', { user, isLoading });
  
  // Debug log para verificar el estado del usuario
  React.useEffect(() => {
    console.log('🔍 UserMenu - Estado del usuario:', { user, isLoading });
  }, [user, isLoading]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg w-20 h-8"></div>
    );
  }

  if (user) {
    // Obtener el nombre completo y manejar casos donde el nombre esté vacío
    console.log('👤 Usuario en UserMenu:', user);
    const displayName = user.nombre && user.nombre.trim() ? user.nombre : user.email.split('@')[0];
    const firstName = displayName.split(' ')[0];
    console.log('👤 Nombre para mostrar:', displayName);
    console.log('👤 Primer nombre para avatar:', firstName);
    
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          {/* Campanita de notificaciones */}
          <NotificationBell />
          
          {/* Botón de usuario logueado - ahora muestra el nombre completo */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full lg:rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 flex items-center space-x-2 border border-white/30"
            title={`Logueado como ${displayName}`}
          >
            {/* Avatar pequeño dentro del botón */}
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Nombre del usuario */}
            <span className="hidden sm:inline max-w-24 truncate">
              {displayName}
            </span>
            <span className="sm:hidden">
              {firstName}
            </span>
            
            {/* Indicador de descuento si aplica */}
            {user.tieneDescuento && (
              <span className="text-yellow-300 text-xs">
                {user.porcentajeDescuento}%
              </span>
            )}
          </button>
        </div>

        {/* Dropdown expandido */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header del usuario */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{displayName}</p>
                  <p className="text-slate-700 text-xs">{user.email}</p>
                  {user.tieneDescuento && (
                    <span className="inline-block mt-1 text-yellow-700 text-xs bg-yellow-200 px-2 py-0.5 rounded-full">
                      🎉 {user.porcentajeDescuento}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="py-2">
              <a
                href="/perfil"
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">Mi Perfil</span>
              </a>
              
              <a
                href="/mis-compras"
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm font-medium">Mis Compras</span>
              </a>

              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Solo ícono sin funcionalidad de modal cuando no está logueado */}
        <div
          className="bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full lg:rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-2 border border-white/30"
          title="Inicia sesión desde el chatbot para acceder a tu cuenta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden lg:inline lg:ml-1">Invitado</span>
        </div>
      </div>

    </>
  );
}