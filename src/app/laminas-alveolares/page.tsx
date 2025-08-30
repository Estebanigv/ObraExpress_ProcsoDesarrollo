import { Metadata } from "next";
import React from 'react';
import { NavbarSimple } from "@/components/navbar-simple";
import { Cotizador } from "@/components/cotizador";

export const metadata: Metadata = {
  title: "Láminas Alveolares de Policarbonato - ObraExpress Chile | Aislamiento Térmico Superior",
  description: "Láminas alveolares de policarbonato de 6mm, 10mm y 16mm. Excelente aislamiento térmico, protección UV y resistencia para techos e invernaderos. Garantía 10 años.",
  keywords: "láminas alveolares policarbonato, policarbonato alveolar Chile, techos policarbonato, invernaderos policarbonato, aislamiento térmico, ObraExpress",
  openGraph: {
    title: "Láminas Alveolares de Policarbonato - ObraExpress Chile",
    description: "Láminas alveolares con excelente aislamiento térmico. Disponibles en 6mm, 10mm y 16mm con protección UV y garantía de 10 años.",
    type: "website",
    images: [
      {
        url: "https://obraexpress.cl/assets/images/Productos/Policarbonato Alveolar/laminas-alveolares.webp",
        width: 1200,
        height: 630,
        alt: "Láminas alveolares de policarbonato ObraExpress",
      }
    ],
  },
  alternates: {
    canonical: "https://obraexpress.cl/laminas-alveolares"
  }
};

export default function LaminasAlveolares() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <NavbarSimple />
      
      <div className="pt-48 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
              Láminas Alveolares
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Soluciones versátiles y duraderas para techos y cerramientos con excelente aislamiento térmico.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Product 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Lámina 6mm</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Policarbonato Alveolar 6mm</h3>
              <p className="text-gray-600 mb-4">Ideal para invernaderos y techos ligeros. Excelente transmisión de luz.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Espesor: 6mm</li>
                <li>• Ancho: 2.10m</li>
                <li>• Largo: hasta 12m</li>
                <li>• Peso: 1.3 kg/m²</li>
              </ul>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Lámina 10mm</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Policarbonato Alveolar 10mm</h3>
              <p className="text-gray-600 mb-4">Mayor aislamiento térmico. Perfecto para aplicaciones industriales.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Espesor: 10mm</li>
                <li>• Ancho: 2.10m</li>
                <li>• Largo: hasta 12m</li>
                <li>• Peso: 1.7 kg/m²</li>
              </ul>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Lámina 16mm</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Policarbonato Alveolar 16mm</h3>
              <p className="text-gray-600 mb-4">Máximo aislamiento térmico y resistencia estructural.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Espesor: 16mm</li>
                <li>• Ancho: 2.10m</li>
                <li>• Largo: hasta 12m</li>
                <li>• Peso: 2.8 kg/m²</li>
              </ul>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Características Principales</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">☀️</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Protección UV</h3>
                <p className="text-sm text-gray-600">Filtro UV incorporado para mayor durabilidad</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Resistente</h3>
                <p className="text-sm text-gray-600">Alta resistencia al impacto y granizo</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌡️</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Aislamiento</h3>
                <p className="text-sm text-gray-600">Excelente aislamiento térmico</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Translúcido</h3>
                <p className="text-sm text-gray-600">Óptima transmisión de luz natural</p>
              </div>
            </div>
          </div>

          {/* Cotizador Section */}
          <div className="mb-16">
            <Cotizador productType="Láminas Alveolares" bgColor="bg-blue-900" textColor="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}