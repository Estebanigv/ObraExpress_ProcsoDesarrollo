# 📋 ObraExpress - Descripción Completa del Proyecto

## 🎯 Descripción del Proyecto

**ObraExpress** es una plataforma e-commerce especializada en productos de policarbonato y materiales para construcción, dirigida al mercado chileno. El sistema está diseñado con una arquitectura dual que separa la experiencia del cliente del panel administrativo, optimizando tanto la conversión comercial como la gestión empresarial.

## 🏗️ Arquitectura del Sistema

### Separación Cliente/Admin
```
┌─────────────────────┐    ┌──────────────────────┐
│   CLIENTE PÚBLICO   │    │    PANEL ADMIN       │
│                     │    │                      │
│ • Catálogo público  │    │ • Gestión completa   │
│ • Precios con IVA   │    │ • Costos proveedor   │
│ • Carrito/Checkout  │    │ • Márgenes/Ganancia  │
│ • Cotizaciones      │    │ • Control de stock   │
│ • Chatbot IA        │    │ • Sincronización     │
└─────────────────────┘    └──────────────────────┘
           │                           │
           └───────────┬───────────────┘
                       ▼
               ┌─────────────────┐
               │   SUPABASE DB   │
               │                 │
               │ • Productos     │
               │ • Usuarios      │
               │ • Compras       │
               │ • Conversaciones│
               │ • Coordinaciones│
               └─────────────────┘
                       ▲
               ┌─────────────────┐
               │ GOOGLE SHEETS   │
               │ (Fuente verdad) │
               └─────────────────┘
```

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.4.6** - Framework React con App Router
- **React 19.1.0** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **Framer Motion 12.23** - Animaciones fluidas
- **DaisyUI 5.0.50** - Componentes UI prediseñados

### Backend & Database
- **Supabase** - Base de datos PostgreSQL y autenticación
- **Google Sheets API** - Sincronización de inventario
- **Vercel** - Hosting y deployment

### Integraciones
- **Transbank SDK** - Pagos con tarjeta
- **Google OAuth** - Autenticación social
- **ElevenLabs** - Widget de voz AI
- **Resend** - Envío de emails

### Herramientas de Desarrollo
- **ESLint** - Linter de código
- **Cross-env** - Variables de entorno multiplataforma
- **Web Vitals** - Métricas de rendimiento

## 📊 Esquema de Base de Datos (Supabase)

### Tabla: `productos`
```sql
- id (UUID, Primary Key)
- codigo (TEXT, SKU único)
- nombre (TEXT, Nombre del producto)
- categoria (TEXT, Categoría principal)
- tipo (TEXT, Subcategoría)
- espesor, ancho, largo (TEXT, Medidas técnicas)
- color, uso (TEXT, Especificaciones)
- costo_proveedor (NUMERIC, Solo admin)
- precio_neto (NUMERIC, Solo admin)
- precio_con_iva (NUMERIC, Público)
- ganancia, margen_ganancia (NUMERIC/TEXT, Solo admin)
- stock (INTEGER, Inventario)
- disponible_en_web (BOOLEAN, Control visibilidad)
- tiene_imagen, ruta_imagen (BOOLEAN/TEXT, Gestión multimedia)
```

### Tabla: `users`
```sql
- id (UUID, Primary Key)
- email, nombre, telefono (TEXT, Datos personales)
- password_hash (TEXT, Autenticación)
- compras_realizadas, total_comprado (NUMERIC, Historial)
- tiene_descuento, porcentaje_descuento (BOOLEAN/NUMERIC)
- provider (TEXT, OAuth/manual)
```

### Tabla: `conversaciones_chatbot`
```sql
- id (UUID, Primary Key)
- session_id (TEXT, Sesión única)
- mensajes (JSON, Historial completo)
- estado_conversacion (ENUM: activa/finalizada/abandonada)
- productos_solicitados (JSON, Productos consultados)
- datos_cliente (TEXT, Nombre, email, teléfono)
- coordinacion_id (UUID, Link a despacho)
```

### Otras Tablas
- `purchases` - Historial de compras
- `contactos` - Formularios de contacto
- `coordinaciones_despacho` - Gestión de entregas
- `descargas_catalogos` - Descargas de documentos
- `notificaciones` - Sistema de alertas

## ⚡ Funcionalidades Principales

### 🛒 E-commerce Cliente
- **Catálogo Dinámico**: Productos sincronizados desde Google Sheets
- **Configurador Avanzado**: Calculadora de medidas y precios
- **Sistema de Carrito**: Persistente con localStorage
- **Checkout Completo**: Integración con Transbank
- **Autenticación**: Google OAuth + registro manual
- **Responsive Design**: Optimizado para móviles

### 🤖 Chatbot Inteligente
- **IA Conversacional**: Asistente especializado en productos
- **Base de Conocimiento**: Archivo JSON optimizado con productos
- **Coordinación Automática**: Genera citas de despacho
- **Seguimiento**: Historial completo en Supabase
- **Integración Completa**: Conectado con inventario real

### 🏢 Panel Administrativo
- **Dashboard Central**: Métricas y KPIs en tiempo real
- **Gestión de Inventario**: Control completo de productos
- **Sincronización Automática**: Google Sheets → Supabase
- **Upload de Imágenes**: Gestión multimedia
- **Control de Visibilidad**: Mostrar/ocultar productos
- **Gestión de Usuarios**: CRM básico integrado

### 📈 Sincronización de Datos
- **Fuente Única**: Google Sheets como master data
- **Sincronización Automática**: Cada 6 horas vía cron
- **Separación de Información**: Admin ve costos, cliente solo precios públicos
- **Fallback System**: JSON local como respaldo
- **Tiempo Real**: Cambios inmediatos en la web

## 🔗 APIs y Endpoints

### Cliente Público
- `GET /api/productos-publico` - Catálogo con precios IVA
- `POST /api/payment/create` - Iniciar pago Transbank
- `GET /api/payment/confirm` - Confirmar transacción

### Administración
- `GET /api/admin/productos` - Vista completa con costos
- `POST /api/admin/toggle-visibility` - Control de visibilidad
- `POST /api/admin/update-stock` - Actualizar inventario
- `POST /api/sync-products-csv` - Sincronización manual

### Automático
- `POST /api/cron/sync-products` - Sync automático (token requerido)

## 🎨 Diseño y UX

### Cliente
- **Diseño Moderno**: Interfaz limpia y profesional
- **Mobile First**: Optimizado para dispositivos móviles
- **Performance**: Imágenes optimizadas y lazy loading
- **Animaciones**: Transiciones fluidas con Framer Motion
- **Accesibilidad**: Contraste y navegación por teclado

### Admin
- **Dashboard Profesional**: Tablas densas y métricas
- **Interfaz Eficiente**: Acciones rápidas y bulk operations
- **Visualización de Datos**: Gráficos con Recharts
- **Responsive**: Funcional en tablets y desktop

## 🔒 Seguridad y Privacidad

### Autenticación
- **Google OAuth 2.0**: Login seguro con Google
- **JWT Tokens**: Sesiones seguras
- **Role-based Access**: Admin vs Cliente
- **Password Hashing**: bcrypt para contraseñas

### Protección de Datos
- **Separación de Información**: Costos ocultos para clientes
- **HTTPS Obligatorio**: Certificados SSL/TLS
- **Validación de Inputs**: Sanitización de datos
- **Rate Limiting**: Protección contra ataques

## 🚀 Estado Actual del Desarrollo

### ✅ Completado
- Arquitectura base Next.js 15
- Integración completa con Supabase
- Sincronización Google Sheets
- Sistema de productos público/admin
- Autenticación Google OAuth
- Panel administrativo funcional
- Chatbot básico implementado
- Sistema de pagos Transbank

### 🔄 En Desarrollo
- Optimización del chatbot IA
- Mejoras de performance
- Testing automatizado
- SEO avanzado
- Analytics integrado

### ❌ Problemas Identificados
- Chatbot: Base de conocimiento puede perderse
- Performance: Imágenes sin optimizar
- Testing: Cobertura insuficiente
- Documentación: Módulos sin documentar
- Monitoreo: Faltan métricas de error

## 🎯 Objetivos del Proyecto

### Corto Plazo
1. **Estabilidad**: Resolver errores de build y runtime
2. **Performance**: Optimizar carga y SEO
3. **Chatbot**: Mejorar confiabilidad y base de conocimiento
4. **Testing**: Implementar suite de pruebas

### Mediano Plazo
1. **Escalabilidad**: Arquitectura modular
2. **Analytics**: Tracking completo de conversiones
3. **Automatización**: Workflows de deployment
4. **Mobile App**: PWA o app nativa

### Largo Plazo
1. **Multi-tienda**: Soporte para múltiples vendedores
2. **IA Avanzada**: Recomendaciones personalizadas
3. **Integración ERP**: Sistemas empresariales
4. **Expansión Regional**: Otros países LATAM

---

## 📞 Información de Contacto del Proyecto

- **Empresa**: ObraExpress Chile
- **Dominio**: [En desarrollo]
- **Email Admin**: admin@obraexpress.cl
- **Versión Actual**: 0.1.0
- **Última Actualización**: Agosto 2025

---

*Este documento constituye la base de conocimiento técnica del proyecto ObraExpress y debe mantenerse actualizado con cada cambio significativo en la arquitectura o funcionalidades.*