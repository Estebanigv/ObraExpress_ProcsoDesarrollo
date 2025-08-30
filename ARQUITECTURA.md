# Arquitectura ObraExpress

## Separación Cliente/Admin

### 🏢 ADMIN PANEL (/admin)
**Propósito**: Gestión empresarial interna
**Usuarios**: Equipo ObraExpress
**Funcionalidades**:
- Dashboard de administración
- Gestión de inventario
- Sincronización con Google Sheets  
- Upload de imágenes de productos
- Métricas comerciales y financieras
- CRM y post-venta
- Coordinación de despachos

**Archivos clave**:
- `/src/app/admin/` - Panel de administración
- `/src/components/admin/` - Componentes exclusivos admin
- `/src/lib/admin-setup.ts` - Configuración admin
- `/src/hooks/useSheetSync.ts` - Sincronización datos

### 👥 CLIENT SITE (/)
**Propósito**: Experiencia de compra para clientes
**Usuarios**: Clientes finales y empresas
**Funcionalidades**:
- Catálogo de productos
- Cotizador inteligente
- Sistema de carrito y checkout
- Perfiles de usuario
- Seguimiento de pedidos
- Soporte via chatbot

**Archivos clave**:
- `/src/app/` - Páginas públicas (productos, contacto, etc.)
- `/src/components/` - Componentes de UI del cliente
- `/src/contexts/CartContext.tsx` - Estado del carrito
- `/src/contexts/AuthContext.tsx` - Autenticación de clientes

### 🔄 APIS COMPARTIDAS (/api)
**Sincronización de datos**:
- `/api/sync-products-csv` - Sincronización con Google Sheets
- `/api/get-products-data` - Datos de productos
- `/api/upload-image` - Upload de imágenes (admin)
- `/api/payment/` - Procesamiento de pagos (cliente)

### 📊 FLUJO DE DATOS
```
Google Sheets ↔ Admin Panel ↔ API ↔ Client Site
     ↓              ↓         ↓        ↓
  Inventario   Gestión   Base de   Catálogo
   Maestro    Comercial   Datos    Público
```

### 🎨 SEPARACIÓN DE ESTILOS
- **Admin**: Dashboard profesional, tablas densas, métricas
- **Client**: UX moderna, responsive, enfocada en conversión

### 🔒 AUTENTICACIÓN
- **Admin**: Credenciales internas (admin@obraexpress.cl)
- **Client**: OAuth Google + registro tradicional

Esta arquitectura garantiza:
✅ Separación clara de responsabilidades
✅ Escalabilidad independiente
✅ Seguridad por capas
✅ Mantenimiento simplificado