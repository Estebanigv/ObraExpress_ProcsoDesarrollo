"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeCodeForToken, getUserInfo, normalizeUserInfo } from '@/lib/oauth';
import { logger } from '@/lib/logger';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [status, setStatus] = useState('Procesando autenticación...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        logger.error('OAuth error:', error);
        setStatus('Error en la autenticación');
        setTimeout(() => router.push('/login?error=oauth_failed'), 2000);
        return;
      }

      if (!code) {
        setStatus('Código de autorización no encontrado');
        setTimeout(() => router.push('/login?error=no_code'), 2000);
        return;
      }

      try {
        setStatus('Intercambiando código por token...');
        
        // Intercambiar código por token de acceso
        const tokenResponse = await exchangeCodeForToken('google', code);
        
        if (!tokenResponse.access_token) {
          throw new Error('No se pudo obtener el token de acceso');
        }

        setStatus('Obteniendo información del usuario...');
        
        // Obtener información del usuario
        const userInfo = await getUserInfo('google', tokenResponse.access_token);
        
        if (!userInfo) {
          throw new Error('No se pudo obtener la información del usuario');
        }

        setStatus('Registrando usuario...');
        
        // Normalizar información del usuario
        const normalizedUser = normalizeUserInfo('google', userInfo);
        
        // Registrar o iniciar sesión
        const success = await register({
          email: normalizedUser.email,
          nombre: normalizedUser.name,
          provider: 'google',
          tieneDescuento: true,
          porcentajeDescuento: 5,
          fechaRegistro: new Date()
        });

        if (success) {
          setStatus('¡Autenticación exitosa! Redirigiendo...');
          setTimeout(() => router.push('/'), 1000);
        } else {
          // Usuario ya existe, intentar login directo
          setStatus('Iniciando sesión...');
          setTimeout(() => router.push('/?login=success'), 1000);
        }
      } catch (error) {
        logger.error('Error processing Google callback:', error);
        setStatus('Error procesando la autenticación');
        setTimeout(() => router.push('/login?error=callback_failed'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, register]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Logo de Google */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        </div>

        {/* Estado de carga */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Google OAuth</h2>
        <p className="text-gray-600 mb-4">{status}</p>
        
        {/* Indicador de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Si esta página no te redirige automáticamente, 
          <button 
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:text-blue-700 ml-1 underline"
          >
            haz clic aquí
          </button>
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando...</h2>
          <p className="text-gray-600">Preparando autenticación...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}