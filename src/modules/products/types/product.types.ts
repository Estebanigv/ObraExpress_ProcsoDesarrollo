// Tipos centralizados para productos de ObraExpress
export interface ProductBase {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  tipo: string;
  espesor: string;
  ancho: string;
  largo: string;
  color: string;
  uso: string;
  stock: number;
  pestaña_origen: string;
  orden_original: number;
  disponible_en_web: boolean;
  tiene_sku_valido: boolean;
  tiene_stock_minimo: boolean;
  tiene_imagen: boolean;
  ruta_imagen: string | null;
  motivo_no_disponible: string | null;
  created_at: string;
  updated_at: string;
}

// Producto completo con información financiera (solo admin)
export interface ProductAdmin extends ProductBase {
  costo_proveedor: number;
  precio_neto: number;
  ganancia: number;
  margen_ganancia: string;
  proveedor: string;
}

// Producto público (solo información visible al cliente)
export interface ProductPublic extends ProductBase {
  precio_con_iva: number;
}

// Producto para exportación CSV
export interface ProductCSV {
  'Código SKU': string;
  'Producto': string;
  'Categoría': string;
  'Tipo': string;
  'Espesor (mm)': string;
  'Color': string;
  'Dimensiones': string;
  'Stock': number;
  'Costo Proveedor': number;
  'Precio Neto': number;
  'Precio con IVA': number;
  'Ganancia': number;
  'Margen (%)': string;
  'Proveedor': string;
  'Disponible Web': string;
  'Tiene Imagen': string;
  [key: string]: string | number; // Index signature para acceso dinámico
}

// Variante de producto (para admin dashboard)
export interface ProductVariant {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  tipo: string;
  espesor: string;
  ancho: string;
  largo: string;
  color: string;
  uso: string;
  precio_con_iva: number;
  stock: number;
  disponible_en_web: boolean;
  tiene_imagen: boolean;
  ruta_imagen?: string;
  dimensiones?: string; // Agregado para compatibilidad
  // Información adicional para admin
  costo_proveedor?: number;
  precio_neto?: number;
  ganancia?: number;
  margen_ganancia?: string;
  proveedor?: string;
}

// Configuración de producto (para configurador)
export interface ProductConfiguration {
  espesor?: string;
  ancho?: string;
  largo?: string;
  color?: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
}

// Estadísticas de productos (admin dashboard)
export interface ProductStats {
  totalProducts: number;
  totalVariants: number;
  visibleProducts: number;
  hiddenProducts: number;
  autoHiddenProducts: number;
  totalStock: number;
  lowStockCount: number;
  moderateStockCount: number;
  goodStockCount: number;
  criticalStockCount: number; // Agregamos esta propiedad faltante
  outOfStockCount: number;
  productosConImagen: number;
  productosSinImagen: number;
  productosNoDisponiblesWeb: number;
  categorias: CategoryStats[];
  proveedores: ProviderStats[];
}

// Estadísticas por categoría
export interface CategoryStats {
  categoria: string;
  count: number;
  stock_total: number;
  precio_promedio: number;
}

// Estadísticas por proveedor
export interface ProviderStats {
  proveedor: string;
  count: number;
  stock_total: number;
  costo_promedio: number;
}

// Filtros de productos
export interface ProductFilters {
  searchTerm?: string;
  categoria?: string;
  proveedor?: string;
  disponible_en_web?: boolean;
  tiene_imagen?: boolean;
  stock_minimo?: number;
  precio_min?: number;
  precio_max?: number;
}

// Orden de productos
export type ProductSortBy = 'nombre' | 'precio' | 'stock' | 'categoria' | 'fecha';
export type SortOrder = 'asc' | 'desc';

// Problema de producto (para alertas admin)
export interface ProductIssue {
  id: number;
  tipo: 'precio' | 'stock' | 'imagen' | 'datos' | 'nuevo' | 'modificado';
  producto: string;
  problema: string;
  fecha: Date;
  usuario: string;
  precio: number | null;
  resuelto?: boolean;
}

// Notificación de producto
export interface ProductNotification {
  id: string;
  tipo: 'stock_bajo' | 'precio_cambio' | 'nuevo_producto' | 'producto_oculto';
  producto_id: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
}

// Usuario de admin dashboard
export interface AdminUser {
  nombre: string;
  rol: 'admin' | 'editor' | 'viewer';
  ultima_actividad: Date;
  acciones_realizadas: number;
}

// Configuración de colores para usuarios (admin dashboard)
export interface UserColorConfig {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  badge: string;
  initials: string;
}

// Configuración de colores por usuario
export type UserColorsMap = {
  [userName: string]: UserColorConfig;
}

// Respuesta de API para productos
export interface ProductAPIResponse {
  success: boolean;
  data: ProductAdmin[] | ProductPublic[];
  message?: string;
  error?: string;
}

// Respuesta de sincronización
export interface SyncResponse {
  success: boolean;
  productos_procesados: number;
  productos_actualizados: number;
  productos_nuevos: number;
  errores: string[];
  tiempo_procesamiento: string;
}

// Configuración de paginación
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationConfig;
  filters?: ProductFilters;
}