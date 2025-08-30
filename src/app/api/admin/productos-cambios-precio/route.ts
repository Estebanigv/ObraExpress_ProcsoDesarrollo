import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Obtener productos con cambios de precio
    const { data: productosCambioPrecio, error: errorCambios } = await supabase
      .from('productos')
      .select(`
        codigo,
        nombre,
        categoria,
        tipo,
        precio_con_iva,
        precio_anterior,
        tiene_cambio_precio,
        porcentaje_cambio_precio,
        fecha_cambio_precio,
        stock,
        disponible_en_web
      `)
      .eq('tiene_cambio_precio', true)
      .order('fecha_cambio_precio', { ascending: false });

    if (errorCambios) {
      console.error('Error obteniendo productos con cambio de precio:', errorCambios);
      return NextResponse.json(
        { success: false, error: errorCambios.message },
        { status: 500 }
      );
    }

    // Obtener estadísticas de validación
    const { data: estadisticasValidacion, error: errorStats } = await supabase
      .from('productos')
      .select(`
        disponible_en_web,
        dimensiones_completas,
        cumple_stock_minimo,
        tiene_imagen,
        motivos_no_disponible_web
      `);

    if (errorStats) {
      console.error('Error obteniendo estadísticas:', errorStats);
      return NextResponse.json(
        { success: false, error: errorStats.message },
        { status: 500 }
      );
    }

    // Calcular estadísticas
    const stats = {
      totalProductos: estadisticasValidacion?.length || 0,
      productosWebValidos: estadisticasValidacion?.filter(p => p.disponible_en_web).length || 0,
      productosCambioPrecio: productosCambioPrecio?.length || 0,
      productosConDimensiones: estadisticasValidacion?.filter(p => p.dimensiones_completas).length || 0,
      productosConStockMinimo: estadisticasValidacion?.filter(p => p.cumple_stock_minimo).length || 0,
      productosConImagen: estadisticasValidacion?.filter(p => p.tiene_imagen).length || 0,
      
      // Motivos de no disponibilidad más comunes
      motivosNoDisponibilidad: {}
    };

    // Analizar motivos de no disponibilidad
    estadisticasValidacion?.forEach(p => {
      if (p.motivos_no_disponible_web && Array.isArray(p.motivos_no_disponible_web)) {
        p.motivos_no_disponible_web.forEach(motivo => {
          stats.motivosNoDisponibilidad[motivo] = 
            (stats.motivosNoDisponibilidad[motivo] || 0) + 1;
        });
      }
    });

    // Categorizar cambios de precio
    const cambiosPorTipo = {
      aumentos: productosCambioPrecio?.filter(p => p.porcentaje_cambio_precio > 0) || [],
      descuentos: productosCambioPrecio?.filter(p => p.porcentaje_cambio_precio < 0) || []
    };

    return NextResponse.json({
      success: true,
      data: {
        productos_cambio_precio: productosCambioPrecio || [],
        cambios_por_tipo: cambiosPorTipo,
        estadisticas: stats
      },
      mensaje: `${stats.productosCambioPrecio} productos con cambio de precio detectados`
    });

  } catch (error) {
    console.error('Error en API cambios de precio:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}