"use client";

import React from "react";

interface TechnicalSpec {
  label: string;
  value: string;
  icon?: string;
}

interface TechnicalSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productType: string;
  specifications: TechnicalSpec[];
  applications: string[];
  advantages: string[];
}

export function TechnicalSpecsModal({
  isOpen,
  onClose,
  productName,
  productType,
  specifications,
  applications,
  advantages
}: TechnicalSpecsModalProps) {
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    if (type.toLowerCase().includes('ondulado')) return '🌊';
    if (type.toLowerCase().includes('alveolar')) return '🏗️';
    if (type.toLowerCase().includes('compacto')) return '💎';
    if (type.toLowerCase().includes('termoacustico')) return '🔇';
    if (type.toLowerCase().includes('antivandalico')) return '🛡️';
    return '📋';
  };

  const getTypeColor = (type: string) => {
    if (type.toLowerCase().includes('ondulado')) return 'bg-blue-50 border-blue-200 text-blue-800';
    if (type.toLowerCase().includes('alveolar')) return 'bg-green-50 border-green-200 text-green-800';
    if (type.toLowerCase().includes('compacto')) return 'bg-purple-50 border-purple-200 text-purple-800';
    if (type.toLowerCase().includes('termoacustico')) return 'bg-orange-50 border-orange-200 text-orange-800';
    if (type.toLowerCase().includes('antivandalico')) return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{getTypeIcon(productType)}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Especificaciones Técnicas
                  </h2>
                  <p className="text-gray-600 text-sm">{productName}</p>
                </div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(productType)}`}>
                {productType}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Especificaciones Técnicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Datos Técnicos
              </h3>
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      {spec.icon && <span className="mr-2">{spec.icon}</span>}
                      <span className="text-sm font-medium text-gray-700">{spec.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aplicaciones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Aplicaciones Principales
              </h3>
              <div className="space-y-2">
                {applications.map((application, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 capitalize">{application}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ventajas */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Ventajas Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {advantages.map((advantage, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-800 font-medium">{advantage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Especificaciones sujetas a variaciones según fabricante
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}