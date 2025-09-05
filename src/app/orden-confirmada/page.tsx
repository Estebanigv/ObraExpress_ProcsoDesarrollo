"use client";

import React from 'react';
import Link from 'next/link';

export default function OrdenConfirmadaPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-40">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Cotización Enviada!
              </h1>
              <p className="text-gray-600 text-lg">
                Tu solicitud de cotización ha sido procesada exitosamente
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                ¿Qué sigue ahora?
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Revisión de tu cotización</h3>
                    <p className="text-blue-700 text-sm">
                      Nuestro equipo revisará tu solicitud y preparará una cotización detallada
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Contacto directo</h3>
                    <p className="text-blue-700 text-sm">
                      Te contactaremos por teléfono o email para confirmar detalles
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Cotización oficial</h3>
                    <p className="text-blue-700 text-sm">
                      Recibirás la cotización oficial por email con todos los detalles
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-yellow-800">Información importante</span>
              </div>
              <div className="text-yellow-700 text-sm space-y-1">
                <p>• Cotización válida por 7 días calendario</p>
                <p>• Tiempo de respuesta: 24-48 horas hábiles</p>
                <p>• Precios incluyen IVA</p>
                <p>• Despacho coordinado según disponibilidad</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                ¿Tienes alguna duda?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+56 2 1234 5678</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>cotizaciones@obraexpress.cl</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Horario de atención: Lunes a Viernes 9:00 - 18:00 hrs
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/productos"
                className="block w-full bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Cotizar Más Productos
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Si no recibes respuesta en 48 horas, por favor contacta directamente a nuestro equipo comercial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}