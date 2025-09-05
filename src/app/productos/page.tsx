"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { NavbarSimple } from '@/components/navbar-simple';

// Componente client-side independiente
const ProductosClientSideComponent = dynamic(
  () => import('@/components/ProductosClientSide'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">🔄 Inicializando sistema de productos...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function ProductosPage() {
  return (
    <div>
      <NavbarSimple />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">🔄 Cargando catálogo...</p>
          </div>
        </div>
      }>
        <ProductosClientSideComponent />
      </Suspense>
    </div>
  );
}