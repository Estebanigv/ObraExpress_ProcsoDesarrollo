"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AuthStorage } from '@/lib/auth-storage';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/login',
  requireAuth = true 
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  // Determinar qué sistema de auth usar según el entorno
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'localStorage';
  const isStaticExport = process.env.STATIC_EXPORT === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Si es desarrollo o modo Vercel, NO aplicar AuthGuard
  const shouldSkipAuth = isDevelopment || authMode === 'vercel' || (!isStaticExport && authMode !== 'hostinger');

  // Páginas que NO requieren autenticación (públicas)
  const publicRoutes = ['/login', '/test-supabase'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Verificar sesión al montar el componente
    const checkSession = () => {
      // Si debe saltar la autenticación (desarrollo/vercel), no verificar
      if (shouldSkipAuth) {
        setChecking(false);
        return;
      }
      
      // Si es una ruta pública, no verificar autenticación
      if (isPublicRoute) {
        setChecking(false);
        return;
      }

      if (requireAuth && !user && !isLoading) {
        // No hay usuario y se requiere autenticación
        if (!AuthStorage.isSessionValid()) {
          // Redirigir al login si no hay sesión válida
          router.push(redirectTo);
          return;
        }
      }
      setChecking(false);
    };

    // Pequeño delay para evitar flash
    const timer = setTimeout(checkSession, 100);
    return () => clearTimeout(timer);
  }, [user, isLoading, requireAuth, redirectTo, router, isPublicRoute, shouldSkipAuth]);

  // Renovar sesión en actividad del usuario
  useEffect(() => {
    if (user) {
      const renewOnActivity = () => {
        AuthStorage.renewSession();
      };

      // Renovar sesión en interacciones del usuario
      const events = ['click', 'keydown', 'mousemove', 'scroll'];
      events.forEach(event => {
        document.addEventListener(event, renewOnActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, renewOnActivity);
        });
      };
    }
  }, [user]);

  // Si debe saltar la autenticación, mostrar contenido directamente
  if (shouldSkipAuth) {
    return <>{children}</>;
  }

  // Mostrar loading mientras verifica
  if (checking || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si es ruta pública, mostrar contenido sin restricciones
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Si se requiere auth y no hay usuario
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Usuario autenticado o no se requiere auth
  return <>{children}</>;
}

// Hook para verificar autenticación en páginas
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !AuthStorage.isSessionValid()) {
      router.push(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  return { user, isLoading };
}

// Componente para mostrar info de sesión (útil para debugging)
export function SessionInfo() {
  const [sessionInfo, setSessionInfo] = useState(AuthStorage.getSessionInfo());

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionInfo(AuthStorage.getSessionInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!sessionInfo.isLoggedIn) return null;

  const timeRemaining = Math.floor(sessionInfo.timeRemaining / 1000 / 60); // minutos

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs opacity-75 hover:opacity-100 transition-opacity">
      <div className="text-green-600 font-medium">✓ Sesión activa</div>
      <div className="text-gray-500">
        {sessionInfo.rememberMe ? '30 días' : `${timeRemaining}min restantes`}
      </div>
      {sessionInfo.user && (
        <div className="text-gray-400 truncate max-w-[150px]">
          {sessionInfo.user.email}
        </div>
      )}
    </div>
  );
}