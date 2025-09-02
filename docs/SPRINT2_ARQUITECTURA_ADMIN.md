# 🏗️ Sprint 2: Arquitectura Admin-Products

## 📋 **Flujo Actual vs Flujo Mejorado**

### **🔄 FLUJO ACTUAL (Funcional)**
```
📊 Google Sheets (Leker Excel)
    ↓ (OAuth2 API)
📦 /api/sync-products
    ↓ (Procesamiento automático)
☁️ Supabase (productos table)
    ↓ (Lectura directa)
🌐 Página Web (Productos visibles)
```

### **🎯 FLUJO MEJORADO (Sprint 2)**
```
📊 Google Sheets (Excel modificado)
    ↓ (OAuth2 API)
📦 /api/sync-products
    ↓ (Nuevos productos marcados como 'pending')
☁️ Supabase (productos + productos_pending table)
    ↓
🎛️ Admin Dashboard
    ├── ✅ Aprobar productos nuevos
    ├── ✏️ Corregir precios/datos erróneos
    ├── 🖼️ Verificar imágenes
    └── 📝 Notas de revisión
    ↓ (Solo productos aprobados)
🌐 Página Web (Solo productos aprobados)
```

## 🚀 **Tareas Sprint 2 Definidas**

### **Tarea 2.1: Estructura Modular Base**
```bash
# Crear organización modular
/src/modules/
├── admin/
│   ├── components/     # AdminHeader, AdminLayout, etc
│   ├── services/       # adminService, approvalService
│   ├── hooks/         # useAdmin, useApprovals  
│   └── types/         # AdminTypes
├── products/
│   ├── components/     # ProductCard, ProductList
│   ├── services/       # productService, syncService
│   ├── hooks/         # useProducts, useSync
│   └── types/         # ProductTypes
└── shared/
    ├── components/     # ErrorBoundary, Loading
    ├── hooks/         # useAuth, useSupabase
    └── utils/         # validators, formatters
```

### **Tarea 2.2: Sistema de Aprobación**
```typescript
// Nuevo endpoint: /api/admin/approve-product
interface ProductApproval {
  id: string;
  producto_id: string;
  estado: 'pending' | 'approved' | 'rejected';
  motivo_rechazo?: string;
  admin_usuario: string;
  cambios_solicitados?: string;
  fecha_revision: Date;
}

// Nueva tabla Supabase: productos_pending
// Flujo:
// 1. Sync detecta nuevo producto → productos_pending
// 2. Admin revisa en dashboard → approve/reject
// 3. Si aprueba → productos (visible web)
// 4. Si rechaza → log + notificación
```

### **Tarea 2.3: Dashboard de Aprobación**
```typescript
// Nuevos componentes admin:
<PendingProductsTable />     // Lista productos pendientes
<ProductApprovalModal />     // Modal revisar/aprobar
<ApprovalNotifications />    // Alertas productos pendientes
<ProductComparisonView />    // Ver cambios/diferencias
<BulkApprovalTools />        // Aprobar múltiples
```

### **Tarea 2.4: Integraciones Mejoradas**
```typescript
// Mejorar APIs existentes:
/api/sync-products-csv → Detectar productos nuevos vs modificados
/api/admin/productos → Filtrar solo aprobados para web
/api/admin/pending → CRUD productos pendientes
/api/admin/approve → Procesar aprobaciones
/api/admin/bulk-approve → Aprobación masiva
```

## 🎯 **Plan de Implementación**

### **Semana 1: Bases**
- [x] Análisis arquitectura actual ✅
- [ ] Crear estructura modular /src/modules/
- [ ] Migrar componentes admin existentes
- [ ] Actualizar imports y referencias

### **Semana 2: Sistema Aprobación**  
- [ ] Crear tabla productos_pending en Supabase
- [ ] Modificar sync para detectar nuevos/modificados
- [ ] API endpoints para gestión aprobaciones
- [ ] Dashboard aprobación integrado

### **Semana 3: UX Admin Avanzada**
- [ ] Modal aprobación con preview
- [ ] Comparación before/after productos
- [ ] Notificaciones automáticas 
- [ ] Logs auditoria admin

### **Semana 4: Testing & Refinamiento**
- [ ] Tests unitarios sistema aprobación
- [ ] Performance optimization
- [ ] Documentación admin workflow
- [ ] Deploy y monitoreo

## 🔍 **Consideraciones Técnicas**

### **Base de Datos (Supabase)**
```sql
-- Nueva tabla para productos pendientes
CREATE TABLE productos_pending (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio_nuevo DECIMAL,
  precio_anterior DECIMAL,
  cambios_detectados JSONB,
  estado approval_status DEFAULT 'pending',
  admin_revisor TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_revision TIMESTAMP,
  motivo_rechazo TEXT,
  notas_admin TEXT
);

-- Enum para estados
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
```

### **Flujo de Sincronización**
1. **Detectar cambios**: Comparar Google Sheets vs Supabase actual
2. **Clasificar**: Nuevo producto vs precio/datos modificados  
3. **Ruteo**: Automático (cambios menores) vs Manual (nuevos productos)
4. **Aprobación**: Admin decide qué se publica
5. **Logs**: Auditoría completa de cambios

---

## ✅ **Estado Actual Sprint 2**

- ✅ **Análisis completado**: Arquitectura Google Sheets → Supabase → Admin identificada
- ✅ **Errores TypeScript**: Corregidos errores críticos admin dashboard  
- 🟡 **Modularización**: Pendiente crear estructura /src/modules/
- 🟡 **Sistema Aprobación**: Diseño completado, implementación pendiente

**¿Continuar con la implementación de la estructura modular o necesitas más detalles sobre el sistema de aprobación?**

---

*Documento creado: 29 Agosto 2025*  
*Estado: 🎯 PLANIFICACIÓN COMPLETA*  
*Siguiente: Implementar estructura modular*