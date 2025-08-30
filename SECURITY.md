# 🔐 Documentación de Seguridad - ObraExpress

## Índice
1. [Configuración de Credenciales](#configuración-de-credenciales)
2. [Medidas de Seguridad Implementadas](#medidas-de-seguridad-implementadas)
3. [Políticas RLS de Supabase](#políticas-rls-de-supabase)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Checklist de Seguridad](#checklist-de-seguridad)
6. [Respuesta a Incidentes](#respuesta-a-incidentes)

---

## 🔑 Configuración de Credenciales

### Variables de Entorno

Las credenciales se almacenan en `.env.local` que **NUNCA** debe subirse a control de versiones.

```env
NEXT_PUBLIC_SUPABASE_URL=https://lbjslbhglvanctbtoehi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[CLAVE_PUBLICA]
SUPABASE_SERVICE_ROLE_KEY=[CLAVE_SERVICIO]
```

### Jerarquía de Claves

1. **Anon Key (Pública)**: Usada en el cliente, solo permite operaciones públicas
2. **Service Role Key (Privada)**: SOLO en servidor, para operaciones administrativas

⚠️ **NUNCA** uses la Service Role Key en código del cliente

---

## 🛡️ Medidas de Seguridad Implementadas

### 1. Validación de Variables de Entorno
- **Archivo**: `src/lib/env-validation.ts`
- Valida que las credenciales estén configuradas
- Enmascara claves en logs
- Previene exposición accidental

### 2. Middleware de Seguridad
- **Archivo**: `middleware.ts`
- Headers de seguridad (XSS, CSRF, Clickjacking)
- Bloqueo de rutas sensibles
- Detección de patrones sospechosos
- Rate limiting básico

### 3. Middleware de API
- **Archivo**: `src/middleware/security.ts`
- Validación de origen (CORS)
- Sanitización de respuestas
- Detección de fugas de credenciales
- Autenticación requerida

### 4. Protección de Archivos
```
.gitignore incluye:
- .env*
- *.local
- /config
- credenciales temporales
```

---

## 🔒 Políticas RLS de Supabase

### Configuración RLS
**Script**: `scripts/setup-rls-security.sql`

### Políticas por Tabla

| Tabla | Lectura | Escritura | Restricción |
|-------|---------|-----------|-------------|
| users | Propio perfil | Propio perfil | Solo usuario autenticado |
| productos | Públicos (disponible_en_web) | Solo admins | Email verificado |
| purchases | Propias compras | Crear propias | Usuario autenticado |
| sessions | Propias sesiones | Service role | Sistema únicamente |
| contactos | Solo admins | Cualquiera | - |
| notificaciones | Propias | Marcar leídas | Usuario autenticado |

### Funciones de Seguridad SQL
- `is_admin()`: Verifica si usuario es administrador
- `sanitize_text()`: Limpia entrada de texto
- `validate_email()`: Valida formato de email

---

## ✅ Mejores Prácticas

### Desarrollo Local

1. **Usa `.env.local`** para credenciales locales
2. **Nunca hardcodees** credenciales en el código
3. **Verifica** que `.env.local` esté en `.gitignore`
4. **Rota las claves** si se exponen accidentalmente

### Producción

1. **Variables de entorno del servidor**: Configura en el hosting
2. **HTTPS obligatorio**: Todas las comunicaciones cifradas
3. **RLS habilitado**: En TODAS las tablas de Supabase
4. **Logs de auditoría**: Monitorea accesos sospechosos
5. **Backups regulares**: Automatiza respaldos de BD

### Código

```typescript
// ❌ MALO - Nunca hagas esto
const supabaseKey = "eyJhbGc..."

// ✅ BUENO - Usa variables de entorno
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📋 Checklist de Seguridad

### Antes de Desarrollo
- [ ] Configurar `.env.local` con credenciales
- [ ] Verificar `.gitignore` incluye archivos sensibles
- [ ] Habilitar RLS en Supabase
- [ ] Configurar políticas de seguridad

### Durante Desarrollo
- [ ] No exponer Service Role Key en cliente
- [ ] Validar todas las entradas de usuario
- [ ] Usar HTTPS en desarrollo (mkcert)
- [ ] Revisar logs de seguridad

### Antes de Producción
- [ ] Ejecutar script RLS (`setup-rls-security.sql`)
- [ ] Configurar variables en hosting
- [ ] Habilitar 2FA en Supabase
- [ ] Configurar backups automáticos
- [ ] Revisar headers de seguridad
- [ ] Test de penetración básico

### En Producción
- [ ] Monitorear logs de auditoría
- [ ] Alertas de intentos de acceso sospechosos
- [ ] Rotación periódica de claves (cada 90 días)
- [ ] Revisar políticas RLS mensualmente

---

## 🚨 Respuesta a Incidentes

### Si se expone una credencial:

1. **INMEDIATAMENTE**:
   - Rota la clave en Supabase Dashboard
   - Actualiza `.env.local` y producción
   - Revisa logs de acceso

2. **En 24 horas**:
   - Audita todos los accesos durante exposición
   - Notifica a usuarios si hay breach
   - Documenta el incidente

3. **Post-incidente**:
   - Revisa cómo ocurrió
   - Actualiza procedimientos
   - Capacita al equipo

### Contactos de Emergencia

- **Supabase Support**: support@supabase.io
- **Responsable Seguridad**: [TU_EMAIL]
- **Dashboard Supabase**: https://supabase.com/dashboard/project/lbjslbhglvanctbtoehi

---

## 🔍 Monitoreo y Auditoría

### Logs a Revisar

1. **Diariamente**:
   - Intentos de login fallidos
   - Errores 403/401 en API
   - Patrones sospechosos en middleware

2. **Semanalmente**:
   - Tabla `audit_log` en Supabase
   - Uso de Service Role Key
   - Nuevos usuarios registrados

3. **Mensualmente**:
   - Políticas RLS activas
   - Permisos de usuarios
   - Tokens expirados

### Herramientas Recomendadas

- **Sentry**: Para monitoreo de errores
- **Datadog/New Relic**: Para métricas de seguridad
- **GitHub Security**: Escaneo de dependencias
- **OWASP ZAP**: Testing de seguridad

---

## 📚 Referencias

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ⚠️ Advertencias Importantes

1. **NUNCA** subas `.env.local` a Git
2. **NUNCA** uses Service Role Key en el cliente
3. **SIEMPRE** habilita RLS en tablas con datos sensibles
4. **SIEMPRE** valida entrada de usuarios
5. **SIEMPRE** usa HTTPS en producción

---

*Última actualización: Agosto 2025*
*Mantén este documento actualizado con cada cambio de seguridad*