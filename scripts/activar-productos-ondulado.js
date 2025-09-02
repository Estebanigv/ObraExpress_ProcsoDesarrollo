/**
 * Script para activar productos Policarbonato Ondulado y asignar imágenes automáticamente
 * Problema detectado: Productos tienen stock pero están marcados como no disponibles por falta de imagen
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bvvmczwrvebatctvfhde.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm1jendydmViYXRjdHZmaGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDEwMjM2NSwiZXhwIjoyMDM5Njc4MzY1fQ.AhEn5xB3XoLpGzP6P9l9EyoTUNCQMvNn1WiUPPjvZY0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de imágenes por color para Policarbonato Ondulado
const mapaImagenes = {
  'Clear': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_cristal_6mm.webp',
  'Bronce': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_bronce_8mm.webp', 
  'Opal': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_opal.webp'
};

async function activarProductosOndulado() {
  try {
    console.log('🚀 Iniciando activación de productos Policarbonato Ondulado...');

    // 1. Obtener todos los productos Ondulado que no están disponibles en web
    const { data: productos, error: errorGet } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', 'Policarbonato')
      .eq('tipo', 'Ondulado')
      .eq('disponible_en_web', false);

    if (errorGet) {
      console.error('❌ Error obteniendo productos:', errorGet);
      return;
    }

    console.log(`📊 Encontrados ${productos?.length || 0} productos Ondulado sin activar`);

    if (!productos || productos.length === 0) {
      console.log('✅ No hay productos Ondulado para activar');
      return;
    }

    let productosActivados = 0;
    let errores = 0;

    // 2. Procesar cada producto
    for (const producto of productos) {
      try {
        // Determinar la imagen según el color
        let rutaImagen = mapaImagenes[producto.color] || mapaImagenes['Clear']; // Fallback a Clear

        // Verificar que el producto tiene stock mínimo y dimensiones
        const tieneStock = (producto.stock || 0) >= 10;
        const tieneDimensiones = producto.espesor && producto.ancho && producto.largo;

        if (!tieneStock) {
          console.log(`⚠️ [${producto.codigo}] Stock insuficiente: ${producto.stock}`);
          continue;
        }

        if (!tieneDimensiones) {
          console.log(`⚠️ [${producto.codigo}] Dimensiones incompletas`);
          continue;
        }

        // 3. Actualizar producto con imagen y disponibilidad
        const { error: errorUpdate } = await supabase
          .from('productos')
          .update({
            disponible_en_web: true,
            tiene_imagen: true,
            ruta_imagen: rutaImagen,
            motivo_no_disponible: null,
            cumple_stock_minimo: true,
            dimensiones_completas: true,
            updated_at: new Date().toISOString()
          })
          .eq('codigo', producto.codigo);

        if (errorUpdate) {
          console.error(`❌ Error actualizando ${producto.codigo}:`, errorUpdate);
          errores++;
        } else {
          console.log(`✅ [${producto.codigo}] Activado - Color: ${producto.color} | Stock: ${producto.stock} | Imagen: ${rutaImagen}`);
          productosActivados++;
        }

      } catch (error) {
        console.error(`❌ Error procesando producto ${producto.codigo}:`, error);
        errores++;
      }
    }

    // 4. Resumen final
    console.log('\n📈 RESUMEN DE ACTIVACIÓN:');
    console.log(`✅ Productos activados: ${productosActivados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${productos.length}`);

    if (productosActivados > 0) {
      console.log('\n🎉 ¡Productos Policarbonato Ondulado activados exitosamente!');
      console.log('🌐 Ahora deberían aparecer en la página web');
    }

  } catch (error) {
    console.error('❌ Error general en la activación:', error);
  }
}

// Ejecutar el script
activarProductosOndulado();