/**
 * Analytics Predictivo para Admin de ObraExpress
 * Sprint 4: Admin con IA - Tarea 4.2
 */

'use client';

import { useState, useEffect } from 'react';
import { aiService } from '../services/ai-service';
import { PredictiveAnalytics as PredictiveAnalyticsType, ProductDemandForecast, StockAlert } from '../types/ai.types';
import InfoPanel from '@/components/InfoPanel';
import RefreshButton from '@/components/RefreshButton';

interface PredictiveAnalyticsProps {
  products: any[];
  className?: string;
}

export default function PredictiveAnalytics({ products, className = '' }: PredictiveAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PredictiveAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demand' | 'forecast' | 'alerts' | 'trends'>('demand');
  const [refreshing, setRefreshing] = useState(false);

  // Cargar analytics al montar
  useEffect(() => {
    loadAnalytics();
  }, [products]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.generatePredictiveAnalytics(products);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Error generando analytics');
      }
    } catch (err) {
      setError('Error cargando analytics predictivo');
      console.error('Error en PredictiveAnalytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error en Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Analytics Predictivo</h2>
            </div>
            <p className="text-gray-600 text-sm mt-1">Predicciones inteligentes para tu inventario</p>
          </div>
          
          <RefreshButton 
            onClick={refreshAnalytics}
            isLoading={refreshing}
            variant="analytics"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { 
              id: 'demand', 
              label: 'Demanda', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              tooltip: {
                title: "Predicción de Demanda",
                description: "Análisis inteligente que predice cuántas unidades de cada producto se venderán en diferentes períodos de tiempo.",
                details: [
                  "Analiza patrones históricos de venta",
                  "Considera factores estacionales y tendencias",
                  "Calcula demanda para 7, 30 y 90 días",
                  "Sugiere niveles óptimos de inventario"
                ],
                benefits: [
                  "Evita agotamiento de productos populares",
                  "Reduce sobrestockeado de productos lentos",
                  "Optimiza capital de trabajo",
                  "Mejora satisfacción del cliente"
                ]
              }
            },
            { 
              id: 'forecast', 
              label: 'Forecast', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              tooltip: {
                title: "Forecast de Ingresos",
                description: "Predicción inteligente de ingresos, unidades vendidas y ticket promedio para planificación financiera.",
                details: [
                  "Proyecta ingresos mensuales esperados",
                  "Calcula unidades totales a vender",
                  "Estima valor promedio por transacción",
                  "Identifica tendencias de crecimiento"
                ],
                benefits: [
                  "Planificación financiera más precisa",
                  "Mejor gestión de flujo de caja",
                  "Metas de ventas realistas",
                  "Presupuestos más exactos"
                ]
              }
            },
            { 
              id: 'alerts', 
              label: 'Alertas', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.861-.833-2.631 0L4.182 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ),
              tooltip: {
                title: "Sistema de Alertas Inteligente",
                description: "Notificaciones automáticas sobre situaciones críticas del inventario que requieren atención inmediata.",
                details: [
                  "Detecta productos con stock crítico",
                  "Identifica productos sin movimiento",
                  "Alerta sobre puntos de reorden",
                  "Clasifica alertas por severidad"
                ],
                benefits: [
                  "Previene quiebres de stock",
                  "Reduce productos obsoletos",
                  "Actúa antes de problemas críticos",
                  "Automatiza vigilancia del inventario"
                ]
              }
            },
            { 
              id: 'trends', 
              label: 'Tendencias', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              tooltip: {
                title: "Análisis de Tendencias de Mercado",
                description: "Identifica patrones y tendencias en el comportamiento de ventas por categoría de productos.",
                details: [
                  "Analiza crecimiento por categoría",
                  "Identifica productos en ascenso/declive",
                  "Detecta patrones estacionales",
                  "Sugiere acciones estratégicas"
                ],
                benefits: [
                  "Identifica oportunidades de negocio",
                  "Anticipa cambios del mercado",
                  "Optimiza mix de productos",
                  "Desarrolla estrategias proactivas"
                ]
              }
            }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'demand' && (
          <div>
            <InfoPanel 
              title="Predicción de Demanda"
              description="Análisis inteligente que predice cuántas unidades de cada producto se venderán en diferentes períodos de tiempo."
              details={[
                "Analiza patrones históricos de venta",
                "Considera factores estacionales y tendencias",
                "Calcula demanda para 7, 30 y 90 días",
                "Sugiere niveles óptimos de inventario"
              ]}
              benefits={[
                "Evita agotamiento de productos populares",
                "Reduce sobrestockeado de productos lentos",
                "Optimiza capital de trabajo",
                "Mejora satisfacción del cliente"
              ]}
            />
            <DemandForecastView forecasts={analytics.productDemand} />
          </div>
        )}
        
        {activeTab === 'forecast' && (
          <div>
            <InfoPanel 
              title="Forecast de Ingresos"
              description="Predicción inteligente de ingresos, unidades vendidas y ticket promedio para planificación financiera."
              details={[
                "Proyecta ingresos mensuales esperados",
                "Calcula unidades totales a vender",
                "Estima valor promedio por transacción",
                "Identifica tendencias de crecimiento"
              ]}
              benefits={[
                "Planificación financiera más precisa",
                "Mejor gestión de flujo de caja",
                "Metas de ventas realistas",
                "Presupuestos más exactos"
              ]}
            />
            <SalesForecastView forecast={analytics.salesForecast} />
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div>
            <InfoPanel 
              title="Sistema de Alertas Inteligente"
              description="Notificaciones automáticas sobre situaciones críticas del inventario que requieren atención inmediata."
              details={[
                "Detecta productos con stock crítico",
                "Identifica productos sin movimiento",
                "Alerta sobre puntos de reorden",
                "Clasifica alertas por severidad"
              ]}
              benefits={[
                "Previene quiebres de stock",
                "Reduce productos obsoletos",
                "Actúa antes de problemas críticos",
                "Automatiza vigilancia del inventario"
              ]}
            />
            <StockAlertsView alerts={analytics.stockAlerts} />
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div>
            <InfoPanel 
              title="Análisis de Tendencias de Mercado"
              description="Identifica patrones y tendencias en el comportamiento de ventas por categoría de productos."
              details={[
                "Analiza crecimiento por categoría",
                "Identifica productos en ascenso/declive",
                "Detecta patrones estacionales",
                "Sugiere acciones estratégicas"
              ]}
              benefits={[
                "Identifica oportunidades de negocio",
                "Anticipa cambios del mercado",
                "Optimiza mix de productos",
                "Desarrolla estrategias proactivas"
              ]}
            />
            <TrendsView trends={analytics.trends} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Vista de predicción de demanda
 */
function DemandForecastView({ forecasts }: { forecasts: ProductDemandForecast[] }) {
  const [sortBy, setSortBy] = useState<'confidence' | 'demand' | 'stock'>('confidence');
  
  const sortedForecasts = [...forecasts].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'demand':
        return b.predictedDemand.next30Days - a.predictedDemand.next30Days;
      case 'stock':
        return a.currentStock - b.currentStock;
      default:
        return 0;
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Predicción de Demanda</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="confidence">Por confianza</option>
          <option value="demand">Por demanda</option>
          <option value="stock">Por stock actual</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedForecasts.map((forecast) => (
          <div key={forecast.productId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{forecast.nombre}</h4>
                <p className="text-sm text-gray-600 mb-2">SKU: {forecast.sku} • {forecast.categoria}</p>
                
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Stock Actual</p>
                    <p className="font-semibold">{forecast.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">7 días</p>
                    <p className="font-semibold text-blue-600">{forecast.predictedDemand.next7Days}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">30 días</p>
                    <p className="font-semibold text-green-600">{forecast.predictedDemand.next30Days}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Recomendado</p>
                    <p className="font-semibold text-orange-600">{forecast.recommendedStock}</p>
                  </div>
                </div>
                
                {forecast.factors.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Factores:</p>
                    <div className="flex flex-wrap gap-1">
                      {forecast.factors.map((factor, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {factor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Confianza</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${forecast.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold">{Math.round(forecast.confidence * 100)}%</span>
                  </div>
                </div>
                
                {forecast.currentStock < forecast.recommendedStock && (
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    ⚠️ Reabastecer
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Vista de forecast de ventas
 */
function SalesForecastView({ forecast }: { forecast: PredictiveAnalyticsType['salesForecast'] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast de Ventas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">💰</span>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Revenue Proyectado</p>
              <p className="text-xl font-bold text-blue-900">
                ${forecast.prediction.revenue.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">📦</span>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Unidades</p>
              <p className="text-xl font-bold text-green-900">
                {forecast.prediction.units.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎯</span>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Ticket Promedio</p>
              <p className="text-xl font-bold text-purple-900">
                ${forecast.prediction.averageOrderValue.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-600">Nivel de confianza:</span>
          <div className="flex items-center gap-1">
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${forecast.confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(forecast.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
      
      {forecast.trends.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Tendencias Identificadas:</h4>
          <ul className="space-y-1">
            {forecast.trends.map((trend, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-1">▪</span>
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Vista de alertas de stock
 */
function StockAlertsView({ alerts }: { alerts: StockAlert[] }) {
  const severityColors = {
    low: 'bg-blue-50 text-blue-800 border-blue-200',
    medium: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    high: 'bg-orange-50 text-orange-800 border-orange-200',
    critical: 'bg-red-50 text-red-800 border-red-200'
  };

  const severityIcons = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '🔥',
    critical: '🚨'
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Inteligentes de Stock</h3>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">¡Todo en orden!</h4>
          <p className="text-gray-600">No hay alertas críticas en este momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-4 ${severityColors[alert.severity]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{severityIcons[alert.severity]}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">
                      {alert.sku} - {alert.type.replace('_', ' ')}
                    </h4>
                    <span className="text-xs opacity-75">
                      {alert.createdAt.toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">
                    <strong>Stock actual:</strong> {alert.currentStock} unidades
                  </p>
                  
                  <p className="text-sm mb-3">{alert.recommendedAction}</p>
                  
                  <div className="bg-white/50 rounded p-2 text-xs">
                    <strong>Análisis IA:</strong> {alert.aiReasoning}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Vista de análisis de tendencias
 */
function TrendsView({ trends }: { trends: PredictiveAnalyticsType['trends'] }) {
  const trendIcons = {
    ascending: '📈',
    descending: '📉', 
    stable: '➡️'
  };

  const trendColors = {
    ascending: 'text-green-600',
    descending: 'text-red-600',
    stable: 'text-gray-600'
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Tendencias</h3>
      
      <div className="space-y-4">
        {trends.map((trend, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">{trendIcons[trend.trend]}</span>
                  {trend.category}
                </h4>
                <p className="text-sm text-gray-600">{trend.period}</p>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-bold ${trendColors[trend.trend]}`}>
                  {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 capitalize">{trend.trend}</p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-700">{trend.recommendation}</p>
            </div>
            
            {trend.factors.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Factores influyentes:</p>
                <div className="flex flex-wrap gap-1">
                  {trend.factors.map((factor, factorIdx) => (
                    <span 
                      key={factorIdx}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}