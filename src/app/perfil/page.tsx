"use client";

import React from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

function PerfilContent() {
  const { user, logout, updateUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-100 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sesión Requerida</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para ver tu perfil.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/"
              className="block bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    // Redirigir se maneja automáticamente por AuthGuard
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Botón Volver - Prominente */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Inicio
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información y preferencias</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Información Personal */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información Personal
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.nombre}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {user.telefono || 'No especificado'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {user.fechaRegistro.toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>
          </div>

          {/* Beneficios y Estadísticas */}
          <div className="space-y-6">
            {/* Descuentos */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Tus Beneficios
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Descuento Activo</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {user.porcentajeDescuento}% OFF
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Estado</span>
                  <span className="text-green-800 font-medium">
                    {user.tieneDescuento ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Mis Estadísticas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.comprasRealizadas}</div>
                  <div className="text-sm text-blue-600">Compras</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${user.totalComprado.toLocaleString('es-CL')}
                  </div>
                  <div className="text-sm text-yellow-600">Total Gastado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Ir a Inicio
          </Link>
          
          <Link
            href="/productos"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Ver Productos
          </Link>
          
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return <PerfilContent />;
}