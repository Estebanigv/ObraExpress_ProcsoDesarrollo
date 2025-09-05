"use client";

import React, { useState, useEffect, useMemo } from 'react';
import ProductConfiguratorSimple from '@/modules/products/components/product-configurator-simple';
import ObraExpressLoader from '@/components/ObraExpressLoader';

// Componente que SOLO se ejecuta en el cliente - VERSIÓN LIMPIA
export default function ProductosClientSide() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [ordenPor, setOrdenPor] = useState<string>('precio-desc');
  const [busqueda, setBusqueda] = useState<string>('');
  const [productosData, setProductosData] = useState<any>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);

  // Procesar productos ANTES de los early returns para mantener orden de hooks
  const productosAgrupados = useMemo(() => {
    console.log('🔄 [CLIENT-PROC] Procesando productos...');
    console.log('🔄 [CLIENT-PROC] productosData existe?', !!productosData);
    
    if (!productosData) {
      console.log('❌ [CLIENT-PROC] No hay productosData');
      return { productos_policarbonato: [], accesorios: [] };
    }

    const { productos_por_categoria = {} } = productosData;
    console.log('🔄 [CLIENT-PROC] Categorías disponibles:', Object.keys(productos_por_categoria));

    // Usar las categorías reales que devuelve la API
    // Buscar todos los productos de policarbonato (que están bajo la categoría "Policarbonato")
    const todosPolicarbonatos = productos_por_categoria['Policarbonato'] || [];
    console.log('🔄 [CLIENT-PROC] Policarbonatos encontrados:', todosPolicarbonatos.length);
    
    // Separar por tipo dentro de Policarbonato y agregar información de espesores
    const policarbonatoOndulado = todosPolicarbonatos.find(p => p.tipo === 'Ondulado');
    const policarbonatoAlveolar = todosPolicarbonatos.find(p => p.tipo === 'Alveolar');
    const policarbonatoCompacto = todosPolicarbonatos.find(p => p.tipo === 'Compacto');
    
    // Agregar información de espesores disponibles a cada producto
    if (policarbonatoOndulado) {
      const espesores = [...new Set(policarbonatoOndulado.variantes?.map(v => v.espesor).filter(Boolean))];
      policarbonatoOndulado.espesores = espesores;
      console.log('🔄 [CLIENT-PROC] Ondulado espesores:', espesores);
    }
    
    if (policarbonatoAlveolar) {
      const espesores = [...new Set(policarbonatoAlveolar.variantes?.map(v => v.espesor).filter(Boolean))];
      policarbonatoAlveolar.espesores = espesores;
      console.log('🔄 [CLIENT-PROC] Alveolar espesores:', espesores);
    }
    
    if (policarbonatoCompacto) {
      const espesores = [...new Set(policarbonatoCompacto.variantes?.map(v => v.espesor).filter(Boolean))];
      policarbonatoCompacto.espesores = espesores;
      console.log('🔄 [CLIENT-PROC] Compacto espesores:', espesores);
    }
    
    console.log('🔄 [CLIENT-PROC] Tipos encontrados:', {
      ondulado: !!policarbonatoOndulado,
      alveolar: !!policarbonatoAlveolar,
      compacto: !!policarbonatoCompacto
    });
    const productosPolicarbonato = [policarbonatoOndulado, policarbonatoAlveolar, policarbonatoCompacto].filter(Boolean);
    
    // Buscar perfiles individualmente - cada uno como producto separado
    const perfilesIndividuales = [];
    
    // Perfil U como producto individual
    if (productos_por_categoria['Perfil U']?.[0]) {
      perfilesIndividuales.push(productos_por_categoria['Perfil U'][0]);
      console.log('🔄 [CLIENT-PROC] Perfil U encontrado');
    }
    
    // Perfil Clip Plano como producto individual  
    if (productos_por_categoria['Perfil Clip Plano']?.[0]) {
      perfilesIndividuales.push(productos_por_categoria['Perfil Clip Plano'][0]);
      console.log('🔄 [CLIENT-PROC] Perfil Clip Plano encontrado');
    }
    
    // Si hay productos bajo "Perfiles Alveolar", agregarlos individualmente
    const perfilesAlveolar = productos_por_categoria['Perfiles Alveolar'] || [];
    perfilesAlveolar.forEach(perfil => {
      perfilesIndividuales.push(perfil);
    });
    
    console.log('🔄 [CLIENT-PROC] Perfiles encontrados:', {
      total: perfilesIndividuales.length,
      nombres: perfilesIndividuales.map(p => p.nombre || p.id)
    });

    console.log('✅ [CLIENT-PROC] Procesamiento completado:', {
      policarbonato: productosPolicarbonato.length,
      accesorios: perfilesIndividuales.length
    });

    return {
      productos_policarbonato: productosPolicarbonato,
      accesorios: perfilesIndividuales
    };
  }, [productosData]);

  const cantidadTotalProductos = productosAgrupados.productos_policarbonato.length + productosAgrupados.accesorios.length;

  // Marcar como cliente y cargar datos
  useEffect(() => {
    console.log('🎯 [CLIENT] Componente ProductosClientSide montado');
    setIsClient(true);
    
    const loadData = async () => {
      try {
        console.log('🔄 [CLIENT-LOAD] Iniciando carga desde componente cliente...');
        
        const apiUrl = `/api/productos-publico?client=true&t=${Date.now()}`;
        console.log('🔄 [CLIENT-LOAD] Fetching:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('🔄 [CLIENT-LOAD] Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ [CLIENT-LOAD] Datos recibidos:', {
            success: result.success,
            total: result.total,
            hasData: !!result.data,
            categoriesCount: Object.keys(result.data?.productos_por_categoria || {}).length
          });
          
          if (result.success && result.data) {
            setProductosData(result.data);
            console.log('✅ [CLIENT-LOAD] ProductosData establecido en componente cliente');
          } else {
            console.error('❌ [CLIENT-LOAD] Error en respuesta:', result.error);
            setProductosData({ productos_por_categoria: {}, productos_policarbonato: [] });
          }
        } else {
          console.error('❌ [CLIENT-LOAD] HTTP Error:', response.status);
          setProductosData({ productos_por_categoria: {}, productos_policarbonato: [] });
        }
      } catch (error) {
        console.error('❌ [CLIENT-LOAD] Error de red:', error);
        setProductosData({ productos_por_categoria: {}, productos_policarbonato: [] });
      } finally {
        setIsLoadingProducts(false);
        console.log('✅ [CLIENT-LOAD] Carga finalizada');
      }
    };

    loadData();
  }, []);

  // No renderizar hasta que esté en el cliente
  if (!isClient) {
    return (
      <ObraExpressLoader 
        message="Inicializando aplicación"
        showPercentage={false}
        duration={1}
      />
    );
  }

  // Loading state
  if (isLoadingProducts) {
    return (
      <ObraExpressLoader 
        message="Cargando catálogo de productos"
        showPercentage={true}
        duration={2}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-40">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600 mb-4">
            Descubre nuestra gama completa de materiales de construcción
          </p>
        </div>

        {/* Filtros básicos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar productos
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, código..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="Todos">Todos</option>
                <option value="Policarbonato">Policarbonato</option>
                <option value="Perfil Alveolar">Perfil Alveolar</option>
              </select>
            </div>

            {/* Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={ordenPor}
                onChange={(e) => setOrdenPor(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="precio-desc">Precio (Mayor a menor)</option>
                <option value="precio-asc">Precio (Menor a mayor)</option>
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="nombre-desc">Nombre (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Nuestros Productos
          </h2>

          {/* Policarbonato */}
          {productosAgrupados.productos_policarbonato.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Placas de Policarbonato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosAgrupados.productos_policarbonato.map((producto, index) => (
                  <ProductConfiguratorSimple
                    key={`policarbonato-${index}`}
                    productGroup={producto}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Perfiles y Accesorios - Cada uno con su sección individual */}
          {productosAgrupados.accesorios.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Perfiles y Accesorios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosAgrupados.accesorios.map((producto, index) => {
                  // Dar un nombre más descriptivo a cada perfil para su ficha individual
                  const nombreDescriptivo = 
                    producto.nombre === 'Perfil U' ? 'Perfil U de Policarbonato' :
                    producto.nombre === 'Perfil Clip Plano' ? 'Perfil Clip Plano de Policarbonato' :
                    producto.nombre || `Perfil ${index + 1}`;
                  
                  return (
                    <ProductConfiguratorSimple
                      key={`perfil-${producto.id || producto.nombre || index}`}
                      productGroup={{
                        ...producto,
                        nombre: nombreDescriptivo,
                        descripcion: producto.descripcion || 
                          (producto.nombre === 'Perfil U' ? 
                            'Perfil de cierre para extremos de paneles alveolares. Evita el ingreso de polvo, agua e insectos.' :
                            producto.nombre === 'Perfil Clip Plano' ?
                            'Sistema de unión para paneles alveolares. Instalación rápida sin tornillos.' :
                            'Accesorio para instalación de policarbonato')
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {cantidadTotalProductos === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}