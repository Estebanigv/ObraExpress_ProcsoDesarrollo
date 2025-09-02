"use client";

import React from 'react';
import { NavbarSimple } from "@/components/navbar-simple";
import { Cotizador } from "@/components/cotizador";

export default function EstructurasMetalicas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavbarSimple />
      
      <div className="pt-48 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Estructuras Metálicas
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Sistemas de soporte resistentes y duraderos para instalaciones de policarbonato de cualquier tamaño.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Product 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Perfiles C</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perfiles C Galvanizados</h3>
              <p className="text-gray-600 mb-4">Estructura principal para techos y cubiertas de gran luz.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Medidas: 80x40, 100x50, 120x60mm</li>
                <li>• Espesor: 1.5-3.0mm</li>
                <li>• Galvanizado en caliente</li>
                <li>• Largos hasta 12m</li>
              </ul>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Correas Z</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Correas Z Estructurales</h3>
              <p className="text-gray-600 mb-4">Soporte secundario para distribución de cargas.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Medidas: 100x50, 150x50, 200x50mm</li>
                <li>• Espesor: 1.5-2.5mm</li>
                <li>• Tratamiento anticorrosivo</li>
                <li>• Fácil montaje</li>
              </ul>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Marcos</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Marcos para Cerramientos</h3>
              <p className="text-gray-600 mb-4">Sistemas completos para paredes y fachadas.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Perfiles rectangulares</li>
                <li>• Incluye herrajes</li>
                <li>• Medidas personalizadas</li>
                <li>• Acabado poliéster</li>
              </ul>
            </div>

            {/* Product 4 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Tensores</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistemas de Tensado</h3>
              <p className="text-gray-600 mb-4">Cables y tensores para estructuras tensadas.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cable de acero inoxidable</li>
                <li>• Tensores ajustables</li>
                <li>• Anclajes de fijación</li>
                <li>• Resistente a intemperie</li>
              </ul>
            </div>

            {/* Product 5 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Columnas</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Columnas Estructurales</h3>
              <p className="text-gray-600 mb-4">Soportes verticales para grandes estructuras.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Perfiles IPE, HEB</li>
                <li>• Altura hasta 15m</li>
                <li>• Base con pernos de anclaje</li>
                <li>• Cálculo estructural incluido</li>
              </ul>
            </div>

            {/* Product 6 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-green-600 to-green-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Kits</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kits de Montaje</h3>
              <p className="text-gray-600 mb-4">Soluciones completas listas para instalar.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Estructuras prefabricadas</li>
                <li>• Incluye tornillería</li>
                <li>• Manual de montaje</li>
                <li>• Para luces de 3-12m</li>
              </ul>
            </div>
          </div>

          {/* Applications Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Aplicaciones</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏭</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Naves Industriales</h3>
                <p className="text-sm text-gray-600">Grandes luces libres para almacenes y fábricas</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌿</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Invernaderos</h3>
                <p className="text-sm text-gray-600">Estructuras optimizadas para agricultura</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Centros Comerciales</h3>
                <p className="text-sm text-gray-600">Cubiertas translúcidas para espacios públicos</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚗</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Estacionamientos</h3>
                <p className="text-sm text-gray-600">Techos de protección vehicular</p>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Especificaciones Técnicas</h3>
              <ul className="space-y-3">
                <li><strong>Resistencia al viento:</strong> Hasta 120 km/h</li>
                <li><strong>Carga de nieve:</strong> 200 kg/m²</li>
                <li><strong>Vida útil:</strong> +25 años</li>
                <li><strong>Normas:</strong> NCh427, NCh2369</li>
                <li><strong>Galvanizado:</strong> Z350 (350g/m²)</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Servicios Incluidos</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Cálculo estructural certificado
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Planos de fabricación y montaje
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Supervisión técnica
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Garantía estructural 10 años
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Capacitación de montaje
                </li>
              </ul>
            </div>
          </div>

          {/* Process Section */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Proceso de Trabajo</h2>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Visita Técnica</h3>
                <p className="text-sm text-blue-200">Evaluación del sitio y requerimientos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Diseño</h3>
                <p className="text-sm text-blue-200">Cálculo y planos estructurales</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Fabricación</h3>
                <p className="text-sm text-blue-200">Producción en taller especializado</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Montaje</h3>
                <p className="text-sm text-blue-200">Instalación por equipo certificado</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">5</span>
                </div>
                <h3 className="font-semibold mb-2">Entrega</h3>
                <p className="text-sm text-blue-200">Pruebas finales y garantía</p>
              </div>
            </div>
          </div>

          {/* Cotizador Section */}
          <div className="mb-16">
            <Cotizador productType="Estructuras Metálicas" bgColor="bg-gray-900" textColor="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}