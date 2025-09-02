-- =====================================================
-- Script de Configuración de Seguridad RLS para Supabase
-- =====================================================
-- Este script configura las políticas de seguridad a nivel de fila
-- para proteger los datos en tu base de datos Supabase

-- =====================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

-- Tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tabla sessions  
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Tabla purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Tabla contactos
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

-- Tabla coordinaciones_despacho
ALTER TABLE coordinaciones_despacho ENABLE ROW LEVEL SECURITY;

-- Tabla notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Tabla productos (lectura pública, escritura protegida)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Tabla conversaciones_chatbot
ALTER TABLE conversaciones_chatbot ENABLE ROW LEVEL SECURITY;

-- Tabla descargas_catalogos
ALTER TABLE descargas_catalogos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA TABLA USERS
-- =====================================================

-- Los usuarios solo pueden ver su propia información
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propia información
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Solo el service role puede crear usuarios
CREATE POLICY "Service role can create users" 
ON users FOR INSERT 
TO service_role
WITH CHECK (true);

-- =====================================================
-- 3. POLÍTICAS PARA TABLA SESSIONS
-- =====================================================

-- Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Users can view own sessions" 
ON sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Solo el sistema puede crear/actualizar sesiones
CREATE POLICY "Service role manages sessions" 
ON sessions FOR ALL 
TO service_role
WITH CHECK (true);

-- =====================================================
-- 4. POLÍTICAS PARA TABLA PURCHASES
-- =====================================================

-- Los usuarios pueden ver sus propias compras
CREATE POLICY "Users can view own purchases" 
ON purchases FOR SELECT 
USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias compras
CREATE POLICY "Users can create own purchases" 
ON purchases FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Solo el service role puede actualizar compras
CREATE POLICY "Service role can update purchases" 
ON purchases FOR UPDATE 
TO service_role
WITH CHECK (true);

-- =====================================================
-- 5. POLÍTICAS PARA TABLA PRODUCTOS
-- =====================================================

-- Lectura pública de productos disponibles en web
CREATE POLICY "Public can view available products" 
ON productos FOR SELECT 
USING (disponible_en_web = true);

-- Solo admins pueden insertar productos
CREATE POLICY "Admins can insert products" 
ON productos FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND email IN ('admin@obraexpress.cl', 'gonzalo@obraexpress.cl')
  )
);

-- Solo admins pueden actualizar productos
CREATE POLICY "Admins can update products" 
ON productos FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND email IN ('admin@obraexpress.cl', 'gonzalo@obraexpress.cl')
  )
);

-- =====================================================
-- 6. POLÍTICAS PARA TABLA CONTACTOS
-- =====================================================

-- Los usuarios pueden crear contactos
CREATE POLICY "Anyone can create contact" 
ON contactos FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Solo admins pueden ver todos los contactos
CREATE POLICY "Admins can view all contacts" 
ON contactos FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND email IN ('admin@obraexpress.cl', 'gonzalo@obraexpress.cl')
  )
);

-- =====================================================
-- 7. POLÍTICAS PARA TABLA COORDINACIONES_DESPACHO
-- =====================================================

-- Los usuarios pueden ver sus propias coordinaciones
CREATE POLICY "Users can view own coordinations" 
ON coordinaciones_despacho FOR SELECT 
USING (
  auth.uid() = user_id 
  OR email_cliente = (SELECT email FROM users WHERE id = auth.uid())
);

-- Los usuarios pueden crear coordinaciones
CREATE POLICY "Users can create coordinations" 
ON coordinaciones_despacho FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR auth.uid() IS NOT NULL
);

-- =====================================================
-- 8. POLÍTICAS PARA TABLA NOTIFICACIONES
-- =====================================================

-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" 
ON notificaciones FOR SELECT 
USING (auth.uid() = user_id);

-- Los usuarios pueden marcar sus notificaciones como leídas
CREATE POLICY "Users can update own notifications" 
ON notificaciones FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. POLÍTICAS PARA TABLA CONVERSACIONES_CHATBOT
-- =====================================================

-- Los usuarios pueden ver sus propias conversaciones
CREATE POLICY "Users can view own conversations" 
ON conversaciones_chatbot FOR SELECT 
USING (
  auth.uid() = user_id 
  OR session_id = current_setting('request.session_id', true)
);

-- Cualquiera puede crear conversaciones (para usuarios no autenticados)
CREATE POLICY "Anyone can create conversations" 
ON conversaciones_chatbot FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Los usuarios pueden actualizar sus propias conversaciones
CREATE POLICY "Users can update own conversations" 
ON conversaciones_chatbot FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR session_id = current_setting('request.session_id', true)
);

-- =====================================================
-- 10. POLÍTICAS PARA TABLA DESCARGAS_CATALOGOS
-- =====================================================

-- Cualquiera puede registrar una descarga
CREATE POLICY "Anyone can register download" 
ON descargas_catalogos FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Solo admins pueden ver las descargas
CREATE POLICY "Admins can view downloads" 
ON descargas_catalogos FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND email IN ('admin@obraexpress.cl', 'gonzalo@obraexpress.cl')
  )
);

-- =====================================================
-- 11. CREAR FUNCIONES DE SEGURIDAD ADICIONALES
-- =====================================================

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND email IN ('admin@obraexpress.cl', 'gonzalo@obraexpress.cl')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para sanitizar entrada de texto
CREATE OR REPLACE FUNCTION sanitize_text(input_text text)
RETURNS text AS $$
BEGIN
  -- Remover caracteres peligrosos y scripts
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<[^>]*>', '', 'g'), -- Remover HTML
      '[<>\"'';]', '', 'g' -- Remover caracteres especiales
    ),
    '(javascript:|data:|vbscript:|file:|about:|chrome:)', '', 'gi'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 12. CREAR TRIGGERS DE SEGURIDAD
-- =====================================================

-- Trigger para validar emails antes de insertar
CREATE OR REPLACE FUNCTION validate_email()
RETURNS trigger AS $$
BEGIN
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_email
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION validate_email();

-- =====================================================
-- 13. CONFIGURAR LOGS DE AUDITORÍA
-- =====================================================

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  changed_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en tabla de auditoría
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver logs
CREATE POLICY "Only admins can view audit logs" 
ON audit_log FOR SELECT 
TO authenticated
USING (is_admin());

-- =====================================================
-- 14. ÍNDICES PARA MEJORAR SEGURIDAD Y PERFORMANCE
-- =====================================================

-- Índices para búsquedas de seguridad
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Ajusta los emails de admin según tus necesidades
-- 3. Revisa y prueba cada política antes de producción
-- 4. Monitorea los logs de auditoría regularmente
-- 5. NUNCA deshabilites RLS en tablas con datos sensibles