import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, createSupabaseNotConfiguredResponse } from '@/lib/env-validation';

// Importar supabase de forma condicional
let supabase: any = null;
if (isSupabaseConfigured()) {
  try {
    const { supabase: sb } = require('@/lib/supabase');
    supabase = sb;
  } catch (error) {
    console.warn('Could not import supabase:', error);
  }
}

// Lista de códigos de productos Policarbonato Ondulado con sus colores
const productosOndulado = [
  // Clear
  { codigo: '111001101', color: 'Clear' },
  { codigo: '111002101', color: 'Clear' },
  { codigo: '111003101', color: 'Clear' },
  { codigo: '111005101', color: 'Clear' },
  { codigo: '111001201', color: 'Clear' },
  { codigo: '111002201', color: 'Clear' },
  { codigo: '111003201', color: 'Clear' },
  { codigo: '111005201', color: 'Clear' },
  // Bronce
  { codigo: '111001102', color: 'Bronce' },
  { codigo: '111002102', color: 'Bronce' },
  { codigo: '111003102', color: 'Bronce' },
  { codigo: '111005102', color: 'Bronce' },
  { codigo: '111001202', color: 'Bronce' },
  { codigo: '111002202', color: 'Bronce' },
  { codigo: '111003202', color: 'Bronce' },
  { codigo: '111005202', color: 'Bronce' },
  // Opal
  { codigo: '111001103', color: 'Opal' },
  { codigo: '111002103', color: 'Opal' },
  { codigo: '111003103', color: 'Opal' },
  { codigo: '111005103', color: 'Opal' },
  { codigo: '111001203', color: 'Opal' },
  { codigo: '111002203', color: 'Opal' },
  { codigo: '111003203', color: 'Opal' },
  { codigo: '111005203', color: 'Opal' }
];

const mapaImagenes = {
  'Clear': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_cristal_6mm.webp',
  'Bronce': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_bronce_8mm.webp', 
  'Opal': '/assets/images/Productos/Policarbonato Ondulado/policarbonato_ondulado_opal.webp'
};

export async function POST(request: NextRequest) {
  // Verificar que Supabase esté configurado
  if (!isSupabaseConfigured() || !supabase) {
    return createSupabaseNotConfiguredResponse();
  }

  try {
    console.log('🚀 Activando productos específicos Policarbonato Ondulado...');

    let activados = 0;
    let errores = 0;
    const resultados: string[] = [];

    for (const producto of productosOndulado) {
      try {
        const rutaImagen = mapaImagenes[producto.color as keyof typeof mapaImagenes];

        const { error } = await supabase
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

        if (error) {
          errores++;
          resultados.push(`❌ ${producto.codigo}: ${error.message}`);
        } else {
          activados++;
          resultados.push(`✅ ${producto.codigo} (${producto.color})`);
        }

      } catch (error) {
        errores++;
        resultados.push(`❌ ${producto.codigo}: Error procesando`);
      }
    }

    console.log(`✅ Activados: ${activados}, Errores: ${errores}`);

    return NextResponse.json({
      success: true,
      productosActivados: activados,
      errores,
      total: productosOndulado.length,
      resultados,
      mensaje: `🎉 Proceso completado: ${activados}/${productosOndulado.length} productos activados`
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error activando productos' 
    }, { status: 500 });
  }
}