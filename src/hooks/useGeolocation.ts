"use client";

import { useState, useCallback, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  region: string;
  comuna: string;
  accuracy?: number;
}

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

// Mapeo mejorado de coordenadas a regiones chilenas
const getRegionFromCoordinates = (lat: number, lng: number): { region: string; comuna: string } => {
  // Región de Arica y Parinacota
  if (lat >= -18.8 && lat <= -17.5 && lng >= -70.5 && lng <= -69.2) {
    return { region: 'Región de Arica y Parinacota', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Tarapacá
  if (lat >= -21.5 && lat <= -18.8 && lng >= -70.5 && lng <= -68.5) {
    return { region: 'Región de Tarapacá', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Antofagasta
  if (lat >= -26.5 && lat <= -21.5 && lng >= -70.5 && lng <= -67.5) {
    return { region: 'Región de Antofagasta', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Atacama
  if (lat >= -29.5 && lat <= -26.5 && lng >= -71.5 && lng <= -68.5) {
    return { region: 'Región de Atacama', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Coquimbo
  if (lat >= -32.5 && lat <= -29.5 && lng >= -71.8 && lng <= -69.5) {
    return { region: 'Región de Coquimbo', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Valparaíso
  if (lat >= -33.6 && lat <= -32.0 && lng >= -72.0 && lng <= -70.5) {
    return { region: 'Región de Valparaíso', comuna: 'Seleccione su comuna' };
  }
  
  // Región Metropolitana
  if (lat >= -34.0 && lat <= -32.8 && lng >= -71.5 && lng <= -70.2) {
    return { region: 'Región Metropolitana', comuna: 'Seleccione su comuna' };
  }
  
  // Región del Libertador General Bernardo O'Higgins
  if (lat >= -35.0 && lat <= -33.8 && lng >= -72.5 && lng <= -70.5) {
    return { region: 'Región del Libertador General Bernardo O\'Higgins', comuna: 'Seleccione su comuna' };
  }
  
  // Región del Maule
  if (lat >= -36.5 && lat <= -34.5 && lng >= -72.5 && lng <= -70.5) {
    return { region: 'Región del Maule', comuna: 'Seleccione su comuna' };
  }
  
  // Región del Ñuble
  if (lat >= -37.5 && lat <= -36.0 && lng >= -72.8 && lng <= -71.0) {
    return { region: 'Región de Ñuble', comuna: 'San Fabián' };
  }
  
  // Región del Biobío
  if (lat >= -38.5 && lat <= -36.5 && lng >= -73.5 && lng <= -71.5) {
    return { region: 'Región del Biobío', comuna: 'Seleccione su comuna' };
  }
  
  // Región de La Araucanía
  if (lat >= -39.5 && lat <= -37.5 && lng >= -73.5 && lng <= -71.0) {
    return { region: 'Región de La Araucanía', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Los Ríos
  if (lat >= -40.5 && lat <= -39.0 && lng >= -73.5 && lng <= -71.5) {
    return { region: 'Región de Los Ríos', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Los Lagos
  if (lat >= -44.0 && lat <= -40.0 && lng >= -74.5 && lng <= -71.0) {
    return { region: 'Región de Los Lagos', comuna: 'Seleccione su comuna' };
  }
  
  // Región Aysén del General Carlos Ibáñez del Campo
  if (lat >= -49.5 && lat <= -43.5 && lng >= -76.0 && lng <= -71.0) {
    return { region: 'Región Aysén del General Carlos Ibáñez del Campo', comuna: 'Seleccione su comuna' };
  }
  
  // Región de Magallanes y de la Antártica Chilena
  if (lat >= -56.0 && lat <= -48.5 && lng >= -76.0 && lng <= -66.0) {
    return { region: 'Región de Magallanes y de la Antártica Chilena', comuna: 'Seleccione su comuna' };
  }
  
  // Si no se puede determinar la región exacta, retornar solo la región más probable
  // basándose en rangos más amplios de latitud
  if (lat >= -18.8 && lat <= -26.5) {
    return { region: 'Norte de Chile', comuna: 'Seleccione su comuna' };
  }
  if (lat >= -26.5 && lat <= -33.0) {
    return { region: 'Norte Chico', comuna: 'Seleccione su comuna' };
  }
  if (lat >= -33.0 && lat <= -36.0) {
    return { region: 'Zona Central', comuna: 'Seleccione su comuna' };
  }
  if (lat >= -36.0 && lat <= -40.0) {
    return { region: 'Zona Centro-Sur', comuna: 'Seleccione su comuna' };
  }
  if (lat >= -40.0 && lat <= -44.0) {
    return { region: 'Zona Sur', comuna: 'Seleccione su comuna' };
  }
  if (lat >= -44.0 && lat <= -56.0) {
    return { region: 'Zona Austral', comuna: 'Seleccione su comuna' };
  }
  
  return { region: 'Ubicación no determinada', comuna: 'Seleccione manualmente' };
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null
  });

  // Función para obtener ubicación desde localStorage
  const getStoredLocation = useCallback((): LocationData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('polimax_user_location');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Verificar que la ubicación guardada no sea muy antigua (24 horas)
        const storedTime = localStorage.getItem('polimax_location_timestamp');
        if (storedTime) {
          const timeDiff = Date.now() - parseInt(storedTime);
          if (timeDiff < 24 * 60 * 60 * 1000) { // 24 horas
            return parsed;
          }
        }
      }
    } catch (error) {
      console.error('Error al leer ubicación guardada:', error);
    }
    return null;
  }, []);

  // Función para guardar ubicación en localStorage
  const storeLocation = useCallback((location: LocationData) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('polimax_user_location', JSON.stringify(location));
      localStorage.setItem('polimax_location_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
    }
  }, []);

  // Función para solicitar geolocalización
  const requestLocation = useCallback(async () => {
    // Primero verificar si ya tenemos una ubicación guardada
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setState({
        location: storedLocation,
        loading: false,
        error: null
      });
      return;
    }

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocalización no soportada por este navegador'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000 // 10 minutos
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const { region, comuna } = getRegionFromCoordinates(latitude, longitude);
        
        const locationData: LocationData = {
          latitude,
          longitude,
          region,
          comuna,
          accuracy
        };

        // Guardar en localStorage
        storeLocation(locationData);

        setState({
          location: locationData,
          loading: false,
          error: null
        });

        console.log('📍 Ubicación detectada:', { region, comuna, accuracy: `${accuracy}m` });
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }

        setState({
          location: null,
          loading: false,
          error: errorMessage
        });

        console.warn('⚠️ Error de geolocalización:', errorMessage);
      },
      options
    );
  }, [getStoredLocation, storeLocation]);

  // Función para establecer ubicación manual
  const setManualLocation = useCallback((region: string, comuna: string) => {
    const manualLocation: LocationData = {
      latitude: 0,
      longitude: 0,
      region,
      comuna,
      accuracy: 0
    };

    // Guardar en localStorage
    storeLocation(manualLocation);

    // Actualizar estado
    setState({
      location: manualLocation,
      loading: false,
      error: null
    });

    console.log('📍 Ubicación establecida manualmente:', { region, comuna });
  }, [storeLocation]);

  // Función para limpiar ubicación guardada
  const clearLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('polimax_user_location');
    localStorage.removeItem('polimax_location_timestamp');
    
    setState({
      location: null,
      loading: false,
      error: null
    });
  }, []);

  // Cargar ubicación guardada al inicializar
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setState({
        location: stored,
        loading: false,
        error: null
      });
    }
  }, [getStoredLocation]);

  return {
    location: state.location,
    loading: state.loading,
    error: state.error,
    requestLocation,
    clearLocation,
    setManualLocation
  };
};