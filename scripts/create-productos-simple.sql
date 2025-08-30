-- Script simplificado para crear la tabla productos en Supabase
-- Ejecutar este SQL en el panel de Supabase SQL Editor

-- Eliminar tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS productos CASCADE;

-- Crear tabla productos con estructura simplificada
CREATE TABLE productos (
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

-- Crear índices básicos
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_disponible_web ON productos(disponible_en_web);

-- Insertar un producto de prueba para verificar que funciona
INSERT INTO productos (codigo, nombre, categoria, tipo) 
VALUES ('TEST001', 'Producto de Prueba', 'Test', 'Verificación')
ON CONFLICT (codigo) DO NOTHING;

-- Verificar que la tabla fue creada correctamente
SELECT 
    'Tabla productos creada exitosamente' as mensaje,
    COUNT(*) as registros_existentes
FROM productos;

-- Mostrar estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;