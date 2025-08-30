"use client";

import React, { useState } from 'react';
import { REGIONES_CHILE, Region, Comuna } from '@/data/comunas-chile';

interface LocationSelectorProps {
  onLocationSelect: (region: string, comuna: string) => void;
  onCancel: () => void;
  currentLocation?: { region: string; comuna: string } | null;
}

export function LocationSelector({ onLocationSelect, onCancel, currentLocation }: LocationSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleRegionChange = (regionNombre: string) => {
    setSelectedRegion(regionNombre);
    setSelectedComuna(''); // Reset comuna when region changes
  };

  const handleConfirm = () => {
    if (selectedRegion && selectedComuna) {
      onLocationSelect(selectedRegion, selectedComuna);
    }
  };

  const getAvailableComunas = (): Comuna[] => {
    const region = REGIONES_CHILE.find(r => r.nombre === selectedRegion);
    return region ? region.comunas : [];
  };

  if (!isOpen) {
    return (
      <div className="space-y-4">
        {currentLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-blue-900">
                  📍 {currentLocation.comuna}
                </div>
                <div className="text-xs text-blue-700">
                  {currentLocation.region}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {currentLocation ? 'Cambiar Ubicación' : 'Seleccionar Ubicación'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Ubicación</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selector de Región */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Región *
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Seleccione una región</option>
          {REGIONES_CHILE.map((region) => (
            <option key={region.codigo} value={region.nombre}>
              {region.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Comuna */}
      {selectedRegion && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comuna *
          </label>
          <select
            value={selectedComuna}
            onChange={(e) => setSelectedComuna(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione una comuna</option>
            {getAvailableComunas().map((comuna) => (
              <option key={comuna.codigo} value={comuna.nombre}>
                {comuna.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-800 mb-1">¿Por qué necesitamos tu ubicación?</div>
            <ul className="space-y-1 text-xs">
              <li>• Mostrar disponibilidad de productos en tu zona</li>
              <li>• Contacto comercial personalizado</li>
              <li>• Información de distribuidores locales</li>
              <li>• Ofertas y promociones regionales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedRegion || !selectedComuna}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          Confirmar Ubicación
        </button>
      </div>
    </div>
  );
}