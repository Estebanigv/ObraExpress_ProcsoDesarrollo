"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/format-currency';

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  precio_neto: number;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  uso: string;
  stock: number;
  uv_protection: boolean;
  garantia: string;
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

interface ProductConfiguratorProps {
  productGroup: ProductGroup;
  className?: string;
  showDeliveryDate?: boolean;
}

export function ProductConfiguratorAdvanced({ productGroup, className = '', showDeliveryDate = false }: ProductConfiguratorProps) {
  const { addItem } = useCart();
  
  // Estados para las selecciones del usuario
  const [selectedEspesor, setSelectedEspesor] = useState<string>('');
  const [selectedDimensiones, setSelectedDimensiones] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);

  // Extraer opciones únicas de las variantes
  const opciones = useMemo(() => {
    const espesores = [...new Set(productGroup.variantes.map(v => v.espesor))].sort();
    const dimensiones = [...new Set(productGroup.variantes.map(v => v.dimensiones))].sort();
    const colores = [...new Set(productGroup.variantes.map(v => v.color))].sort();
    
    return { espesores, dimensiones, colores };
  }, [productGroup.variantes]);

  // Filtrar variantes disponibles basado en selecciones actuales
  const variantesDisponibles = useMemo(() => {
    return productGroup.variantes.filter(variante => {
      return (
        (!selectedEspesor || variante.espesor === selectedEspesor) &&
        (!selectedDimensiones || variante.dimensiones === selectedDimensiones) &&
        (!selectedColor || variante.color === selectedColor)
      );
    });
  }, [productGroup.variantes, selectedEspesor, selectedDimensiones, selectedColor]);

  // Obtener opciones disponibles basadas en las selecciones actuales
  const opcionesDisponibles = useMemo(() => {
    const espesoresDisponibles = [...new Set(variantesDisponibles.map(v => v.espesor))].sort();
    const dimensionesDisponibles = [...new Set(variantesDisponibles.map(v => v.dimensiones))].sort();
    const coloresDisponibles = [...new Set(variantesDisponibles.map(v => v.color))].sort();
    
    return { 
      espesores: espesoresDisponibles, 
      dimensiones: dimensionesDisponibles, 
      colores: coloresDisponibles 
    };
  }, [variantesDisponibles]);

  // Encontrar la variante exacta cuando todas las opciones están seleccionadas
  useEffect(() => {
    if (selectedEspesor && selectedDimensiones && selectedColor) {
      const variante = productGroup.variantes.find(v => 
        v.espesor === selectedEspesor && 
        v.dimensiones === selectedDimensiones && 
        v.color === selectedColor
      );
      setSelectedVariant(variante || null);
      // Ajustar cantidad mínima según el precio
      if (variante) {
        const minQty = variante.precio_con_iva > 100000 ? 1 : 10;
        setCantidad(minQty);
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedEspesor, selectedDimensiones, selectedColor, productGroup.variantes]);

  // Inicializar con la primera opción disponible
  useEffect(() => {
    if (opciones.espesores.length > 0 && !selectedEspesor) {
      setSelectedEspesor(opciones.espesores[0]);
    }
    if (opciones.colores.length > 0 && !selectedColor) {
      setSelectedColor(opciones.colores[0]);
    }
  }, [opciones, selectedEspesor, selectedColor]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const item = {
      id: selectedVariant.codigo,
      tipo: 'producto' as const,
      nombre: selectedVariant.nombre,
      descripcion: selectedVariant.descripcion,
      cantidad: cantidad,
      precioUnitario: selectedVariant.precio_con_iva,
      total: selectedVariant.precio_con_iva * cantidad,
      imagen: productGroup.imagen,
      especificaciones: [
        `Código: ${selectedVariant.codigo}`,
        `Espesor: ${selectedVariant.espesor}`,
        `Dimensiones: ${selectedVariant.dimensiones}`,
        `Color: ${selectedVariant.color}`,
        `Protección UV: ${selectedVariant.uv_protection ? 'Sí' : 'No'}`,
        `Garantía: ${selectedVariant.garantia}`
      ]
    };
    
    addItem(item);
  };

  const formatUso = (uso: string) => {
    if (!uso) return [];
    
    // Dividir el uso en aplicaciones individuales
    const aplicaciones = uso.split(' ').reduce((acc: string[], word: string, index: number, array: string[]) => {
      if (index === 0) {
        acc.push(word);
      } else if (word.length > 8) { // Palabras largas probablemente son aplicaciones
        acc.push(word);
      } else {
        // Unir palabras cortas con la anterior
        if (acc.length > 0) {
          acc[acc.length - 1] += ` ${word}`;
        }
      }
      return acc;
    }, []);

    return aplicaciones.slice(0, 8); // Mostrar máximo 8 aplicaciones
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-8 ${className}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Configurar {productGroup.nombre}
        </h2>
        <p className="text-gray-600 text-lg">
          {productGroup.descripcion}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Configuración */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Selecciona tus opciones:
          </h3>

          {/* Selector de Espesor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Espesor *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {opcionesDisponibles.espesores.map((espesor) => (
                <button
                  key={espesor}
                  onClick={() => setSelectedEspesor(espesor)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    selectedEspesor === espesor
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {espesor}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {opcionesDisponibles.colores.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    selectedColor === color
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Dimensiones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dimensiones *
            </label>
            <select
              value={selectedDimensiones}
              onChange={(e) => setSelectedDimensiones(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Seleccionar dimensiones</option>
              {opcionesDisponibles.dimensiones.map((dimension) => (
                <option key={dimension} value={dimension}>
                  {dimension}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cantidad 
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full ml-2">
                {selectedVariant && selectedVariant.precio_con_iva > 100000 ? '(mín. 1 unidad)' : '(mín. 10 unidades)'}
              </span>
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const minQty = selectedVariant && selectedVariant.precio_con_iva > 100000 ? 1 : 10;
                  const increment = selectedVariant && selectedVariant.precio_con_iva > 100000 ? 1 : 10;
                  setCantidad(Math.max(minQty, cantidad - increment));
                }}
                className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-20 text-center font-semibold text-lg">{cantidad}</span>
              <button
                onClick={() => {
                  const increment = selectedVariant && selectedVariant.precio_con_iva > 100000 ? 1 : 10;
                  setCantidad(cantidad + increment);
                }}
                className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Los cambios son de 10 en 10 unidades</p>
          </div>
        </div>

        {/* Panel de Información */}
        <div className="space-y-6">
          {/* Precio */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Precio</h4>
            {selectedVariant ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio unitario:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-2xl text-gray-900">
                      ${formatCurrency(selectedVariant.precio_con_iva)}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">IVA incluido</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">Total ({cantidad} unidades):</span>
                  <span className="font-bold text-3xl text-yellow-600">
                    ${formatCurrency(selectedVariant.precio_con_iva * cantidad)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Selecciona todas las opciones para ver el precio</p>
            )}
          </div>

          {/* Información del Producto Seleccionado */}
          {selectedVariant && (
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Producto Seleccionado</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Código:</strong> {selectedVariant.codigo}</div>
                <div><strong>Espesor:</strong> {selectedVariant.espesor}</div>
                <div><strong>Dimensiones:</strong> {selectedVariant.dimensiones}</div>
                <div><strong>Color:</strong> {selectedVariant.color}</div>
                <div><strong>Stock:</strong> {selectedVariant.stock} disponibles</div>
                <div><strong>Garantía:</strong> {selectedVariant.garantia}</div>
                {selectedVariant.uv_protection && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Protección UV incluida
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fecha de Despacho */}
          {showDeliveryDate && selectedVariant && (
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="font-semibold text-emerald-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fecha de Despacho
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-semibold text-emerald-900">Despacho Estimado</div>
                      <div className="text-sm text-emerald-700">
                        {cantidad <= 50 ? '2-3 días hábiles' : '3-5 días hábiles'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-800">
                      {(() => {
                        const today = new Date();
                        const days = cantidad <= 50 ? 3 : 5;
                        const deliveryDate = new Date(today);
                        deliveryDate.setDate(today.getDate() + days);
                        return deliveryDate.toLocaleDateString('es-CL', {
                          weekday: 'short',
                          day: 'numeric', 
                          month: 'short'
                        });
                      })()}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-emerald-600 bg-emerald-100 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Información de Despacho:</span>
                  </div>
                  <ul className="space-y-1 text-xs ml-6">
                    <li>• Despacho gratis en Región Metropolitana para compras sobre $200.000</li>
                    <li>• Productos en stock se despachan el mismo día si se compran antes de las 14:00 hrs</li>
                    <li>• {cantidad > 50 ? 'Cantidad grande: se requiere tiempo adicional de preparación' : 'Cantidad estándar: despacho rápido'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Aplicaciones y Usos */}
          {selectedVariant && selectedVariant.uso && (
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="font-semibold text-green-900 mb-3">Aplicaciones Recomendadas</h4>
              <div className="grid grid-cols-2 gap-2">
                {formatUso(selectedVariant.uso).map((aplicacion, index) => (
                  <div key={index} className="flex items-center text-sm text-green-700">
                    <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {aplicacion.charAt(0).toUpperCase() + aplicacion.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Agregar al Carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:transform-none shadow-lg"
          >
            {selectedVariant ? 
              `Agregar ${cantidad} unidades al carrito` : 
              'Selecciona todas las opciones'
            }
          </button>
        </div>
      </div>
    </div>
  );
}