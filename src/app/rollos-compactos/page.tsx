import { Metadata } from "next";
import React from 'react';
import { NavbarSimple } from "@/components/navbar-simple";
import { Cotizador } from "@/components/cotizador";

export const metadata: Metadata = {
  title: "Rollos Compactos de Policarbonato - ObraExpress Chile | Máxima Resistencia",
  description: "Rollos compactos de policarbonato transparente y de colores. Máxima resistencia al impacto, durabilidad y protección UV. Ideales para proyectos industriales.",
  keywords: "rollos compactos policarbonato, policarbonato compacto Chile, láminas compactas transparentes, resistencia impacto, ObraExpress",
  openGraph: {
    title: "Rollos Compactos de Policarbonato - ObraExpress Chile",
    description: "Rollos compactos con máxima resistencia al impacto. Transparentes y de colores con protección UV y garantía de 10 años.",
    type: "website",
    images: [
      {
        url: "https://obraexpress.cl/assets/images/Productos/Policarbonato Compacto/rollos-compactos.webp",
        width: 1200,
        height: 630,
        alt: "Rollos compactos de policarbonato ObraExpress",
      }
    ],
  },
  alternates: {
    canonical: "https://obraexpress.cl/rollos-compactos"
  }
};

export default function RollosCompactos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <NavbarSimple />
      
      <div className="pt-48 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6">
              Rollos Compactos
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Policarbonato sólido de alta calidad para aplicaciones que requieren máxima resistencia y transparencia.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Product 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Rollo 2mm</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Policarbonato Compacto 2mm</h3>
              <p className="text-gray-600 mb-4">Ideal para aplicaciones decorativas y señalética.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Espesor: 2mm</li>
                <li>• Ancho: 1.25m</li>
                <li>• Largo: rollos de 50m</li>
                <li>• Peso: 2.4 kg/m²</li>
              </ul>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Rollo 3mm</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Policarbonato Compacto 3mm</h3>
              <p className="text-gray-600 mb-4">Excelente para ventanas y aplicaciones industriales.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Espesor: 3mm</li>
                <li>• Ancho: 1.25m</li>
                <li>• Largo: rollos de 50m</li>
                <li>• Peso: 3.6 kg/m²</li>
              </ul>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="h-48 bg-gradient-to-br from-green-600 to-green-800 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">Rollo 5mm</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Policarbonato Compacto 5mm</h3>
              <p className="text-gray-600 mb-4">Máxima resistencia para aplicaciones exigentes.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Espesor: 5mm</li>
                <li>• Ancho: 1.25m</li>
                <li>• Largo: rollos de 30m</li>
                <li>• Peso: 6.0 kg/m²</li>
              </ul>
            </div>
          </div>

          {/* Applications Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-green-900 mb-8 text-center">Aplicaciones</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">Ventanas Industriales</h3>
                <p className="text-sm text-gray-600">Resistente a impactos y condiciones extremas</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">Protección de Máquinas</h3>
                <p className="text-sm text-gray-600">Pantallas de seguridad transparentes</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">Señalética</h3>
                <p className="text-sm text-gray-600">Letreros y displays publicitarios</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-green-900 mb-6">Ventajas del Policarbonato Compacto</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  250 veces más resistente que el vidrio
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Transparencia óptica superior al 90%
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Resistente a rayos UV
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  Fácil de cortar y moldear
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-green-900 mb-6">Especificaciones Técnicas</h3>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Temperatura de uso:</strong> -40°C a +120°C</li>
                <li><strong>Densidad:</strong> 1.2 g/cm³</li>
                <li><strong>Transmisión luminosa:</strong> 90%</li>
                <li><strong>Resistencia al impacto:</strong> 35 kJ/m²</li>
              </ul>
            </div>
          </div>

          {/* Cotizador Section */}
          <div className="mb-16">
            <Cotizador productType="Rollos Compactos" bgColor="bg-green-900" textColor="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}