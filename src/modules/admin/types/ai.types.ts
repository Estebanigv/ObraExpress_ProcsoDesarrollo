/**
 * Tipos para sistema de IA en Admin de ObraExpress
 * Sprint 4: Admin con IA - Definiciones de tipos
 */

// Tipos base para IA
export interface AIServiceConfig {
  apiKey?: string;
  model: 'gpt-4' | 'claude-3' | 'local';
  endpoint?: string;
  timeout: number;
  fallbackEnabled: boolean;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  source: 'openai' | 'claude' | 'local' | 'fallback';
  processingTime?: number;
}

// Analytics Predictivo
export interface PredictiveAnalytics {
  productDemand: ProductDemandForecast[];
  salesForecast: SalesForecast;
  stockAlerts: StockAlert[];
  trends: TrendAnalysis[];
}

export interface ProductDemandForecast {
  productId: string;
  sku: string;
  nombre: string;
  categoria: string;
  currentStock: number;
  predictedDemand: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
  recommendedStock: number;
  confidence: number;
  factors: DemandFactor[];
}

export interface SalesForecast {
  period: 'weekly' | 'monthly' | 'quarterly';
  prediction: {
    revenue: number;
    units: number;
    averageOrderValue: number;
  };
  confidence: number;
  trends: string[];
}

export interface StockAlert {
  id: string;
  productId: string;
  sku: string;
  type: 'low_stock' | 'overstock' | 'out_of_stock' | 'reorder_point';
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentStock: number;
  recommendedAction: string;
  aiReasoning: string;
  createdAt: Date;
}

export interface TrendAnalysis {
  category: string;
  trend: 'ascending' | 'descending' | 'stable';
  change: number; // percentage
  period: string;
  factors: string[];
  recommendation: string;
}

export interface DemandFactor {
  name: string;
  impact: number; // -1 to 1
  description: string;
}

// Asistente de IA
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  actions?: ChatAction[];
}

export interface ChatAttachment {
  type: 'chart' | 'table' | 'report' | 'product';
  data: any;
  title: string;
}

export interface ChatAction {
  id: string;
  type: 'navigate' | 'export' | 'update' | 'create';
  label: string;
  payload: any;
}

export interface AdminQuery {
  query: string;
  context: AdminContext;
  expectedResponseType: 'analytics' | 'recommendation' | 'data' | 'action';
}

export interface AdminContext {
  currentPage: string;
  selectedProducts?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

// Optimización de Inventario
export interface InventoryOptimization {
  reorderSuggestions: ReorderSuggestion[];
  lowRotationProducts: LowRotationProduct[];
  bundleRecommendations: BundleRecommendation[];
  pricingOptimization: PricingOptimization[];
}

export interface ReorderSuggestion {
  productId: string;
  sku: string;
  nombre: string;
  currentStock: number;
  suggestedOrderQuantity: number;
  urgency: 'low' | 'medium' | 'high';
  reasoning: string;
  expectedStockoutDate?: Date;
  supplierInfo?: {
    name: string;
    leadTime: number;
    minOrderQuantity: number;
  };
}

export interface LowRotationProduct {
  productId: string;
  sku: string;
  nombre: string;
  stockValue: number;
  daysSinceLastSale: number;
  rotationRate: number;
  recommendation: 'discount' | 'bundle' | 'discontinue' | 'remarket';
  aiSuggestion: string;
}

export interface BundleRecommendation {
  id: string;
  name: string;
  products: {
    productId: string;
    sku: string;
    nombre: string;
    quantity: number;
  }[];
  estimatedDemandIncrease: number;
  suggestedDiscount: number;
  reasoning: string;
  confidence: number;
}

export interface PricingOptimization {
  productId: string;
  sku: string;
  currentPrice: number;
  suggestedPrice: number;
  expectedImpact: {
    revenueChange: number;
    volumeChange: number;
  };
  reasoning: string;
  marketFactors: string[];
}

// Reportes Automáticos
export interface AutoReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  sections: ReportSection[];
  generatedAt: Date;
  insights: string[];
  actions: RecommendedAction[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  data: any;
  insights?: string[];
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'inventory' | 'pricing' | 'marketing' | 'operations';
  estimatedImpact: string;
  actionUrl?: string;
}

// Métricas y Performance
export interface AIMetrics {
  totalQueries: number;
  successRate: number;
  averageResponseTime: number;
  mostUsedFeatures: string[];
  userSatisfaction?: number;
  costUsage: {
    current: number;
    budget: number;
    period: string;
  };
}

export interface ModelPerformance {
  model: string;
  accuracy: number;
  responseTime: number;
  errorRate: number;
  lastEvaluated: Date;
  benchmarkScore?: number;
}

// Configuración y Preferencias
export interface AIPreferences {
  userId: string;
  language: 'es' | 'en';
  responseStyle: 'detailed' | 'concise' | 'technical';
  enabledFeatures: string[];
  notificationSettings: {
    stockAlerts: boolean;
    priceChanges: boolean;
    demandForecasts: boolean;
    weeklyReports: boolean;
  };
}

export default {};