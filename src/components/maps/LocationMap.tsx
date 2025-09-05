"use client";

import { useEffect, useRef, useState } from 'react';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  searchAddress?: string;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  height?: string;
  className?: string;
}

const LocationMap = ({ 
  latitude, 
  longitude, 
  address, 
  searchAddress,
  onLocationSelect, 
  height = '300px',
  className = '' 
}: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Función para geocodificar una dirección
  const geocodeAddress = (address: string): Promise<{ lat: number, lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps no está cargado'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      
      // Agregar "Santiago, Chile" si no está incluido para mejorar la precisión
      const searchQuery = address.includes('Chile') ? address : `${address}, Santiago, Chile`;
      
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error('No se pudo encontrar la dirección'));
        }
      });
    });
  };

  // Función para cargar Google Maps
  const loadGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
      
      document.head.appendChild(script);
    });
  };

  // Función para inicializar el mapa
  const initializeMap = async () => {
    try {
      setIsLoading(true);
      await loadGoogleMaps();

      if (!mapRef.current) return;

      // Coordenadas por defecto (Santiago, Chile)
      const defaultLat = latitude || -33.4489;
      const defaultLng = longitude || -70.6693;

      const mapOptions: google.maps.MapOptions = {
        center: { lat: defaultLat, lng: defaultLng },
        zoom: latitude && longitude ? 15 : 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      const googleMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(googleMap);

      // Crear marcador
      const mapMarker = new google.maps.Marker({
        position: { lat: defaultLat, lng: defaultLng },
        map: googleMap,
        draggable: true,
        title: address || 'Ubicación de entrega'
      });
      setMarker(mapMarker);

      // Evento para cuando se arrastra el marcador
      mapMarker.addListener('dragend', () => {
        const position = mapMarker.getPosition();
        if (position && onLocationSelect) {
          const lat = position.lat();
          const lng = position.lng();
          
          // Obtener dirección usando geocodificación inversa
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address);
            } else {
              onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          });
        }
      });

      // Evento para hacer clic en el mapa
      googleMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Mover el marcador
          mapMarker.setPosition({ lat, lng });
          
          if (onLocationSelect) {
            // Obtener dirección
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                onLocationSelect(lat, lng, results[0].formatted_address);
              } else {
                onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              }
            });
          }
        }
      });

      setIsLoading(false);

    } catch (err) {
      console.error('Error al cargar el mapa:', err);
      setError('No se pudo cargar el mapa');
      setIsLoading(false);
    }
  };

  // Efecto para actualizar la posición del marcador
  useEffect(() => {
    if (map && marker && latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude };
      marker.setPosition(newPosition);
      map.setCenter(newPosition);
      map.setZoom(15);
    }
  }, [latitude, longitude, map, marker]);

  // Efecto para geocodificar cuando cambia searchAddress
  useEffect(() => {
    if (searchAddress && searchAddress.trim() && map && marker) {
      geocodeAddress(searchAddress)
        .then(({ lat, lng }) => {
          const newPosition = { lat, lng };
          marker.setPosition(newPosition);
          map.setCenter(newPosition);
          map.setZoom(16);
          
          // Notificar la nueva ubicación
          if (onLocationSelect) {
            onLocationSelect(lat, lng, searchAddress);
          }
        })
        .catch((error) => {
          console.error('Error al geocodificar dirección:', error);
        });
    }
  }, [searchAddress, map, marker, onLocationSelect]);

  // Inicializar mapa al montar el componente
  useEffect(() => {
    initializeMap();
  }, []);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-300 ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Instrucciones */}
      <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-lg p-2 text-xs text-gray-600 shadow-sm">
        <p>📍 Arrastra el marcador o haz clic para seleccionar ubicación</p>
      </div>
    </div>
  );
};

export default LocationMap;