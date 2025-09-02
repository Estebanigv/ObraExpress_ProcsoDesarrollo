import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { categoria, tipo, visible, filtros } = await request.json();

    if (visible === undefined) {
      return NextResponse.json(
        { success: false, error: 'Parámetro visible es requerido' },
        { status: 400 }
      );
    }

    let query = supabase.from('productos');

    // Construir la consulta según los filtros
    if (categoria && categoria !== 'all') {
      if (categoria === 'Policarbonato' && tipo && tipo !== 'all') {
        // Filtrar por categoría y tipo específico
        query = query.select('codigo').eq('categoria', categoria).eq('tipo', tipo);
      } else {
        // Solo filtrar por categoría
        query = query.select('codigo').eq('categoria', categoria);
      }
    } else if (filtros) {
      // Aplicar filtros adicionales si se proporcionan
      query = query.select('codigo');
      Object.keys(filtros).forEach(key => {
        if (filtros[key] && filtros[key] !== 'all') {
          query = query.eq(key, filtros[key]);
        }
      });
    } else {
      // Sin filtros específicos = aplicar a TODAS las categorías visibles
      console.log('🔄 Acción masiva en TODAS las categorías visibles');
      const { getVisibleCategories } = await import('@/config/categories-visibility');
      const categoriasVisibles = getVisibleCategories();
      
      if (categoriasVisibles.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay categorías visibles para procesar' },
          { status: 400 }
        );
      }
      
      // Filtrar por categorías visibles
      query = query.select('codigo').in('categoria', categoriasVisibles);
    }

    // Obtener productos que cumplen los criterios
    const { data: productos, error: selectError } = await query;

    if (selectError) {
      console.error('Error obteniendo productos:', selectError);
      return NextResponse.json(
        { success: false, error: selectError.message },
        { status: 500 }
      );
    }

    if (!productos || productos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron productos con los criterios especificados' },
        { status: 404 }
      );
    }

    // Construir filtros para la actualización
    let updateQuery = supabase.from('productos').update({
      disponible_en_web: visible,
      updated_at: new Date().toISOString()
    });

    // Aplicar los mismos filtros para la actualización
    if (categoria && categoria !== 'all') {
      updateQuery = updateQuery.eq('categoria', categoria);
      if (categoria === 'Policarbonato' && tipo && tipo !== 'all') {
        updateQuery = updateQuery.eq('tipo', tipo);
      }
    } else if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] && filtros[key] !== 'all') {
          updateQuery = updateQuery.eq(key, filtros[key]);
        }
      });
    } else {
      // Aplicar a todas las categorías visibles
      const { getVisibleCategories } = await import('@/config/categories-visibility');
      const categoriasVisibles = getVisibleCategories();
      updateQuery = updateQuery.in('categoria', categoriasVisibles);
    }

    // Ejecutar la actualización
    const { data: updatedData, error: updateError } = await updateQuery.select('codigo');

    if (updateError) {
      console.error('Error actualizando visibilidad masiva:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    const productosActualizados = updatedData?.length || productos.length;
    
    let descripcionFiltro;
    if (categoria === 'Policarbonato' && tipo && tipo !== 'all') {
      descripcionFiltro = `${categoria} ${tipo}`;
    } else if (categoria) {
      descripcionFiltro = categoria;
    } else {
      // Caso de todas las categorías visibles
      const { getVisibleCategories } = await import('@/config/categories-visibility');
      const categoriasVisibles = getVisibleCategories();
      descripcionFiltro = `todas las categorías visibles (${categoriasVisibles.join(', ')})`;
    }

    console.log(`✅ Visibilidad masiva actualizada: ${productosActualizados} productos de ${descripcionFiltro} → ${visible ? 'VISIBLE' : 'OCULTO'}`);

    return NextResponse.json({
      success: true,
      message: `Visibilidad actualizada para ${productosActualizados} productos`,
      categoria,
      tipo,
      productosActualizados,
      newVisibility: visible,
      descripcionFiltro
    });

  } catch (error) {
    console.error('Error en actualización masiva de visibilidad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}