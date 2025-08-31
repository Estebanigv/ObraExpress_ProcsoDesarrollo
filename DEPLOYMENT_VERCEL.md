# 🚀 Guía de Deployment en Vercel

## 📋 Variables de Entorno Requeridas

Para que el proyecto funcione correctamente en producción, necesitas configurar las siguientes variables de entorno en Vercel:

### 🔐 Supabase (Base de Datos)
```env
NEXT_PUBLIC_SUPABASE_URL=https://lbjslbhglvanctbtoehi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxianNsYmhnbHZhbmN0YnRvZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMDkzMjMsImV4cCI6MjA3MDg4NTMyM30.9vxxt0dikYY66U6ZoqBzDiq2LIdZPeoZHIsudq2lVn4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxianNsYmhnbHZhbmN0YnRvZWhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMwOTMyMywiZXhwIjoyMDcwODg1MzIzfQ.mKYt8GFhJEx28Soy3NGPsN_-lyw_G37tlZlOE4mPY2Q
SUPABASE_PROJECT_ID=lbjslbhglvanctbtoehi
```

### 📊 Google Sheets (Sincronización de Productos)
```env
GOOGLE_SHEET_ID=1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc
```

### 🔄 Cron Jobs (Sincronización Automática)
```env
CRON_SECRET_TOKEN=obraexpress-f7qil19jmfc2dl1wlx3odw
```

## 🛠️ Pasos para el Deployment

### 1. Conectar con GitHub
1. Ve a [Vercel](https://vercel.com)
2. Importa el repositorio: `https://github.com/Estebanigv/ObraExpress_EnDesarrollo`
3. Selecciona el framework: **Next.js**

### 2. Configurar Variables de Entorno
1. En la configuración del proyecto en Vercel
2. Ve a **Settings > Environment Variables**
3. Agrega cada variable listada arriba

### 3. Configurar Sincronización Automática
El archivo `vercel.json` ya está configurado para sincronizar automáticamente cada 6 horas:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-products",
      "schedule": "0 */6 * * *",
      "headers": {
        "Authorization": "Bearer obraexpress-f7qil19jmfc2dl1wlx3odw"
      }
    }
  ]
}
```

## 🔍 Verificación Post-Deployment

### URLs de API para Verificar:
- **Admin (Completo)**: `https://tu-dominio.vercel.app/api/admin/productos`
- **Cliente (Público)**: `https://tu-dominio.vercel.app/api/productos-publico`
- **Sincronización Manual**: `POST https://tu-dominio.vercel.app/api/sync-products-csv`

### Flujo de Datos:
```
Google Sheets → Supabase → Admin Panel → Cliente Web
     ↑                           ↓
     └── Sincronización ←────────┘
         (Cada 6 horas)
```

## 📈 Arquitectura del Sistema

### Separación de Información:
- **Admin**: Ve costos, márgenes, ganancia, stock completo
- **Cliente**: Solo ve precios con IVA y información pública

### Base de Datos (Supabase):
- Tabla `productos` con 89 productos sincronizados
- Actualización automática desde Google Sheets
- Control de visibilidad por producto

## ⚠️ Importante

1. **NO** subir archivos `.env.local` a GitHub
2. Las variables de entorno están protegidas por `.gitignore`
3. Supabase maneja la persistencia de datos
4. Google Sheets es la fuente de verdad para productos
5. El admin controla qué productos se muestran en la web

## 🔗 Enlaces Útiles

- **GitHub**: https://github.com/Estebanigv/ObraExpress_EnDesarrollo
- **Supabase Dashboard**: https://supabase.com/dashboard/project/lbjslbhglvanctbtoehi
- **Google Sheet**: [Ver Hoja de Productos](https://docs.google.com/spreadsheets/d/1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc)

## 📞 Soporte

Para problemas con el deployment o configuración, revisar:
1. Los logs en Vercel Dashboard
2. Los logs de Supabase
3. La sincronización de Google Sheets