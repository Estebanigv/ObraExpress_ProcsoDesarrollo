"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import TransbankService from '@/modules/checkout/services/transbank';
import Image from 'next/image';
import { CartThumbnail } from '@/components/optimized-image';
import { useGeolocation } from '@/hooks/useGeolocation';
import ProductConfiguratorSimple from '@/modules/products/components/product-configurator-simple';
import LocationMap from '@/components/maps/LocationMap';

interface CheckoutFormData {
  nombre: string;
  telefono: string;
  email: string;
  empresa?: string;
  rut?: string;
  region: string;
  comuna: string;
  direccion: string;
  comentarios: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, removeItem, updateQuantity, clearCart, addItem } = useCart();
  const { user } = useAuth();

  // Estados para el formulario
  const [formData, setFormData] = useState<CheckoutFormData>({
    nombre: user?.full_name || '',
    telefono: user?.phone || '',
    email: user?.email || '',
    empresa: '',
    rut: '',
    region: 'Región Metropolitana',
    comuna: '',
    direccion: '',
    comentarios: '',
    coordenadas: undefined
  });

  // Estados para la UI
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<any>({});
  const [complementaryProductQuantities, setComplementaryProductQuantities] = useState<{[key: string]: number}>({});
  const [complementaryDispatchDates, setComplementaryDispatchDates] = useState<{[key: string]: string}>({});
  const [showCalendars, setShowCalendars] = useState<{[key: string]: boolean}>({});
  const [complementarySelectedVariants, setComplementarySelectedVariants] = useState<{[key: string]: any}>({});
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderCalendar, setShowOrderCalendar] = useState(false);
  const [orderDispatchDate, setOrderDispatchDate] = useState<string>('');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Geolocalización hook
  const { location, requestLocation, clearLocation, setManualLocation } = useGeolocation();

  // Función para obtener fechas bloqueadas
  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('/api/admin/blocked-dates');
      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data.blockedDates || []);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  // Función para verificar si una fecha es jueves
  const isThursday = (date: Date): boolean => {
    return date.getDay() === 4; // 4 = jueves
  };

  // Función para verificar si una fecha está disponible
  const isDateAvailable = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar que sea jueves
    if (!isThursday(date)) return false;
    
    // Bloquear el jueves del mismo día (hoy es 4, por lo tanto el jueves actual está bloqueado)
    if (date.toDateString() === today.toDateString()) return false;
    
    // Verificar que sea fecha futura (excluye hoy)
    if (date <= today) return false;
    
    // Verificar que no esté bloqueada
    if (blockedDates.includes(dateStr)) return false;
    
    return true;
  };

  // Función para obtener el próximo jueves disponible
  const getNextAvailableThursday = (): Date => {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si es jueves después de las 12:00 PM, buscar desde el próximo jueves
    // Si es jueves antes de las 12:00 PM, incluir el jueves actual si está disponible
    let startDate = new Date(today);
    if (today.getDay() === 4 && currentHour >= 12) {
      // Es jueves después del mediodía, comenzar desde mañana
      startDate.setDate(startDate.getDate() + 1);
    } else if (today.getDay() > 4) {
      // Es viernes, sábado o domingo, comenzar desde lunes siguiente
      const daysUntilMonday = (8 - today.getDay()) % 7;
      startDate.setDate(startDate.getDate() + daysUntilMonday);
    }
    
    let nextDate = new Date(startDate);
    
    // Buscar el próximo jueves disponible
    while (!isThursday(nextDate) || !isDateAvailable(nextDate)) {
      nextDate.setDate(nextDate.getDate() + 1);
      // Evitar bucle infinito
      if (nextDate.getTime() - today.getTime() > 90 * 24 * 60 * 60 * 1000) break;
    }
    
    return nextDate;
  };

  // Opciones de regiones de Chile
  // Solo despachamos a la Región Metropolitana
  const regionesChile = [
    'Región Metropolitana'
  ];

  // Comunas disponibles solo para la Región Metropolitana
  const comunasPorRegion: { [key: string]: string[] } = {
    'Región Metropolitana': [
      'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'La Reina', 'Macul',
      'Peñalolén', 'Vitacura', 'Lo Barnechea', 'Huechuraba', 'Recoleta',
      'Independencia', 'Conchalí', 'Quilicura', 'Renca', 'Lampa', 'Colina',
      'Tiltil', 'Maipú', 'Pudahuel', 'Cerro Navia', 'Lo Prado', 'Quinta Normal',
      'Estación Central', 'Pedro Aguirre Cerda', 'San Miguel', 'La Cisterna',
      'El Bosque', 'San Bernardo', 'Calera de Tango', 'Buin', 'Paine'
    ]
  };

  // Efecto para cargar ubicación inicial
  useEffect(() => {
    if (location) {
      setFormData(prev => ({
        ...prev,
        region: location.region,
        comuna: location.comuna || '',
        coordenadas: {
          lat: location.latitude,
          lng: location.longitude
        }
      }));
    }
  }, [location]);

  // Efecto para cargar productos recomendados - comentado para pruebas
  // useEffect(() => {
    const loadProductos = async () => {
      // setLoadingRecommendations(true);
      try {
        const response = await fetch('/api/productos-publico');
        if (response.ok) {
          const result = await response.json();
          console.log('🔍 API Response:', result);
          
          if (!result.success || !result.data) {
            console.log('❌ API response not successful or missing data');
            return;
          }
          
          // Obtener categorías de productos ya en el carrito
          const categoriasEnCarrito = state.items.map(item => {
            // Normalizar nombres de categorías para comparación
            if (item.nombre?.toLowerCase().includes('perfil u')) return 'Perfil U';
            if (item.nombre?.toLowerCase().includes('perfil clip') || item.nombre?.toLowerCase().includes('clip plano')) return 'Perfil Clip Plano';
            if (item.nombre?.toLowerCase().includes('policarbonato alveolar')) return 'Policarbonato Alveolar';
            if (item.nombre?.toLowerCase().includes('policarbonato ondulado')) return 'Policarbonato Ondulado';
            if (item.nombre?.toLowerCase().includes('policarbonato compacto')) return 'Policarbonato Compacto';
            return item.categoria || '';
          });
          
          console.log('🛒 Categorías en carrito:', categoriasEnCarrito);
          
          // Determinar qué productos recomendar basado en lo que ya está en el carrito
          const categoriasARecomendar: string[] = [];
          
          const tieneAlveolar = categoriasEnCarrito.includes('Policarbonato Alveolar');
          const tieneOndulado = categoriasEnCarrito.includes('Policarbonato Ondulado');
          const tieneCompacto = categoriasEnCarrito.includes('Policarbonato Compacto');
          const tienePerfilU = categoriasEnCarrito.includes('Perfil U');
          const tienePerfilClip = categoriasEnCarrito.includes('Perfil Clip Plano');
          
          // Lógica de recomendaciones inteligentes - SOLO recomendar lo que NO está en el carrito:
          
          // Si tiene policarbonato alveolar → recomendar perfiles (si no los tiene)
          if (tieneAlveolar) {
            if (!tienePerfilU) categoriasARecomendar.push('Perfil U');
            if (!tienePerfilClip) categoriasARecomendar.push('Perfil Clip Plano');
          }
          
          // Si tiene policarbonato ondulado → recomendar otros tipos (si no los tiene)
          if (tieneOndulado) {
            if (!tieneAlveolar) categoriasARecomendar.push('Policarbonato Alveolar');
            if (!tieneCompacto) categoriasARecomendar.push('Policarbonato Compacto');
            if (!tienePerfilU) categoriasARecomendar.push('Perfil U');
            if (!tienePerfilClip) categoriasARecomendar.push('Perfil Clip Plano');
          }
          
          // Si tiene policarbonato compacto → recomendar perfiles y otros policarbonatos
          if (tieneCompacto) {
            if (!tieneAlveolar) categoriasARecomendar.push('Policarbonato Alveolar');
            if (!tieneOndulado) categoriasARecomendar.push('Policarbonato Ondulado');
            if (!tienePerfilU) categoriasARecomendar.push('Perfil U');
            if (!tienePerfilClip) categoriasARecomendar.push('Perfil Clip Plano');
          }
          
          // Si solo tiene perfiles → recomendar policarbonatos
          if ((tienePerfilU || tienePerfilClip) && !tieneAlveolar && !tieneOndulado && !tieneCompacto) {
            categoriasARecomendar.push('Policarbonato Alveolar', 'Policarbonato Ondulado', 'Policarbonato Compacto');
          }
          
          // Si el carrito está vacío → mostrar productos destacados por defecto
          if (state.items.length === 0) {
            categoriasARecomendar.push('Perfil U', 'Perfil Clip Plano', 'Policarbonato Compacto');
          }
          
          // Eliminar duplicados
          const categoriasUnicas = [...new Set(categoriasARecomendar)];
          
          console.log('💡 Categorías a recomendar:', categoriasUnicas);
          
          // Extraer productos recomendados
          const gruposProductos: any[] = [];
          Object.entries(result.data.productos_por_categoria || {}).forEach(([categoriaKey, categoria]: [string, any]) => {
            // Solo incluir categorías que queremos recomendar
            if (categoriasUnicas.includes(categoriaKey)) {
              categoria.forEach((grupo: any) => {
                if (grupo.variantes && grupo.variantes.length > 0) {
                  // Filtrar variantes disponibles
                  const variantesDisponibles = grupo.variantes.filter((v: any) => 
                    v.disponible_en_web && v.stock > 0
                  );
                  
                  if (variantesDisponibles.length > 0) {
                    gruposProductos.push({
                      id: categoriaKey.toLowerCase().replace(/\s+/g, '-'),
                      nombre: categoriaKey,
                      categoria_completa: categoriaKey,
                      descripcion: grupo.descripcion || `${categoriaKey} para instalación de policarbonato`,
                      imagen: grupo.imagen || variantesDisponibles[0].imagen || variantesDisponibles[0].ruta_imagen,
                      variantes: variantesDisponibles.map((v: any) => ({
                        ...v,
                        disponible_en_web: v.disponible_en_web || v.disponible,
                        precio: v.precio_con_iva || v.precio
                      })),
                      precio_desde: Math.min(...variantesDisponibles.map((v: any) => v.precio_con_iva || v.precio || 0)),
                      total_variantes: variantesDisponibles.length,
                      tag: categoriaKey.includes('Perfil') ? 'Recomendado' : 'Complementario'
                    });
                  }
                }
              });
            }
          });
          
          console.log('🔍 Grupos de productos complementarios filtrados:', gruposProductos);
          
          // Usar los grupos como productos destacados
          const productosDestacados = gruposProductos;
          
          console.log('✨ Productos destacados para recomendaciones:', productosDestacados.map((p: any) => ({
            codigo: p.codigo,
            nombre: p.nombre,
            precio: p.precio,
            categoria: p.categoria
          })));
          
          setProductos(productosDestacados);
        }
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
      } finally {
        // setLoadingRecommendations(false);
      }
    };

    // loadProductos();
  // }, [state.items]); // Re-ejecutar cuando cambien los items del carrito

  // Función para detectar si es Policarbonato Compacto (único con mínimo de 1 unidad)
  const isPolicarbonatoCompacto = (item: any) => {
    const nombreLower = (item.nombre || '').toLowerCase();
    const categoriaLower = (item.categoria || '').toLowerCase();
    
    return (nombreLower.includes('policarbonato') && nombreLower.includes('compacto')) ||
           (categoriaLower.includes('policarbonato') && categoriaLower.includes('compacto'));
  };

  // Función para generar nombre descriptivo del producto
  const getProductDisplayName = (item: any) => {
    // Primero, intentar detectar el tipo de producto por el nombre o categoría
    const nombreLower = (item.nombre || '').toLowerCase();
    const categoriaLower = (item.categoria || '').toLowerCase();
    
    // Para policarbonatos - priorizar detección por contenido del nombre
    if (nombreLower.includes('policarbonato') || categoriaLower.includes('policarbonato')) {
      if (nombreLower.includes('alveolar') || categoriaLower.includes('alveolar')) {
        return 'Policarbonato Alveolar';
      }
      if (nombreLower.includes('ondulado') || categoriaLower.includes('ondulado')) {
        return 'Policarbonato Ondulado';
      }
      if (nombreLower.includes('compacto') || categoriaLower.includes('compacto')) {
        return 'Policarbonato Compacto';
      }
      // Si solo dice "policarbonato" pero no especifica el tipo, usar el nombre original
      return item.nombre || item.categoria || 'Policarbonato';
    }
    
    // Para perfiles
    if (nombreLower.includes('perfil') || categoriaLower.includes('perfil')) {
      if (nombreLower.includes('perfil u') || nombreLower.includes('u ')) {
        return 'Perfil U';
      }
      if (nombreLower.includes('clip') || nombreLower.includes('clip plano')) {
        return 'Perfil Clip Plano';
      }
      return item.nombre || item.categoria || 'Perfil';
    }
    
    // Para otros productos, usar el nombre original o la categoría
    return item.nombre || item.categoria || 'Producto';
  };

  // Función para obtener dirección usando coordenadas
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ObraExpress/1.0 (contact@obraexpress.com)'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || '';
        
        // Extraer información útil de la dirección
        const addressParts = address.split(', ');
        const streetInfo = addressParts.slice(0, 3).join(', ');
        
        setFormData(prev => ({
          ...prev,
          direccion: streetInfo
        }));
        
        console.log('📍 Dirección obtenida:', streetInfo);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener la dirección automáticamente:', error);
    }
  };

  // Efecto para obtener dirección cuando cambian las coordenadas
  useEffect(() => {
    if (formData.coordenadas && !formData.direccion) {
      reverseGeocode(formData.coordenadas.lat, formData.coordenadas.lng);
    }
  }, [formData.coordenadas]);

  // Efecto para inicializar fecha de despacho
  useEffect(() => {
    // Comentado temporalmente para pruebas
    // if (state.items.length === 0) {
    //   router.push('/');
    //   return;
    // }
    
    // Función para inicializar fechas
    const initializeDispatchDate = async () => {
      // Cargar fechas bloqueadas - comentado para pruebas
      // await fetchBlockedDates();
      
      // Verificar si hay fecha seleccionada en localStorage (desde página principal)
      const savedDispatchDate = localStorage.getItem('selectedDispatchDate');
      if (savedDispatchDate) {
        const savedDate = new Date(savedDispatchDate);
        if (isDateAvailable(savedDate)) {
          setOrderDispatchDate(savedDispatchDate);
          return;
        }
      }
      
      // Si no hay fecha válida, sugerir el próximo jueves disponible
      const nextThursday = getNextAvailableThursday();
      const nextThursdayStr = nextThursday.toISOString().split('T')[0];
      setOrderDispatchDate(nextThursdayStr);
      localStorage.setItem('selectedDispatchDate', nextThursdayStr);
    };
    
    // Comentado temporalmente para pruebas
    // initializeDispatchDate();
  }, [state.items.length, router]);

  // Función para manejar la geolocalización
  const handleGeolocalizacion = async () => {
    try {
      await requestLocation();
      setShowMap(true); // Mostrar mapa automáticamente después de obtener ubicación
    } catch (error) {
      console.error('Error al obtener geolocalización:', error);
    }
  };

  // Función para manejar selección de ubicación en el mapa
  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      coordenadas: { lat, lng },
      direccion: address.split(',')[0] // Solo la primera parte de la dirección
    }));
    console.log('📍 Ubicación seleccionada desde mapa:', { lat, lng, address });
  };

  // Función para limpiar ubicación
  const handleClearLocation = () => {
    clearLocation();
    setShowMap(false); // Ocultar mapa al limpiar ubicación
    setFormData(prev => ({
      ...prev,
      region: 'Región Metropolitana',
      comuna: '',
      direccion: '',
      coordenadas: undefined
    }));
  };

  // Función para establecer ubicación manual
  const handleSetManualLocation = (region: string, comuna: string) => {
    setManualLocation(region, comuna);
    setFormData(prev => ({
      ...prev,
      region,
      comuna,
      coordenadas: undefined
    }));
    setShowLocationEditor(false);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para agregar producto al carrito
  const handleAddToCart = (producto: any, variant?: any) => {
    const precio = variant?.precio || producto.precio || 0;
    
    console.log('🛒 Agregando al carrito:', {
      producto: producto.nombre,
      precio,
      variant
    });

    const cartItem = {
      id: `${producto.codigo}-${variant ? `${variant.espesor || ''}-${variant.color || ''}` : 'default'}`,
      tipo: 'producto' as const,
      nombre: producto.nombre,
      descripcion: producto.descripcion || `${producto.categoria} - ${producto.codigo}`,
      imagen: producto.imagen_url || `/images/${producto.categoria.toLowerCase().replace(/\s+/g, '-')}-sample.jpg`,
      especificaciones: variant ? [
        variant.espesor && `Espesor: ${variant.espesor}`,
        variant.color && `Color: ${variant.color}`,
        variant.ancho && variant.largo && `Dimensiones: ${variant.ancho}m x ${variant.largo}m`
      ].filter(Boolean) : [],
      cantidad: 1,
      precioUnitario: precio,
      total: precio,
      espesor: variant?.espesor,
      color: variant?.color,
      ancho: variant?.ancho,
      largo: variant?.largo,
      area: variant?.area
    };

    addItem(cartItem);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.items.length === 0) {
      alert('El carrito está vacío. Agrega productos antes de continuar.');
      return;
    }

    // Validaciones básicas
    if (!formData.nombre || !formData.telefono || !formData.email || !formData.region || !formData.comuna || !formData.direccion) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);

    try {
      // Crear orden en Transbank
      const ordenData = {
        items: state.items,
        cliente: formData,
        total: state.total,
        timestamp: new Date().toISOString()
      };

      console.log('💳 Iniciando proceso de pago con Transbank...', ordenData);
      
      const transbankResponse = await TransbankService.crearTransaccion(ordenData);
      
      if (transbankResponse.success) {
        console.log('✅ Transacción creada exitosamente:', transbankResponse.data);
        // Redirigir a Webpay
        window.location.href = transbankResponse.data.url;
      } else {
        throw new Error(transbankResponse.error || 'Error al crear la transacción');
      }
      
    } catch (error) {
      console.error('❌ Error en el proceso de checkout:', error);
      alert('Hubo un error al procesar tu pedido. Por favor, inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular totales
  const subtotal = state.total;
  const envio = subtotal > 100000 ? 0 : 5000; // Envío gratis sobre $100.000
  const total = subtotal + envio;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">Agrega productos a tu carrito para continuar con el checkout.</p>
          <Link 
            href="/productos" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Checkout */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  <span className="text-gray-900">Obra</span>
                  <span className="text-yellow-500">Express</span>
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Materiales de Construcción</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Pago Seguro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps del Checkout */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            {/* Paso 1: Información de Entrega */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Información de Entrega</span>
            </div>
            
            {/* Separador */}
            <div className="flex-1 border-t border-gray-300 max-w-[100px]"></div>
            
            {/* Paso 2: Ubicación */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Ubicación de Entrega</span>
            </div>
            
            {/* Separador */}
            <div className="flex-1 border-t border-gray-300 max-w-[100px]"></div>
            
            {/* Paso 3: Pago */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-600">Pago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de Entrega</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Información Opcional de Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa (Opcional)
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                      RUT (Opcional)
                    </label>
                    <input
                      type="text"
                      id="rut"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12.345.678-9"
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Ubicación de Entrega</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleGeolocalizacion}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ubicar automáticamente
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {showMap ? 'Ocultar mapa' : 'Ver mapa'}
                      </button>
                      
                      {location && (
                        <button
                          type="button"
                          onClick={handleClearLocation}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {location && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm">
                          <p className="text-green-800 font-medium">Ubicación detectada</p>
                          <p className="text-green-600">{location.region}, {location.comuna}</p>
                          {location.accuracy && (
                            <p className="text-green-500 text-xs">Precisión: {location.accuracy}m</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aviso de cobertura de despacho */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Cobertura de Despacho</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Actualmente solo realizamos despachos dentro de la <strong>Región Metropolitana</strong>. 
                          Pronto expandiremos nuestro servicio a otras regiones.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                        Región *
                      </label>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona una región</option>
                        {regionesChile.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">
                        Comuna *
                      </label>
                      <select
                        id="comuna"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona una comuna</option>
                        {formData.region && comunasPorRegion[formData.region] ? 
                          comunasPorRegion[formData.region].map((comuna) => (
                            <option key={comuna} value={comuna}>
                              {comuna}
                            </option>
                          )) :
                          <option value="">Primero selecciona una región</option>
                        }
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calle, número, departamento, referencias..."
                  />
                </div>

                <div>
                  <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios Adicionales
                  </label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    value={formData.comentarios}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instrucciones especiales para la entrega, referencias adicionales..."
                  />
                </div>
                
                {/* Mapa de ubicación */}
                {showMap && (
                  <div className="space-y-3">
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        📍 Selecciona tu ubicación en el mapa
                      </label>
                      <LocationMap
                        latitude={formData.coordenadas?.lat || location?.lat}
                        longitude={formData.coordenadas?.lng || location?.lng}
                        address={formData.direccion}
                        searchAddress={formData.direccion}
                        onLocationSelect={handleMapLocationSelect}
                        height="350px"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Puedes arrastrar el marcador o hacer clic en el mapa para ajustar tu ubicación exacta
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Productos Complementarios */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">¿Necesitas completar tu instalación?</h3>
                    <p className="text-sm text-gray-600">Productos complementarios que podrías necesitar</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">💡 Recomendación profesional</p>
                      <p className="text-sm text-blue-700">Para una instalación correcta del policarbonato alveolar, es esencial usar <strong>Perfil U</strong> en los bordes y <strong>Perfil Clip</strong> para las uniones entre láminas. Esto garantiza sellado hermético y mayor durabilidad.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {loadingRecommendations ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {productos.map((grupo) => {
                    const varianteSeleccionada = complementarySelectedVariants[grupo.id] || grupo.variantes[0];
                    const cantidad = complementaryProductQuantities[grupo.id] || 10;
                    const selectedDispatchDate = complementaryDispatchDates[grupo.id] || '';
                    const showCalendar = showCalendars[grupo.id] || false;

                    return (
                      <div key={grupo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[650px]">
                        {/* Header con imagen y etiqueta */}
                        <div className="relative h-32 bg-gray-100">
                          <Image
                            src={grupo.imagen || grupo.variantes[0]?.imagen || grupo.variantes[0]?.ruta_imagen || 
                              (grupo.nombre?.includes('Perfil U') ? "/assets/images/Productos/Perfiles/perfil-u-policarbonato.webp" :
                               grupo.nombre?.includes('Perfil Clip') ? "/assets/images/Productos/Perfiles/perfil-clip-policarbonato.webp" :
                               `/images/${grupo.categoria_completa?.toLowerCase().replace(/\s+/g, '-')}-sample.jpg`)
                            }
                            alt={grupo.nombre}
                            width={300}
                            height={128}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/productos/producto-placeholder.jpg';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-md ${
                              grupo.tag === 'Recomendado' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-blue-500 text-white'
                            }`}>
                              {grupo.tag}
                            </span>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-4 flex flex-col flex-1">
                          {/* Título y descripción */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">{grupo.nombre}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2">{grupo.descripcion}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {varianteSeleccionada?.codigo || 'N/A'}</p>
                          </div>

                          {/* Configuración rápida */}
                          <div className="space-y-3 mb-4">
                            {/* Colores */}
                            {[...new Set(grupo.variantes.map((v: any) => v.color).filter(Boolean))].length > 1 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Color: <span className="text-blue-600">{varianteSeleccionada?.color}</span>
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                  {[...new Set(grupo.variantes.map((v: any) => v.color).filter(Boolean))].map((color) => (
                                    <button
                                      key={color}
                                      onClick={() => {
                                        const nuevaVariante = grupo.variantes.find((v: any) => v.color === color) || grupo.variantes[0];
                                        setComplementarySelectedVariants(prev => ({
                                          ...prev,
                                          [grupo.id]: nuevaVariante
                                        }));
                                      }}
                                      className={`px-2 py-1 text-xs rounded border transition-all ${
                                        varianteSeleccionada?.color === color
                                          ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' 
                                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-600'
                                      }`}
                                    >
                                      {color}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Espesores */}
                            {[...new Set(grupo.variantes.map((v: any) => v.espesor).filter(Boolean))].length > 1 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Espesor: <span className="text-blue-600">{varianteSeleccionada?.espesor}</span>
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                  {[...new Set(grupo.variantes.map((v: any) => v.espesor).filter(Boolean))].slice(0, 4).map((espesor) => (
                                    <button
                                      key={espesor}
                                      onClick={() => {
                                        const nuevaVariante = grupo.variantes.find((v: any) => v.espesor === espesor) || grupo.variantes[0];
                                        setComplementarySelectedVariants(prev => ({
                                          ...prev,
                                          [grupo.id]: nuevaVariante
                                        }));
                                      }}
                                      className={`px-2 py-1 text-xs rounded border transition-all ${
                                        varianteSeleccionada?.espesor === espesor
                                          ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' 
                                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-600'
                                      }`}
                                    >
                                      {espesor.replace(/mm$/i, '')}mm
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dimensiones - Ancho */}
                            {[...new Set(grupo.variantes.map((v: any) => v.ancho).filter(Boolean))].length > 1 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Ancho: <span className="text-blue-600">{varianteSeleccionada?.ancho}mm</span>
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                  {[...new Set(grupo.variantes.map((v: any) => v.ancho).filter(Boolean))].slice(0, 3).map((ancho) => (
                                    <button
                                      key={ancho}
                                      onClick={() => {
                                        const nuevaVariante = grupo.variantes.find((v: any) => v.ancho === ancho) || grupo.variantes[0];
                                        setComplementarySelectedVariants(prev => ({
                                          ...prev,
                                          [grupo.id]: nuevaVariante
                                        }));
                                      }}
                                      className={`px-2 py-1 text-xs rounded border transition-all ${
                                        varianteSeleccionada?.ancho === ancho
                                          ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' 
                                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-600'
                                      }`}
                                    >
                                      {ancho}mm
                                    </button>
                                  ))}
                                  {[...new Set(grupo.variantes.map((v: any) => v.ancho).filter(Boolean))].length > 3 && (
                                    <span className="text-xs text-gray-500 px-2 py-1">+{[...new Set(grupo.variantes.map((v: any) => v.ancho).filter(Boolean))].length - 3} más</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Dimensiones - Largo */}
                            {[...new Set(grupo.variantes.map((v: any) => v.largo).filter(Boolean))].length > 1 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Largo: <span className="text-blue-600">{varianteSeleccionada?.largo}mts</span>
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                  {[...new Set(grupo.variantes.map((v: any) => v.largo).filter(Boolean))].slice(0, 3).map((largo) => (
                                    <button
                                      key={largo}
                                      onClick={() => {
                                        const nuevaVariante = grupo.variantes.find((v: any) => v.largo === largo) || grupo.variantes[0];
                                        setComplementarySelectedVariants(prev => ({
                                          ...prev,
                                          [grupo.id]: nuevaVariante
                                        }));
                                      }}
                                      className={`px-2 py-1 text-xs rounded border transition-all ${
                                        varianteSeleccionada?.largo === largo
                                          ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' 
                                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-600'
                                      }`}
                                    >
                                      {largo}mts
                                    </button>
                                  ))}
                                  {[...new Set(grupo.variantes.map((v: any) => v.largo).filter(Boolean))].length > 3 && (
                                    <span className="text-xs text-gray-500 px-2 py-1">+{[...new Set(grupo.variantes.map((v: any) => v.largo).filter(Boolean))].length - 3} más</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Dimensiones generales (si existen y no hay ancho/largo específicos) */}
                            {[...new Set(grupo.variantes.map((v: any) => v.dimensiones).filter(Boolean))].length > 1 && 
                             [...new Set(grupo.variantes.map((v: any) => v.ancho).filter(Boolean))].length <= 1 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Dimensiones: <span className="text-blue-600">{varianteSeleccionada?.dimensiones}</span>
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                  {[...new Set(grupo.variantes.map((v: any) => v.dimensiones).filter(Boolean))].slice(0, 3).map((dimension) => (
                                    <button
                                      key={dimension}
                                      onClick={() => {
                                        const nuevaVariante = grupo.variantes.find((v: any) => v.dimensiones === dimension) || grupo.variantes[0];
                                        setComplementarySelectedVariants(prev => ({
                                          ...prev,
                                          [grupo.id]: nuevaVariante
                                        }));
                                      }}
                                      className={`px-2 py-1 text-xs rounded border transition-all ${
                                        varianteSeleccionada?.dimensiones === dimension
                                          ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium' 
                                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-600'
                                      }`}
                                    >
                                      {dimension}
                                    </button>
                                  ))}
                                  {[...new Set(grupo.variantes.map((v: any) => v.dimensiones).filter(Boolean))].length > 3 && (
                                    <span className="text-xs text-gray-500 px-2 py-1">+{[...new Set(grupo.variantes.map((v: any) => v.dimensiones).filter(Boolean))].length - 3} más</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Espaciado adicional para alineación */}
                          <div className="flex-1 min-h-[30px]"></div>

                          {/* Precio y Stock siguiendo el diseño del sitio principal */}
                          <div className="mb-3">
                            {/* Precio principal */}
                            <div className="mb-1">
                              <div className="text-lg font-bold text-gray-900">
                                ${(varianteSeleccionada?.precio || grupo.precio_desde).toLocaleString('es-CL')}
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium text-xs">IVA incluido</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-green-600 font-medium">
                                • Stock: {grupo.variantes.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)}
                              </span>
                              <button
                                onClick={() => setShowCalendars(prev => ({
                                  ...prev,
                                  [grupo.id]: !showCalendar
                                }))}
                                className={`text-sm font-medium transition-all cursor-pointer px-3 py-2 rounded-lg flex items-center ${
                                  selectedDispatchDate 
                                    ? 'text-emerald-700 bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 shadow-md font-bold' 
                                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
                                }`}
                              >
                                <span>🚚 {selectedDispatchDate ? 'Elegir despacho' : 'Elegir despacho'}</span>
                                {selectedDispatchDate && (
                                  <div className="ml-2 flex items-center justify-center w-5 h-5 bg-emerald-600 rounded-full shadow-lg">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Cantidad siguiendo el diseño del sitio principal */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                  (mín. 10)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center bg-gray-50 border border-gray-300 rounded-lg p-2">
                              <button
                                onClick={() => setComplementaryProductQuantities(prev => ({
                                  ...prev,
                                  [grupo.id]: Math.max(10, cantidad - 10)
                                }))}
                                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={cantidad <= 10}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                </svg>
                              </button>
                              <div className="flex-1 text-center mx-4">
                                <div className="text-lg font-bold text-gray-900">
                                  {cantidad}
                                </div>
                                <div className="text-xs text-gray-500">
                                  unidades
                                </div>
                              </div>
                              <button
                                onClick={() => setComplementaryProductQuantities(prev => ({
                                  ...prev,
                                  [grupo.id]: cantidad + 10
                                }))}
                                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Total y Botón siguiendo el diseño del sitio principal */}
                          <div className="space-y-3">
                            {/* Total */}
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Total:</div>
                              <div className="text-xl font-bold text-green-600">
                                ${((varianteSeleccionada?.precio || grupo.precio_desde) * cantidad).toLocaleString('es-CL')}
                              </div>
                            </div>
                            
                            {/* Botones de compra - siguiendo el diseño de la página principal */}
                            <div className="relative min-h-[80px] flex flex-col justify-end mt-auto">
                              {!state.items.some(item => item.id === `${grupo.id}-${varianteSeleccionada?.codigo || 'default'}`) ? (
                                <button
                                  onClick={() => {
                                    const cartItem = {
                                      id: `${grupo.id}-${varianteSeleccionada?.codigo || 'default'}`,
                                      tipo: 'producto' as const,
                                      nombre: grupo.nombre,
                                      descripcion: grupo.descripcion || `${grupo.categoria_completa} - ${varianteSeleccionada?.codigo}`,
                                      imagen: grupo.imagen || varianteSeleccionada?.imagen,
                                      especificaciones: varianteSeleccionada ? [
                                        varianteSeleccionada.espesor && `Espesor: ${varianteSeleccionada.espesor}`,
                                        varianteSeleccionada.color && `Color: ${varianteSeleccionada.color}`,
                                        varianteSeleccionada.ancho && `Ancho: ${varianteSeleccionada.ancho}mm`,
                                        varianteSeleccionada.largo && `Largo: ${varianteSeleccionada.largo}mts`
                                      ].filter(Boolean) : [],
                                      cantidad: cantidad,
                                      precioUnitario: varianteSeleccionada?.precio || grupo.precio_desde,
                                      total: (varianteSeleccionada?.precio || grupo.precio_desde) * cantidad
                                    };
                                    addItem(cartItem);
                                  }}
                                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center"
                                >
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                                  </svg>
                                  Agregar al Carrito
                                </button>
                              ) : (
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  {/* Botón Agregar Más - Verde */}
                                  <button
                                    onClick={() => {
                                      const cartItem = {
                                        id: `${grupo.id}-${varianteSeleccionada?.codigo || 'default'}`,
                                        tipo: 'producto' as const,
                                        nombre: grupo.nombre,
                                        descripcion: grupo.descripcion || `${grupo.categoria_completa} - ${varianteSeleccionada?.codigo}`,
                                        imagen: grupo.imagen || varianteSeleccionada?.imagen,
                                        especificaciones: varianteSeleccionada ? [
                                          varianteSeleccionada.espesor && `Espesor: ${varianteSeleccionada.espesor}`,
                                          varianteSeleccionada.color && `Color: ${varianteSeleccionada.color}`,
                                          varianteSeleccionada.ancho && `Ancho: ${varianteSeleccionada.ancho}mm`,
                                          varianteSeleccionada.largo && `Largo: ${varianteSeleccionada.largo}mts`
                                        ].filter(Boolean) : [],
                                        cantidad: cantidad,
                                        precioUnitario: varianteSeleccionada?.precio || grupo.precio_desde,
                                        total: (varianteSeleccionada?.precio || grupo.precio_desde) * cantidad
                                      };
                                      addItem(cartItem);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                    <span className="hidden sm:inline">Más</span>
                                  </button>
                                  
                                  {/* Botón Quitar */}
                                  <button
                                    onClick={() => {
                                      removeItem(`${grupo.id}-${varianteSeleccionada?.codigo || 'default'}`);
                                    }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 p-3 rounded-lg transition-all flex items-center justify-center group"
                                    title="Quitar producto del carrito"
                                  >
                                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {productos.length === 0 && !loadingRecommendations && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay productos complementarios disponibles en este momento.</p>
                  <p className="text-xs mt-2">Los perfiles y accesorios aparecerán aquí cuando estén disponibles.</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Resumen de la orden */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Resumen del Pedido</h2>
                <button
                  onClick={() => setShowOrderDetails(!showOrderDetails)}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {showOrderDetails ? 'Ocultar detalles' : 'Ver detalles'}
                  <svg 
                    className={`w-4 h-4 ml-1 transform transition-transform ${showOrderDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Resumen simple */}
              <div className="space-y-3 mb-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    {item.imagen && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <CartThumbnail
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                          productName={item.nombre}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {getProductDisplayName(item)}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600">Cantidad: {item.cantidad}</p>
                        <div className="text-xs text-gray-500">
                          Min: {isPolicarbonatoCompacto(item) ? '1' : '10'} unid.
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Precio unit.: ${item.precioUnitario?.toLocaleString('es-CL') || (item.total / item.cantidad).toLocaleString('es-CL')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold text-black">${item.total.toLocaleString('es-CL')}</p>
                        <p className="text-xs text-gray-500">IVA incluido</p>
                      </div>
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const minQuantity = isPolicarbonatoCompacto(item) ? 1 : 10;
                            const newQuantity = Math.max(minQuantity, item.cantidad - (minQuantity === 1 ? 1 : 10));
                            if (newQuantity === 0) {
                              removeItem(item.id);
                            } else {
                              updateQuantity(item.id, newQuantity);
                            }
                          }}
                          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                          title="Disminuir cantidad"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="text-xs font-medium text-gray-700 min-w-[2rem] text-center">
                          {item.cantidad}
                        </span>
                        
                        <button
                          onClick={() => {
                            const minQuantity = isPolicarbonatoCompacto(item) ? 1 : 10;
                            const incrementBy = minQuantity === 1 ? 1 : 10;
                            updateQuantity(item.id, item.cantidad + incrementBy);
                          }}
                          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                          title="Aumentar cantidad"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Eliminar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items del carrito - Solo visible cuando showOrderDetails es true */}
              {showOrderDetails && (
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      {item.imagen && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <CartThumbnail
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                            productName={item.nombre}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{getProductDisplayName(item)}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-600">Cantidad: {item.cantidad} unidades</p>
                          <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Mín: {isPolicarbonatoCompacto(item) ? '1' : '10'} unid.
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-black">
                              ${item.total.toLocaleString('es-CL')}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Eliminar producto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Información del Cliente */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">📋 Información de Entrega</h3>
                
                {formData.nombre && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Cliente:</span> {formData.nombre}</p>
                    {formData.telefono && <p><span className="font-medium">Teléfono:</span> {formData.telefono}</p>}
                    {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
                    {formData.empresa && <p><span className="font-medium">Empresa:</span> {formData.empresa}</p>}
                    
                    {(formData.region || formData.comuna || formData.direccion) && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="font-medium text-gray-700 mb-1">📍 Dirección de entrega:</p>
                        <div className="text-gray-600">
                          {formData.region && <p>{formData.region}</p>}
                          {formData.comuna && <p>{formData.comuna}</p>}
                          {formData.direccion && <p>{formData.direccion}</p>}
                        </div>
                      </div>
                    )}
                    
                    {formData.comentarios && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="font-medium text-gray-700">💬 Comentarios:</p>
                        <p className="text-gray-600">{formData.comentarios}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {!formData.nombre && (
                  <p className="text-sm text-gray-500 italic">Completa el formulario para ver el resumen</p>
                )}
              </div>

              {/* Fecha de Despacho */}
              <div className="border-t border-gray-200 pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900">Fecha de Despacho</h3>
                  </div>
                  <button
                    onClick={() => setShowOrderCalendar(!showOrderCalendar)}
                    className={`text-sm font-medium transition-all px-3 py-2 rounded-lg flex items-center ${
                      orderDispatchDate 
                        ? 'text-emerald-700 bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 shadow-md' 
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <span>📅 {orderDispatchDate ? new Date(orderDispatchDate + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : 'Elegir fecha'}</span>
                    {orderDispatchDate && (
                      <div className="ml-2 flex items-center justify-center w-4 h-4 bg-emerald-600 rounded-full">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>

                {/* Calendario Inline */}
                {showOrderCalendar && (
                  <div className="bg-white border-2 border-gray-100 rounded-xl p-4 mb-3 shadow-lg">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-gray-900 mb-2">Selecciona tu fecha de despacho</h4>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 rounded-lg p-2">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">Solo despachamos los jueves</p>
                            <p className="text-blue-100 text-sm">Horario: 9:00 AM - 6:00 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calendario Elegante - Un Solo Mes */}
                    <div className="mb-4">
                      {(() => {
                        const today = new Date();
                        
                        // Crear fechas del calendario para el mes seleccionado
                        const firstDay = new Date(calendarYear, calendarMonth, 1);
                        const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
                        const daysInMonth = lastDay.getDate();
                        const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Lunes = 0
                        
                        const days = [];
                        
                        // Días vacíos al inicio
                        for (let i = 0; i < firstDayOfWeek; i++) {
                          days.push(null);
                        }
                        
                        // Días del mes
                        for (let day = 1; day <= daysInMonth; day++) {
                          days.push(day);
                        }
                        
                        return (
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            {/* Header navegación compacto */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                              <button
                                onClick={() => {
                                  if (calendarMonth === 0) {
                                    setCalendarMonth(11);
                                    setCalendarYear(calendarYear - 1);
                                  } else {
                                    setCalendarMonth(calendarMonth - 1);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <h4 className="text-sm font-semibold text-gray-800 capitalize">
                                {firstDay.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                              </h4>
                              <button
                                onClick={() => {
                                  if (calendarMonth === 11) {
                                    setCalendarMonth(0);
                                    setCalendarYear(calendarYear + 1);
                                  } else {
                                    setCalendarMonth(calendarMonth + 1);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 gap-1 p-3 pb-1 bg-gray-50">
                              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                                <div 
                                  key={day} 
                                  className={`text-center text-xs font-medium py-1 ${
                                    index === 3 ? 'text-blue-600 font-bold' : 'text-gray-500'
                                  }`}
                                >
                                  {day}
                                </div>
                              ))}
                            </div>
                            
                            {/* Calendario */}
                            <div className="grid grid-cols-7 gap-1 p-3 pt-0">
                              {days.map((day, dayIndex) => {
                                if (day === null) {
                                  return <div key={dayIndex} className="h-8 w-8"></div>;
                                }
                                
                                const date = new Date(calendarYear, calendarMonth, day);
                                const dateStr = date.toISOString().split('T')[0];
                                const isThursdayDay = isThursday(date);
                                const isAvailable = isDateAvailable(date);
                                const isSelected = orderDispatchDate === dateStr;
                                const isPast = date < today;
                                const isToday = date.toDateString() === today.toDateString();
                                const isBlocked = blockedDates.includes(dateStr);
                                
                                let buttonClass = 'h-8 w-8 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center relative ';
                                
                                if (isSelected) {
                                  buttonClass += 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 shadow-lg cursor-pointer';
                                } else if (isAvailable && isThursdayDay) {
                                  buttonClass += 'border border-blue-500 text-blue-600 hover:border-blue-600 cursor-pointer font-bold hover:bg-blue-50 bg-white';
                                } else if (isToday) {
                                  buttonClass += 'border-2 border-gray-500 text-gray-600 font-bold bg-white';
                                } else if (isPast) {
                                  buttonClass += 'text-gray-400 cursor-default';
                                } else {
                                  buttonClass += 'text-gray-500 cursor-default';
                                }
                              
                                return (
                                  <button
                                    key={dayIndex}
                                    onClick={() => {
                                      if (isAvailable && isThursdayDay) {
                                        setOrderDispatchDate(dateStr);
                                        setShowOrderCalendar(false);
                                        localStorage.setItem('selectedDispatchDate', dateStr);
                                      }
                                    }}
                                    disabled={!isAvailable || !isThursdayDay}
                                    className={buttonClass}
                                    title={
                                      isBlocked ? 'Fecha bloqueada por administrador' :
                                      !isThursdayDay ? 'Solo despachamos los jueves' :
                                      isPast ? 'Fecha pasada' :
                                      isAvailable ? 'Fecha disponible para despacho' :
                                      'Fecha no disponible'
                                    }
                                  >
                                    {day}
                                    {isThursdayDay && !isSelected && isAvailable && (
                                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full"></div>
                                    )}
                                    {isSelected && (
                                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Leyenda profesional */}
                    <div className="bg-gray-50 p-3 border-t">
                      <div className="flex items-center justify-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border-2 border-gray-500 rounded bg-white"></div>
                          <span className="text-gray-600">Hoy</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border border-blue-500 rounded bg-white"></div>
                          <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-600 rounded ring-2 ring-blue-300"></div>
                          <span className="text-gray-600 font-medium">Seleccionada</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-gray-300 rounded"></div>
                          <span className="text-gray-600">No disponible</span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">
                        Solo despachamos los jueves de 9:00 a 18:00 hrs
                      </p>
                    </div>
                  </div>
                )}

                {orderDispatchDate && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Despacho confirmado para: {
                            new Date(orderDispatchDate).toLocaleDateString('es-CL', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          }
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Entregaremos tu pedido entre las 9:00 AM y 6:00 PM
                        </p>
                        <button
                          onClick={() => setShowOrderCalendar(true)}
                          className="text-xs text-green-700 hover:text-green-800 underline mt-1 font-medium"
                        >
                          Cambiar fecha
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-black">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold text-black">
                    {envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-CL')}`}
                  </span>
                </div>
                {envio === 0 && subtotal > 100000 && (
                  <p className="text-xs text-green-600">¡Envío gratis por compras sobre $100.000!</p>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="font-semibold text-black">${total.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

              {/* Botón de pago */}
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    `Pagar $${total.toLocaleString('es-CL')}`
                  )}
                </button>

                {/* Métodos de pago */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-3">
                    <Image
                      src="/assets/images/Logotipo/logo_tbk.svg"
                      alt="Transbank"
                      width={100}
                      height={40}
                      className="h-10 w-auto"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Pago 100% seguro con Webpay Plus
                    </p>
                    <p className="text-xs text-gray-500">
                      Serás redirigido a la plataforma de Transbank para completar tu pago de forma segura.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para editar ubicación */}
        {showLocationEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Establecer Ubicación Manual</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => {
                      const region = e.target.value;
                      setFormData(prev => ({ ...prev, region, comuna: '' }));
                    }}
                    value={formData.region}
                  >
                    <option value="">Selecciona una región</option>
                    {regionesChile.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFormData(prev => ({ ...prev, comuna: e.target.value }))}
                    value={formData.comuna}
                  >
                    <option value="">Selecciona una comuna</option>
                    {formData.region && comunasPorRegion[formData.region] ? 
                      comunasPorRegion[formData.region].map((comuna) => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      )) : null
                    }
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleSetManualLocation(formData.region, formData.comuna)}
                    disabled={!formData.region || !formData.comuna}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setShowLocationEditor(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-16 border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">OBRAEXPRESS</h2>
                <p className="text-sm text-gray-600">Materiales de construcción</p>
              </div>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-sm">
                Plataforma especializada en materiales de construcción que desarrolladores y equipos de obra necesitan. Especialistas en policarbonato y soluciones constructivas innovadoras.
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-3 mb-6">
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-gentle-pulse"></div>
                <span className="text-sm font-medium text-gray-700">GPS logística de vanguardia</span>
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Productos</h3>
              <ul className="space-y-3">
                <li><a href="/productos?categoria=Policarbonato Alveolar" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Alveolar</a></li>
                <li><a href="/productos?categoria=Policarbonato Ondulado" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Ondulado</a></li>
                <li><a href="/productos?categoria=Policarbonato Compacto" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Compacto</a></li>
                <li><a href="/productos?categoria=Perfiles y Accesorios" className="text-sm hover:text-blue-600 transition-colors">Perfiles y Accesorios</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><Link href="/nosotros" className="text-sm hover:text-blue-600 transition-colors">Acerca de OBRAEXPRESS</Link></li>
                <li><Link href="/productos" className="text-sm hover:text-blue-600 transition-colors">Catálogo</Link></li>
                <li><Link href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</Link></li>
                <li><Link href="/cotizador-detallado" className="text-sm hover:text-blue-600 transition-colors">Cotizador IA</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Soporte</h3>
              <ul className="space-y-3">
                <li><a href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</a></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Documentación</span></li>
              </ul>
              
              {/* Quality Rating */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Calidad</h3>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-600">Máxima calidad</p>
                
                {/* Certifications */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Certificaciones</h4>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-medium">UV 10</span>
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-medium">ISO 9001</span>
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-medium">CE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">© 2024 ObraExpress. Todos los derechos reservados.</p>
              </div>
              <div className="flex items-center space-x-6 text-xs">
                <a href="/terminos" className="text-gray-400 hover:text-gray-600 transition-colors">Términos de Servicio</a>
                <a href="/privacidad" className="text-gray-400 hover:text-gray-600 transition-colors">Política de Privacidad</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
