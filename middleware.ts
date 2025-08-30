import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuración de seguridad
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}

// Rutas que requieren autenticación
const protectedRoutes = [
  '/admin',
  '/perfil',
  '/coordinador-despacho',
]

// Rutas de API que requieren validación especial
const apiRoutes = [
  '/api/admin',
  '/api/sync-products',
  '/api/sync-supabase',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Bloquear acceso directo a archivos sensibles
  const blockedPaths = [
    '/.env',
    '/.env.local',
    '/.env.production',
    '/config',
    '/.git',
    '/src/lib/env-validation.ts',
  ]
  
  if (blockedPaths.some(path => pathname.startsWith(path))) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // Aplicar headers de seguridad a todas las respuestas
  const response = NextResponse.next()
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Verificar autenticación para rutas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('sb-access-token')
    
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }
  
  // Validación adicional para rutas de API admin
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization')
    
    // Verificar que el request tiene autenticación
    if (!authHeader && !request.cookies.get('sb-access-token')) {
      return new NextResponse('Unauthorized', { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="api"'
        }
      })
    }
    
    // Verificar que no se está intentando acceder con service role key desde el cliente
    if (authHeader && authHeader.includes('service_role')) {
      console.error('⚠️ SECURITY: Attempt to use service role key from client')
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  // Log de seguridad para requests sospechosos
  if (process.env.NODE_ENV === 'production') {
    // Detectar patrones sospechosos
    const suspiciousPatterns = [
      /\.\.\//g,  // Path traversal
      /<script/gi, // XSS attempt
      /union.*select/gi, // SQL injection
      /1=1/g, // SQL injection
    ]
    
    const url = request.url
    const body = request.body
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        console.error(`🚨 SECURITY ALERT: Suspicious pattern detected in URL: ${url}`)
        return new NextResponse('Bad Request', { status: 400 })
      }
    }
  }
  
  return response
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}