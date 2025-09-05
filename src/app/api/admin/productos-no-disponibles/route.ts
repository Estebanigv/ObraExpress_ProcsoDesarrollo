import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los productos con detalles de validación
    const { data: todosLosProductos, error } = await supabase
      .from('productos')
      .select(`
        codigo,
        nombre,
        categoria,
        tipo,
        espesor,
        ancho,
        largo,
        color,
        stock,
        precio_con_iva,
        disponible_en_web,
        dimensiones_completas,
        cumple_stock_minimo,
        tiene_imagen,
        ruta_imagen,
        motivos_no_disponible_web,
        motivo_no_disponible,
        pestaña_origen,
        orden_original
      `)
      .order('pestaña_origen', { ascending: true })
      .order('orden_original', { ascending: true });

    if (error) {
      console.error('Error obteniendo productos:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!todosLosProductos || todosLosProductos.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          productos_disponibles: [],
          productos_no_disponibles: [],
          estadisticas: {
            total: 0,
            disponibles: 0,
            no_disponibles: 0
          }
        }
      });
    }

    // Separar productos disponibles y no disponibles
    const disponibles = (todosLosProductos as any[]).filter((p: any) => p.disponible_en_web);
    const noDisponibles = (todosLosProductos as any[]).filter((p: any) => !p.disponible_en_web);

    // Analizar productos no disponibles con detalles
    const noDisponiblesDetallados = noDisponibles.map((producto: any) => {
      const motivos = [];
      const valoresRaw = {
        espesor_raw: producto.espesor || 'VACÍO',
        ancho_raw: producto.ancho || 'VACÍO', 
        largo_raw: producto.largo || 'VACÍO'
      };

      // Analizar cada dimensión
      if (!producto.espesor || producto.espesor.trim() === '') {
        motivos.push('❌ Espesor vacío o no especificado');
      } else if (!producto.espesor.includes('mm')) {
        motivos.push(`❌ Espesor sin unidad (${producto.espesor})`);
      } else {
        motivos.push(`✅ Espesor OK (${producto.espesor})`);
      }

      if (!producto.ancho || producto.ancho.trim() === '') {
        motivos.push('❌ Ancho vacío o no especificado');
      } else if (!producto.ancho.includes('cm') && !producto.ancho.includes('m')) {
        motivos.push(`❌ Ancho sin unidad (${producto.ancho})`);
      } else {
        motivos.push(`✅ Ancho OK (${producto.ancho})`);
      }

      if (!producto.largo || producto.largo.trim() === '') {
        motivos.push('❌ Largo vacío o no especificado');
      } else if (!producto.largo.includes('cm') && !producto.largo.includes('m')) {
        motivos.push(`❌ Largo sin unidad (${producto.largo})`);
      } else {
        motivos.push(`✅ Largo OK (${producto.largo})`);
      }

      // Analizar stock
      if (producto.stock < 10) {
        motivos.push(`❌ Stock insuficiente (${producto.stock}/10 mínimo)`);
      } else {
        motivos.push(`✅ Stock OK (${producto.stock})`);
      }

      // Analizar imagen
      if (!producto.tiene_imagen) {
        motivos.push('❌ Sin imagen válida');
      } else {
        motivos.push(`✅ Imagen OK (${producto.ruta_imagen})`);
      }

      return {
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        tipo: producto.tipo,
        pestaña_origen: producto.pestaña_origen,
        orden_original: producto.orden_original,
        valores_raw: valoresRaw,
        validaciones: {
          dimensiones_completas: producto.dimensiones_completas,
          cumple_stock_minimo: producto.cumple_stock_minimo,
          tiene_imagen: producto.tiene_imagen
        },
        motivos_detallados: motivos,
        motivos_sistema: producto.motivos_no_disponible_web || [],
        motivo_legacy: producto.motivo_no_disponible,
        datos_adicionales: {
          precio_con_iva: producto.precio_con_iva,
          stock: producto.stock,
          ruta_imagen: producto.ruta_imagen
        }
      };
    });

    // Agrupar motivos más comunes
    const conteoMotivos = {};
    noDisponiblesDetallados.forEach(producto => {
      producto.motivos_detallados.forEach(motivo => {
        if (motivo.startsWith('❌')) {
          conteoMotivos[motivo] = (conteoMotivos[motivo] || 0) + 1;
        }
      });
    });

    // Estadísticas por pestaña
    const estadisticasPorPestaña = {};
    todosLosProductos.forEach(producto => {
      const pestaña = producto.pestaña_origen || 'Sin pestaña';
      if (!estadisticasPorPestaña[pestaña]) {
        estadisticasPorPestaña[pestaña] = {
          total: 0,
          disponibles: 0,
          no_disponibles: 0
        };
      }
      estadisticasPorPestaña[pestaña].total++;
      if (producto.disponible_en_web) {
        estadisticasPorPestaña[pestaña].disponibles++;
      } else {
        estadisticasPorPestaña[pestaña].no_disponibles++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        productos_disponibles: disponibles.map(p => ({
          codigo: p.codigo,
          nombre: p.nombre,
          categoria: p.categoria,
          espesor: p.espesor,
          ancho: p.ancho,
          largo: p.largo,
          stock: p.stock,
          pestaña_origen: p.pestaña_origen
        })),
        productos_no_disponibles: noDisponiblesDetallados,
        estadisticas: {
          total: todosLosProductos.length,
          disponibles: disponibles.length,
          no_disponibles: noDisponibles.length,
          porcentaje_disponible: ((disponibles.length / todosLosProductos.length) * 100).toFixed(2)
        },
        motivos_mas_comunes: conteoMotivos,
        estadisticas_por_pestaña: estadisticasPorPestaña
      },
      mensaje: `${noDisponibles.length} productos no disponibles de ${todosLosProductos.length} total`
    });

  } catch (error) {
    console.error('Error en API productos no disponibles:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}