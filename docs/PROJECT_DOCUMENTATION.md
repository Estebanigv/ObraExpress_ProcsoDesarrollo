# 📚 PROJECT DOCUMENTATION - ObraExpress

## 🎯 Descripción del Proyecto y Contexto

**ObraExpress** es una plataforma e-commerce B2B/B2C especializada en la venta de productos de policarbonato para construcción en Chile. El proyecto fue desarrollado para digitalizar y automatizar las operaciones de venta, gestión de inventario y atención al cliente de una empresa líder en el sector de materiales de construcción.

### Contexto de Negocio
- **Cliente Principal**: Constructoras, arquitectos, y usuarios finales
- **Productos**: Policarbonato alveolar, compacto, ondulado y accesorios
- **Mercado**: Chile (con potencial expansión LATAM)
- **Volumen**: ~89 productos activos, 200+ transacciones mensuales esperadas
- **Diferenciador**: Configurador avanzado de productos y chatbot IA especializado

## 🛠️ Stack Tecnológico Utilizado

### Core Framework
```json
{
  "framework": "Next.js 15.4.6",
  "runtime": "React 19.1.0",
  "language": "TypeScript 5",
  "styling": "Tailwind CSS 4 + DaisyUI 5.0.50",
  "deployment": "Vercel + Hostinger (static export)"
}
```

### Dependencias Principales
- **UI/UX**:
  - `framer-motion@12.23.12` - Animaciones fluidas
  - `lucide-react@0.539.0` - Iconografía consistente
  - `recharts@3.1.2` - Visualización de datos admin
  - `@react-three/fiber` - Visualizaciones 3D (experimental)

- **Backend/Database**:
  - `@supabase/supabase-js@2.55.0` - Base de datos PostgreSQL
  - `googleapis@157.0.0` - Sincronización Google Sheets
  - `google-auth-library@10.3.0` - OAuth authentication

- **Pagos y Comunicación**:
  - `transbank-sdk@6.1.0` - Procesamiento de pagos
  - `resend@6.0.1` - Email transaccional

## 🏗️ Arquitectura Actual vs Propuesta

### Arquitectura Actual (Monolítica)
```
/src
├── app/                    # Next.js App Router
│   ├── admin/             # Panel administrativo
│   ├── api/               # API routes mezcladas
│   ├── productos/         # Páginas de productos
│   └── [otras páginas]    # Resto de páginas
├── components/            # Componentes sin organización clara
├── contexts/              # Estados globales
├── data/                  # JSONs y datos estáticos
├── lib/                   # Utilidades
└── types/                 # TypeScript types
```

### Arquitectura Propuesta (Modular)
```
/src
├── modules/
│   ├── products/          # Módulo de productos
│   │   ├── components/    
│   │   ├── services/      
│   │   ├── hooks/         
│   │   └── types/         
│   ├── chatbot/           # Módulo chatbot IA
│   │   ├── components/    
│   │   ├── knowledge-base/
│   │   ├── services/      
│   │   └── types/         
│   ├── admin/             # Módulo administrativo
│   │   ├── analytics/     
│   │   ├── inventory/     
│   │   ├── users/         
│   │   └── sync/          
│   ├── checkout/          # Módulo de pagos
│   │   ├── transbank/     
│   │   ├── cart/          
│   │   └── order/         
│   └── shared/            # Compartido entre módulos
│       ├── ui/            
│       ├── utils/         
│       └── hooks/         
├── app/                   # Rutas (thin layer)
└── infrastructure/        # Configuraciones y setup
```

## 📋 Lista de Funcionalidades Existentes

### ✅ Funcionalidades Implementadas y Funcionales

#### Sistema de Productos
- [x] Catálogo dinámico con sincronización Google Sheets → Supabase
- [x] Separación de precios Admin (costos) vs Cliente (precio IVA)
- [x] Configurador de productos simple y avanzado
- [x] Sistema de variantes (colores, espesores, dimensiones)
- [x] Control de visibilidad web por producto
- [x] Gestión de stock en tiempo real
- [x] Imágenes optimizadas con WebP/AVIF

#### E-commerce
- [x] Carrito de compras persistente (localStorage)
- [x] Checkout con Transbank integrado
- [x] Calculadora de envío por comuna
- [x] Sistema de cotizaciones
- [x] Descarga de catálogos PDF

#### Autenticación y Usuarios
- [x] Google OAuth 2.0
- [x] Login/Registro manual
- [x] Gestión de sesiones con JWT
- [x] Perfil de usuario básico
- [x] Sistema de roles (admin/cliente)

#### Panel Administrativo
- [x] Dashboard con métricas KPI
- [x] Gestión de inventario completa
- [x] Sincronización manual/automática
- [x] Control de productos web
- [x] Vista de costos y márgenes
- [x] Upload de imágenes de productos

#### Chatbot IA (Parcialmente Funcional)
- [x] Interfaz de chat flotante
- [x] Integración con base de conocimiento JSON
- [~] Persistencia de conversaciones (con problemas)
- [x] Coordinación de despachos
- [ ] Memoria de contexto confiable

### 🔄 Funcionalidades en Desarrollo
- [ ] Analytics avanzado con IA
- [ ] Sistema de notificaciones push
- [ ] PWA para móviles
- [ ] Multi-idioma (español/inglés)
- [ ] Sistema de reviews/ratings

## ⚠️ Problemas Identificados

### 🔴 Críticos (Afectan funcionalidad core)

#### 1. **Chatbot - Pérdida de Información**
- **Problema**: El chatbot pierde contexto y base de conocimiento aleatoriamente
- **Causa**: No hay persistencia adecuada del estado en `floating-chat-simple.tsx`
- **Impacto**: Conversaciones incompletas, pérdida de ventas potenciales
- **Archivos afectados**:
  - `/src/components/floating-chat-simple.tsx`
  - `/src/app/api/chatbot/route.ts` (no existe, necesario crear)
  - `CHATBOT_ObraExpress_OPTIMIZED.json` (configuración n8n externa)

#### 2. **Performance - Imágenes sin Optimización Completa**
- **Problema**: Algunas imágenes cargan sin lazy loading
- **Causa**: Componente `OptimizedImage` no se usa consistentemente
- **Impacto**: LCP alto, afecta SEO y conversión

#### 3. **Build Warnings - TypeScript Errors**
- **Problema**: Múltiples warnings en build de producción
- **Causa**: Types incompletos y any implícitos
- **Impacto**: Posibles errores en runtime

### 🟡 Medios (Afectan experiencia pero no bloquean)

#### 4. **Sincronización - Sin Notificaciones de Error**
- **Problema**: Fallos silenciosos en sync Google Sheets
- **Causa**: No hay sistema de alertas implementado
- **Impacto**: Datos desactualizados sin aviso

#### 5. **Mobile UX - Navegación Compleja**
- **Problema**: Menú móvil difícil de usar en pantallas pequeñas
- **Causa**: Diseño no optimizado para touch
- **Impacto**: Pérdida de conversión móvil (~40% del tráfico)

## 🗄️ Esquema de Base de Datos Supabase

### Tablas Principales

#### `productos` (89 registros activos)
```sql
- id: UUID PRIMARY KEY
- codigo: TEXT UNIQUE (SKU)
- nombre: TEXT NOT NULL
- categoria: TEXT
- tipo: TEXT
- espesor: TEXT (mm)
- ancho: TEXT (metros)
- largo: TEXT (metros)
- color: TEXT
- uso: TEXT
- costo_proveedor: NUMERIC (admin only)
- precio_neto: NUMERIC (admin only)
- precio_con_iva: NUMERIC (public)
- ganancia: NUMERIC (admin only)
- margen_ganancia: TEXT (admin only)
- stock: INTEGER
- proveedor: TEXT DEFAULT 'Leker'
- disponible_en_web: BOOLEAN
- tiene_imagen: BOOLEAN
- ruta_imagen: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `users` (Autenticación y perfil)
```sql
- id: UUID PRIMARY KEY
- email: TEXT UNIQUE
- password_hash: TEXT
- nombre: TEXT
- telefono: TEXT
- compras_realizadas: INTEGER
- total_comprado: NUMERIC
- tiene_descuento: BOOLEAN
- porcentaje_descuento: NUMERIC
- provider: TEXT (google/manual)
```

#### `conversaciones_chatbot` (Historial chat)
```sql
- id: UUID PRIMARY KEY
- session_id: TEXT
- mensajes: JSON
- estado_conversacion: ENUM
- productos_solicitados: JSON
- datos_cliente: TEXT
- coordinacion_id: UUID REFERENCES coordinaciones_despacho
```

#### `purchases` (Transacciones)
```sql
- id: UUID PRIMARY KEY
- user_id: UUID REFERENCES users
- products: JSON
- total: NUMERIC
- status: TEXT
- payment_method: TEXT
- transbank_order_id: TEXT
- created_at: TIMESTAMPTZ
```

### Relaciones y Políticas RLS
- **Productos**: Lectura pública (filtrado por `disponible_en_web`), escritura admin
- **Users**: Lectura/escritura propia, admin full access
- **Conversaciones**: Escritura pública, lectura por session_id
- **Purchases**: Lectura propia, escritura via API

## 🎨 Análisis del Diseño Actual (NO modificar)

### Elementos de Diseño a Preservar

#### 1. **Identidad Visual**
- **Colores Principales**: 
  - Primary: `#2563eb` (blue-600)
  - Secondary: `#f97316` (orange-500)
  - Success: `#10b981` (emerald-500)
- **Tipografía**: System fonts con fallback sans-serif
- **Espaciado**: Basado en rem (4, 8, 16, 24, 32, 48, 64)

#### 2. **Componentes UI Exitosos**
- **Navbar**: Diseño limpio con mega-menu funcional
- **Product Cards**: Layout con hover effects y quick view
- **Admin Tables**: Diseño denso pero legible
- **Floating Elements**: Chat y carrito con animaciones smooth

#### 3. **Flujos UX Validados**
- **Checkout**: 3 pasos claros (carrito → datos → pago)
- **Configurador**: Wizard step-by-step intuitivo
- **Admin**: Sidebar + content area familiar

### Métricas de Performance Actuales
```javascript
{
  "lighthouse": {
    "performance": 72,
    "accessibility": 88,
    "best_practices": 83,
    "seo": 92
  },
  "web_vitals": {
    "LCP": "2.8s",  // Necesita mejora
    "FID": "95ms",  // Bueno
    "CLS": "0.08",  // Bueno
    "TTFB": "0.6s"  // Aceptable
  }
}
```

## 🤖 Información sobre Integración IA en Admin

### Estado Actual
- **Sin IA implementada** en el panel admin actual
- Preparado para integración con hooks y servicios

### Propuesta de IA para Admin

#### 1. **Analytics Predictivo**
- Predicción de demanda por producto
- Alertas de stock crítico inteligentes
- Sugerencias de precios basadas en mercado

#### 2. **Asistente Admin IA**
- Generación automática de descripciones de productos
- Respuestas a consultas de datos complejas
- Automatización de reportes

#### 3. **Optimización de Inventario**
- Recomendaciones de reorden
- Análisis de productos de baja rotación
- Sugerencias de bundles y promociones

### Preparación Técnica Necesaria
```typescript
// Estructura propuesta para servicios IA
interface AIService {
  analyzeProducts(): Promise<ProductInsights>
  generateDescription(product: Product): Promise<string>
  predictDemand(sku: string, period: number): Promise<DemandForecast>
  suggestPricing(product: Product, market: MarketData): Promise<PricingSuggestion>
}
```

## 🔒 Seguridad y Autenticación

### Implementado
- [x] OAuth 2.0 con Google
- [x] Hashing de passwords con bcrypt
- [x] JWT para sesiones
- [x] RLS en Supabase
- [x] HTTPS en producción
- [x] Variables de entorno seguras

### Pendiente
- [ ] 2FA para admin
- [ ] Rate limiting en APIs
- [ ] Audit logs
- [ ] CAPTCHA en formularios
- [ ] Content Security Policy estricta

## 📊 Datos y Métricas del Proyecto

### Estadísticas de Código
```yaml
Total Archivos: 127
Líneas de Código: ~15,000
Componentes React: 48
API Routes: 23
Páginas: 18
Tests: 0 (❌ Necesario implementar)
```

### Dependencias
- **Producción**: 24 packages
- **Desarrollo**: 12 packages
- **Vulnerabilidades**: 0 críticas, 2 medias (en dev deps)

### Performance Budget
```javascript
{
  "bundle_size": {
    "main": "245KB",
    "vendor": "380KB",
    "total": "625KB"
  },
  "targets": {
    "main": "< 200KB",  // Necesita optimización
    "vendor": "< 400KB", // OK
    "total": "< 600KB"   // Necesita optimización
  }
}
```

## 🚀 Estado de Deployment

### Producción (Vercel)
- **URL**: [Por definir]
- **Branch**: `main`
- **Auto-deploy**: Habilitado
- **Environment**: Production

### Staging (Vercel)
- **URL**: [Por definir]
- **Branch**: `develop`
- **Auto-deploy**: Habilitado
- **Environment**: Preview

### Static Export (Hostinger)
- **Build Command**: `npm run build:static`
- **Output**: `/out` directory
- **Limitaciones**: Sin SSR, sin API routes dinámicas

## 📝 Notas Importantes para Desarrollo

### ⚠️ NO MODIFICAR
1. Diseño visual actual (colores, tipografía, espaciado)
2. Flujos de usuario validados
3. Estructura de base de datos
4. Integraciones funcionando (Transbank, Google OAuth)

### ✅ PRIORIDADES
1. **Solucionar chatbot** - pérdida de contexto
2. **Modularizar código** - mejorar mantenibilidad
3. **Implementar tests** - cobertura mínima 70%
4. **Optimizar performance** - reducir bundle size
5. **Documentar APIs** - OpenAPI/Swagger

### 🔧 CONFIGURACIÓN REQUERIDA
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://lbjslbhglvanctbtoehi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REQUERIDO]
SUPABASE_SERVICE_ROLE_KEY=[REQUERIDO]
GOOGLE_SHEET_ID=1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc
CRON_SECRET_TOKEN=obraexpress-f7qil19jmfc2dl1wlx3odw
```

---

*Documento actualizado: Agosto 2025*
*Versión: 1.0.0*
*Mantenedor: Equipo ObraExpress Development*