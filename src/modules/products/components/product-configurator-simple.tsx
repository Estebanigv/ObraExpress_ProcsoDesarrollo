"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { TechnicalSpecsModal } from '@/components/technical-specs-modal';
import { getProductSpecifications } from '@/utils/product-specifications';
import DispatchCalendarModal from '@/components/dispatch-calendar-modal';
import { formatCurrency } from '@/utils/format-currency';

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  precio_neto?: number;
  precio_con_iva: number;
  precio?: number; // Alias para precio_con_iva
  espesor: string;
  dimensiones: string;
  ancho?: string;
  largo?: string;
  color: string;
  uso: string;
  stock: number;
  uv_protection: boolean;
  garantia: string;
  disponible?: boolean;
  imagen?: string;
}

interface ProductGroup {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo?: string;
  variantes: ProductVariant[];
  colores: string[];
  espesores?: string[];
  dimensiones?: string[];
  precio_desde: number;
  stock_total: number;
  variantes_count: number;
  imagen: string;
  etiqueta?: string;
}

interface ProductConfiguratorSimpleProps {
  productGroup: ProductGroup;
  className?: string;
}

function ProductConfiguratorSimple({ productGroup, className = '' }: ProductConfiguratorSimpleProps) {
  const { addItem, removeItem, state } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedDispatchDate, setSelectedDispatchDate] = useState<string>('');

  // Función para formatear dimensiones with unidades correctas
  const formatDimensionWithUnit = (dimension: string) => {
    if (!dimension) return 'N/A';
    
    // Extraer números de la dimensión (ej: "1.05x2.90" -> [1.05, 2.90])
    const numbers = dimension.split('x').map(n => parseFloat(n.trim()));
    
    return numbers.map(num => {
      if (num < 1) {
        // Menos de 1 = milímetros 
        return `${(num * 1000).toFixed(0)}mm`;
      } else if (num < 10) {
        // Entre 1 y 10 = centímetros si es decimal, metros si es entero
        if (num % 1 !== 0) {
          return `${(num * 100).toFixed(0)}cm`;
        } else {
          return `${num.toFixed(1)}mts`;
        }
      } else {
        // Mayor a 10 = centímetros  
        return `${num.toFixed(0)}cm`;
      }
    }).join(' x ');
  };
  
  // Estados para las selecciones del usuario
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    productGroup.variantes?.[0] || {} as ProductVariant
  );
  // Determinar cantidad mínima e inicial basada en el tipo de producto
  const getMinQuantity = () => {
    // Detectar si es compacto por el nombre del producto o el código
    const isCompacto = productGroup.nombre?.includes('Compacto') || 
                      selectedVariant.nombre?.includes('Compacto') ||
                      selectedVariant.codigo?.startsWith('517');
    return isCompacto ? 1 : 10;
  };

  const [quantity, setQuantity] = useState(getMinQuantity());
  
  // Estados para filtros dinámicos
  const [selectedColor, setSelectedColor] = useState<string>(productGroup.variantes?.[0]?.color || '');
  const [selectedEspesor, setSelectedEspesor] = useState<string>(productGroup.variantes?.[0]?.espesor || '');
  const [selectedDimension, setSelectedDimension] = useState<string>(productGroup.variantes?.[0]?.dimensiones || '');

  // Función para limpiar valor de espesor (quitar mm si ya lo tiene)
  const cleanEspesorValue = (espesor: string) => {
    if (!espesor) return '';
    return espesor.replace(/mm$/i, ''); // Quitar "mm" o "MM" del final si lo tiene
  };
  
  // Verificar si el producto está en el carrito
  const isInCart = state.items.some(item => item.id === selectedVariant.codigo);

  // Efecto para leer la fecha de despacho específica del producto desde localStorage
  useEffect(() => {
    const productKey = `dispatch-date-${selectedVariant.codigo}`;
    const savedDate = localStorage.getItem(productKey);
    if (savedDate) {
      setSelectedDispatchDate(savedDate);
    } else {
      // Solo usar searchParams si no hay fecha guardada específica para este producto
      const fechaParam = searchParams.get('fecha');
      if (fechaParam) {
        setSelectedDispatchDate(fechaParam);
      }
    }
  }, [searchParams, selectedVariant.codigo]);

  // Efecto para ajustar cantidad inicial cuando cambie la variante
  useEffect(() => {
    if (selectedVariant.codigo) {
      const isCompacto = productGroup.nombre?.includes('Compacto') || 
                        selectedVariant.nombre?.includes('Compacto') ||
                        selectedVariant.codigo?.startsWith('517');
      const newMinQuantity = isCompacto ? 1 : 10;
      setQuantity(newMinQuantity);
    }
  }, [selectedVariant.codigo]); // Solo cuando cambie el código de variante

  // Función para crear fecha consistente desde string ISO
  const createDateFromISOString = (dateString: string) => {
    // Crear fecha en zona horaria local para evitar problemas de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month es 0-indexed en Date
  };

  // Función para formatear la fecha de despacho
  const getDispatchDateText = () => {
    if (selectedDispatchDate) {
      const date = createDateFromISOString(selectedDispatchDate);
      return date.toLocaleDateString('es-CL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
      });
    }
    return null;
  };

  // Función para manejar la selección de fecha de despacho
  const handleDispatchDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDispatchDate(dateString);
    
    // Guardar fecha específica para este producto en localStorage
    const productKey = `dispatch-date-${selectedVariant.codigo}`;
    localStorage.setItem(productKey, dateString);
    
    // Solo actualizar la URL si NO estamos en la página principal
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== '') {
      // Actualizar la URL con la nueva fecha sin navegación completa
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('fecha', dateString);
      // Usar replace para no agregar entrada al historial
      window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
    }
    
    setIsCalendarModalOpen(false);
  };

  const handleViewDetails = () => {
    router.push(`/productos/${productGroup.id}`);
  };

  const handleShowSpecs = () => {
    setIsSpecsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.codigo) {
      const item = {
        id: selectedVariant.codigo,
        tipo: 'producto' as const,
        nombre: selectedVariant.nombre,
        descripcion: selectedVariant.descripcion,
        cantidad: quantity,
        precioUnitario: selectedVariant.precio_con_iva,
        total: selectedVariant.precio_con_iva * quantity,
        imagen: productGroup.imagen,
        fechaDespacho: selectedDispatchDate ? createDateFromISOString(selectedDispatchDate) : undefined,
        especificaciones: [
          `Código: ${selectedVariant.codigo}`,
          `Espesor: ${selectedVariant.espesor}`,
          `Dimensiones: ${selectedVariant.dimensiones}`,
          `Color: ${selectedVariant.color}`,
          `Protección UV: ${selectedVariant.uv_protection ? 'Sí' : 'No'}`,
          `Garantía: ${selectedVariant.garantia}`,
          ...(selectedDispatchDate ? [`Fecha de despacho: ${createDateFromISOString(selectedDispatchDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}`] : [])
        ]
      };
      addItem(item);
    }
  };

  const productSpecs = getProductSpecifications(productGroup);

  // Obtener opciones desde el grupo (ya calculadas en el servidor)
  const uniqueColors = productGroup.colores || [];
  const uniqueThicknesses = productGroup.espesores || [];
  const uniqueDimensions = productGroup.dimensiones || [];

  // DEBUG: Verificar qué valores de espesor llegan
  console.log('DEBUG - Espesores únicos:', uniqueThicknesses);
  console.log('DEBUG - Espesor seleccionado:', selectedEspesor);
  console.log('DEBUG - Primera variante espesor:', productGroup.variantes?.[0]?.espesor);
  console.log('DEBUG - Imagen del grupo:', productGroup.imagen);
  console.log('DEBUG - Imagen del selectedVariant:', selectedVariant.imagen);

  // Filtrado dinámico: obtener dimensiones disponibles para el espesor seleccionado
  const getAvailableDimensionsForThickness = (thickness: string) => {
    if (!thickness) return uniqueDimensions;
    
    const availableDimensions = productGroup.variantes
      ?.filter(v => v.espesor === thickness)
      .map(v => v.dimensiones)
      .filter(Boolean);
    
    return [...new Set(availableDimensions)] || [];
  };

  // Filtrado dinámico: obtener dimensiones disponibles para el color seleccionado
  const getAvailableDimensionsForColor = (color: string) => {
    if (!color) return uniqueDimensions;
    
    const availableDimensions = productGroup.variantes
      ?.filter(v => v.color === color)
      .map(v => v.dimensiones)
      .filter(Boolean);
    
    return [...new Set(availableDimensions)] || [];
  };

  // Obtener dimensiones filtradas por espesor Y color seleccionados
  const getFilteredDimensions = () => {
    if (!selectedEspesor && !selectedColor) return uniqueDimensions;
    
    let filteredVariants = productGroup.variantes || [];
    
    if (selectedEspesor) {
      filteredVariants = filteredVariants.filter(v => v.espesor === selectedEspesor);
    }
    
    if (selectedColor) {
      filteredVariants = filteredVariants.filter(v => v.color === selectedColor);
    }
    
    const availableDimensions = filteredVariants
      .map(v => v.dimensiones)
      .filter(Boolean);
    
    return [...new Set(availableDimensions)] || [];
  };

  // Función para encontrar variante compatible
  const findVariant = (color: string, espesor: string, dimension: string) => {
    return productGroup.variantes?.find(v => 
      v.color === color && 
      v.espesor === espesor && 
      v.dimensiones === dimension
    ) || selectedVariant;
  };

  // Handlers para cambios de configuración
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Verificar si la dimensión actual sigue siendo válida con el nuevo color
    const availableDimensions = getAvailableDimensionsForColor(color);
    let newDimension = selectedDimension;
    
    // Si la dimensión actual no está disponible con este color, seleccionar la primera disponible
    if (!availableDimensions.includes(selectedDimension)) {
      newDimension = availableDimensions[0] || '';
      setSelectedDimension(newDimension);
    }
    
    const newVariant = findVariant(color, selectedEspesor, newDimension);
    setSelectedVariant(newVariant);
    
    // Actualizar cantidad si el nuevo tipo requiere cantidad mínima diferente
    const isCompacto = productGroup.nombre?.includes('Compacto') || newVariant.codigo?.startsWith('517');
    const newMinQuantity = isCompacto ? 1 : 10;
    if (quantity < newMinQuantity) {
      setQuantity(newMinQuantity);
    }
  };

  const handleEspesorChange = (espesor: string) => {
    setSelectedEspesor(espesor);
    
    // Verificar si la dimensión actual sigue siendo válida con el nuevo espesor
    const availableDimensions = getAvailableDimensionsForThickness(espesor);
    let newDimension = selectedDimension;
    
    // Si la dimensión actual no está disponible con este espesor, seleccionar la primera disponible
    if (!availableDimensions.includes(selectedDimension)) {
      newDimension = availableDimensions[0] || '';
      setSelectedDimension(newDimension);
    }
    
    const newVariant = findVariant(selectedColor, espesor, newDimension);
    setSelectedVariant(newVariant);
    
    // Actualizar cantidad si el nuevo tipo requiere cantidad mínima diferente
    const isCompacto = productGroup.nombre?.includes('Compacto') || newVariant.codigo?.startsWith('517');
    const newMinQuantity = isCompacto ? 1 : 10;
    if (quantity < newMinQuantity) {
      setQuantity(newMinQuantity);
    }
  };

  const handleDimensionChange = (dimension: string) => {
    setSelectedDimension(dimension);
    const newVariant = findVariant(selectedColor, selectedEspesor, dimension);
    setSelectedVariant(newVariant);
    // Actualizar cantidad si el nuevo tipo requiere cantidad mínima diferente
    const isCompacto = productGroup.nombre?.includes('Compacto') || newVariant.codigo?.startsWith('517');
    const newMinQuantity = isCompacto ? 1 : 10;
    if (quantity < newMinQuantity) {
      setQuantity(newMinQuantity);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className} flex flex-col product-card-mobile product-card-mobile-md product-card-tablet`}>
      <div className="p-4 sm:p-5 lg:p-6 flex-1">
        {/* Imagen - Clickeable */}
        <div 
          className="bg-gray-100 rounded-xl h-48 mb-3 overflow-hidden product-image img-mobile cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => router.push(`/productos/${productGroup.id}`)}
        >
          {/* Función para obtener la imagen correcta */}
          {(() => {
            let imagenFinal = selectedVariant.imagen || productGroup.imagen;
            
            // Si hay imagen, verificar si es una ruta problemática conocida
            if (imagenFinal && (
              imagenFinal.includes('ondulado.webp') ||
              imagenFinal.includes('/Policarnato Ondulado/') ||
              !imagenFinal.includes('policarbonato_')
            )) {
              // Ruta problemática detectada, usar fallback
              imagenFinal = null;
            }
            
            // Si no hay imagen válida, asignar imagen por defecto según el tipo
            if (!imagenFinal && productGroup.nombre) {
              if (productGroup.nombre.includes('Ondulado')) {
                imagenFinal = "/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp";
              } else if (productGroup.nombre.includes('Alveolar')) {
                imagenFinal = "/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar.webp";
              } else if (productGroup.nombre.includes('Compacto')) {
                imagenFinal = "/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto.webp";
              }
            }
            
            return imagenFinal ? (
              <img
                src={imagenFinal}
                alt={`${productGroup.nombre} - ${productGroup.descripcion}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Si la imagen falla, mostrar placeholder
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null;
          })()}
          
          {/* Placeholder cuando no hay imagen */}
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"
            style={{ display: (selectedVariant.imagen || productGroup.imagen) ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">{productGroup.nombre}</p>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
              {productGroup.categoria}
            </span>
            {productGroup.etiqueta && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                {productGroup.etiqueta}
              </span>
            )}
          </div>
          {isInCart && (
            <div className="relative">
              <div className="flex items-center bg-white border-2 border-emerald-500 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm flex items-center justify-center mr-1">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                En carrito
              </div>
              {/* Globito rojo con cantidad */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {state.items.filter(item => item.id === selectedVariant.codigo).reduce((sum, item) => sum + item.cantidad, 0)}
              </div>
            </div>
          )}
        </div>
        
        <h3 
          className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-amber-600 transition-colors duration-200"
          onClick={() => router.push(`/productos/${productGroup.id}`)}
        >
          {productGroup.nombre}
        </h3>
        
        <div className="mb-3 h-10 flex items-start">
          <p className="text-gray-600 text-sm line-clamp-2">
            {productGroup.descripcion}
          </p>
        </div>

        {/* SKU sutilmente debajo de la descripción */}
        <div className="mb-3">
          <div className="text-right">
            <span className="text-gray-400 text-xs font-medium">SKU: {selectedVariant.codigo || 'N/A'}</span>
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="mb-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-lg font-bold text-gray-900">
                ${formatCurrency(selectedVariant.precio_con_iva || productGroup.precio_desde)}
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">IVA incluido</span>
            </div>
            
            {/* Stock y Botón de despacho en la misma línea */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Stock: {selectedVariant.stock || productGroup.stock_total}</span>
              </div>
              
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className={`text-sm font-medium transition-all cursor-pointer px-3 py-2 rounded-lg touch-target flex items-center ${
                  selectedDispatchDate 
                    ? 'text-emerald-700 bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 shadow-md font-bold' 
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                <span>🚚 {getDispatchDateText() || 'Elegir despacho'}</span>
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
        </div>
        {/* Configuración de Producto */}
        <div className="space-y-4">
          {/* Selección de Color */}
          {uniqueColors.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color: <span className="text-amber-600 font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-amber-400 bg-amber-100 text-amber-800 shadow-md ring-2 ring-amber-200' 
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50 text-gray-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Espesor */}
          {uniqueThicknesses.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Espesor: <span className="text-amber-600 font-bold">{cleanEspesorValue(selectedEspesor)}mm</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueThicknesses.map((espesor) => (
                  <button
                    key={espesor}
                    onClick={() => handleEspesorChange(espesor)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                      selectedEspesor === espesor 
                        ? 'border-amber-400 bg-amber-100 text-amber-800 shadow-md ring-2 ring-amber-200' 
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50 text-gray-700'
                    }`}
                  >
                    {cleanEspesorValue(espesor)}mm
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Dimensiones */}
          {getFilteredDimensions().length > 1 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones: <span className="text-amber-600 font-bold">{formatDimensionWithUnit(selectedDimension)}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {getFilteredDimensions().map((dimension) => (
                  <button
                    key={dimension}
                    onClick={() => handleDimensionChange(dimension)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                      selectedDimension === dimension 
                        ? 'border-amber-400 bg-amber-100 text-amber-800 shadow-md ring-2 ring-amber-200' 
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50 text-gray-700'
                    }`}
                  >
                    {formatDimensionWithUnit(dimension)}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
      
      {/* Contenedor de botones - posición fija en la parte inferior */}
      <div className="p-4 sm:p-5 lg:p-6 bg-white border-t border-gray-100 flex-shrink-0">
        {/* Cantidad - Alineada en todas las tarjetas */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2 form-label-mobile">
            <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Cantidad: 
            {!productGroup.nombre?.includes('Compacto') && (
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full ml-2">
                (mín. 10 unidades)
              </span>
            )}
          </label>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg p-2 touch-target">
            <button
              onClick={() => {
                const isCompacto = productGroup.nombre?.includes('Compacto') || selectedVariant.codigo?.startsWith('517');
                const minQty = isCompacto ? 1 : 10;
                const increment = isCompacto ? 1 : 10;
                setQuantity(Math.max(minQty, quantity - increment));
              }}
              className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              disabled={quantity <= (productGroup.nombre?.includes('Compacto') || selectedVariant.codigo?.startsWith('517') ? 1 : 10)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-gray-900">
                {quantity}
              </div>
              <div className="text-xs text-gray-500">
                unidades
              </div>
            </div>
            <button
              onClick={() => {
                const isCompacto = productGroup.nombre?.includes('Compacto') || selectedVariant.codigo?.startsWith('517');
                const increment = isCompacto ? 1 : 10;
                const stockDisponible = selectedVariant.stock || 0;
                const nuevaCantidad = quantity + increment;
                
                // Solo incrementar si no excede el stock disponible
                if (nuevaCantidad <= stockDisponible) {
                  setQuantity(nuevaCantidad);
                }
              }}
              className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              disabled={(() => {
                const isCompacto = productGroup.nombre?.includes('Compacto') || selectedVariant.codigo?.startsWith('517');
                const increment = isCompacto ? 1 : 10;
                const stockDisponible = selectedVariant.stock || 0;
                return (quantity + increment) > stockDisponible;
              })()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Precio total a la derecha */}
        <div className="flex justify-end mb-3">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total:</div>
            <div className="text-xl font-bold text-green-600">
              ${formatCurrency((selectedVariant.precio_con_iva || 0) * quantity)}
            </div>
          </div>
        </div>
        {/* Botón de compra directo */}
        <div className="relative min-h-[80px] flex flex-col justify-end">
          {!isInCart ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center btn-mobile btn-touch touch-target"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Agregar al Carrito
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Botón Agregar Más - Verde para acción positiva */}
              <button
                onClick={handleAddToCart}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center btn-mobile btn-touch touch-target"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span className="hidden sm:inline">Más</span>
              </button>
              
              {/* Botón Quitar - Solo icono de basurero */}
              <button
                onClick={() => {
                  removeItem(selectedVariant.codigo);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 p-3 rounded-lg transition-all flex items-center justify-center btn-mobile btn-touch touch-target group"
                title="Quitar producto del carrito"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción principal */}
        <div className="flex gap-3 btn-group-mobile btn-group-mobile-md min-h-[60px] items-end">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-500 text-black font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center btn-mobile-md btn-touch touch-target shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver Detalles
          </button>
          <button
            onClick={handleShowSpecs}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center min-w-[50px] btn-touch touch-target"
            title="Especificaciones técnicas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de Especificaciones Técnicas */}
      <TechnicalSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        productName={productSpecs.name}
        productType={productSpecs.type}
        specifications={productSpecs.specifications}
        applications={productSpecs.applications}
        advantages={productSpecs.advantages}
      />

      {/* Modal de Calendario de Despacho */}
      <DispatchCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        productType={productGroup.categoria}
        onDateSelect={handleDispatchDateSelect}
      />
    </div>
  );
}

export default ProductConfiguratorSimple;