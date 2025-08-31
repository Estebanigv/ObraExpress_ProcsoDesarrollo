import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 GET /api/get-products-simple - Iniciando...');
    
    // SIEMPRE intentar obtener de Supabase primero
    if (supabaseAdmin) {
      console.log('🔗 Consultando Supabase...');
      const { data, error } = await supabaseAdmin
        .from('productos')
        .select('*')
        .order('codigo');

      console.log('📊 Resultado Supabase:', { 
        error: error?.message || 'sin error', 
        dataLength: data?.length || 0,
        hasData: !!data 
      });

      if (error) {
        console.error('❌ Error Supabase:', error);
        return NextResponse.json({
          success: false,
          productos_por_categoria: {},
          total: 0,
          error: 'Error de base de datos: ' + error.message
        });
      }

      if (data && data.length > 0) {
        // Agrupar por categoría
        const productosPorCategoria: any = {};
        
        data.forEach((producto) => {
          const categoria = producto.categoria || 'Policarbonato';
          
          if (!productosPorCategoria[categoria]) {
            productosPorCategoria[categoria] = [];
          }
          
          // Buscar si ya existe un producto con el mismo nombre
          let productoExistente = productosPorCategoria[categoria].find(
            (p: any) => p.nombre === producto.nombre && p.tipo === producto.tipo
          );
          
          if (!productoExistente) {
            productoExistente = {
              id: producto.codigo,
              nombre: producto.nombre,
              categoria: categoria,
              tipo: producto.tipo,
              variantes: []
            };
            productosPorCategoria[categoria].push(productoExistente);
          }
          
          // Agregar variante con TODOS los campos necesarios
          productoExistente.variantes.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            tipo: producto.tipo || '', // ✅ AGREGAR TIPO
            categoria: producto.categoria || 'Policarbonato',
            espesor: producto.espesor || '',
            ancho: producto.ancho || '', // ✅ AGREGAR ANCHO INDIVIDUAL
            largo: producto.largo || '', // ✅ AGREGAR LARGO INDIVIDUAL
            color: producto.color || '',
            dimensiones: `${producto.ancho || ''} x ${producto.largo || ''}`.trim() || '',
            costo_proveedor: producto.costo_proveedor || 0,
            precio_neto: producto.precio_neto || 0,
            precio_con_iva: producto.precio_con_iva || 0,
            ganancia: producto.ganancia || 0,
            margen_ganancia: producto.margen_ganancia || '0%',
            stock: producto.stock || 0,
            proveedor: producto.proveedor || '',
            disponible_en_web: producto.disponible_en_web || false,
            tiene_imagen: producto.tiene_imagen || false,
            ruta_imagen: producto.ruta_imagen || null
          });
        });

        console.log('✅ Datos procesados:', {
          categorias: Object.keys(productosPorCategoria),
          totalProductos: Object.values(productosPorCategoria).flat().length,
          totalVariantes: data.length
        });

        return NextResponse.json({
          success: true,
          productos_por_categoria: productosPorCategoria,
          total: data.length
        });
      } else {
        console.warn('⚠️ No se encontraron datos en Supabase - tabla vacía');
        return NextResponse.json({
          success: false,
          productos_por_categoria: {},
          total: 0,
          error: 'No hay productos en la base de datos. Ejecuta una sincronización primero.'
        });
      }
    } else {
      console.error('❌ supabaseAdmin no está configurado');
      return NextResponse.json({
        success: false,
        productos_por_categoria: {},
        total: 0,
        error: 'Configuración de base de datos no disponible'
      });
    }

  } catch (error) {
    console.error('💥 Error general en get-products-simple:', error);
    return NextResponse.json({
      success: false,
      productos_por_categoria: {},
      total: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}