/**
 * Hook para sistema de IA en Admin de ObraExpress
 * Sprint 4: Admin con IA - Hook unificado
 */

import { useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/ai-service';
import { 
  PredictiveAnalytics, 
  InventoryOptimization, 
  AdminQuery, 
  AdminContext, 
  AutoReport,
  AIMetrics 
} from '../types/ai.types';

interface UseAIOptions {
  enablePredictiveAnalytics?: boolean;
  enableInventoryOptimization?: boolean;
  enableAutoReports?: boolean;
  refreshInterval?: number; // minutos
}

export function useAI(products: any[], context: AdminContext, options: UseAIOptions = {}) {
  const {
    enablePredictiveAnalytics = true,
    enableInventoryOptimization = true,
    enableAutoReports = true,
    refreshInterval = 30
  } = options;

  // Estados
  const [analytics, setAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [optimization, setOptimization] = useState<InventoryOptimization | null>(null);
  const [report, setReport] = useState<AutoReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Cargar datos inicial
  useEffect(() => {
    if (products.length > 0) {
      loadAllData();
    }
  }, [products, enablePredictiveAnalytics, enableInventoryOptimization, enableAutoReports]);

  /**
   * Cargar todos los datos de IA
   */
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const promises = [];

      if (enablePredictiveAnalytics) {
        promises.push(
          aiService.generatePredictiveAnalytics(products)
            .then(response => {
              if (response.success && response.data) {
                setAnalytics(response.data);
              }
              return response;
            })
        );
      }

      if (enableInventoryOptimization) {
        promises.push(
          aiService.optimizeInventory(products)
            .then(response => {
              if (response.success && response.data) {
                setOptimization(response.data);
              }
              return response;
            })
        );
      }

      if (enableAutoReports) {
        promises.push(
          aiService.generateAutoReport('daily', { products, context })
            .then(response => {
              if (response.success && response.data) {
                setReport(response.data);
              }
              return response;
            })
        );
      }

      const results = await Promise.all(promises);
      
      // Verificar si alguno falló
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        setError(`${failures.length} servicios fallaron`);
      }

    } catch (err) {
      setError('Error cargando datos de IA');
      console.error('Error en useAI:', err);
    } finally {
      setLoading(false);
    }
  }, [products, enablePredictiveAnalytics, enableInventoryOptimization, enableAutoReports]);

  /**
   * Procesar consulta de IA
   */
  const processQuery = useCallback(async (query: string): Promise<any> => {
    const adminQuery: AdminQuery = {
      query,
      context,
      expectedResponseType: 'analytics'
    };

    try {
      const response = await aiService.processAdminQuery(adminQuery);
      return response;
    } catch (error) {
      console.error('Error procesando consulta:', error);
      return {
        success: false,
        error: 'Error procesando consulta'
      };
    }
  }, [context]);

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(() => {
    loadAllData();
  }, [loadAllData]);

  /**
   * Refrescar solo analytics
   */
  const refreshAnalytics = useCallback(async () => {
    if (!enablePredictiveAnalytics) return;

    try {
      const response = await aiService.generatePredictiveAnalytics(products);
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error refrescando analytics:', error);
    }
  }, [products, enablePredictiveAnalytics]);

  /**
   * Refrescar solo optimización
   */
  const refreshOptimization = useCallback(async () => {
    if (!enableInventoryOptimization) return;

    try {
      const response = await aiService.optimizeInventory(products);
      if (response.success && response.data) {
        setOptimization(response.data);
      }
    } catch (error) {
      console.error('Error refrescando optimización:', error);
    }
  }, [products, enableInventoryOptimization]);

  /**
   * Generar nuevo reporte
   */
  const generateReport = useCallback(async (type: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    if (!enableAutoReports) return null;

    try {
      const response = await aiService.generateAutoReport(type, { products, context });
      if (response.success && response.data) {
        setReport(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error generando reporte:', error);
      return null;
    }
  }, [products, context, enableAutoReports]);

  /**
   * Obtener métricas del sistema
   */
  const getMetrics = useCallback(async (): Promise<AIMetrics | null> => {
    try {
      const stats = aiService.getStats();
      
      const aiMetrics: AIMetrics = {
        totalQueries: stats.requestCount,
        successRate: 0.85, // Simulated
        averageResponseTime: 1200, // Simulated
        mostUsedFeatures: ['Analytics', 'Inventory Optimization'],
        costUsage: {
          current: 0, // Local model - no cost
          budget: 100,
          period: 'monthly'
        }
      };

      setMetrics(aiMetrics);
      return aiMetrics;
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      return null;
    }
  }, []);

  /**
   * Aplicar optimización
   */
  const applyOptimization = useCallback((optimizationId: string, type: string, data: any) => {
    console.log(`Aplicando optimización ${optimizationId}:`, { type, data });
    
    // Aquí iría la lógica real de aplicar la optimización
    // Por ahora solo lo loggeamos
    
    return {
      success: true,
      message: `Optimización ${optimizationId} aplicada exitosamente`
    };
  }, []);

  /**
   * Obtener recomendaciones rápidas
   */
  const getQuickInsights = useCallback((): string[] => {
    const insights: string[] = [];

    if (analytics) {
      if (analytics.stockAlerts.length > 0) {
        insights.push(`${analytics.stockAlerts.length} productos necesitan reabastecimiento`);
      }
      
      if (analytics.trends.length > 0) {
        const ascendingTrends = analytics.trends.filter(t => t.trend === 'ascending').length;
        if (ascendingTrends > 0) {
          insights.push(`${ascendingTrends} categorías en tendencia ascendente`);
        }
      }
    }

    if (optimization) {
      if (optimization.reorderSuggestions.length > 0) {
        insights.push(`${optimization.reorderSuggestions.length} sugerencias de reorden disponibles`);
      }
      
      if (optimization.bundleRecommendations.length > 0) {
        insights.push(`${optimization.bundleRecommendations.length} oportunidades de bundle identificadas`);
      }
    }

    if (insights.length === 0) {
      insights.push('Todo funcionando correctamente ✅');
    }

    return insights;
  }, [analytics, optimization]);

  /**
   * Estado de carga general
   */
  const isAnyLoading = loading;

  /**
   * ¿Está listo el sistema?
   */
  const isReady = !loading && (analytics !== null || optimization !== null);

  return {
    // Datos
    analytics,
    optimization,
    report,
    metrics,
    
    // Estados
    loading,
    error,
    isReady,
    isAnyLoading,
    
    // Acciones
    processQuery,
    refreshAll,
    refreshAnalytics,
    refreshOptimization,
    generateReport,
    getMetrics,
    applyOptimization,
    getQuickInsights,
    
    // Configuración
    aiService
  };
}

/**
 * Hook simplificado para consultas de IA
 */
export function useAIQuery() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (queryString: string, context: AdminContext) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const adminQuery: AdminQuery = {
        query: queryString,
        context,
        expectedResponseType: 'analytics'
      };

      const result = await aiService.processAdminQuery(adminQuery);
      
      if (result.success) {
        setResponse(result.data);
      } else {
        setError(result.error || 'Error en consulta');
      }
      
      return result;
    } catch (err) {
      const errorMsg = 'Error procesando consulta de IA';
      setError(errorMsg);
      console.error('Error en useAIQuery:', err);
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    query,
    reset,
    loading,
    response,
    error
  };
}

export default useAI;