/**
 * Middleware de seguridad para protección de API y credenciales
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Headers de seguridad recomendados
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Función para verificar si la solicitud proviene de un origen confiable
function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://lbjslbhglvanctbtoehi.supabase.co',
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter(Boolean)
  
  // En producción, ser más estricto
  if (process.env.NODE_ENV === 'production') {
    return origin ? allowedOrigins.includes(origin) : false
  }
  
  // En desarrollo, ser más permisivo pero seguro
  return true
}

// Función para sanitizar headers de respuesta
function sanitizeResponseHeaders(response: NextResponse): NextResponse {
  // Aplicar headers de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Remover headers que podrían exponer información sensible
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  return response
}

// Función para detectar y prevenir exposición de credenciales
function checkForCredentialLeak(body: any): boolean {
  if (!body) return false
  
  const bodyStr = JSON.stringify(body)
  
  // Patrones de credenciales de Supabase
  const patterns = [
    /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, // JWT tokens
    /service_role/gi,
    /SUPABASE_SERVICE_ROLE_KEY/gi,
  ]
  
  for (const pattern of patterns) {
    if (pattern.test(bodyStr)) {
      console.error('⚠️ WARNING: Potential credential leak detected in response')
      return true
    }
  }
  
  return false
}

// Middleware principal de seguridad
export async function securityMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Verificar origen
  if (!isAllowedOrigin(request)) {
    return new NextResponse('Forbidden', { 
      status: 403,
      headers: securityHeaders 
    })
  }
  
  // Verificar métodos HTTP permitidos
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { 
      status: 405,
      headers: securityHeaders 
    })
  }
  
  // Rate limiting básico (almacenar en memoria o Redis en producción)
  // Aquí iría la lógica de rate limiting
  
  try {
    // Ejecutar el handler
    const response = await handler()
    
    // Verificar que no haya fugas de credenciales en la respuesta
    const responseBody = await response.clone().text()
    try {
      const jsonBody = JSON.parse(responseBody)
      if (checkForCredentialLeak(jsonBody)) {
        // En caso de detectar una fuga, devolver error genérico
        return new NextResponse('Internal Server Error', { 
          status: 500,
          headers: securityHeaders 
        })
      }
    } catch {
      // No es JSON, continuar
    }
    
    // Aplicar headers de seguridad y devolver
    return sanitizeResponseHeaders(response)
  } catch (error) {
    console.error('Security middleware error:', error)
    
    // Nunca exponer detalles del error en producción
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error'
      : (error as Error).message
    
    return new NextResponse(message, { 
      status: 500,
      headers: securityHeaders 
    })
  }
}

// Función helper para verificar autenticación con Supabase
export async function requireAuth(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }
  
  // Aquí iría la verificación del token con Supabase
  // Por ahora, solo validamos que existe
  return token
}

// Exportar configuración de seguridad
export const securityConfig = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  rateLimitPerMinute: 60,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  blockedPaths: [
    '/.env',
    '/.env.local',
    '/config',
    '/.git',
  ],
}