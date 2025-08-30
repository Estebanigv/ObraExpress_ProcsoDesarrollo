// Tipos para el sistema de gestión de órdenes/pedidos

export type OrderStatus = 
  | 'pendiente'           // Recién creada, esperando confirmación
  | 'confirmada'          // Confirmada por el cliente
  | 'procesando'          // En preparación/empaque
  | 'lista_despacho'      // Lista para despacho
  | 'en_transito'         // En camino al cliente
  | 'entregada'           // Entregada exitosamente
  | 'cancelada'           // Cancelada por cualquier motivo
  | 'devuelta';           // Devuelta por el cliente

export type PaymentStatus = 
  | 'pendiente'           // Pago pendiente
  | 'pagado'              // Pago completado
  | 'fallido'             // Pago fallido
  | 'reembolsado';        // Reembolso procesado

export type DeliveryType = 
  | 'domicilio'           // Despacho a domicilio
  | 'retiro_tienda'       // Retiro en tienda
  | 'coordinacion';       // Coordinación especial

export interface OrderItem {
  id: string;
  producto_codigo: string;
  producto_nombre: string;
  producto_imagen?: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  especificaciones?: string[];
  variante?: string;
  tipo: 'producto' | 'coordinacion';
}

export interface CustomerInfo {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  rut?: string;
}

export interface DeliveryInfo {
  tipo: DeliveryType;
  direccion?: string;
  comuna?: string;
  region?: string;
  fecha_programada?: string;
  hora_programada?: string;
  instrucciones?: string;
  costo_despacho: number;
}

export interface PaymentInfo {
  metodo: 'tarjeta' | 'transferencia' | 'efectivo' | 'webpay';
  estado: PaymentStatus;
  monto: number;
  fecha_pago?: string;
  transaccion_id?: string;
  detalles?: any;
}

export interface Order {
  id: string;
  numero_orden: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: OrderStatus;
  
  // Información del cliente
  cliente: CustomerInfo;
  
  // Items del pedido
  items: OrderItem[];
  
  // Totales
  subtotal: number;
  descuento: number;
  costo_despacho: number;
  total: number;
  
  // Información de entrega
  entrega: DeliveryInfo;
  
  // Información de pago
  pago: PaymentInfo;
  
  // Metadatos
  comentarios?: string;
  notas_internas?: string;
  canal_origen?: 'web' | 'telefono' | 'whatsapp' | 'admin';
  
  // Timestamps
  fecha_confirmacion?: string;
  fecha_procesamiento?: string;
  fecha_despacho?: string;
  fecha_entrega?: string;
  fecha_cancelacion?: string;
  
  // Tracking
  tracking_codigo?: string;
  historial: OrderHistoryEntry[];
}

export interface OrderHistoryEntry {
  id: string;
  fecha: string;
  accion: string;
  descripcion: string;
  usuario?: string;
  estado_anterior?: OrderStatus;
  estado_nuevo?: OrderStatus;
  detalles?: any;
}

// Estados para filtros y métricas
export interface OrderFilters {
  estado?: OrderStatus[];
  fecha_desde?: string;
  fecha_hasta?: string;
  cliente?: string;
  canal_origen?: string[];
  monto_min?: number;
  monto_max?: number;
  tipo_entrega?: DeliveryType[];
  region?: string[];
  comuna?: string[];
}

// Métricas de órdenes para dashboard
export interface OrderMetrics {
  total_ordenes: number;
  ordenes_pendientes: number;
  ordenes_procesando: number;
  ordenes_entregadas: number;
  ordenes_canceladas: number;
  ventas_total: number;
  ventas_mes: number;
  ventas_dia: number;
  promedio_orden: number;
  tiempo_promedio_entrega: number;
  tasa_cancelacion: number;
}

// Para tablas y listados
export interface OrderSummary {
  id: string;
  numero_orden: string;
  fecha_creacion: string;
  cliente_nombre: string;
  cliente_telefono: string;
  estado: OrderStatus;
  total: number;
  items_count: number;
  tipo_entrega: DeliveryType;
  fecha_entrega_programada?: string;
}

// Para el dashboard de métricas
export interface OrderStats {
  periodo: string;
  ordenes_nuevas: number;
  ordenes_completadas: number;
  ventas_total: number;
  cliente_nuevos: number;
  producto_mas_vendido: string;
  region_mas_activa: string;
}

// Estados de la UI
export interface OrderManagementState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalOrders: number;
  sortBy: keyof Order;
  sortOrder: 'asc' | 'desc';
}

// Acciones para actualizar órdenes
export interface OrderUpdatePayload {
  id: string;
  estado?: OrderStatus;
  notas_internas?: string;
  fecha_despacho?: string;
  tracking_codigo?: string;
  [key: string]: any;
}