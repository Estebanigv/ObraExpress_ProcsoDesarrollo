-- Script SQL para activar productos Policarbonato Ondulado con imágenes
-- Ejecutar en el panel de Supabase SQL Editor

UPDATE productos 
SET 
  disponible_en_web = true,
  tiene_imagen = true,
  motivo_no_disponible = null,
  cumple_stock_minimo = true,
  dimensiones_completas = true,
  updated_at = NOW(),
  
  -- Asignar imágenes según el color
  ruta_imagen = CASE 
    WHEN color = 'Clear' THEN '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_cristal_6mm.webp'
    WHEN color = 'Bronce' THEN '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_bronce_8mm.webp'
    WHEN color = 'Opal' THEN '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_opal.webp'
    ELSE '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_cristal_6mm.webp'
  END
  
WHERE 
  categoria = 'Policarbonato' 
  AND tipo = 'Ondulado'
  AND disponible_en_web = false
  AND stock >= 10
  AND espesor IS NOT NULL 
  AND espesor != ''
  AND ancho IS NOT NULL 
  AND ancho != ''
  AND largo IS NOT NULL 
  AND largo != '';

-- Verificar los cambios
SELECT 
  codigo, 
  nombre, 
  color, 
  stock, 
  disponible_en_web, 
  tiene_imagen, 
  ruta_imagen,
  motivo_no_disponible
FROM productos 
WHERE categoria = 'Policarbonato' AND tipo = 'Ondulado'
ORDER BY color, codigo;