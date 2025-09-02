"use client";

import React from 'react';
import { NavbarSimple } from "@/components/navbar-simple";
import { Cotizador } from "@/components/cotizador";

export default function Accesorios() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <NavbarSimple />
      
      <div className="pt-48 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-purple-900 mb-6">
              Accesorios
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Complementos esenciales para una instalación perfecta y duradera de policarbonato.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Product 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Perfiles H</span>
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Perfiles de Unión H</h3>
              <p className="text-gray-600 mb-4">Para unir láminas de policarbonato de forma hermética.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Longitud: 6m</li>
                <li>• Para láminas 6-16mm</li>
                <li>• Material: Policarbonato</li>
                <li>• Colores: Transparente, bronce</li>
              </ul>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Perfiles U</span>
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Perfiles de Cierre U</h3>
              <p className="text-gray-600 mb-4">Para sellar los extremos de las láminas alveolares.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Longitud: 6m</li>
                <li>• Para láminas 6-16mm</li>
                <li>• Material: Policarbonato</li>
                <li>• Previene entrada de polvo</li>
              </ul>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Tornillos</span>
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Tornillos Autorroscantes</h3>
              <p className="text-gray-600 mb-4">Tornillos especiales con arandela de neopreno.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Largo: 25mm, 32mm, 50mm</li>
                <li>• Con arandela hermética</li>
                <li>• Cabeza hexagonal</li>
                <li>• Galvanizado</li>
              </ul>
            </div>

            {/* Product 4 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Cinta</span>
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Cinta Hermética</h3>
              <p className="text-gray-600 mb-4">Cinta autoadhesiva para sellado de extremos.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ancho: 25mm, 50mm</li>
                <li>• Material: Aluminio</li>
                <li>• Adhesivo resistente UV</li>
                <li>• Rollo de 25m</li>
              </ul>
            </div>

            {/* Product 5 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Silicona</span>
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Silicona Estructural</h3>
              <p className="text-gray-600 mb-4">Sellador flexible para juntas y fijaciones.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cartucho 300ml</li>
                <li>• Transparente o colores</li>
                <li>• Resistente a UV</li>
                <li>• Adherencia superior</li>
              </ul>
            </div>

            {/* Product 6 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Ganchos</span>
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Ganchos de Fijación</h3>
              <p className="text-gray-600 mb-4">Sistema de anclaje para estructuras metálicas.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Acero galvanizado</li>
                <li>• Diferentes medidas</li>
                <li>• Con tornillería incluida</li>
                <li>• Fácil instalación</li>
              </ul>
            </div>
          </div>

          {/* Installation Guide */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">Guía de Instalación</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-900">1</span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">Preparación</h3>
                <p className="text-sm text-gray-600">Medir y cortar las láminas a medida</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-900">2</span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">Sellado</h3>
                <p className="text-sm text-gray-600">Aplicar cinta hermética en extremos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-900">3</span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">Fijación</h3>
                <p className="text-sm text-gray-600">Usar tornillos con arandela hermética</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-900">4</span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">Acabado</h3>
                <p className="text-sm text-gray-600">Instalar perfiles de unión y cierre</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-purple-900 text-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Consejos de Instalación</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">✅ Hacer</h3>
                <ul className="space-y-2">
                  <li>• Pre-perforar antes de atornillar</li>
                  <li>• Dejar dilatación de 3mm por metro</li>
                  <li>• Usar perfiles adecuados para el espesor</li>
                  <li>• Limpiar con agua y jabón neutro</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">❌ No hacer</h3>
                <ul className="space-y-2">
                  <li>• No usar solventes abrasivos</li>
                  <li>• No sobreajustar los tornillos</li>
                  <li>• No instalar sin sellado de extremos</li>
                  <li>• No caminar sobre las láminas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cotizador Section */}
          <div className="mb-16">
            <Cotizador productType="Accesorios" bgColor="bg-purple-900" textColor="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}