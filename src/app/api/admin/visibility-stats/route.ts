import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getVisibleCategories } from '@/config/categories-visibility';

export async function GET() {
  try {
    // Obtener productos de Supabase
    const { data: productos, error } = await supabaseAdmin
      .from('productos')
      .select('categoria, disponible_en_web, stock')
      .gte('stock', 1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!productos || productos.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {},
        totalVisible: 0,
        totalHidden: 0
      });
    }

    // Obtener categorías visibles según configuración
    const categoriasVisibles = getVisibleCategories();

    // Calcular estadísticas por categoría
    const stats: Record<string, any> = {};
    let totalVisible = 0;
    let totalHidden = 0;

    productos.forEach(producto => {
      const categoria = producto.categoria || 'Sin Categoría';
      const esCategoriaVisible = categoriasVisibles.includes(categoria);
      const esProductoVisible = producto.disponible_en_web && producto.stock >= 10;

      if (!stats[categoria]) {
        stats[categoria] = {
          total: 0,
          visible: 0,
          hidden: 0,
          categoryVisible: esCategoriaVisible,
          lowStock: 0
        };
      }

      stats[categoria].total++;

      if (producto.stock < 10) {
        stats[categoria].lowStock++;
      }

      if (esProductoVisible && esCategoriaVisible) {
        stats[categoria].visible++;
        totalVisible++;
      } else {
        stats[categoria].hidden++;
        totalHidden++;
      }
    });

    return NextResponse.json({
      success: true,
      stats,
      totalVisible,
      totalHidden,
      categoriasVisibles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de visibilidad:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}