import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Función para formatear dimensiones en admin (debe ser consistente con product-validation)
function formatDimensionAdmin(dimension: string): string {
  // Si es vacío, null o undefined, retornar vacío
  if (!dimension || dimension === '' || dimension === 'null' || dimension === 'undefined') {
    return '';
  }
  
  // Convertir a string y limpiar
  let valorStr = dimension.toString().trim();
  
  // Si ya tiene formato correcto, devolverlo
  if (valorStr.match(/^\d+(\.\d+)?mm$/)) return valorStr; // ej: "4mm", "0.5mm"  
  if (valorStr.match(/^\d+(\.\d+)?cm$/)) return valorStr; // ej: "81cm"
  if (valorStr.match(/^\d+(\.\d+)?m$/)) return valorStr;  // ej: "2.10m"
  
  const num = parseFloat(dimension);
  if (!isNaN(num)) {
    // Si es exactamente 0, probablemente es un dato no especificado
    if (num === 0) {
      return '';
    }
    
    // LÓGICA CORREGIDA: 
    // - Si el valor es < 1, interpretarlo como centímetros (0.81 = 81cm)
    // - Si el valor es >= 1, interpretarlo como metros (2.10 = 2.10m)
    if (num < 1) {
      const centimetros = Math.round(num * 100);
      return `${centimetros}cm`;
    } else {
      return `${num.toFixed(2)}m`;
    }
  }
  return dimension;
}

export async function GET(request: NextRequest) {
  try {
    // Obtener productos completos desde Supabase
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .order('pestaña_origen', { ascending: true })
      .order('orden_original', { ascending: true });

    if (error) {
      console.error('Error obteniendo productos de Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!productos || productos.length === 0) {
      return NextResponse.json({
        success: true,
        data: { productos_por_categoria: {} },
        message: 'No hay productos en la base de datos',
        total: 0
      });
    }

    // Agrupar productos por categoría y tipo (estructura original)
    const productosPorCategoria = productos.reduce((acc, producto) => {
      const categoria = producto.categoria || 'Sin categoría';
      const tipo = producto.tipo || 'Sin tipo';

      if (!acc[categoria]) {
        acc[categoria] = [];
      }

      // Buscar si ya existe un producto con este tipo
      let productoExistente = acc[categoria].find(p => p.tipo === tipo);

      if (!productoExistente) {
        // Crear nuevo producto agrupado por tipo
        productoExistente = {
          id: `${categoria.toLowerCase().replace(/\s+/g, '-')}-${tipo.toLowerCase().replace(/\s+/g, '-')}`,
          nombre: `${categoria} ${tipo}`,
          descripcion: `${tipo} de la categoría ${categoria} disponible en diferentes especificaciones`,
          categoria: categoria,
          tipo: tipo,
          variantes: []
        };
        acc[categoria].push(productoExistente);
      }

      // Añadir el producto como variante con datos completos de Supabase
      productoExistente.variantes.push({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.nombre,
        categoria: producto.categoria,
        tipo: producto.tipo,
        costo_proveedor: producto.costo_proveedor || 0,
        precio_neto: producto.precio_neto || 0,
        precio_con_iva: producto.precio_con_iva || 0,
        ganancia: producto.ganancia || 0,
        margen_ganancia: producto.margen_ganancia || '0%',
        espesor: producto.espesor || '',
        ancho: producto.ancho ? formatDimensionAdmin(producto.ancho) : '',
        largo: producto.largo ? formatDimensionAdmin(producto.largo) : '',
        color: producto.color || '',
        uso: producto.uso || 'Uso general',
        stock: producto.stock || 0,
        proveedor: producto.proveedor || 'Leker',
        pestaña_origen: producto.pestaña_origen || 'Sheet1',
        orden_original: producto.orden_original || 0,
        disponible_en_web: producto.disponible_en_web || false,
        tiene_sku_valido: producto.tiene_sku_valido || false,
        tiene_stock_minimo: producto.tiene_stock_minimo || false,
        tiene_imagen: producto.tiene_imagen || false,
        ruta_imagen: producto.ruta_imagen || null,
        motivo_no_disponible: producto.motivo_no_disponible || null,
        uv_protection: true,
        garantia: "10 años",
        dimensiones: producto.ancho && producto.largo ? `${formatDimensionAdmin(producto.ancho)} x ${formatDimensionAdmin(producto.largo)}` : ''
      });

      return acc;
    }, {} as Record<string, any[]>);

    // Calcular estadísticas
    const stats = {
      totalProductos: productos.length,
      totalCategorias: Object.keys(productosPorCategoria).length,
      productosDisponiblesWeb: productos.filter(p => p.disponible_en_web).length,
      stockTotal: productos.reduce((sum, p) => sum + (p.stock || 0), 0),
      valorInventario: productos.reduce((sum, p) => sum + ((p.precio_neto || 0) * (p.stock || 0)), 0),
      ultimaActualizacion: productos.length > 0 ? 
        Math.max(...productos.map(p => new Date(p.updated_at || p.created_at).getTime())) : Date.now()
    };

    return NextResponse.json({
      success: true,
      data: {
        productos_por_categoria: productosPorCategoria,
        // Mantener compatibilidad con código existente
        productos_policarbonato: productosPorCategoria['Policarbonato'] || []
      },
      stats,
      fuente: 'supabase',
      total: productos.length
    });

  } catch (error) {
    console.error('Error en API productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para actualizar un producto específico
export async function PUT(request: NextRequest) {
  try {
    const { codigo, ...updateData } = await request.json();

    if (!codigo) {
      return NextResponse.json(
        { success: false, error: 'Código de producto requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('productos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('codigo', codigo)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Producto actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}