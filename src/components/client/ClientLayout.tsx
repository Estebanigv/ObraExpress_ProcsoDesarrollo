"use client";

import { ReactNode } from 'react';
import '../../styles/client/ecommerce.css';

interface ClientLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function ClientLayout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  className = ""
}: ClientLayoutProps) {
  return (
    <div className={`client-container ${className}`}>
      {/* Header del Cliente */}
      {showHeader && (
        <header className="client-navbar sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">
                    Obra<span className="text-blue-600">Express</span>
                  </h1>
                </div>
              </div>

              {/* Navegación Principal */}
              <nav className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <a href="/" className="client-nav-link">
                    Inicio
                  </a>
                  <a href="/productos" className="client-nav-link">
                    Productos
                  </a>
                  <a href="/cotizador-detallado" className="client-nav-link">
                    Cotizador
                  </a>
                  <a href="/contacto" className="client-nav-link">
                    Contacto
                  </a>
                  <a href="/nosotros" className="client-nav-link">
                    Nosotros
                  </a>
                </div>
              </nav>

              {/* Acciones del Usuario */}
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button className="floating-cart-btn relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Contenido Principal */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer del Cliente */}
      {showFooter && (
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Información de la empresa */}
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">ObraExpress</h3>
                <p className="text-gray-300 mb-4">
                  Líderes en materiales de construcción y policarbonatos. 
                  Calidad garantizada para todos tus proyectos.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Productos</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="/laminas-alveolares" className="hover:text-white">Láminas Alveolares</a></li>
                  <li><a href="/rollos-compactos" className="hover:text-white">Rollos Compactos</a></li>
                  <li><a href="/estructuras" className="hover:text-white">Estructuras</a></li>
                  <li><a href="/accesorios" className="hover:text-white">Accesorios</a></li>
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>+56 9 XXXX XXXX</li>
                  <li>info@obraexpress.cl</li>
                  <li>Santiago, Chile</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>© 2024 ObraExpress. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}