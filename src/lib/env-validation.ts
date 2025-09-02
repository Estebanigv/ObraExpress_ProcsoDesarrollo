/**
 * Validación y manejo seguro de variables de entorno
 * NUNCA expongas las claves en logs o errores
 */

// Función para validar que una variable existe sin exponer su valor
function validateEnvVar(name: string, value: string | undefined): void {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  
  // Validación adicional sin exponer el valor
  if (value.includes('tu_') || value.includes('your-') || value.includes('aqui')) {
    throw new Error(`Environment variable ${name} contains placeholder value. Please update .env.local`)
  }
}

// Función para enmascarar claves en logs (muestra solo los primeros/últimos caracteres)
export function maskKey(key: string): string {
  if (!key || key.length < 20) return '***'
  return `${key.substring(0, 10)}...${key.substring(key.length - 10)}`
}

// Validación de configuración de Supabase
export function validateSupabaseConfig(): {
  url: string
  anonKey: string
  serviceKey: string | undefined
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Validar URL
  try {
    validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', url)
    if (url && !url.includes('.supabase.co')) {
      errors.push('Invalid Supabase URL format')
    }
  } catch (e) {
    errors.push((e as Error).message)
  }
  
  // Validar Anon Key
  try {
    validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey)
    if (anonKey && !anonKey.startsWith('eyJ')) {
      errors.push('Invalid Supabase Anon Key format')
    }
  } catch (e) {
    errors.push((e as Error).message)
  }
  
  // Service Key es opcional pero si existe debe ser válida
  if (serviceKey) {
    if (!serviceKey.startsWith('eyJ')) {
      errors.push('Invalid Supabase Service Role Key format')
    }
  }
  
  return {
    url: url || '',
    anonKey: anonKey || '',
    serviceKey,
    isValid: errors.length === 0,
    errors
  }
}

// Middleware para verificar configuración antes de usar Supabase
export function checkSupabaseConfig(): void {
  const config = validateSupabaseConfig()
  
  if (!config.isValid) {
    console.error('❌ Supabase configuration errors:')
    config.errors.forEach(error => console.error(`  - ${error}`))
    
    // En desarrollo, mostrar instrucciones
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📝 To fix this:')
      console.log('1. Check your .env.local file')
      console.log('2. Ensure all required variables are set')
      console.log('3. Restart the development server')
    }
    
    throw new Error('Invalid Supabase configuration. Check console for details.')
  }
  
  // Log seguro de configuración exitosa (sin exponer claves)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Supabase configuration validated:')
    console.log(`  - URL: ${config.url}`)
    console.log(`  - Anon Key: ${maskKey(config.anonKey)}`)
    if (config.serviceKey) {
      console.log(`  - Service Key: ${maskKey(config.serviceKey)}`)
    }
  }
}

// Función para obtener configuración validada
export function getSupabaseConfig() {
  const config = validateSupabaseConfig()
  
  if (!config.isValid) {
    throw new Error('Invalid Supabase configuration')
  }
  
  return {
    url: config.url,
    anonKey: config.anonKey,
    serviceKey: config.serviceKey
  }
}

// Exportar tipo para uso en otros archivos
export type SupabaseConfig = ReturnType<typeof getSupabaseConfig>

// Función para verificar si Supabase está disponible sin lanzar errores
export function isSupabaseConfigured(): boolean {
  try {
    const config = validateSupabaseConfig()
    return config.isValid && config.errors.length === 0
  } catch (error) {
    return false
  }
}

// Respuesta estándar para APIs cuando Supabase no está configurado
export function createSupabaseNotConfiguredResponse() {
  return Response.json({
    success: false,
    error: 'Supabase configuration not available',
    message: 'Database connection is not configured in this environment'
  }, { status: 503 })
}