-- Script para agregar campos de validación a la tabla productos
-- Ejecutar en Supabase SQL Editor

-- Campos para control de cambios de precio
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS precio_anterior NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiene_cambio_precio BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_cambio_precio TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS porcentaje_cambio_precio NUMERIC DEFAULT 0;

-- Campos para validaciones web más estrictas  
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS dimensiones_completas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cumple_stock_minimo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS motivos_no_disponible_web TEXT[];

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_productos_cambio_precio ON productos(tiene_cambio_precio);
CREATE INDEX IF NOT EXISTS idx_productos_dimensiones_completas ON productos(dimensiones_completas);
CREATE INDEX IF NOT EXISTS idx_productos_cumple_stock_minimo ON productos(cumple_stock_minimo);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN productos.precio_anterior IS 'Precio anterior para detectar cambios';
COMMENT ON COLUMN productos.tiene_cambio_precio IS 'True si el producto tuvo cambio de precio reciente';
COMMENT ON COLUMN productos.fecha_cambio_precio IS 'Fecha del último cambio de precio';
COMMENT ON COLUMN productos.porcentaje_cambio_precio IS 'Porcentaje de cambio de precio (positivo = aumento, negativo = descuento)';
COMMENT ON COLUMN productos.dimensiones_completas IS 'True si el producto tiene espesor, ancho y largo especificados';
COMMENT ON COLUMN productos.cumple_stock_minimo IS 'True si el producto cumple el stock mínimo de 10 unidades';
COMMENT ON COLUMN productos.motivos_no_disponible_web IS 'Array con motivos por los cuales el producto no está disponible en web';