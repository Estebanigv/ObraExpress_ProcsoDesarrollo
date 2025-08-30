"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { regionesComunas } from '@/data/regiones-comunas';

interface LocationBannerProps {
  className?: string;
  showDeliveryInfo?: boolean;
  onLocationChange?: (location: { region: string; comuna: string } | null) => void;
}

function LocationBanner({ 
  className = '', 
  showDeliveryInfo = true,
  onLocationChange 
}: LocationBannerProps) {
  const { location, loading, error, requestLocation, clearLocation, setManualLocation } = useGeolocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');

  // Obtener comunas basadas en la región seleccionada
  const comunasDisponibles = useMemo(() => {
    const regionSeleccionada = regionesComunas.find(r => r.nombre === selectedRegion);
    return regionSeleccionada ? regionSeleccionada.comunas : [];
  }, [selectedRegion]);

  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(location);
    }
  }, [location, onLocationChange]);

  // Mostrar prompt de permisos si no hay ubicación y no hay error
  useEffect(() => {
    if (!location && !loading && !error) {
      // Retardar la aparición del prompt para evitar conflictos con otros modales
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 2000); // 2 segundos de retraso
      return () => clearTimeout(timer);
    } else {
      setShowPermissionPrompt(false);
    }
  }, [location, loading, error]);

  const handleRequestLocation = () => {
    setShowPermissionPrompt(false);
    requestLocation();
  };

  const handleChangeLocation = () => {
    // Pre-cargar la ubicación actual si existe
    if (location) {
      console.log('📍 Pre-cargando ubicación:', location.region, location.comuna);
      setSelectedRegion(location.region);
      setSelectedComuna(location.comuna);
    } else {
      console.log('📍 No hay ubicación para pre-cargar');
      setSelectedRegion('');
      setSelectedComuna('');
    }
    setShowManualSelector(true);
  };

  const handleManualLocationSubmit = () => {
    if (selectedRegion && selectedComuna) {
      setManualLocation(selectedRegion, selectedComuna);
      setShowManualSelector(false);
      setSelectedRegion('');
      setSelectedComuna('');
      // Mantener la pestaña expandida para mostrar el cambio
      setIsExpanded(true);
    }
  };

  const handleRegionChange = (regionNombre: string) => {
    setSelectedRegion(regionNombre);
    setSelectedComuna(''); // Limpiar comuna cuando cambie la región
  };

  // Banner de solicitud de permisos
  if (showPermissionPrompt) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Mejora tu experiencia de compra
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Permite conocer tu ubicación para mostrar disponibilidad local, costos de envío y fechas de entrega precisas.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleRequestLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Permitir Ubicación
              </button>
              <button
                onClick={() => setShowPermissionPrompt(false)}
                className="bg-white hover:bg-gray-50 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg border border-blue-300 transition-colors"
              >
                Continuar sin ubicación
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="text-sm text-gray-600">Obteniendo tu ubicación...</span>
        </div>
      </div>
    );
  }

  // Error de ubicación
  if (error && !location) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <div className="text-sm text-yellow-800 mb-2">
              No se pudo obtener tu ubicación: {error}
            </div>
            <button
              onClick={handleRequestLocation}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner con ubicación exitosa
  if (location) {
    return (
      <div>
        <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg ${className}`}>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-semibold text-green-900">
                      📍 {location.comuna}, {location.region}
                    </h3>
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 hover:bg-green-200 rounded transition-colors"
                    >
                      <svg 
                        className={`w-4 h-4 text-green-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-sm text-green-700">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        ✓ Ubicación confirmada para consultas comerciales
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel expandido */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-green-900 text-sm">Detalles de ubicación</h4>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-green-200 rounded transition-colors"
                    title="Minimizar"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-900">Disponibilidad</h4>
                    <div className="space-y-1 text-green-700">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Productos disponibles</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Atención comercial</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Despacho a domicilio</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-900">Tu Ubicación</h4>
                    <div className="text-green-700 space-y-1">
                      <div>{location.region}</div>
                      <div>{location.comuna}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <button
                    onClick={handleChangeLocation}
                    className="text-sm text-green-700 hover:text-green-900 underline"
                  >
                    Cambiar ubicación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de selector manual de ubicación */}
        {showManualSelector && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Seleccionar Ubicación
                  </h3>
                  {location && (
                    <p className="text-sm font-bold text-green-700 mt-1">
                      Ubicación actual: {location.region}, {location.comuna}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowManualSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Selectors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Región *
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-700">Seleccione región</option>
                    {regionesComunas.map(region => (
                      <option 
                        key={region.codigo} 
                        value={region.nombre}
                        className={location?.region === region.nombre ? "text-gray-900 font-bold" : "text-gray-900"}
                      >
                        {region.nombre}
                        {location?.region === region.nombre ? ' (Actual) ✅' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comuna *
                  </label>
                  <select
                    value={selectedComuna}
                    onChange={(e) => setSelectedComuna(e.target.value)}
                    disabled={!selectedRegion}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-700">
                      {selectedRegion ? 'Seleccione comuna' : 'Primero seleccione una región'}
                    </option>
                    {comunasDisponibles.map(comuna => (
                      <option 
                        key={comuna.codigo} 
                        value={comuna.nombre}
                        className={location?.comuna === comuna.nombre ? "text-gray-900 font-bold" : "text-gray-900"}
                      >
                        {comuna.nombre}
                        {location?.comuna === comuna.nombre ? ' (Actual) ✅' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón sin ubicación */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    clearLocation();
                    setShowManualSelector(false);
                    setSelectedRegion('');
                    setSelectedComuna('');
                  }}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  ❌ Sin especificar ubicación
                </button>
              </div>

              {/* Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowManualSelector(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualLocationSubmit}
                  disabled={!selectedRegion || !selectedComuna}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {location && selectedRegion === location.region && selectedComuna === location.comuna 
                    ? 'Mantener Ubicación' 
                    : 'Cambiar Ubicación'
                  }
                </button>
              </div>

              {/* Opción de geolocalización */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowManualSelector(false);
                    requestLocation();
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  O usar mi ubicación actual (GPS)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Estado por defecto (sin ubicación)
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-sm text-gray-600">
            Ubicación no disponible
          </span>
        </div>
        <button
          onClick={handleRequestLocation}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Obtener ubicación
        </button>
      </div>
    </div>
  );
}

export default LocationBanner;