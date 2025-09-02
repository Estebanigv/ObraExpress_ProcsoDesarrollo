"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseAuth } from '@/lib/supabase-auth';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 AuthCallback: Iniciando proceso de callback...');
      console.log('🔄 AuthCallback: URL actual:', window.location.href);
      
      // Verificar INMEDIATAMENTE si hay parámetros de error en la URL (usuario canceló)
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      // Detección agresiva de cancelación
      if (error) {
        console.log('❌ AuthCallback: Error detectado:', { error, errorDescription });
        
        if (error === 'access_denied' || 
            errorDescription?.includes('cancelled') ||
            errorDescription?.includes('denied') ||
            errorDescription?.includes('User cancelled') ||
            error === 'cancelled' ||
            error === 'user_cancelled') {
          // Usuario canceló - redirigir INMEDIATAMENTE sin mostrar NADA
          console.log('👤 Cancelación detectada - redirección inmediata');
          // Usar replace para no dejar historial
          window.location.replace('/');
          return;
        }
      }

      // Si no hay code o state, también es cancelación
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code && !state) {
        console.log('👤 Sin code/state - posible cancelación, redirigiendo');
        window.location.replace('/');
        return;
      }

      try {
        
        setStatus('processing');
        setMessage('Procesando autenticación con Google...');

        // Manejar el callback OAuth
        console.log('🔄 AuthCallback: Llamando a handleOAuthCallback...');
        const user = await SupabaseAuth.handleOAuthCallback();
        console.log('🔄 AuthCallback: Usuario recibido:', user);

        if (user) {
          const welcomeName = user.nombre && user.nombre.trim() ? user.nombre.split(' ')[0] : user.email.split('@')[0];
          setStatus('success');
          setMessage(`¡Bienvenido ${welcomeName}! Redirigiendo...`);
          
          console.log('🎉 Usuario final para establecer en contexto:', user);
          
          // Establecer el usuario completo en el contexto
          setUser(user);
          
          console.log('✅ Usuario establecido en el contexto:', user);
          
          // Redirigir al usuario después de un breve delay
          setTimeout(() => {
            router.replace('/');
          }, 1500);
        } else {
          throw new Error('No se pudo procesar la autenticación');
        }
      } catch (error) {
        console.error('Error en callback OAuth:', error);
        setStatus('error');
        setMessage('Error en la autenticación. Redirigiendo...');
        
        // Redirigir al home después de un breve delay
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'processing' && 'Procesando...'}
          {status === 'success' && '¡Bienvenido!'}
          {status === 'error' && 'Error de Autenticación'}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => router.replace('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver al Login
          </button>
        )}
      </div>
    </div>
  );
}