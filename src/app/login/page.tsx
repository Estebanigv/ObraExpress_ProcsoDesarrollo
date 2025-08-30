"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthUrl, oauthConfig } from '@/lib/oauth';
import { logger } from '@/lib/logger';
import { navigate, safeDocument } from '@/lib/client-utils';
import { getAdminCredentials } from '@/lib/admin-setup';

export default function LoginPage() {
  const { login, loginWithGoogle, register, isLoading } = useAuth();
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Cerrar con tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    safeDocument.addEventListener('keydown', handleEscape);
    return () => safeDocument.removeEventListener('keydown', handleEscape);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      // Proceso de login
      const success = await login(formData.email, formData.password, rememberMe);
      if (success) {
        console.log('✅ Login exitoso, redirigiendo...');
        window.location.href = '/';
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } else {
      // Proceso de registro
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!formData.telefono.trim()) {
        setError('El teléfono es requerido');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const success = await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono,
        provider: 'email'
      });

      if (success) {
        console.log('✅ Registro exitoso, redirigiendo...');
        window.location.href = '/';
      } else {
        setError('Error al crear la cuenta. El email podría estar en uso.');
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ email: '', password: '', nombre: '', telefono: '' });
    setRememberMe(false);
  };

  const handleSocialLogin = async (provider: 'google') => {
    setError('');
    setSocialLoading(provider);
    
    try {
      if (provider === 'google') {
        console.log('🔐 Iniciando login con Google desde página...');
        console.log('Current URL:', window.location.origin);
        
        // Usar la nueva función de login con Google
        const result = await loginWithGoogle();
        
        console.log('🔄 Resultado del login:', result);
        
        if (!result.success) {
          console.error('❌ Error en login:', result.error);
          setError(result.error || 'Error al conectar con Google');
          setSocialLoading(null);
        }
        // Si es exitoso, la redirección se maneja automáticamente
        
      } else {
        // Para otros proveedores, verificar si están configurados
        const config = oauthConfig[provider];
        if (!config.clientId) {
          // Mostrar instrucciones específicas según el proveedor
          const instructions = {
            microsoft: 'Ve a https://portal.azure.com/ → Azure Active Directory → App registrations → New registration',
            facebook: 'Ve a https://developers.facebook.com/ → My Apps → Create App → Facebook Login',
          };
          
          setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth no está configurado.\n\n📋 Para configurarlo:\n${instructions[provider as keyof typeof instructions]}\n\n✏️ Luego agrega las credenciales en el archivo .env.local`);
          setSocialLoading(null);
          return;
        }

        // Si está configurado, redirigir al OAuth real
        const authUrl = getAuthUrl(provider);
        navigate.redirect(authUrl);
      }
      
    } catch (error) {
      logger.error(`Error iniciando OAuth para ${provider}:`, error);
      setError(`Error al conectar con ${provider}. Verifica la configuración.`);
      setSocialLoading(null);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-yellow-400/20 via-yellow-50 to-orange-100/60 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8"
      onClick={(e) => {
        // Si se hace click fuera del formulario, volver al inicio
        if (e.target === e.currentTarget) {
          router.push('/');
        }
      }}
    >
      <div className="max-w-lg w-full space-y-8 relative">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="mb-12">
            {/* Logotipo tipográfico */}
            <div className="mb-5">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight leading-none drop-shadow-sm select-none font-poppins" style={{fontWeight: 900}}>
                OBRAEXPRESS
              </h1>
            </div>
            {/* Slogan */}
            <div className="text-gray-600 font-semibold text-sm tracking-[0.25em] uppercase border-t-2 border-gray-200 pt-4 max-w-xs mx-auto font-poppins" style={{fontWeight: 600}}>
              Materiales de construcción
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
            {isLoginMode 
              ? 'Ingresa a tu cuenta para acceder a beneficios exclusivos' 
              : 'Crea tu cuenta para obtener descuentos y seguimiento de pedidos'
            }
          </p>
          
        </div>

        {/* Formulario */}
        <div className="bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-yellow-200/30 relative ring-1 ring-yellow-300/20">
          {/* Botón de cerrar dentro del formulario */}
          <button
            onClick={() => router.push('/')}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Google OAuth */}
          <button
            onClick={async () => {
              setError('');
              setSocialLoading('google');
              
              try {
                const result = await loginWithGoogle();
                if (result.success && result.url) {
                  window.location.href = result.url;
                } else if (!result.success) {
                  setError(result.error || 'Error al conectar con Google');
                  setSocialLoading(null);
                }
              } catch (error) {
                console.error('❌ Error:', error);
                setError('Error al conectar con Google');
                setSocialLoading(null);
              }
            }}
            disabled={socialLoading === 'google'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-6 group disabled:opacity-70"
          >
            {socialLoading === 'google' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-gray-700 font-medium group-hover:text-gray-900">
              {socialLoading === 'google' ? 'Conectando...' : (isLoginMode ? 'Continuar con Google' : 'Crear cuenta con Google')}
            </span>
          </button>

          {/* Separador */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O continúa con email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos de registro */}
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Ej: Juan Pérez"
                    required={!isLoginMode}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Ej: +569 12345678"
                    required={!isLoginMode}
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isLoginMode ? 'Email o Usuario *' : 'Email *'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder={isLoginMode ? "usuario@ejemplo.com" : "tu-email@ejemplo.com"}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                Mantener sesión activa por 30 días
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
            >
              {isLoading 
                ? (isLoginMode ? 'Iniciando sesión...' : 'Creando cuenta...') 
                : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')
              }
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">o continúa con</span>
            </div>
          </div>

          {/* Botones de Login Social */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading === 'google'}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continuar con Google</span>
            </button>


          </div>

          {/* Toggle entre Login y Registro */}
          <div className="text-center mt-6">
            <span className="text-gray-600">
              {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              onClick={toggleMode}
              className="ml-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              {isLoginMode ? 'Crear cuenta aquí' : 'Iniciar sesión aquí'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}