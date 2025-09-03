"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import ProductConfiguratorSimple from '@/modules/products/components/product-configurator-simple';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationSelector } from '@/components/location-selector';
import Link from 'next/link';
import { ProductErrorBoundary } from '@/components/ErrorBoundary';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precio: number;
  imagen: string;
  especificaciones: {
    espesor?: string;
    colores?: string[];
    medidas?: string;
    variantes?: string;
    uv?: boolean;
    garantia?: string;
  };
  stock: number;
  nuevo?: boolean;
  descuento?: number;
  variantes_count?: number;
}

// Función para calcular próximo día hábil de despacho (jueves)
const getNextDeliveryDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Domingo, 4=Jueves
  
  let daysUntilThursday;
  if (dayOfWeek <= 2) { // Domingo, Lunes, Martes
    daysUntilThursday = 4 - dayOfWeek;
  } else { // Miércoles en adelante
    daysUntilThursday = 11 - dayOfWeek; // Próximo jueves
  }
  
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysUntilThursday);
  
  return nextThursday.toLocaleDateString('es-CL', { 
    weekday: 'long', 
    day: 'numeric',
    month: 'short'
  });
};

// Componente que maneja los search params
function ProductosContent() {
  const { location, requestLocation, clearLocation, setManualLocation } = useGeolocation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [ordenPor, setOrdenPor] = useState<string>('precio-desc');
  const [busqueda, setBusqueda] = useState<string>('');
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);
  const [fechaDespacho, setFechaDespacho] = useState<string>('');
  const [productosData, setProductosData] = useState<any>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Solicitar geolocalización al cargar
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Cargar datos de productos desde la API
  useEffect(() => {
    const loadProductsData = async () => {
      try {
        setIsLoadingProducts(true);
        console.log('🔄 Cargando productos desde Supabase API pública...');
        const response = await fetch('/api/productos-publico');
        
        if (response.ok) {
          const result = await response.json();
          console.log('🔄 DEBUG: Response result:', result);
          if (result.success) {
            setProductosData(result.data);
            console.log('✅ Productos cargados desde Supabase:', result.total);
            console.log('🔍 DEBUG: Categorías en result.data:', Object.keys(result.data.productos_por_categoria || {}));
          } else {
            console.error('❌ Error en API pública:', result.error);
            setProductosData({ productos_por_categoria: {}, productos_policarbonato: [] });
          }
        } else {
          console.error('❌ Error HTTP:', response.status);
          setProductosData({ productos_por_categoria: {}, productos_policarbonato: [] });
        }
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
        setProductosData({ productos_por_categoria: {}, productos_policarbonato: [] });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProductsData();
  }, []);

  // Efecto para aplicar filtros desde URL
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const fecha = searchParams.get('fecha');
    
    if (categoria) {
      setFiltroCategoria(categoria);
    }
    if (fecha) {
      setFechaDespacho(fecha);
    }
  }, [searchParams]);

  // Procesar datos de productos cargados desde API
  const productosAgrupados = useMemo(() => {
    if (!productosData) {
      return {
        productos_policarbonato: [],
        accesorios: []
      };
    }

    try {
      // Usar la estructura actualizada productos_por_categoria
      const productos_por_categoria = productosData.productos_por_categoria || {};
      
      // Mantener las categorías separadas
      const result = {};
      
      Object.entries(productos_por_categoria).forEach(([categoria, productos]) => {
        const productosFormateados = (productos as any[]).map(producto => {
          // Obtener la imagen desde la primera variante que tenga imagen
          const primeraVarianteConImagen = producto.variantes?.find(v => v.ruta_imagen);
          return {
            ...producto,
            imagen: primeraVarianteConImagen?.ruta_imagen || ''
          };
        });
        
        // Usar nombres de categoría normalizados para la clave PERO también mantener la clave original
        const categoriaKey = categoria.toLowerCase().replace(/\s+/g, '_');
        result[categoriaKey] = productosFormateados;
        result[categoria] = productosFormateados; // Mantener también la clave original
      });
      
      return {
        ...result,
        // Mantener compatibilidad con código legacy
        productos_policarbonato: result['policarbonato'] || [],
        accesorios: result['accesorios'] || []
      };
    } catch (error) {
      console.warn('Error procesando datos de productos:', error);
      return {
        productos_policarbonato: [],
        accesorios: []
      };
    }
  }, [productosData]);

  const productos = useMemo(() => {
    // Combinar productos de todas las categorías disponibles sin duplicar
    const productosUnicos = new Map();
    
    console.log('🔄 DEBUG: Procesando categorías:', Object.keys(productosAgrupados));
    
    // Agregar productos de cada categoría disponible (excepto productos_policarbonato que es legacy)
    Object.keys(productosAgrupados).forEach(key => {
      // Excluir claves legacy y duplicados normalizados  
      if (key !== 'productos_policarbonato' && key !== 'accesorios' && !key.includes('_')) {
        const categoria = productosAgrupados[key];
        if (Array.isArray(categoria)) {
          console.log(`✅ Agregando categoría ${key} con ${categoria.length} productos`);
          categoria.forEach(producto => {
            if (!productosUnicos.has(producto.id)) {
              productosUnicos.set(producto.id, producto);
            }
          });
        }
      }
    });
    
    // Solo agregar productos_policarbonato si no hay otras categorías (fallback)
    if (productosUnicos.size === 0 && productosAgrupados.productos_policarbonato) {
      console.log('✅ Usando productos_policarbonato como fallback');
      productosAgrupados.productos_policarbonato.forEach(producto => {
        if (!productosUnicos.has(producto.id)) {
          productosUnicos.set(producto.id, producto);
        }
      });
    }
    
    const result = Array.from(productosUnicos.values());
    console.log('🎯 Total productos únicos:', result.length);
    return result;
  }, [productosAgrupados]);


  // Obtener categorías únicas separando los tipos de policarbonato
  const todasLasCategorias = productos.flatMap(p => 
    p.variantes?.map(v => v.categoria).filter(Boolean) || [p.categoria]
  );
  const categoriasUnicas = Array.from(new Set(todasLasCategorias)).sort();
  const categorias = ['Todos', ...categoriasUnicas];

  // Filtrar y agrupar productos por categoría específica
  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Si se selecciona una categoría específica, agrupar todas las variantes de esa categoría
    if (filtroCategoria !== 'Todos') {
      // Crear un mapa para agrupar variantes por categoría específica
      const variantesPorCategoria = new Map();
      
      productos.forEach(producto => {
        if (producto.variantes) {
          producto.variantes.forEach(variante => {
            // Manejar tanto categorías específicas como "Policarbonatos" genérico
            const coincide = variante.categoria === filtroCategoria || 
                            (filtroCategoria === 'Policarbonatos' && variante.categoria?.includes('Policarbonato'));
            
            if (coincide) {
              if (!variantesPorCategoria.has(variante.categoria)) {
                variantesPorCategoria.set(variante.categoria, {
                  id: variante.categoria.toLowerCase().replace(/\s+/g, '-'),
                  nombre: variante.categoria,
                  descripcion: `Todas las variantes de ${variante.categoria}`,
                  categoria: variante.categoria,
                  variantes: [],
                  colores: new Set(),
                  imagen: producto.imagen,
                  precio_desde: Infinity,
                  stock_total: 0,
                  variantes_count: 0
                });
              }
              
              const grupo = variantesPorCategoria.get(variante.categoria);
              grupo.variantes.push(variante);
              grupo.colores.add(variante.color);
              grupo.precio_desde = Math.min(grupo.precio_desde, variante.precio_con_iva);
              grupo.stock_total += variante.stock;
              grupo.variantes_count++;
            }
          });
        }
      });

      // Convertir el mapa a array y convertir Set de colores a array
      resultado = Array.from(variantesPorCategoria.values()).map(grupo => ({
        ...grupo,
        colores: Array.from(grupo.colores)
      }));
    }
    // Si es "Todos", no aplicar filtros adicionales de categoría

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenPor) {
        case 'precio-asc':
          return a.precio_desde - b.precio_desde;
        case 'precio-desc':
          return b.precio_desde - a.precio_desde;
        case 'nombre':
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

    return resultado;
  }, [productos, busqueda, filtroCategoria, ordenPor]);


  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      <div className="pt-56 pb-20">
        <div className="container mx-auto px-6">
          {/* Banner de ubicación */}
          {(location && (location.comuna.includes('no determinada') || location.comuna.includes('Seleccione'))) && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-yellow-800">
                      📍 {location.comuna}, {location.region}
                    </div>
                    <div className="text-xs text-yellow-600">
                      {location.comuna.includes('no determinada') 
                        ? 'La ubicación detectada puede ser incorrecta' 
                        : 'Por favor, selecciona tu comuna específica'}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowLocationSelector(true)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Seleccionar Comuna
                  </button>
                  <button
                    onClick={clearLocation}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium rounded-md transition-colors"
                  >
                    Detectar Nuevamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal del selector de ubicación */}
          {showLocationSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <LocationSelector
                  currentLocation={location}
                  onLocationSelect={(region, comuna) => {
                    setManualLocation(region, comuna);
                    setShowLocationSelector(false);
                  }}
                  onCancel={() => setShowLocationSelector(false)}
                />
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-4 tracking-wide">
              Catálogo de Productos
            </h1>
            <p className="text-xl text-gray-600">
              Descubre nuestra amplia gama de productos de policarbonato y accesorios
            </p>
          </div>

          {/* Banner de fecha de despacho - Solo cuando hay fecha seleccionada */}
          {fechaDespacho && (
            <div className="mb-8 bg-white border-2 border-emerald-500 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        ✓ Confirmado
                      </span>
                      <span className="text-gray-900 font-bold text-lg">Fecha de despacho</span>
                    </div>
                    <div className="text-gray-700 text-sm font-medium">
                      {new Date(fechaDespacho + 'T00:00:00').toLocaleDateString('es-CL', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })} • 9:00 - 18:00 hrs
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const url = new URL(window.location);
                    url.searchParams.delete('fecha');
                    router.push(url.pathname + url.search);
                    setFechaDespacho('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-lg transition-colors"
                  title="Cambiar fecha de despacho"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Filtros - Optimizado para móvil */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8 mobile-spacing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mobile-grid">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 form-label-mobile">
                  <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar productos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 form-input-mobile touch-target"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 touch-target"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 form-label-mobile">
                  <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categoría
                </label>
                <div className="relative">
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 appearance-none bg-white form-input-mobile touch-target"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 form-label-mobile">
                  <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Ordenar por
                </label>
                <div className="relative">
                  <select
                    value={ordenPor}
                    onChange={(e) => setOrdenPor(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 appearance-none bg-white form-input-mobile touch-target"
                  >
                    <option value="precio-desc">Mayor a menor</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="nombre">Nombre A-Z</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Botón de limpiar filtros - Solo visible cuando hay filtros activos */}
            {(busqueda || filtroCategoria !== 'Todos' || ordenPor !== 'precio-desc') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroCategoria('Todos');
                    setOrdenPor('precio-desc');
                  }}
                  className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-target"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filtroCategoria !== 'Todos' ? (
                <>
                  Mostrando {productosFiltrados.length} configuración{productosFiltrados.length !== 1 ? 'es' : ''} de <span className="font-medium text-gray-800">{filtroCategoria}</span>
                  {busqueda && ` para "${busqueda}"`}
                  <br />
                  <span className="text-sm text-gray-500">
                    Cada configuración incluye todas las opciones de color, espesor y dimensiones disponibles
                  </span>
                </>
              ) : (
                <>
                  Mostrando {productosFiltrados.length} productos
                  {busqueda && ` para "${busqueda}"`}
                </>
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando productos actualizados...</p>
              </div>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-600 text-lg">No se encontraron productos</p>
            </div>
          ) : (
            <>
              {/* Grid de Productos Simplificado - Optimizado para móvil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8 mobile-grid items-start">
                {productosFiltrados.map((producto) => (
              <ProductConfiguratorSimple 
                key={producto.id}
                productGroup={producto}
                className="flex flex-col h-full w-full max-w-sm mx-auto sm:max-w-none"
              />
            ))}
          </div>
          </>
          )}
        </div>
      </div>
    </main>
  );
}

// Componente principal con Suspense
export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}