# 📋 Guía de Estructura de Componentes ObraExpress

## 🎯 Principios de Diseño

### 1. **Separación por Contexto**
```
📁 /src/components/
  ├── 📁 admin/           # Solo administración interna
  ├── 📁 client/          # Solo experiencia del cliente  
  └── 📁 shared/          # Componentes reutilizables
```

### 2. **Responsabilidades Específicas**

#### 🏢 **Componentes Admin** (`/admin/`)
**Propósito**: Herramientas de gestión empresarial
**Características**:
- Tablas densas con muchos datos
- Métricas y KPIs empresariales  
- Formularios de configuración
- Dashboards profesionales
- Colores corporativos (grises, azules)

**Ejemplos**:
- `AdminLayout.tsx` - Layout exclusivo admin
- `AdminDashboard.tsx` - Dashboard principal
- `InventoryManager.tsx` - Gestión de inventario
- `SheetsSync.tsx` - Sincronización Google Sheets
- `ImageUploader.tsx` - Upload de imágenes
- `MetricsCard.tsx` - Tarjetas de métricas

#### 👥 **Componentes Cliente** (`/client/`)
**Propósito**: Experiencia de compra optimizada
**Características**:
- UX moderna y atractiva
- Enfoque en conversión
- Responsive mobile-first
- Animaciones fluidas
- Colores vibrantes (gradientes, verdes)

**Ejemplos**:
- `ClientLayout.tsx` - Layout para clientes
- `ProductCard.tsx` - Tarjetas de productos
- `ShoppingCart.tsx` - Carrito de compras
- `QuoteCalculator.tsx` - Cotizador inteligente
- `CheckoutFlow.tsx` - Flujo de pago
- `UserProfile.tsx` - Perfil del cliente

#### 🔄 **Componentes Compartidos** (`/shared/`)
**Propósito**: Reutilización entre admin y cliente
**Características**:
- UI agnóstica al contexto
- Configurable via props
- Sin estilos específicos de admin/client

**Ejemplos**:
- `Button.tsx` - Botones configurables
- `Modal.tsx` - Modales genéricos
- `LoadingSpinner.tsx` - Indicadores de carga
- `ErrorBoundary.tsx` - Manejo de errores
- `NotificationToast.tsx` - Notificaciones

## 🎨 **Separación de Estilos**

### Admin Styles (`/styles/admin/`)
```css
/* Paleta profesional */
--admin-primary: #1e40af;      /* Azul corporativo */
--admin-secondary: #64748b;    /* Gris neutro */
--admin-success: #059669;      /* Verde datos */
--admin-warning: #d97706;      /* Naranja alertas */
--admin-danger: #dc2626;       /* Rojo errores */

/* Tipografía densa */
font-size: 0.875rem;           /* 14px - compacto */
line-height: 1.25;             /* Líneas ajustadas */
```

### Client Styles (`/styles/client/`)
```css
/* Paleta atractiva */
--client-primary: #667eea;     /* Azul vibrante */
--client-secondary: #764ba2;   /* Púrpura moderno */
--client-accent: #059669;      /* Verde llamada-acción */
--client-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Tipografía legible */
font-size: 1rem;               /* 16px - estándar */
line-height: 1.6;              /* Líneas cómodas */
```

## 🔧 **Convenciones de Código**

### Nomenclatura de Componentes
```typescript
// ✅ Correcto - Admin
AdminInventoryTable.tsx
AdminMetricCard.tsx  
AdminUserManager.tsx

// ✅ Correcto - Client
ClientProductCard.tsx
ClientCheckoutForm.tsx
ClientQuoteModal.tsx

// ✅ Correcto - Shared
Button.tsx
Modal.tsx
LoadingSpinner.tsx
```

### Props Interface
```typescript
// Admin Component
interface AdminTableProps {
  data: AdminInventoryItem[];
  onEdit: (id: string) => void;
  dense?: boolean;
  exportable?: boolean;
}

// Client Component  
interface ClientCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  animated?: boolean;
  featured?: boolean;
}
```

## 📱 **Responsive Design**

### Admin (Desktop-First)
- Optimizado para pantallas grandes (1440px+)
- Tablas horizontales extensas
- Múltiples columnas de datos
- Móvil como vista compacta

### Cliente (Mobile-First)
- Optimizado para móviles (375px+)
- Cards verticales
- Una columna en móvil
- Escritorio como mejora

## 🔐 **Control de Acceso**

### Rutas Admin
```typescript
// Requiere autenticación admin
/admin/*           -> AdminLayout
/admin/dashboard   -> AdminDashboard  
/admin/inventory   -> AdminInventory
/admin/metrics     -> AdminMetrics
```

### Rutas Cliente
```typescript
// Acceso público + autenticación opcional
/*                 -> ClientLayout
/productos         -> ClientProductCatalog
/checkout          -> ClientCheckout (requiere auth)
/perfil           -> ClientProfile (requiere auth)
```

## ✅ **Checklist de Implementación**

### Al crear un componente Admin:
- [ ] Usar `AdminLayout` como wrapper
- [ ] Importar `/styles/admin/dashboard.css`
- [ ] Aplicar clase `admin-*` para estilos
- [ ] Validar autenticación admin
- [ ] Optimizar para desktop/tablet

### Al crear un componente Cliente:
- [ ] Usar `ClientLayout` como wrapper  
- [ ] Importar `/styles/client/ecommerce.css`
- [ ] Aplicar clases `client-*` para estilos
- [ ] Implementar responsive mobile-first
- [ ] Optimizar animaciones y transiciones

### Componentes Compartidos:
- [ ] Sin dependencias de layout específico
- [ ] Props configurables para contexto
- [ ] Estilos neutros/configurables
- [ ] Documentación de uso para admin y client

Esta estructura garantiza:
✅ **Separación clara** de responsabilidades  
✅ **Reutilización eficiente** de código
✅ **Mantenimiento simplificado** 
✅ **Escalabilidad** a futuro