"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface ProductVariant {
  codigo: string;
  nombre: string;
  espesor: string;
  color: string;
  dimensiones: string;
  costo_proveedor: number;
  precio_neto: number;
  precio_con_iva: number;
  ganancia: number;
  margen_ganancia: string;
  stock: number;
  proveedor: string;
  categoria: string;
  disponible_en_web: boolean;
  tiene_imagen: boolean;
  ruta_imagen?: string;
  uso?: string;
  uv_protection?: boolean;
  garantia?: string;
}

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  descripcion?: string;
  variantes: ProductVariant[];
}

// Función para formatear las dimensiones con unidades claras
const formatDimension = (dimension: string): string => {
  const num = parseFloat(dimension);
  
  if (!isNaN(num)) {
    if (num < 0.01) {
      return `${(num * 1000).toFixed(0)}mm`;
    } else if (num < 1) {
      return `${(num * 100).toFixed(0)}cm`;
    } else {
      return `${num.toFixed(2)}m`;
    }
  }
  
  return dimension;
};

export default function InventarioPage() {
  // Updated: 2025-08-26 15:14
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProveedor, setSelectedProveedor] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductVariant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(null);
  
  // Estado para control de vista
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('obraexpress_admin_auth');
    if (adminAuth !== 'authenticated') {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);
    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/get-products-data');
      if (response.ok) {
        const data = await response.json();
        const allProducts: Product[] = [];
        
        Object.entries(data.productos_por_categoria || {}).forEach(([categoria, productos]: [string, any]) => {
          productos.forEach((producto: any) => {
            allProducts.push({
              ...producto,
              categoria: categoria
            });
          });
        });
        
        setProducts(allProducts);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (codigo: string, currentStatus: boolean) => {
    setUpdatingVisibility(codigo);
    try {
      const response = await fetch('/api/admin/toggle-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, visible: !currentStatus })
      });

      if (response.ok) {
        setProducts(prevProducts => 
          prevProducts.map(product => ({
            ...product,
            variantes: product.variantes.map(v => 
              v.codigo === codigo ? { ...v, disponible_en_web: !currentStatus } : v
            )
          }))
        );
        setSyncStatus('Visibilidad actualizada correctamente');
        setTimeout(() => setSyncStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error actualizando visibilidad:', error);
      setSyncStatus('Error actualizando visibilidad');
      setTimeout(() => setSyncStatus(''), 3000);
    } finally {
      setUpdatingVisibility(null);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Sincronizando con Google Sheets...');
    
    try {
      const response = await fetch('/api/sync-products-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setSyncStatus('Sincronización completada - Los precios han sido actualizados');
        await loadProducts();
        setTimeout(() => setSyncStatus(''), 5000);
      } else {
        setSyncStatus('La sincronización requiere configuración adicional');
        setTimeout(() => setSyncStatus(''), 5000);
      }
    } catch (error) {
      setSyncStatus('Error en sincronización');
      setTimeout(() => setSyncStatus(''), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const exportToExcel = () => {
    const exportData = products.flatMap(product => 
      product.variantes.map(v => ({
        'Código SKU': v.codigo,
        'Producto': product.nombre,
        'Categoría': product.categoria,
        'Tipo': product.tipo,
        'Espesor (mm)': v.espesor,
        'Color': v.color,
        'Dimensiones': formatDimension(v.dimensiones),
        'Stock': v.stock,
        'Costo Proveedor': v.costo_proveedor,
        'Precio Neto': v.precio_neto,
        'Precio con IVA': v.precio_con_iva,
        'Ganancia': v.ganancia,
        'Margen': v.margen_ganancia,
        'Proveedor': v.proveedor,
        'Visible en Web': v.disponible_en_web ? 'Sí' : 'No',
        'Tiene Imagen': v.tiene_imagen ? 'Sí' : 'No'
      }))
    );

    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map((row: Record<string, any>) => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openProductDetail = (variant: ProductVariant) => {
    setSelectedProduct(variant);
    setShowDetailModal(true);
  };

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      variantes: product.variantes.filter(v => {
        const matchesSearch = searchTerm === '' || 
          v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.codigo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
        
        const matchesProveedor = selectedProveedor === 'all' || v.proveedor === selectedProveedor;
        
        const matchesVisibility = selectedVisibility === 'all' ||
          (selectedVisibility === 'visible' && v.disponible_en_web) ||
          (selectedVisibility === 'hidden' && !v.disponible_en_web);
        
        const matchesStock = !showOnlyLowStock || v.stock < 10;
        
        return matchesSearch && matchesCategory && matchesProveedor && matchesVisibility && matchesStock;
      })
    })).filter(p => p.variantes.length > 0);
  }, [products, searchTerm, selectedCategory, selectedProveedor, selectedVisibility, showOnlyLowStock]);

  // Estadísticas
  const stats = useMemo(() => {
    const allVariants = products.flatMap(p => p.variantes);
    const visibleVariants = allVariants.filter(v => v.disponible_en_web);
    
    return {
      totalProducts: products.length,
      totalVariants: allVariants.length,
      visibleProducts: visibleVariants.length,
      hiddenProducts: allVariants.length - visibleVariants.length,
      totalStock: allVariants.reduce((sum, v) => sum + v.stock, 0),
      lowStockCount: allVariants.filter(v => v.stock < 10 && v.stock > 0).length,
      outOfStockCount: allVariants.filter(v => v.stock === 0).length,
      totalValue: allVariants.reduce((sum, v) => sum + (v.precio_con_iva * v.stock), 0),
      totalCost: allVariants.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
      potentialProfit: allVariants.reduce((sum, v) => sum + (v.ganancia * v.stock), 0),
      proveedores: [...new Set(allVariants.map(v => v.proveedor))],
      categorias: [...new Set(products.map(p => p.categoria))]
    };
  }, [products]);

  // Modal de detalles del producto
  const ProductDetailModal = ({ product, onClose }: { product: ProductVariant | null, onClose: () => void }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Detalles del Producto</h2>
              <p className="text-slate-500 mt-1">Código: {product.codigo}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Imagen del producto */}
            {product.ruta_imagen && (
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={product.ruta_imagen} 
                    alt={product.nombre}
                    className="max-w-md w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur">
                      {product.categoria}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Información General</h3>
                  <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">SKU</span>
                      <code className="bg-slate-200 px-3 py-1 rounded-lg font-mono text-sm">{product.codigo}</code>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-600 font-medium">Nombre</span>
                      <span className="font-semibold text-right max-w-64">{product.nombre}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Categoría</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{product.categoria}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Proveedor</span>
                      <span className="font-semibold">{product.proveedor}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Especificaciones Técnicas</h3>
                  <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Espesor</span>
                      <span className="font-bold text-blue-900">{product.espesor}mm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Color</span>
                      <span className="font-semibold">{product.color}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Dimensiones</span>
                      <span className="font-bold text-blue-900">{formatDimension(product.dimensiones)}</span>
                    </div>
                    {product.uv_protection !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Protección UV</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.uv_protection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.uv_protection ? 'Sí' : 'No'}
                        </span>
                      </div>
                    )}
                    {product.garantia && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Garantía</span>
                        <span className="font-semibold">{product.garantia}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Información de precios */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Análisis Financiero</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-6 rounded-xl">
                  <div className="text-sm font-medium text-amber-700 mb-2">Costo Proveedor</div>
                  <div className="text-2xl font-bold text-amber-900">
                    ${product.costo_proveedor.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-6 rounded-xl">
                  <div className="text-sm font-medium text-emerald-700 mb-2">Precio Neto</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    ${product.precio_neto.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
                  <div className="text-sm font-medium text-blue-700 mb-2">Precio con IVA</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${product.precio_con_iva.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 p-6 rounded-xl">
                  <div className="text-sm font-medium text-purple-700 mb-2">Ganancia</div>
                  <div className="text-2xl font-bold text-purple-900">
                    ${product.ganancia.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">{product.margen_ganancia}</div>
                </div>
              </div>
            </div>
            
            {/* Estado y acciones */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Estado y Gestión</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`px-6 py-3 rounded-xl font-semibold border ${
                    product.stock === 0 ? 'bg-red-50 border-red-200 text-red-800' :
                    product.stock < 10 ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    Stock: {product.stock} unidades
                  </div>
                  <div className={`px-6 py-3 rounded-xl font-semibold border ${
                    product.disponible_en_web ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {product.disponible_en_web ? 'Visible en Web' : 'Oculto en Web'}
                  </div>
                  <div className={`px-6 py-3 rounded-xl font-semibold border ${
                    product.tiene_imagen ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {product.tiene_imagen ? 'Con Imagen' : 'Sin Imagen'}
                  </div>
                </div>
                
                <button
                  onClick={() => handleVisibilityToggle(product.codigo, product.disponible_en_web)}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    product.disponible_en_web 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {product.disponible_en_web ? 'Ocultar de la Web' : 'Mostrar en la Web'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Cargando sistema de inventario...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Moderno */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
              <div className="h-8 w-px bg-slate-300"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Sistema de Inventario
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Vista Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tabla
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'cards' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tarjetas
                </button>
              </div>
              
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Precios'}
              </button>
              <button
                onClick={exportToExcel}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {syncStatus && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-lg shadow-md ${
            syncStatus.includes('correctamente') || syncStatus.includes('completada') ? 
              'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            syncStatus.includes('Error') || syncStatus.includes('error') ? 
              'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                syncStatus.includes('correctamente') || syncStatus.includes('completada') ? 'bg-emerald-500' :
                syncStatus.includes('Error') || syncStatus.includes('error') ? 'bg-red-500' :
                'bg-blue-500'
              }`}></div>
              {syncStatus}
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard Profesional */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-slate-900">{stats.totalVariants}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Total SKUs</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 shadow-sm border border-emerald-200">
            <div className="text-3xl font-bold text-emerald-700">{stats.visibleProducts}</div>
            <div className="text-sm text-emerald-600 mt-1 font-medium">Visibles en Web</div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-slate-700">{stats.hiddenProducts}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Ocultos</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 shadow-sm border border-amber-200">
            <div className="text-3xl font-bold text-amber-700">{stats.lowStockCount}</div>
            <div className="text-sm text-amber-600 mt-1 font-medium">Stock Crítico</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 shadow-sm border border-red-200">
            <div className="text-3xl font-bold text-red-700">{stats.outOfStockCount}</div>
            <div className="text-sm text-red-600 mt-1 font-medium">Sin Stock</div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 shadow-sm border border-violet-200">
            <div className="text-3xl font-bold text-violet-700">
              ${(stats.totalValue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-violet-600 mt-1 font-medium">Valor Total</div>
          </div>
        </div>
        
        {/* Resumen financiero profesional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-blue-100 text-sm font-medium">Inversión Total</div>
                <div className="text-3xl font-bold mt-2">
                  ${(stats.totalCost / 1000000).toFixed(2)}M
                </div>
                <div className="text-blue-200 text-xs mt-1">Costo del inventario</div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-emerald-100 text-sm font-medium">Valor de Venta</div>
                <div className="text-3xl font-bold mt-2">
                  ${(stats.totalValue / 1000000).toFixed(2)}M
                </div>
                <div className="text-emerald-200 text-xs mt-1">Precio con IVA</div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-violet-100 text-sm font-medium">Ganancia Potencial</div>
                <div className="text-3xl font-bold mt-2">
                  ${(stats.potentialProfit / 1000000).toFixed(2)}M
                </div>
                <div className="text-violet-200 text-xs mt-1">
                  Margen: {stats.totalCost > 0 ? ((stats.potentialProfit / stats.totalCost) * 100).toFixed(1) : '0'}%
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Profesionales */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Buscar Producto
              </label>
              <div className="relative">
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o código SKU..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Todas ({stats.categorias.length})</option>
                {stats.categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Proveedor
              </label>
              <select
                value={selectedProveedor}
                onChange={(e) => setSelectedProveedor(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Todos ({stats.proveedores.length})</option>
                {stats.proveedores.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            
            {/* Visibilidad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Visibilidad Web
              </label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Todos</option>
                <option value="visible">Solo Visibles</option>
                <option value="hidden">Solo Ocultos</option>
              </select>
            </div>
            
            {/* Stock Crítico */}
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg hover:bg-amber-100 transition-colors w-full justify-center">
                <input
                  type="checkbox"
                  checked={showOnlyLowStock}
                  onChange={(e) => setShowOnlyLowStock(e.target.checked)}
                  className="mr-2 rounded text-amber-600"
                />
                <span className="text-sm font-medium text-amber-800">Stock Crítico</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedProveedor('all');
                setSelectedVisibility('all');
                setShowOnlyLowStock(false);
              }}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Vista de Productos */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        {viewMode === 'table' ? (
          // Vista de Tabla Profesional
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Especificaciones
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Precio Neto
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Precio IVA
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ganancia
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredProducts.flatMap(product =>
                    product.variantes.map((variant, idx) => (
                      <tr key={variant.codigo} className={`hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {variant.ruta_imagen && (
                              <img 
                                src={variant.ruta_imagen} 
                                alt={variant.nombre}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{variant.nombre}</div>
                              <div className="text-xs font-mono text-slate-500">{variant.codigo}</div>
                              <div className="text-xs text-slate-400">{product.categoria}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {variant.espesor}mm
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {variant.color}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                              {formatDimension(variant.dimensiones)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            variant.stock === 0 ? 'bg-red-100 text-red-800' :
                            variant.stock < 10 ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {variant.stock}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                          ${variant.costo_proveedor.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                          ${variant.precio_neto.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-blue-600">
                          ${variant.precio_con_iva.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-bold text-emerald-600">
                            ${variant.ganancia.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500">{variant.margen_ganancia}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              variant.disponible_en_web ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {variant.disponible_en_web ? 'Visible' : 'Oculto'}
                            </span>
                            {variant.tiene_imagen && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" title="Con imagen"></span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openProductDetail(variant)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              Ver Detalles
                            </button>
                            <button
                              onClick={() => handleVisibilityToggle(variant.codigo, variant.disponible_en_web)}
                              disabled={updatingVisibility === variant.codigo}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                variant.disponible_en_web 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              } ${updatingVisibility === variant.codigo ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingVisibility === variant.codigo ? '...' : variant.disponible_en_web ? 'Ocultar' : 'Mostrar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Vista de Tarjetas Profesional
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.flatMap(product =>
              product.variantes.map((variant) => (
                <div key={variant.codigo} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden">
                  {/* Imagen */}
                  {variant.ruta_imagen && (
                    <div className="h-48 bg-slate-100 overflow-hidden relative">
                      <img 
                        src={variant.ruta_imagen} 
                        alt={variant.nombre}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {variant.disponible_en_web && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        )}
                        {variant.tiene_imagen && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {variant.codigo}
                      </code>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        variant.stock === 0 ? 'bg-red-100 text-red-700' :
                        variant.stock < 10 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {variant.stock}
                      </span>
                    </div>
                    
                    {/* Título */}
                    <h3 className="font-semibold text-slate-900 text-sm mb-3 line-clamp-2 leading-tight">
                      {variant.nombre}
                    </h3>
                    
                    {/* Especificaciones */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {variant.espesor}mm
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {variant.color}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                        {formatDimension(variant.dimensiones)}
                      </span>
                    </div>
                    
                    {/* Precios */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Costo</span>
                        <span className="font-semibold">${variant.costo_proveedor.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Precio IVA</span>
                        <span className="font-bold text-blue-600">${variant.precio_con_iva.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500">Ganancia</span>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">${variant.ganancia.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{variant.margen_ganancia}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProductDetail(variant)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleVisibilityToggle(variant.codigo, variant.disponible_en_web)}
                        disabled={updatingVisibility === variant.codigo}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          variant.disponible_en_web 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        } ${updatingVisibility === variant.codigo ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {updatingVisibility === variant.codigo ? '...' : variant.disponible_en_web ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetailModal && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }} 
        />
      )}

      {/* Footer Informativo Profesional */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        <div className="bg-slate-800 text-slate-300 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold text-slate-100 mb-3">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-200">Gestión de Precios</span>
              <p className="text-slate-400 mt-1">Los precios se modifican únicamente desde Excel mediante sincronización</p>
            </div>
            <div>
              <span className="font-medium text-slate-200">Control de Visibilidad</span>
              <p className="text-slate-400 mt-1">La visibilidad web se gestiona directamente desde esta plataforma</p>
            </div>
            <div>
              <span className="font-medium text-slate-200">Unidades de Medida</span>
              <p className="text-slate-400 mt-1">Las dimensiones se muestran automáticamente en mm, cm o m</p>
            </div>
            <div>
              <span className="font-medium text-slate-200">Proveedores</span>
              <p className="text-slate-400 mt-1">Sistema actual: {stats.proveedores.join(', ')}. Preparado para múltiples proveedores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}