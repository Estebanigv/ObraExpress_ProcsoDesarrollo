import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 GET /api/get-products-simple - Iniciando...');
    
    // Verificar configuración primero
    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin no está configurado');
      
      // En producción, intentar crear el cliente dinámicamente
      if (process.env.NODE_ENV === 'production') {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!url || !serviceKey) {
          return NextResponse.json({
            success: false,
            productos_por_categoria: {},
            total: 0,
            error: 'Variables de entorno de Supabase no configuradas en producción'
          });
        }
      }
      
      return NextResponse.json({
        success: false,
        productos_por_categoria: {},
        total: 0,
        error: 'Cliente de Supabase no disponible'
      });
    }
    
    // SIEMPRE intentar obtener de Supabase primero
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
        error: 'Error de base de datos: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error : undefined
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
          
          // Calcular precios correctamente si vienen nulos o ceros
          const costoProveedor = producto.costo_proveedor || 0;
          const precioNeto = producto.precio_neto || 0;
          const precioConIvaDb = producto.precio_con_iva || 0;
          
          // Si precio_con_iva es 0 pero precio_neto existe, calcularlo
          const precioConIva = precioConIvaDb > 0 ? precioConIvaDb : 
            (precioNeto > 0 ? Math.round(precioNeto * 1.19) : 0);
          
          const ganancia = precioNeto > 0 && costoProveedor > 0 ? precioNeto - costoProveedor : 0;
          const margenGanancia = precioNeto > 0 && ganancia > 0 ? 
            `${Math.round((ganancia / precioNeto) * 100)}%` : '0%';

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
            costo_proveedor: costoProveedor,
            precio_neto: precioNeto,
            precio_con_iva: precioConIva,
            ganancia: ganancia,
            margen_ganancia: margenGanancia,
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