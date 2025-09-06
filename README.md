# 🏗️ ObraExpress - Plataforma E-commerce de Materiales de Construcción

Plataforma e-commerce moderna especializada en materiales de construcción premium, con enfoque en policarbonatos y sistemas estructurales para Chile.

## 🚀 Tecnologías

- **Framework**: Next.js 15.5.2 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + CSS Modules
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth + OAuth (Google)
- **Pagos**: Transbank WebPay Plus
- **UI Components**: shadcn/ui, Lucide React
- **Estado**: React Context API + Redux Toolkit
- **Imágenes**: Next.js Image optimization
- **Analytics**: Web Vitals
- **Testing**: Jest (configurado)

## 📦 Características Principales

### 🛒 **E-commerce Completo**
- Catálogo de productos con filtros avanzados
- Configurador de productos dinámico (dimensiones, colores, espesores)
- Carrito de compras persistent
- Checkout con integración de pagos Transbank

### 🤖 **IA y Automatización**
- Cotizador inteligente por IA
- Recomendaciones de productos automáticas
- Chatbot integrado para soporte
- Análisis predictivo de proyectos

### 📱 **UX/UI Optimizada**
- Responsive design (mobile-first)
- PWA ready
- Dark/light mode
- Lazy loading y optimización de imágenes
- SEO avanzado con structured data

### 🔐 **Seguridad y Performance**
- Autenticación OAuth segura
- Rate limiting en APIs
- Validación de datos en cliente y servidor
- Cache optimizado
- Compresión de assets

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Variables de entorno configuradas

### Configuración Local

1. **Clonar el repositorio**:
```bash
git clone https://github.com/Estebanigv/ObraExpress_ProcsoDesarrollo.git
cd ObraExpress
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp .env.local.example .env.local
# Editar .env.local con tus claves
```

4. **Ejecutar en desarrollo**:
```bash
npm run dev
```

5. **Build de producción**:
```bash
npm run build
npm start
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción  
npm run start        # Servidor de producción
npm run lint         # Análisis de código
npm run type-check   # Verificación TypeScript
```

## 📊 Productos y Categorías

### **Policarbonatos**
- **Ondulado**: Ideal para techos y cubiertas
- **Alveolar**: Excelente aislamiento térmico  
- **Compacto**: Máxima resistencia y durabilidad

### **Perfiles y Accesorios**
- **Perfil U**: Cierre para extremos de paneles
- **Perfil Clip Plano**: Sistema de unión sin tornillos
- **Accesorios**: Tornillos, selladores, elementos de fijación

### **Características Técnicas**
- ✅ Garantía UV 10 años
- ✅ Resistencia a impactos superiores
- ✅ Transmisión lumínica optimizada
- ✅ Fabricación con estándares internacionales

## 🗂️ Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # API Routes
│   ├── admin/             # Panel administrativo
│   └── (pages)/           # Páginas del sitio
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI base
│   └── forms/            # Formularios
├── contexts/             # Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
├── modules/              # Módulos funcionales
│   ├── products/         # Gestión de productos
│   ├── auth/            # Autenticación
│   └── checkout/        # Proceso de compra
└── types/               # Definiciones TypeScript
```

## 🔧 APIs y Integraciones

### **APIs Internas**
- `/api/productos-publico` - Catálogo público
- `/api/admin/*` - Gestión administrativa  
- `/api/payments/*` - Procesamiento de pagos
- `/api/auth/*` - Autenticación

### **Servicios Externos**
- **Supabase**: Base de datos y auth
- **Transbank**: Procesamiento de pagos
- **Google Sheets**: Sincronización de inventario
- **Google Maps**: Geolocalización

## 📈 Performance y SEO

### **Optimizaciones Implementadas**
- ✅ Lazy loading de componentes
- ✅ Image optimization con Next.js
- ✅ Static generation para páginas públicas
- ✅ Structured data (JSON-LD) 
- ✅ Meta tags optimizados
- ✅ Sitemap XML dinámico
- ✅ Cache strategies avanzadas

### **Métricas Objetivo**
- **First Load JS**: < 500KB
- **Largest Contentful Paint**: < 2.5s  
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🚦 Estados del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| ✅ Frontend | Completo | Responsive, optimizado |
| ✅ Backend APIs | Completo | Todas las funcionalidades |
| ✅ Base de datos | Completo | Schema optimizado |
| ✅ Autenticación | Completo | OAuth + JWT |
| ✅ Pagos | Completo | Transbank integrado |
| ✅ Admin Panel | Completo | Gestión completa |
| ✅ SEO | Optimizado | Structured data |
| ⚠️ Testing | Básico | Expandir cobertura |

## 📞 Contacto y Soporte

- **Email**: desarrollo@obraexpress.cl
- **WhatsApp**: +56 9 6334 8909
- **Horario**: Lunes a Viernes 9:00-18:00, Sábado 9:00-14:00

## 📄 Licencia

© 2024 ObraExpress Chile - Todos los derechos reservados

---

**🤖 Desarrollado con [Claude Code](https://claude.ai/code)**

> Proyecto optimizado y mantenido con IA para máximo rendimiento y escalabilidad.