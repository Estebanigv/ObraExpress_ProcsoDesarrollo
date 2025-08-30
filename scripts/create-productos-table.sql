-- Script para crear la tabla productos en Supabase
-- Ejecutar este SQL en el panel de Supabase SQL Editor

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    categoria TEXT DEFAULT 'Policarbonato',
    tipo TEXT DEFAULT 'General',
    espesor TEXT DEFAULT '',
    ancho TEXT DEFAULT '',
    largo TEXT DEFAULT '',
    color TEXT DEFAULT '',
    uso TEXT DEFAULT '',
    costo_proveedor NUMERIC DEFAULT 0,
    precio_neto NUMERIC DEFAULT 0,
    precio_con_iva NUMERIC DEFAULT 0,
    ganancia NUMERIC DEFAULT 0,
    margen_ganancia TEXT DEFAULT '0%',
    stock INTEGER DEFAULT 0,
    proveedor TEXT DEFAULT 'Leker',
    pestaña_origen TEXT DEFAULT 'Sheet1',
    orden_original INTEGER DEFAULT 0,
    disponible_en_web BOOLEAN DEFAULT false,
    tiene_sku_valido BOOLEAN DEFAULT false,
    tiene_stock_minimo BOOLEAN DEFAULT false,
    tiene_imagen BOOLEAN DEFAULT false,
    ruta_imagen TEXT,
    motivo_no_disponible TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);
CREATE INDEX IF NOT EXISTS idx_productos_proveedor ON productos(proveedor);
CREATE INDEX IF NOT EXISTS idx_productos_disponible_web ON productos(disponible_en_web);
CREATE INDEX IF NOT EXISTS idx_productos_orden ON productos(pestaña_origen, orden_original);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Productos public read" ON productos 
    FOR SELECT 
    USING (true);

-- Política para permitir escritura solo a usuarios autenticados
CREATE POLICY "Productos authenticated write" ON productos 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE productos IS 'Tabla principal de productos sincronizada desde Google Sheets';
COMMENT ON COLUMN productos.codigo IS 'SKU único del producto';
COMMENT ON COLUMN productos.orden_original IS 'Orden original del producto en Google Sheets para mantener secuencia';
COMMENT ON COLUMN productos.pestaña_origen IS 'Pestaña de Google Sheets de donde proviene el producto';
COMMENT ON COLUMN productos.disponible_en_web IS 'Si el producto se muestra en el sitio web público';

-- Verificar que la tabla fue creada correctamente
SELECT 
    'Tabla productos creada exitosamente' as mensaje,
    COUNT(*) as registros_existentes
FROM productos;