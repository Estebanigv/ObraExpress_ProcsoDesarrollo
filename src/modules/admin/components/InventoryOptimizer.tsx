/**
 * Optimizador de Inventario con IA para Admin de ObraExpress
 * Sprint 4: Admin con IA - Tarea 4.4
 */

'use client';

import { useState, useEffect } from 'react';
import { aiService } from '../services/ai-service';
import { InventoryOptimization, ReorderSuggestion, LowRotationProduct, BundleRecommendation } from '../types/ai.types';
import InfoPanel from '@/components/InfoPanel';
import RefreshButton from '@/components/RefreshButton';

interface InventoryOptimizerProps {
  products: any[];
  onApplyOptimization?: (optimization: any) => void;
  className?: string;
}

export default function InventoryOptimizer({ products, onApplyOptimization, className = '' }: InventoryOptimizerProps) {
  const [optimization, setOptimization] = useState<InventoryOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reorder' | 'rotation' | 'bundles' | 'pricing'>('reorder');
  const [appliedOptimizations, setAppliedOptimizations] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOptimization();
  }, [products]);

  const loadOptimization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.optimizeInventory(products);
      
      if (response.success && response.data) {
        setOptimization(response.data);
      } else {
        setError(response.error || 'Error optimizando inventario');
      }
    } catch (err) {
      setError('Error cargando optimización');
      console.error('Error en InventoryOptimizer:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyOptimization = (id: string, type: string, data: any) => {
    setAppliedOptimizations(prev => new Set([...prev, id]));
    
    if (onApplyOptimization) {
      onApplyOptimization({ id, type, data });
    }
    
    // Simular éxito
    setTimeout(() => {
      console.log(`Optimización ${id} aplicada:`, data);
    }, 1000);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error en Optimización</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadOptimization}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!optimization) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Optimizador de Inventario</h2>
              </div>
              
              <RefreshButton 
                onClick={loadOptimization}
                isLoading={loading}
                variant="optimization"
              />
            </div>
            <p className="text-gray-600 text-sm mt-1">Recomendaciones inteligentes para maximizar ROI</p>
            <div className="text-xs text-gray-500 mt-1">
              Optimizaciones aplicadas: {appliedOptimizations.size}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {[
            { 
              id: 'reorder', 
              label: 'Reorden', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ),
              count: optimization.reorderSuggestions.length,
              tooltip: {
                title: "Sugerencias de Reorden",
                description: "Sistema inteligente que identifica productos que necesitan reabastecimiento y calcula cantidades óptimas de compra.",
                details: [
                  "Analiza stock actual vs demanda proyectada",
                  "Calcula días de cobertura restante", 
                  "Sugiere cantidades óptimas de pedido",
                  "Clasifica urgencia por nivel de riesgo"
                ],
                benefits: [
                  "Evita quiebres de stock críticos",
                  "Optimiza órdenes de compra",
                  "Reduce costos de reposición de emergencia",
                  "Mantiene disponibilidad para clientes"
                ]
              }
            },
            { 
              id: 'rotation', 
              label: 'Rotación', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
              count: optimization.lowRotationProducts.length,
              tooltip: {
                title: "Análisis de Rotación de Inventario",
                description: "Identifica productos con alta y baja rotación para optimizar el mix de inventario y liberar capital atado.",
                details: [
                  "Calcula velocidad de rotación por producto",
                  "Identifica productos de movimiento lento",
                  "Detecta productos estrella de alta rotación",
                  "Sugiere acciones para optimizar inventario"
                ],
                benefits: [
                  "Libera capital atado en productos lentos",
                  "Identifica productos más rentables",
                  "Optimiza espacio de almacenamiento",
                  "Mejora flujo de caja del negocio"
                ]
              }
            },
            { 
              id: 'bundles', 
              label: 'Bundles', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              count: optimization.bundleRecommendations.length,
              tooltip: {
                title: "Recomendaciones de Bundles",
                description: "Identifica productos que se compran frecuentemente juntos para crear paquetes atractivos que aumenten el ticket promedio.",
                details: [
                  "Analiza patrones de compra conjunta",
                  "Calcula precios óptimos de bundle",
                  "Estima incremento en ventas esperado",
                  "Sugiere descuentos que maximicen ganancia"
                ],
                benefits: [
                  "Aumenta ticket promedio de venta",
                  "Simplifica decisión de compra del cliente",
                  "Mejora márgenes con productos complementarios",
                  "Acelera rotación de productos lentos"
                ]
              }
            },
            { 
              id: 'pricing', 
              label: 'Precios', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              ),
              count: optimization.pricingOptimization.length,
              tooltip: {
                title: "Optimización Inteligente de Precios",
                description: "Analiza elasticidad de demanda y competencia para sugerir precios que maximicen utilidades y volumen de ventas.",
                details: [
                  "Analiza sensibilidad de precio por producto",
                  "Compara con precios de competencia",
                  "Evalúa impacto en volumen vs margen",
                  "Considera factores estacionales y tendencias"
                ],
                benefits: [
                  "Maximiza utilidades por producto",
                  "Mantiene competitividad en el mercado",
                  "Balancea volumen y margen óptimamente",
                  "Adapta precios dinámicamente al mercado"
                ]
              }
            }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'reorder' && (
          <div>
            <InfoPanel 
              title="Sugerencias de Reorden"
              description="Sistema inteligente que identifica productos que necesitan reabastecimiento y calcula cantidades óptimas de compra."
              details={[
                "Analiza stock actual vs demanda proyectada",
                "Calcula días de cobertura restante", 
                "Sugiere cantidades óptimas de pedido",
                "Clasifica urgencia por nivel de riesgo"
              ]}
              benefits={[
                "Evita quiebres de stock críticos",
                "Optimiza órdenes de compra",
                "Reduce costos de reposición de emergencia",
                "Mantiene disponibilidad para clientes"
              ]}
            />
            <ReorderSuggestions 
              suggestions={optimization.reorderSuggestions}
              onApply={(id, data) => applyOptimization(id, 'reorder', data)}
              appliedIds={appliedOptimizations}
            />
          </div>
        )}
        
        {activeTab === 'rotation' && (
          <div>
            <InfoPanel 
              title="Análisis de Rotación de Inventario"
              description="Identifica productos con alta y baja rotación para optimizar el mix de inventario y liberar capital atado."
              details={[
                "Calcula velocidad de rotación por producto",
                "Identifica productos de movimiento lento",
                "Detecta productos estrella de alta rotación",
                "Sugiere acciones para optimizar inventario"
              ]}
              benefits={[
                "Libera capital atado en productos lentos",
                "Identifica productos más rentables",
                "Optimiza espacio de almacenamiento",
                "Mejora flujo de caja del negocio"
              ]}
            />
            <LowRotationView 
              products={optimization.lowRotationProducts}
              onApply={(id, data) => applyOptimization(id, 'rotation', data)}
              appliedIds={appliedOptimizations}
            />
          </div>
        )}
        
        {activeTab === 'bundles' && (
          <div>
            <InfoPanel 
              title="Recomendaciones de Bundles"
              description="Identifica productos que se compran frecuentemente juntos para crear paquetes atractivos que aumenten el ticket promedio."
              details={[
                "Analiza patrones de compra conjunta",
                "Calcula precios óptimos de bundle",
                "Estima incremento en ventas esperado",
                "Sugiere descuentos que maximicen ganancia"
              ]}
              benefits={[
                "Aumenta ticket promedio de venta",
                "Simplifica decisión de compra del cliente",
                "Mejora márgenes con productos complementarios",
                "Acelera rotación de productos lentos"
              ]}
            />
            <BundleRecommendations 
              bundles={optimization.bundleRecommendations}
              onApply={(id, data) => applyOptimization(id, 'bundle', data)}
              appliedIds={appliedOptimizations}
            />
          </div>
        )}
        
        {activeTab === 'pricing' && (
          <div>
            <InfoPanel 
              title="Optimización Inteligente de Precios"
              description="Analiza elasticidad de demanda y competencia para sugerir precios que maximicen utilidades y volumen de ventas."
              details={[
                "Analiza sensibilidad de precio por producto",
                "Compara con precios de competencia",
                "Evalúa impacto en volumen vs margen",
                "Considera factores estacionales y tendencias"
              ]}
              benefits={[
                "Maximiza utilidades por producto",
                "Mantiene competitividad en el mercado",
                "Balancea volumen y margen óptimamente",
                "Adapta precios dinámicamente al mercado"
              ]}
            />
            <PricingOptimization 
              optimizations={optimization.pricingOptimization}
              onApply={(id, data) => applyOptimization(id, 'pricing', data)}
              appliedIds={appliedOptimizations}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sugerencias de reorden
 */
function ReorderSuggestions({ 
  suggestions, 
  onApply, 
  appliedIds 
}: { 
  suggestions: ReorderSuggestion[];
  onApply: (id: string, data: any) => void;
  appliedIds: Set<string>;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Óptimo</h3>
        <p className="text-gray-600">Todos los productos tienen niveles de stock adecuados.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Sugerencias de Reorden</h3>
        <p className="text-sm text-gray-600">
          {suggestions.length} productos requieren reabastecimiento
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const isApplied = appliedIds.has(suggestion.productId);
          
          return (
            <div key={suggestion.productId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{suggestion.nombre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      suggestion.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      suggestion.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {suggestion.urgency === 'high' ? '🔥 Alta' : 
                       suggestion.urgency === 'medium' ? '⚠️ Media' : 'ℹ️ Baja'} urgencia
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">SKU: {suggestion.sku}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Stock actual:</span>
                      <span className="font-semibold ml-2">{suggestion.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cantidad sugerida:</span>
                      <span className="font-semibold ml-2 text-green-600">
                        {suggestion.suggestedOrderQuantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      <strong>Análisis IA:</strong> {suggestion.reasoning}
                    </p>
                  </div>
                  
                  {suggestion.supplierInfo && (
                    <div className="text-xs text-gray-500">
                      Proveedor: {suggestion.supplierInfo.name} • 
                      Lead time: {suggestion.supplierInfo.leadTime} días • 
                      Min. orden: {suggestion.supplierInfo.minOrderQuantity}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {isApplied ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      ✅ Aplicado
                    </div>
                  ) : (
                    <button
                      onClick={() => onApply(suggestion.productId, suggestion)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Productos de baja rotación
 */
function LowRotationView({ 
  products, 
  onApply, 
  appliedIds 
}: { 
  products: LowRotationProduct[];
  onApply: (id: string, data: any) => void;
  appliedIds: Set<string>;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Rotación Óptima</h3>
        <p className="text-gray-600">Todos los productos tienen buena rotación.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Productos de Baja Rotación</h3>
        <p className="text-sm text-gray-600">
          {products.length} productos requieren atención especial
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product) => {
          const isApplied = appliedIds.has(product.productId);
          
          return (
            <div key={product.productId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{product.nombre}</h4>
                  <p className="text-sm text-gray-600 mb-3">SKU: {product.sku}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Valor en stock:</span>
                      <p className="font-semibold">${product.stockValue.toLocaleString('es-CL')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sin ventas:</span>
                      <p className="font-semibold text-red-600">{product.daysSinceLastSale} días</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tasa rotación:</span>
                      <p className="font-semibold">{product.rotationRate.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded p-3 mb-3">
                    <p className="text-sm text-orange-800">
                      <strong>Recomendación:</strong> {product.recommendation}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">{product.aiSuggestion}</p>
                  </div>
                </div>
                
                <div className="ml-4">
                  {isApplied ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      ✅ Aplicado
                    </div>
                  ) : (
                    <button
                      onClick={() => onApply(product.productId, product)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Recomendaciones de bundles
 */
function BundleRecommendations({ 
  bundles, 
  onApply, 
  appliedIds 
}: { 
  bundles: BundleRecommendation[];
  onApply: (id: string, data: any) => void;
  appliedIds: Set<string>;
}) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Oportunidades de Bundle</h3>
        <p className="text-sm text-gray-600">
          {bundles.length} combinaciones identificadas para incrementar ventas
        </p>
      </div>

      <div className="space-y-4">
        {bundles.map((bundle) => {
          const isApplied = appliedIds.has(bundle.id);
          
          return (
            <div key={bundle.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{bundle.name}</h4>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Productos incluidos:</p>
                    <div className="space-y-1">
                      {bundle.products.map((product, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 rounded px-3 py-1">
                          {product.quantity}x {product.nombre} ({product.sku})
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Incremento estimado demanda:</span>
                      <p className="font-semibold text-green-600">+{bundle.estimatedDemandIncrease}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Descuento sugerido:</span>
                      <p className="font-semibold text-blue-600">{bundle.suggestedDiscount}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded p-3 mb-3">
                    <p className="text-sm text-purple-800">
                      <strong>Análisis:</strong> {bundle.reasoning}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Confianza:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-purple-500 rounded-full"
                          style={{ width: `${bundle.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold">{Math.round(bundle.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {isApplied ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      ✅ Aplicado
                    </div>
                  ) : (
                    <button
                      onClick={() => onApply(bundle.id, bundle)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Crear Bundle
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Optimización de precios
 */
function PricingOptimization({ 
  optimizations, 
  onApply, 
  appliedIds 
}: { 
  optimizations: any[];
  onApply: (id: string, data: any) => void;
  appliedIds: Set<string>;
}) {
  if (optimizations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Precios Óptimos</h3>
        <p className="text-gray-600">Los precios actuales están optimizados.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Optimización de Precios</h3>
        <p className="text-sm text-gray-600">Ajustes de precios para maximizar revenue</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <p>Análisis de pricing en desarrollo...</p>
      </div>
    </div>
  );
}