import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🧹 Iniciando limpieza manual de productos con SKUs inválidos...');
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin client no disponible'
      }, { status: 500 });
    }

    // Lista de textos inválidos que no son SKUs reales
    const textosInvalidosParaDb = [
      'aplicación típica', 'aplicacion tipica', 'típica', 'tipica',
      'descripción', 'descripcion', 'detalle', 'información', 'informacion',
      'uso típico', 'uso tipico', 'usos', 'características', 'caracteristicas',
      'especificaciones', 'especificacion', 'notas', 'observaciones',
      'medidas típicas', 'medidas tipicas', 'dimensiones típicas',
      'colores disponibles', 'colores', 'acabados', 'terminaciones',
      'instalación', 'instalacion', 'montaje', 'aplicaciones',
      'ventajas', 'beneficios', 'propiedades', 'garantía', 'garantia',
      'falso', 'test', 'prueba', 'ejemplo', 'sample'
    ];

    // Obtener todos los productos actuales
    const { data: productosActuales, error: getError } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre');
    
    if (getError) {
      console.error('❌ Error obteniendo productos actuales:', getError.message);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo productos de la base de datos'
      }, { status: 500 });
    }

    if (!productosActuales || productosActuales.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay productos en la base de datos para limpiar',
        productosEliminados: 0
      });
    }

    // Filtrar productos con SKUs inválidos
    const productosAEliminar = productosActuales.filter(p => {
      const codigo = (p.codigo || '').toLowerCase().trim();
      const codigoOriginal = p.codigo || '';
      
      // Verificar si contiene textos inválidos
      const contieneTextoInvalido = textosInvalidosParaDb.some(texto => 
        codigo.includes(texto.toLowerCase())
      );
      
      // Verificar si es muy corto
      const esMuyCorto = codigo.length < 3;
      
      // Verificar si no tiene patrón de SKU válido (debe tener números o letras mayúsculas)
      const noTienePatronSku = !/[0-9A-Z]/.test(codigoOriginal);
      
      // Verificar si es solo un prefijo (termina en - o _)
      const esSoloPrefijo = codigo.endsWith('-') || codigo.endsWith('_');
      
      return contieneTextoInvalido || esMuyCorto || noTienePatronSku || esSoloPrefijo;
    });

    console.log(`🔍 Encontrados ${productosAEliminar.length} productos con SKUs inválidos de ${productosActuales.length} total`);

    if (productosAEliminar.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No se encontraron productos con SKUs inválidos para eliminar',
        productosEliminados: 0,
        productosRevisados: productosActuales.length
      });
    }

    // Mostrar qué productos se van a eliminar
    const skusAEliminar = productosAEliminar.map(p => p.codigo);
    console.log('🗑️ SKUs a eliminar:', skusAEliminar);

    // Eliminar productos identificados
    const { error: deleteError, count } = await supabaseAdmin
      .from('productos')
      .delete()
      .in('codigo', skusAEliminar);
    
    if (deleteError) {
      console.error('❌ Error eliminando productos inválidos:', deleteError.message);
      return NextResponse.json({
        success: false,
        error: 'Error eliminando productos inválidos: ' + deleteError.message,
        productosIdentificados: productosAEliminar.length
      }, { status: 500 });
    }

    console.log(`✅ ${skusAEliminar.length} productos con SKUs inválidos eliminados correctamente`);

    return NextResponse.json({
      success: true,
      message: `Limpieza completada exitosamente`,
      productosEliminados: skusAEliminar.length,
      productosRevisados: productosActuales.length,
      skusEliminados: skusAEliminar
    });

  } catch (error) {
    console.error('💥 Error en limpieza manual:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de limpieza de productos. Use POST para ejecutar la limpieza.'
  });
}