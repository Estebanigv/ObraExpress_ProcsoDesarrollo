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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Estados para productos recomendados
  const [productos, setProductos] = useState<any[]>([]);
  const [productosLoading, setProductosLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});

  // Estados para geolocalización
  const { location, requestLocation, clearLocation, setManualLocation } = useGeolocation();

  // Comunas de la Región Metropolitana (52 comunas)
  const comunasRM = [
    'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 
    'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 
    'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 
    'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 
    'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Padre Hurtado', 
    'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 
    'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 
    'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 
    'San Miguel', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura',
    'Melipilla', 'María Pinto', 'Lampa', 'Til Til'
  ];

  // Función para cargar productos recomendados
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setProductosLoading(true);
        console.log('🔄 Cargando productos recomendados...');
        
        const response = await fetch('/api/productos-publico');
        const data = await response.json();
        
        console.log('📊 Respuesta API productos:', {
          success: data.success,
          hasData: !!data.data,
          hasProductosPorCategoria: !!data.data?.productos_por_categoria
        });
        
        if (data.success && data.data?.productos_por_categoria) {
          const todosLosProductos: any[] = [];
          
          Object.entries(data.data.productos_por_categoria).forEach(([categoria, productos]: [string, any]) => {
            if (Array.isArray(productos)) {
              productos.forEach((producto: any) => {
                if (producto.disponible_en_web && producto.stock > 0) {
                  console.log('✅ Producto agregado:', {
                    id: producto.id,
                    nombre: producto.nombre,
                    categoria,
                    precio: producto.precio
                  });
                  
                  todosLosProductos.push({
                    ...producto,
                    categoria
                  });
                }
              });
            }
          });

          // Mezclar productos y tomar los primeros 6 como recomendados
          const productosRecomendados = todosLosProductos
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);

          console.log('🎯 Productos recomendados finales:', productosRecomendados.length);
          setProductos(productosRecomendados);
        }
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
      } finally {
        setProductosLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // Función para manejar cambio de variantes
  const handleVariantChange = (productId: string, variant: any) => {
    console.log('🔄 Cambiando variante:', { productId, variant });
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variant
    }));
  };

  // Función para agregar producto al carrito
  const handleAddToCart = (producto: any) => {
    const selectedVariant = selectedVariants[producto.id];
    
    console.log('🛒 Agregando al carrito:', {
      producto: producto.nombre,
      selectedVariant: selectedVariant,
      hasVariantes: producto.variantes?.length > 0
    });

    if (!selectedVariant && producto.variantes?.length > 0) {
      alert('Por favor selecciona una variante del producto');
      return;
    }

    const variant = selectedVariant || producto.variantes?.[0] || producto;

    const cartItem = {
      id: `${producto.id}-${variant.id || 'default'}-${Date.now()}`,
      tipo: 'producto' as const,
      nombre: producto.nombre,
      descripcion: producto.descripcion || `${producto.categoria} - ${producto.nombre}`,
      imagen: getProductImage(producto.categoria),
      especificaciones: [
        ...(variant.espesor ? [`Espesor: ${variant.espesor}`] : []),
        ...(variant.color ? [`Color: ${variant.color}`] : []),
        ...(variant.ancho ? [`Ancho: ${variant.ancho}cm`] : []),
        ...(variant.largo ? [`Largo: ${variant.largo}cm`] : []),
      ].filter(Boolean),
      cantidad: 1,
      precioUnitario: variant.precio || producto.precio || 0,
      total: variant.precio || producto.precio || 0,
      
      // Propiedades adicionales del variant
      espesor: variant.espesor,
      color: variant.color,
      ancho: variant.ancho,
      largo: variant.largo,
    };

    console.log('✅ Item del carrito creado:', cartItem);

    // Agregar al carrito
    addItem(cartItem);
    alert(`${producto.nombre} agregado al carrito`);
  };

  // Función para obtener imagen del producto
  const getProductImage = (categoria: string) => {
    const imagenes: Record<string, string> = {
      'Policarbonato': '/assets/images/Productos Destacados/policarbonato-alveolar.jpg',
      'Perfiles Alveolar': '/assets/images/Productos Destacados/perfil-u.jpg',
      'default': '/assets/images/Productos Destacados/policarbonato-alveolar.jpg'
    };
    return imagenes[categoria] || imagenes.default;
  };

  // Efecto para autocompletar dirección con geolocalización
  useEffect(() => {
    if (location && location.latitude !== 0 && location.longitude !== 0) {
      console.log('🌍 Geocodificando coordenadas:', { lat: location.latitude, lng: location.longitude });
      
      const geocodeCoordinates = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            const address = data.display_name;
            console.log('📍 Dirección obtenida:', address);
            
            setFormData(prev => ({
              ...prev,
              direccion: address,
              region: location.region,
              comuna: location.comuna,
              coordenadas: {
                lat: location.latitude,
                lng: location.longitude
              }
            }));
          }
        } catch (error) {
          console.error('❌ Error en geocodificación:', error);
        }
      };

      geocodeCoordinates();
    }
  }, [location]);

  // Función para alternar expansión de items del carrito
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.region.trim()) {
      newErrors.region = 'La región es requerida';
    }
    if (!formData.comuna.trim()) {
      newErrors.comuna = 'La comuna es requerida';
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para procesar pago
  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    if (state.items.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: state.items,
        customer: formData,
        total: state.total,
        subtotal: state.total,
        tax: 0,
        shipping: 0
      };

      const result = await TransbankService.initTransaction(orderData);
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-2xl font-bold text-gray-900 hover:text-red-600 transition-colors"
            >
              OBRAEXPRESS
            </Link>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Inicio</Link>
              <span className="text-gray-400">/</span>
              <Link href="/productos" className="text-gray-500 hover:text-gray-700">Productos</Link>
              <span className="text-gray-400">/</span>
              <span className="text-red-600 font-medium">Checkout</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal: Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Información de Compra</h1>
              
              <form className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">👤 Información Personal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.nombre ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa tu nombre completo"
                      />
                      {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.telefono ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+56 9 1234 5678"
                      />
                      {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa (Opcional)
                      </label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Entrega */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">🚚 Información de Entrega</h2>
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Detectar ubicación</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                        Región *
                      </label>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.region ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Región Metropolitana">Región Metropolitana</option>
                      </select>
                      {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-2">
                        Comuna *
                      </label>
                      <select
                        id="comuna"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.comuna ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecciona una comuna</option>
                        {comunasRM.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                      </select>
                      {errors.comuna && <p className="text-red-500 text-sm mt-1">{errors.comuna}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.direccion ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Calle, número, depto/casa"
                      />
                      {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                        Comentarios Adicionales
                      </label>
                      <textarea
                        id="comentarios"
                        name="comentarios"
                        value={formData.comentarios}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Instrucciones especiales de entrega, referencias, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">💳 Método de Pago</h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Webpay Plus</p>
                        <p className="text-sm text-gray-500">Pago seguro con tarjeta de débito o crédito</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs font-medium text-gray-600 bg-red-100 px-2 py-1 rounded">TRANSBANK</span>
                      <span className="text-xs font-medium text-gray-600 bg-blue-100 px-2 py-1 rounded">VISA</span>
                      <span className="text-xs font-medium text-gray-600 bg-orange-100 px-2 py-1 rounded">MASTERCARD</span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Serás redirigido a Webpay Plus de forma segura.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Columna lateral: Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Resumen del Pedido</h2>
              
              {/* Items del carrito */}
              {state.items.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50">
                        {item.imagen && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <CartThumbnail
                              src={item.imagen}
                              alt={item.nombre}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.nombre}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Cantidad: {item.cantidad}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="text-sm font-medium">{item.cantidad}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-green-600">
                                ${(item.total || 0).toLocaleString('es-CL')} 
                                <span className="text-xs font-normal text-green-500 ml-1">IVA incluido</span>
                              </p>
                              
                              <button
                                onClick={() => toggleItemExpansion(item.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Ver detalle del producto"
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${expandedItems[item.id] ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors"
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

                      {/* Detalle expandible del producto */}
                      {expandedItems[item.id] && (
                        <div className="p-4 bg-white border-t border-gray-100">
                          <button
                            onClick={() => toggleItemExpansion(item.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm mb-3 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Detalle del producto
                          </button>
                          
                          {/* Descripción del producto */}
                          {item.descripcion && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Descripción:</p>
                              <p className="text-xs text-gray-700">{item.descripcion}</p>
                            </div>
                          )}

                          {/* Especificaciones */}
                          {item.especificaciones && item.especificaciones.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Especificaciones:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.especificaciones.map((spec, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Información adicional */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {item.espesor && (
                              <div>
                                <span className="font-medium text-gray-600">Espesor:</span>
                                <span className="ml-1 text-gray-700">{item.espesor}</span>
                              </div>
                            )}
                            {item.color && (
                              <div>
                                <span className="font-medium text-gray-600">Color:</span>
                                <span className="ml-1 text-gray-700">{item.color}</span>
                              </div>
                            )}
                            {item.ancho && (
                              <div>
                                <span className="font-medium text-gray-600">Ancho:</span>
                                <span className="ml-1 text-gray-700">{item.ancho}cm</span>
                              </div>
                            )}
                            {item.largo && (
                              <div>
                                <span className="font-medium text-gray-600">Largo:</span>
                                <span className="ml-1 text-gray-700">{item.largo}cm</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No hay productos en el carrito</p>
                </div>
              )}

              {/* Información del Cliente */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">📋 Información de Entrega</h3>
                
                {formData.nombre && (
                  <div className="text-xs text-gray-600 mb-2">
                    <span className="font-medium">Cliente:</span> {formData.nombre}
                  </div>
                )}
                
                {formData.region && formData.comuna && (
                  <div className="text-xs text-gray-600 mb-2">
                    <span className="font-medium">Ubicación:</span> {formData.comuna}, {formData.region}
                  </div>
                )}
                
                {formData.direccion && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Dirección:</span> {formData.direccion}
                  </div>
                )}
                
                {location && location.region && (
                  <div className="text-xs text-green-600 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Ubicación detectada: {location.region}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-black">${state.total.toLocaleString('es-CL')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span className="text-black">Total:</span>
                  <span className="text-black">${state.total.toLocaleString('es-CL')}</span>
                </div>
              </div>

              {/* Botón de Pago */}
              <button
                onClick={handleCheckout}
                disabled={isLoading || state.items.length === 0}
                className="w-full mt-6 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  `Proceder al Pago - $${state.total.toLocaleString('es-CL')}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Tu información está protegida con encriptación SSL de 256 bits
              </p>
            </div>
          </div>
        </div>

        {/* Productos Recomendados */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            🏗️ Productos Recomendados
          </h2>
          
          {productosLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos recomendados...</p>
            </div>
          ) : productos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <CartThumbnail
                      src={getProductImage(product.categoria)}
                      alt={product.nombre}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                        {product.categoria}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{product.nombre}</h3>
                    
                    {product.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        Descripción breve del producto
                      </p>
                    )}

                    {/* Variantes del Producto */}
                    {product.variantes && product.variantes.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {/* Selector de Espesor */}
                        {[...new Set(product.variantes.map((v: any) => v.espesor))].filter(Boolean).length > 1 && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Espesor:
                            </label>
                            <div className="grid grid-cols-3 gap-1">
                              {[...new Set(product.variantes.map((v: any) => v.espesor))].filter(Boolean).map((espesor: string) => (
                                <button
                                  key={espesor}
                                  onClick={() => {
                                    const variant = product.variantes.find((v: any) => v.espesor === espesor);
                                    if (variant) handleVariantChange(product.id, variant);
                                  }}
                                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                                    selectedVariants[product.id]?.espesor === espesor 
                                      ? 'border-red-500 bg-red-50 text-red-700 font-medium' 
                                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                  }`}
                                >
                                  {espesor}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selector de Color */}
                        {[...new Set(product.variantes.map((v: any) => v.color))].filter(Boolean).length > 1 && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Color:
                            </label>
                            <div className="grid grid-cols-3 gap-1">
                              {[...new Set(product.variantes.map((v: any) => v.color))].filter(Boolean).map((color: string) => (
                                <button
                                  key={color}
                                  onClick={() => {
                                    const variant = product.variantes.find((v: any) => v.color === color);
                                    if (variant) handleVariantChange(product.id, variant);
                                  }}
                                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                                    selectedVariants[product.id]?.color === color 
                                      ? 'border-red-500 bg-red-50 text-red-700 font-medium' 
                                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                  }`}
                                >
                                  {color}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          ${((selectedVariants[product.id]?.precio || product.precio || 0)).toLocaleString('es-CL')}
                          <span className="text-xs font-normal text-green-500 ml-1">IVA incluido</span>
                        </p>
                        {product.stock && (
                          <p className="text-xs text-gray-500">
                            Stock: {product.stock}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => toggleItemExpansion(`product-${product.id}`)}
                        className="w-full text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Detalle del producto
                      </button>
                      
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-gray-600">No se pudieron cargar los productos recomendados</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer igual a la página principal */}
      <footer className="bg-white text-gray-600 py-16 border-t border-gray-200">
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
                <li><a href="/productos?categoria=Rollos" className="text-sm hover:text-blue-600 transition-colors">Rollos</a></li>
                <li><a href="/productos?categoria=Perfiles y Accesorios" className="text-sm hover:text-blue-600 transition-colors">Perfiles y Accesorios</a></li>
                <li><a href="/productos?categoria=Pinturas" className="text-sm hover:text-blue-600 transition-colors">Pinturas y Selladores</a></li>
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
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Trabaja con nosotros</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Solicitar Features</span></li>
              </ul>
            </div>
            
            {/* Partner with us */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Asociarse con nosotros</h3>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Ser Distribuidor</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Programa de Afiliados</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Inversionistas</span></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Soporte</h3>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Documentación</span></li>
                <li><a href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</a></li>
              </ul>
              
              {/* Quality Rating */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Calidad</h3>
                <div className="flex items-center space-x-1 mb-2">
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700 ml-2">4.8</span>
                </div>
                <p className="text-xs text-gray-500">Basado en 127 reseñas verificadas</p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                {/* Footer Links */}
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <li><Link href="/" className="text-gray-600 hover:text-blue-600">Inicio</Link></li>
                    <li><Link href="/productos" className="text-gray-600 hover:text-blue-600">Productos</Link></li>
                    <li><Link href="/nosotros" className="text-gray-600 hover:text-blue-600">Nosotros</Link></li>
                    <li><Link href="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</Link></li>
                  </div>
                </div>
                
                {/* Version & Build Info */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    v2.1.0
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Build 847
                  </span>
                </div>
              </div>

              {/* Copyright & Legal */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                <p className="text-sm text-gray-500">
                  © 2024 OBRAEXPRESS. Todos los derechos reservados.
                </p>
                
                {/* Legal Links */}
                <div className="flex space-x-4 text-xs">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <li><Link href="/politica-privacidad" className="text-gray-600 hover:text-blue-600">Privacidad</Link></li>
                    <li><Link href="/terminos-condiciones" className="text-gray-600 hover:text-blue-600">Términos</Link></li>
                    <li><Link href="/politica-cookies" className="text-gray-600 hover:text-blue-600">Cookies</Link></li>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom Legal */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-xs text-gray-500 text-center sm:text-left max-w-2xl">
                OBRAEXPRESS es una plataforma de comercio electrónico especializada en materiales de construcción. 
                Nos reservamos el derecho de modificar precios y disponibilidad sin previo aviso.
              </p>
              <div className="flex space-x-4 text-xs">
                <Link href="/politica-privacidad" className="text-gray-500 hover:text-blue-600 transition-colors">Política de Privacidad</Link>
                <Link href="/terminos-condiciones" className="text-gray-500 hover:text-blue-600 transition-colors">Términos</Link>
                <Link href="/politica-cookies" className="text-gray-500 hover:text-blue-600 transition-colors">Cookies</Link>
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