"use client";

import React from 'react';
import { NavbarSimple } from "@/components/navbar-simple";

export default function FichasTecnicas() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      <div className="pt-48 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
              Fichas Técnicas
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Descarga la documentación técnica completa de nuestros productos de policarbonato
            </p>
          </div>

          {/* Technical Sheets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Ficha 1 - Alveolar */}
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl font-bold">6-16</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Policarbonato Alveolar</h3>
                <p className="text-gray-600 mb-6">Especificaciones técnicas completas para láminas alveolares de 6mm, 10mm y 16mm</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                  VER FICHA PDF
                </button>
              </div>
            </div>

            {/* Ficha 2 - Compacto */}
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl font-bold">2-5</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Policarbonato Compacto</h3>
                <p className="text-gray-600 mb-6">Datos técnicos para rollos compactos de 2mm, 3mm y 5mm con propiedades mecánicas</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                  VER FICHA PDF
                </button>
              </div>
            </div>

            {/* Ficha 3 - Perfiles H */}
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl font-bold">H</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Perfiles de Unión H</h3>
                <p className="text-gray-600 mb-6">Especificaciones de perfiles H para unión de láminas alveolares y instalación</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                  VER FICHA PDF
                </button>
              </div>
            </div>

            {/* Ficha 4 - Perfiles U */}
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl font-bold">U</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Perfiles de Cierre U</h3>
                <p className="text-gray-600 mb-6">Datos técnicos para perfiles U de cierre y sellado de extremos de láminas</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                  VER FICHA PDF
                </button>
              </div>
            </div>

            {/* Ficha 5 - Tornillería */}
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl font-bold">🔩</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Tornillería y Fijaciones</h3>
                <p className="text-gray-600 mb-6">Especificaciones de tornillos autorroscantes, arandelas y sistemas de fijación</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                  VER FICHA PDF
                </button>
              </div>
            </div>

            {/* Ficha 6 - Estructuras */}
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl font-bold">⚡</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Estructuras Metálicas</h3>
                <p className="text-gray-600 mb-6">Fichas técnicas de perfiles C, correas Z y sistemas estructurales galvanizados</p>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                  VER FICHA PDF
                </button>
              </div>
            </div>

          </div>

          {/* Info Section */}
          <div className="bg-blue-900 rounded-3xl shadow-xl p-8 mb-16 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Información Adicional</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Certificaciones</h3>
                  <p className="text-blue-200">Todos nuestros productos cuentan con certificaciones internacionales de calidad</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Garantía</h3>
                  <p className="text-blue-200">Garantía de 10 años contra defectos de fabricación y degradación UV</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Soporte Técnico</h3>
                  <p className="text-blue-200">Asesoría especializada para instalación y selección de productos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download All Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">¿Necesitas todas las fichas?</h2>
            <p className="text-xl text-gray-700 mb-8">Descarga el catálogo completo con todas las especificaciones técnicas</p>
            <button className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg">
              Descargar Catálogo Completo PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}