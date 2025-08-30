// Tipos para el sistema de métricas de ventas

export interface SalesMetrics {
  periodo: 'dia' | 'semana' | 'mes' | 'ano';
  fecha_inicio: string;
  fecha_fin: string;
  
  // Ventas generales
  ventas_totales: number;
  cantidad_ordenes: number;
  ticket_promedio: number;
  crecimiento_ventas: number; // % respecto periodo anterior
  
  // Productos
  productos_vendidos: number;
  producto_mas_vendido: ProductSalesInfo;
  categoria_mas_vendida: CategorySalesInfo;
  
  // Clientes
  clientes_nuevos: number;
  clientes_recurrentes: number;
  tasa_retencion: number;
  
  // Geografía
  region_mas_activa: RegionSalesInfo;
  despachos_vs_retiros: DeliveryTypeSales;
  
  // Rentabilidad
  margen_bruto: number;
  costos_despacho: number;
  ganancia_neta: number;
}

export interface ProductSalesInfo {
  codigo: string;
  nombre: string;
  categoria: string;
  unidades_vendidas: number;
  ingresos: number;
  participacion_ventas: number; // % del total
}

export interface CategorySalesInfo {
  nombre: string;
  productos_count: number;
  unidades_vendidas: number;
  ingresos: number;
  participacion_ventas: number;
}

export interface RegionSalesInfo {
  nombre: string;
  ordenes: number;
  ingresos: number;
  participacion_ventas: number;
  tiempo_entrega_promedio: number;
}

export interface DeliveryTypeSales {
  domicilio: {
    ordenes: number;
    ingresos: number;
    participacion: number;
  };
  retiro_tienda: {
    ordenes: number;
    ingresos: number;
    participacion: number;
  };
  coordinacion: {
    ordenes: number;
    ingresos: number;
    participacion: number;
  };
}

// Series de tiempo para gráficos
export interface SalesTimeSeries {
  fecha: string;
  ventas: number;
  ordenes: number;
  clientes_nuevos: number;
}

// Datos para gráficos de comparación
export interface SalesComparison {
  periodo_actual: SalesMetrics;
  periodo_anterior: SalesMetrics;
  variacion_porcentual: number;
}

// Métricas por canal de venta
export interface ChannelSalesMetrics {
  canal: 'web' | 'telefono' | 'whatsapp' | 'admin';
  ordenes: number;
  ingresos: number;
  participacion: number;
  conversion_rate?: number;
}

// Top productos/categorías
export interface TopSellingItem {
  id: string;
  nombre: string;
  tipo: 'producto' | 'categoria';
  unidades_vendidas: number;
  ingresos: number;
  participacion_ventas: number;
  imagen?: string;
}

// Métricas de satisfacción del cliente
export interface CustomerSatisfactionMetrics {
  ordenes_entregadas: number;
  ordenes_canceladas: number;
  ordenes_devueltas: number;
  tasa_satisfaccion: number;
  tiempo_entrega_promedio: number;
  reclamos: number;
}

// Configuración de filtros para el dashboard
export interface SalesFilters {
  fecha_inicio: string;
  fecha_fin: string;
  periodo: 'dia' | 'semana' | 'mes' | 'ano';
  regiones?: string[];
  categorias?: string[];
  canales?: string[];
  tipo_entrega?: string[];
}

// Estado del dashboard de ventas
export interface SalesDashboardState {
  metrics: SalesMetrics | null;
  timeSeries: SalesTimeSeries[];
  topProducts: TopSellingItem[];
  topCategories: TopSellingItem[];
  channelMetrics: ChannelSalesMetrics[];
  customerSatisfaction: CustomerSatisfactionMetrics | null;
  filters: SalesFilters;
  loading: boolean;
  error: string | null;
  selectedView: 'overview' | 'products' | 'customers' | 'geography' | 'trends';
}