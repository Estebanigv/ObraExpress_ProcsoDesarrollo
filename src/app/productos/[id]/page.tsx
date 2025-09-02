"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import { ProductImage } from '@/components/optimized-image';
import { useCart } from '@/contexts/CartContext';

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  uso: string;
  stock: number;
  ancho: string;
  largo: string;
}

interface ProductGroup {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  variantes: ProductVariant[];
  colores: string[];
  precio_desde: number;
  stock_total: number;
  variantes_count: number;
  imagen: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [productos, setProductos] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para la configuración del producto
  const [selectedEspesor, setSelectedEspesor] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedDimensiones, setSelectedDimensiones] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(10);
  // Removido selectedDeliveryOption ya que solo hay entregas los jueves
  
  const productId = params.id as string;
  
  // Cargar datos de productos
  useEffect(() => {
    const loadProductData = async () => {
      try {
        const response = await fetch('/api/productos-publico');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const productosArray: ProductGroup[] = [];
            Object.values(result.data.productos_por_categoria || {}).forEach((categoria: any) => {
              productosArray.push(...categoria);
            });
            setProductos(productosArray);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, []);
  
  // Encontrar el producto por ID
  const productoData = productos.find(p => p.id === productId);
  
  const producto = productoData ? {
    ...productoData,
    imagen: (() => {
      if (productoData.nombre.includes('Ondulado')) {
        return "/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp";
      } else if (productoData.nombre.includes('Alveolar')) {
        return "/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar.webp";
      } else if (productoData.nombre.includes('Compacto')) {
        return "/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto.webp";
      }
      return '';
    })()
  } : null;

  // Opciones disponibles
  const opciones = useMemo(() => {
    if (!producto) return { espesores: [], colores: [], dimensiones: [] };
    return {
      espesores: [...new Set(producto.variantes.map(v => v.espesor))].sort(),
      colores: [...new Set(producto.variantes.map(v => v.color))].sort(),
      dimensiones: [...new Set(producto.variantes.map(v => v.dimensiones))].sort(),
    };
  }, [producto]);

  // Variante seleccionada
  const selectedVariant = useMemo(() => {
    if (!producto || !selectedEspesor || !selectedColor || !selectedDimensiones) return null;
    return producto.variantes.find(v => 
      v.espesor === selectedEspesor && 
      v.color === selectedColor && 
      v.dimensiones === selectedDimensiones
    ) || null;
  }, [producto, selectedEspesor, selectedColor, selectedDimensiones]);

  // Calcular fecha de entrega (solo jueves)
  const deliveryInfo = useMemo(() => {
    const today = new Date();
    let deliveryDate = new Date(today);
    
    // Encontrar el próximo jueves (día 4 de la semana, siendo 0 domingo)
    const todayWeekday = today.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sábado
    let daysUntilThursday = 4 - todayWeekday; // 4 = jueves
    
    // Si es jueves y ya pasaron las horas de despacho (ejemplo: después de las 14:00)
    // o si ya es viernes, sábado, domingo, lunes, martes o miércoles
    if (daysUntilThursday <= 0 || (todayWeekday === 4 && today.getHours() >= 14)) {
      daysUntilThursday += 7; // Próximo jueves
    }
    
    deliveryDate.setDate(today.getDate() + daysUntilThursday);
    
    const deliveryText = 'Entrega jueves';
    const deliveryPrice = 0; // Envío gratuito solo los jueves

    return {
      date: deliveryDate.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).replace('jueves', 'Jueves'),
      text: deliveryText,
      price: deliveryPrice,
      isFree: true
    };
  }, []); // Sin dependencias ya que siempre será jueves

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-32 pb-20 container mx-auto px-6 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido movido.</p>
            <button
              onClick={() => router.push('/productos')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Ver todos los productos
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem({
        id: selectedVariant.codigo,
        name: selectedVariant.nombre,
        price: selectedVariant.precio_con_iva,
        quantity: cantidad,
        image: producto.imagen,
        variant: {
          espesor: selectedVariant.espesor,
          color: selectedVariant.color,
          dimensiones: selectedVariant.dimensiones
        }
      });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <NavbarSimple />
      
      <div className="pt-44 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Breadcrumbs */}
          <div className="mb-8">
            <nav className="flex items-center text-sm text-gray-500">
              <span>Categorías</span>
              <span className="mx-2">/</span>
              <span>Construcción</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{producto.nombre}</span>
            </nav>
          </div>

          {/* Layout Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Imagen del Producto */}
            <div className="">
              <div className="relative">
                {/* Imagen principal */}
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4">
                  <ProductImage
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Miniaturas */}
                <div className="flex space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-20 h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      i === 1 ? 'border-blue-500' : 'border-transparent'
                    }`}>
                      <ProductImage
                        src={producto.imagen}
                        alt={`Vista ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Proyectos Realizados */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Realizados</h3>
                  <p className="text-gray-600 text-sm mb-4">Instalaciones profesionales con Policarbonato Alveolar</p>
                  <div className="space-y-4">
                    <div 
                      className="aspect-video bg-gray-200 rounded-xl overflow-hidden cursor-pointer group"
                      onMouseEnter={(e) => {
                        const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                        if (img) img.src = '/assets/images/Trabajos/Cubierta de terraza policarbonato alveolar_111.webp';
                      }}
                      onMouseLeave={(e) => {
                        const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                        if (img) img.src = '/assets/images/Trabajos/Cubierta de terraza policarbonato alveolar_1.webp';
                      }}
                    >
                      <img 
                        src="/assets/images/Trabajos/Cubierta de terraza policarbonato alveolar_1.webp" 
                        alt="Cubierta de terraza con policarbonato alveolar"
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div 
                      className="aspect-video bg-gray-200 rounded-xl overflow-hidden cursor-pointer group"
                      onMouseEnter={(e) => {
                        const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                        if (img) img.src = '/assets/images/Trabajos/piscina cubierta con policarbonato alveolar_11.webp';
                      }}
                      onMouseLeave={(e) => {
                        const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                        if (img) img.src = '/assets/images/Trabajos/piscina cubierta con policarbonato alveolar_1.webp';
                      }}
                    >
                      <img 
                        src="/assets/images/Trabajos/piscina cubierta con policarbonato alveolar_1.webp" 
                        alt="Piscina cubierta con policarbonato alveolar"
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurador del Producto */}
            <div className="">
              <div className="">
                
                {/* Nuevo Producto Badge */}
                <div className="mb-4">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Nuevo Producto
                  </span>
                </div>
                
                {/* Título y Rating */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{producto.nombre}</h1>
                  
                  {/* Descripción detallada */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-base leading-relaxed">
                      {producto.descripcion || `${producto.tipo} de alta calidad con garantía extendida y protección UV incluida.`}
                    </p>
                  </div>
                  
                  {selectedVariant && (
                    <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                      <strong>SKU:</strong> {selectedVariant.codigo}
                      {selectedVariant.descripcion && selectedVariant.descripcion !== selectedVariant.nombre && (
                        <div className="mt-1 text-xs text-gray-500">{selectedVariant.descripcion}</div>
                      )}
                    </div>
                  )}
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium">(4.8)</span>
                    <span className="text-sm text-gray-500">Basado en {producto.variantes_count || 0} variantes</span>
                  </div>
                  
                  {/* Stock info mejorado */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className={`flex items-center ${
                      producto.stock_total > 10 ? 'text-green-600' : 
                      producto.stock_total > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        producto.stock_total > 10 ? 'bg-green-500' : 
                        producto.stock_total > 0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      {producto.stock_disponible || (producto.stock_total > 10 ? 'Disponible' : 'Stock limitado')}
                    </div>
                    <div className="text-gray-600">
                      {producto.colores_disponibles || opciones.colores.length} colores • {producto.dimensiones_disponibles || opciones.dimensiones.length} tamaños
                    </div>
                  </div>
                  
                  {/* Usos principales */}
                  {producto.usos_principales && producto.usos_principales.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Aplicaciones principales:</p>
                      <div className="flex flex-wrap gap-2">
                        {producto.usos_principales.map((uso, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {uso}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Precio */}
                <div className="mb-8">
                  {selectedVariant ? (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                      <div className="flex items-baseline space-x-3 mb-2">
                        <span className="text-4xl font-bold text-green-900">
                          ${selectedVariant.precio_con_iva.toLocaleString()}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm text-green-700 font-medium">IVA incluido</span>
                          {selectedVariant.precio_neto && (
                            <span className="text-xs text-green-600">
                              Neto: ${selectedVariant.precio_neto.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Precio competitivo • {selectedVariant.garantia || '10 años de garantía'}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="text-2xl text-gray-500 mb-2">Selecciona opciones</div>
                        <div className="text-sm text-gray-400">
                          Desde ${producto.precio_desde?.toLocaleString() || 0} hasta ${producto.precio_maximo?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Colores disponibles */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Colores disponibles</h3>
                  <div className="flex space-x-6">
                    {opciones.colores.map((color) => {
                      const colorMap: { [key: string]: string } = {
                        'Transparente': 'bg-blue-100 border-blue-300',
                        'Bronce': 'bg-amber-600 border-amber-700', 
                        'Opal': 'bg-gray-300 border-gray-400',
                        'Cristal': 'bg-blue-50 border-blue-200'
                      };
                      
                      return (
                        <div key={color} className="flex flex-col items-center">
                          <button
                            onClick={() => setSelectedColor(color)}
                            className={`w-12 h-12 rounded-full border-2 relative mb-2 ${
                              colorMap[color] || 'bg-gray-200 border-gray-300'
                            } ${
                              selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                            }`}
                            title={color}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                          <span className="text-xs text-gray-600 text-center">{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tamaños disponibles */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tamaños disponibles</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {opciones.dimensiones.slice(0, 4).map((dimension) => (
                      <button
                        key={dimension}
                        onClick={() => setSelectedDimensiones(dimension)}
                        className={`p-3 text-center border rounded-lg font-medium transition-all ${
                          selectedDimensiones === dimension
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {dimension}
                      </button>
                    ))}
                  </div>
                  
                  {opciones.dimensiones.length > 4 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setSelectedDimensiones(opciones.dimensiones[4])}
                        className={`w-full p-3 text-center border rounded-lg font-medium transition-all ${
                          selectedDimensiones === opciones.dimensiones[4]
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {opciones.dimensiones[4]}
                      </button>
                    </div>
                  )}
                </div>

                {/* Espesores disponibles */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Espesores disponibles</h3>
                  <div className="flex space-x-3">
                    {opciones.espesores.map((espesor) => (
                      <button
                        key={espesor}
                        onClick={() => setSelectedEspesor(espesor)}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          selectedEspesor === espesor
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {espesor}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedEspesor && `Espesor seleccionado: ${selectedEspesor}`}
                  </div>
                  
                  {/* Más espesores */}
                  <div className="mt-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 font-medium">
                      10mm
                    </button>
                  </div>
                </div>

                {/* Fecha de entrega */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fecha de entrega</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-semibold text-green-900">Próxima entrega:</div>
                          <div className="text-green-700">{deliveryInfo.date}</div>
                          <div className="text-sm text-green-600 mt-1">
                            Horario: 9:00 - 18:00 hrs
                          </div>
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Cambiar fecha
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Pedido mínimo */}
                <div className="mb-8">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-orange-800">
                      Pedido mínimo: 10 unidades
                    </span>
                  </div>
                </div>
                
                {/* Selector de Cantidad y Botón de Compra */}
                <div className="flex items-center space-x-4 mb-8">
                  {/* Selector de Cantidad */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setCantidad(Math.max(10, cantidad - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l-lg"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <div className="w-16 h-10 flex items-center justify-center border-l border-r border-gray-300">
                      <span className="text-lg font-semibold text-gray-900">{cantidad}</span>
                    </div>
                    <button
                      onClick={() => setCantidad(cantidad + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-lg"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Botón de Compra */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant}
                    className={`flex-1 h-10 px-6 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                      selectedVariant
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span>
                      {selectedVariant 
                        ? `Agregar al carrito de compra - $${((selectedVariant?.precio_con_iva || 0) * cantidad).toLocaleString()}`
                        : 'Completa tu selección'
                      }
                    </span>
                  </button>
                </div>

                {/* Características del producto */}
                {producto.caracteristicas && producto.caracteristicas.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Características principales</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {producto.caracteristicas.map((caracteristica, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{caracteristica}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Información adicional mejorada */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-blue-600 text-2xl mb-2">✓</div>
                    <div className="text-sm font-semibold text-blue-900">Garantía</div>
                    <div className="text-sm text-blue-700">{selectedVariant?.garantia || producto.caracteristicas?.find(c => c.includes('años')) || '10 años'}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-green-600 text-2xl mb-2">☀️</div>
                    <div className="text-sm font-semibold text-green-900">Protección UV</div>
                    <div className="text-sm text-green-700">
                      {selectedVariant?.uv_protection ? 'Incluida' : 'Disponible'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <div className="text-amber-600 text-2xl mb-2">📋</div>
                    <div className="text-sm font-semibold text-amber-900">Variantes</div>
                    <div className="text-sm text-amber-700">{producto.total_variantes || producto.variantes_count} disponibles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}