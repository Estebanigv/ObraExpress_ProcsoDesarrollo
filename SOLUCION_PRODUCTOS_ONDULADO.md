# 🔧 SOLUCIÓN: Productos Policarbonato Ondulado Ocultos

## 🎯 PROBLEMA IDENTIFICADO

**Los productos Policarbonato Ondulado aparecen ocultos por "no tener imagen" cuando SÍ tienen imagen disponible.**

### 📊 Diagnóstico Detallado:

✅ **CORRECTO**: 
- Stock suficiente (10+ unidades)
- Dimensiones completas (espesor, ancho, largo)
- Precios calculados correctamente
- 24 productos Ondulado en total (Clear, Bronce, Opal)

❌ **INCORRECTO**:
- `disponible_en_web = false` (debería ser `true`)
- `tiene_imagen = false` (debería ser `true`)  
- `ruta_imagen = null` (debería tener ruta de imagen)

---

## 🛠️ SOLUCIONES DISPONIBLES

### ⚡ SOLUCIÓN RÁPIDA: SQL Directo en Supabase

**Ve a Supabase Dashboard > SQL Editor y ejecuta:**

```sql
-- Activar productos Policarbonato Ondulado con imágenes
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
    WHEN color = 'Clear' THEN '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp'
    WHEN color = 'Bronce' THEN '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp'
    WHEN color = 'Opal' THEN '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp'
    ELSE '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp'
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

-- Verificar los resultados
SELECT 
  codigo, 
  color, 
  stock, 
  disponible_en_web, 
  tiene_imagen, 
  substring(ruta_imagen, 1, 50) as imagen_preview
FROM productos 
WHERE categoria = 'Policarbonato' AND tipo = 'Ondulado'
ORDER BY color, codigo;
```

### 🔄 SOLUCIÓN ALTERNATIVA: Scripts Locales

**Scripts creados en el proyecto:**

1. **`scripts/activar-ondulado-simple.sql`** - SQL directo
2. **`scripts/activar-productos.bat`** - Script de Windows (funciona parcialmente)
3. **`src/app/api/admin/activar-ondulado/route.ts`** - API endpoint (tiene timeout)

---

## 📈 RESULTADOS ESPERADOS

**Después de ejecutar la solución SQL:**

```sql
-- Deberías ver 24 productos activados:
-- ✅ 8 productos Clear (111001101, 111002101, etc.)
-- ✅ 8 productos Bronce (111001102, 111002102, etc.)  
-- ✅ 8 productos Opal (111001103, 111002103, etc.)
```

**En la web:**
- **Página `/productos`**: Mostrará productos Policarbonato Ondulado
- **Admin Panel**: Los productos aparecerán como "Visible" en lugar de "Oculto"

---

## 🔍 VERIFICACIÓN

1. **En Supabase:** Ejecutar el SELECT al final del SQL
2. **En la web:** Visitar `http://localhost:3010/productos`
3. **API pública:** `curl http://localhost:3010/api/productos-publico`

---

## 📝 NOTAS TÉCNICAS

- **Timeout Issue**: Las APIs tienen timeout por conexión lenta a Supabase
- **Imagen Temporal**: Se usa una sola imagen para todos los colores (se puede mejorar después)
- **Path Typo**: El directorio tiene "Policarnato" en lugar de "Policarbonato" (error tipográfico en el sistema de archivos)

---

## ⚡ PRÓXIMOS PASOS

1. ✅ Ejecutar SQL en Supabase
2. ✅ Verificar productos visibles en web
3. 🔄 Agregar imágenes específicas por color
4. 🔄 Corregir directorio "Policarnato" → "Policarbonato"

---

*Solución identificada: 29 Agosto 2025*  
*Estado: Lista para implementar*