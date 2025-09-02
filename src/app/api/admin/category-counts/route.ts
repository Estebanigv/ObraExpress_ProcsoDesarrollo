import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CATEGORIES_VISIBILITY } from '@/config/categories-visibility';

export async function GET() {
  try {
    // Obtener conteos por categoría desde la base de datos
    const { data, error } = await supabase
      .from('productos')
      .select('categoria')
      .not('categoria', 'is', null);

    if (error) {
      console.error('Error obteniendo conteos de categorías:', error);
      return NextResponse.json({
        success: false,
        error: 'Error consultando base de datos'
      }, { status: 500 });
    }

    // Contar productos por categoría
    const counts: Record<string, number> = {};
    
    // Inicializar todas las categorías con 0
    CATEGORIES_VISIBILITY.forEach(cat => {
      counts[cat.name] = 0;
    });

    // Contar productos reales
    if (data) {
      data.forEach(producto => {
        if (producto.categoria && counts.hasOwnProperty(producto.categoria)) {
          counts[producto.categoria]++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      counts
    });

  } catch (error) {
    console.error('Error en category-counts:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}