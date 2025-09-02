import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './env-validation'

// Configuración por defecto para builds sin variables de entorno
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key-for-build-only'

let supabaseUrl = defaultUrl
let supabaseAnonKey = defaultKey
let supabaseServiceKey = undefined

// Solo obtener configuración real si está disponible
if (isSupabaseConfigured()) {
  try {
    const { getSupabaseConfig, checkSupabaseConfig } = require('./env-validation')
    
    // Validar configuración al iniciar
    if (typeof window === 'undefined') {
      // Solo validar en el servidor para no exponer información en el cliente
      try {
        checkSupabaseConfig()
      } catch (error) {
        console.error('⚠️ Supabase configuration error:', error)
      }
    }

    // Obtener configuración validada
    const config = getSupabaseConfig()
    supabaseUrl = config.url
    supabaseAnonKey = config.anonKey
    supabaseServiceKey = config.serviceKey
  } catch (error) {
    console.warn('Using fallback Supabase configuration for build')
  }
} else {
  // En producción, intentar obtener directamente las variables
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    const prodUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const prodAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const prodServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (prodUrl && prodAnonKey) {
      supabaseUrl = prodUrl
      supabaseAnonKey = prodAnonKey
      supabaseServiceKey = prodServiceKey
      console.log('✅ Using production Supabase configuration')
    }
  }
}

// Cliente público con validación
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Cliente administrativo para operaciones que requieren service role
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null

// Tipos de base de datos
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          nombre: string
          telefono: string | null
          fecha_registro: string
          compras_realizadas: number
          total_comprado: number
          tiene_descuento: boolean
          porcentaje_descuento: number
          provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          nombre: string
          telefono?: string | null
          fecha_registro?: string
          compras_realizadas?: number
          total_comprado?: number
          tiene_descuento?: boolean
          porcentaje_descuento?: number
          provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          nombre?: string
          telefono?: string | null
          fecha_registro?: string
          compras_realizadas?: number
          total_comprado?: number
          tiene_descuento?: boolean
          porcentaje_descuento?: number
          provider?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          expires_at: string
          remember_me: boolean
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          expires_at: string
          remember_me?: boolean
          created_at?: string
          last_activity?: string
        }
        Update: {
          expires_at?: string
          last_activity?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          productos: any // JSON
          total: number
          fecha_compra: string
          estado: string
          direccion_entrega: string | null
          telefono_contacto: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          productos: any
          total: number
          fecha_compra?: string
          estado?: string
          direccion_entrega?: string | null
          telefono_contacto?: string | null
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          productos?: any
          total?: number
          estado?: string
          direccion_entrega?: string | null
          telefono_contacto?: string | null
          notas?: string | null
          updated_at?: string
        }
      }
      systems: {
        Row: {
          id: string
          clave: string
          valor: string
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clave: string
          valor: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          valor?: string
          descripcion?: string | null
          updated_at?: string
        }
      }
      contactos: {
        Row: {
          id: string
          nombre: string
          email: string
          telefono: string
          empresa: string | null
          rut: string | null
          cargo: string | null
          region: string | null
          comuna: string | null
          direccion: string | null
          tipo_contacto: 'cliente' | 'proveedor' | 'distribuidor'
          tipo_consulta: 'cotizacion' | 'soporte' | 'reclamo' | 'sugerencia'
          prioridad: 'normal' | 'alta' | 'urgente'
          mensaje: string
          presupuesto: string | null
          tiempo_proyecto: string | null
          estado: 'pendiente' | 'en_proceso' | 'resuelto'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          telefono: string
          empresa?: string | null
          rut?: string | null
          cargo?: string | null
          region?: string | null
          comuna?: string | null
          direccion?: string | null
          tipo_contacto: 'cliente' | 'proveedor' | 'distribuidor'
          tipo_consulta: 'cotizacion' | 'soporte' | 'reclamo' | 'sugerencia'
          prioridad?: 'normal' | 'alta' | 'urgente'
          mensaje: string
          presupuesto?: string | null
          tiempo_proyecto?: string | null
          estado?: 'pendiente' | 'en_proceso' | 'resuelto'
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          email?: string
          telefono?: string
          empresa?: string | null
          rut?: string | null
          cargo?: string | null
          region?: string | null
          comuna?: string | null
          direccion?: string | null
          tipo_contacto?: 'cliente' | 'proveedor' | 'distribuidor'
          tipo_consulta?: 'cotizacion' | 'soporte' | 'reclamo' | 'sugerencia'
          prioridad?: 'normal' | 'alta' | 'urgente'
          mensaje?: string
          presupuesto?: string | null
          tiempo_proyecto?: string | null
          estado?: 'pendiente' | 'en_proceso' | 'resuelto'
          updated_at?: string
        }
      }
      coordinaciones_despacho: {
        Row: {
          id: string
          user_id: string | null
          nombre_cliente: string
          telefono_cliente: string
          email_cliente: string
          region: string
          comuna: string
          direccion: string
          fecha_despacho: string
          comentarios: string | null
          tipo_producto: string
          cantidad: number
          descripcion_producto: string | null
          precio_estimado: number
          estado: 'programado' | 'en_transito' | 'entregado' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          nombre_cliente: string
          telefono_cliente: string
          email_cliente: string
          region: string
          comuna: string
          direccion: string
          fecha_despacho: string
          comentarios?: string | null
          tipo_producto: string
          cantidad?: number
          descripcion_producto?: string | null
          precio_estimado?: number
          estado?: 'programado' | 'en_transito' | 'entregado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          nombre_cliente?: string
          telefono_cliente?: string
          email_cliente?: string
          region?: string
          comuna?: string
          direccion?: string
          fecha_despacho?: string
          comentarios?: string | null
          tipo_producto?: string
          cantidad?: number
          descripcion_producto?: string | null
          precio_estimado?: number
          estado?: 'programado' | 'en_transito' | 'entregado' | 'cancelado'
          updated_at?: string
        }
      }
      descargas_catalogos: {
        Row: {
          id: string
          nombre: string
          email: string
          empresa: string | null
          catalogos_seleccionados: string[]
          acepta_terminos: boolean
          ip_address: string | null
          user_agent: string | null
          download_token: string | null
          email_verified: boolean
          email_sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          empresa?: string | null
          catalogos_seleccionados: string[]
          acepta_terminos?: boolean
          ip_address?: string | null
          user_agent?: string | null
          download_token?: string | null
          email_verified?: boolean
          email_sent?: boolean
          created_at?: string
        }
        Update: {
          nombre?: string
          email?: string
          empresa?: string | null
          catalogos_seleccionados?: string[]
          acepta_terminos?: boolean
          ip_address?: string | null
          user_agent?: string | null
          download_token?: string | null
          email_verified?: boolean
          email_sent?: boolean
        }
      }
      conversaciones_chatbot: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          nombre_cliente: string | null
          email_cliente: string | null
          telefono_cliente: string | null
          mensajes: any // JSON
          estado_conversacion: 'activa' | 'finalizada' | 'abandonada'
          tipo_consulta: string | null
          productos_solicitados: any | null // JSON
          fecha_despacho_seleccionada: string | null
          region_despacho: string | null
          comuna_despacho: string | null
          direccion_despacho: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          webhook_enviado: boolean
          coordinacion_creada: boolean
          coordinacion_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          nombre_cliente?: string | null
          email_cliente?: string | null
          telefono_cliente?: string | null
          mensajes: any
          estado_conversacion?: 'activa' | 'finalizada' | 'abandonada'
          tipo_consulta?: string | null
          productos_solicitados?: any | null
          fecha_despacho_seleccionada?: string | null
          region_despacho?: string | null
          comuna_despacho?: string | null
          direccion_despacho?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          webhook_enviado?: boolean
          coordinacion_creada?: boolean
          coordinacion_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre_cliente?: string | null
          email_cliente?: string | null
          telefono_cliente?: string | null
          mensajes?: any
          estado_conversacion?: 'activa' | 'finalizada' | 'abandonada'
          tipo_consulta?: string | null
          productos_solicitados?: any | null
          fecha_despacho_seleccionada?: string | null
          region_despacho?: string | null
          comuna_despacho?: string | null
          direccion_despacho?: string | null
          webhook_enviado?: boolean
          coordinacion_creada?: boolean
          coordinacion_id?: string | null
          updated_at?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          user_id: string
          tipo: 'compra' | 'despacho' | 'cotizacion' | 'promocion' | 'sistema'
          titulo: string
          mensaje: string
          leida: boolean
          data: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tipo: 'compra' | 'despacho' | 'cotizacion' | 'promocion' | 'sistema'
          titulo: string
          mensaje: string
          leida?: boolean
          data?: any | null
          created_at?: string
        }
        Update: {
          tipo?: 'compra' | 'despacho' | 'cotizacion' | 'promocion' | 'sistema'
          titulo?: string
          mensaje?: string
          leida?: boolean
          data?: any | null
        }
      }
      productos: {
        Row: {
          id: string
          codigo: string
          nombre: string
          categoria: string
          tipo: string
          espesor: string
          ancho: string
          largo: string
          color: string
          uso: string
          costo_proveedor: number
          precio_neto: number
          precio_con_iva: number
          ganancia: number
          margen_ganancia: string
          stock: number
          proveedor: string
          pestaña_origen: string
          orden_original: number
          disponible_en_web: boolean
          tiene_sku_valido: boolean
          tiene_stock_minimo: boolean
          tiene_imagen: boolean
          ruta_imagen: string | null
          motivo_no_disponible: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nombre: string
          categoria: string
          tipo: string
          espesor: string
          ancho: string
          largo: string
          color: string
          uso: string
          costo_proveedor: number
          precio_neto: number
          precio_con_iva: number
          ganancia: number
          margen_ganancia: string
          stock: number
          proveedor: string
          pestaña_origen: string
          orden_original: number
          disponible_en_web?: boolean
          tiene_sku_valido?: boolean
          tiene_stock_minimo?: boolean
          tiene_imagen?: boolean
          ruta_imagen?: string | null
          motivo_no_disponible?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          nombre?: string
          categoria?: string
          tipo?: string
          espesor?: string
          ancho?: string
          largo?: string
          color?: string
          uso?: string
          costo_proveedor?: number
          precio_neto?: number
          precio_con_iva?: number
          ganancia?: number
          margen_ganancia?: string
          stock?: number
          proveedor?: string
          pestaña_origen?: string
          orden_original?: number
          disponible_en_web?: boolean
          tiene_sku_valido?: boolean
          tiene_stock_minimo?: boolean
          tiene_imagen?: boolean
          ruta_imagen?: string | null
          motivo_no_disponible?: string | null
          updated_at?: string
        }
      }
    }
  }
}