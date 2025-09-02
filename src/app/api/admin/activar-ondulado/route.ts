import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mapeo de imágenes por color para Policarbonato Ondulado
const mapaImagenes = {
  'Clear': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_cristal_6mm.webp',
  'Bronce': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_bronce_8mm.webp', 
  'Opal': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_opal.webp'
};

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Ejecutando SQL de activación directa...');

    // Usar SQL directo para mayor eficiencia
    const sqlUpdate = `
      UPDATE productos 
      SET 
        disponible_en_web = true,
        tiene_imagen = true,
        motivo_no_disponible = null,
        cumple_stock_minimo = true,
        dimensiones_completas = true,
        updated_at = NOW(),
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
    `;

    const { data: updateResult, error: updateError } = await supabase.rpc('execute_sql', {
      sql: sqlUpdate
    });

    if (updateError) {
      console.error('❌ Error ejecutando SQL:', updateError);
      // Fallback: usar el método normal
      return await activarProductosMetodoNormal();
    }

    // Verificar los resultados
    const { data: productosActivados, error: errorCheck } = await supabase
      .from('productos')
      .select('codigo, color, stock, disponible_en_web, tiene_imagen, ruta_imagen')
      .eq('categoria', 'Policarbonato')
      .eq('tipo', 'Ondulado')
      .eq('disponible_en_web', true);

    if (errorCheck) {
      console.error('❌ Error verificando resultados:', errorCheck);
    }

    const resumen = {
      success: true,
      message: '🎉 Productos Policarbonato Ondulado activados con SQL directo',
      productosActivados: productosActivados?.length || 0,
      productos: productosActivados || [],
      sqlEjecutado: true
    };

    console.log(`✅ Activados ${productosActivados?.length || 0} productos Ondulado`);
    return NextResponse.json(resumen);

  } catch (error) {
    console.error('❌ Error general:', error);
    // Fallback al método normal
    return await activarProductosMetodoNormal();
  }
}

// Método de fallback
async function activarProductosMetodoNormal() {
  try {
    console.log('🔄 Usando método normal como fallback...');

    // Actualización masiva por lotes
    const updates = [
      {
        filter: { categoria: 'Policarbonato', tipo: 'Ondulado', color: 'Clear', disponible_en_web: false },
        data: {
          disponible_en_web: true,
          tiene_imagen: true,
          ruta_imagen: '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_cristal_6mm.webp',
          motivo_no_disponible: null,
          cumple_stock_minimo: true,
          dimensiones_completas: true,
          updated_at: new Date().toISOString()
        }
      },
      {
        filter: { categoria: 'Policarbonato', tipo: 'Ondulado', color: 'Bronce', disponible_en_web: false },
        data: {
          disponible_en_web: true,
          tiene_imagen: true,
          ruta_imagen: '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_bronce_8mm.webp',
          motivo_no_disponible: null,
          cumple_stock_minimo: true,
          dimensiones_completas: true,
          updated_at: new Date().toISOString()
        }
      },
      {
        filter: { categoria: 'Policarbonato', tipo: 'Ondulado', color: 'Opal', disponible_en_web: false },
        data: {
          disponible_en_web: true,
          tiene_imagen: true,
          ruta_imagen: '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_opal.webp',
          motivo_no_disponible: null,
          cumple_stock_minimo: true,
          dimensiones_completas: true,
          updated_at: new Date().toISOString()
        }
      }
    ];

    let totalActivados = 0;

    for (const update of updates) {
      const { error } = await supabase
        .from('productos')
        .update(update.data)
        .match(update.filter)
        .gte('stock', 10);

      if (!error) {
        totalActivados += 1;
        console.log(`✅ Activados productos ${update.filter.color}`);
      } else {
        console.error(`❌ Error activando ${update.filter.color}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Productos activados con método de fallback',
      productosActivados: totalActivados,
      metodo: 'fallback'
    });

  } catch (error) {
    console.error('❌ Error en método fallback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error activando productos' 
    }, { status: 500 });
  }
}