import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Verificar autorización (podrías agregar un token secreto aquí)
    const { authorization } = await request.json();
    
    // Leer el archivo JSON de productos
    const filePath = path.join(process.cwd(), 'src/data/productos-policarbonato.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const productosLocales = JSON.parse(fileContent);

    console.log(`📦 Iniciando sincronización de ${productosLocales.length} productos...`);

    // Usar supabaseAdmin si está disponible, sino usar supabase normal
    const client = supabaseAdmin || supabase;

    // Primero, verificar si la tabla productos existe y tiene datos
    const { count: existingCount, error: countError } = await client
      .from('productos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error verificando productos existentes:', countError);
      return NextResponse.json({
        success: false,
        message: 'Error verificando tabla productos',
        error: countError.message
      }, { status: 500 });
    }

    console.log(`📊 Productos existentes en base de datos: ${existingCount}`);

    // Preparar productos para inserción
    const productosParaInsertar = productosLocales.map((producto: any, index: number) => ({
      codigo: producto.codigo || `PROD-${Date.now()}-${index}`,
      nombre: producto.nombre || 'Producto sin nombre',
      categoria: producto.categoria || 'Sin categoría',
      tipo: producto.tipo || producto.categoria || 'General',
      espesor: producto.espesor || '0',
      ancho: producto.ancho || '0',
      largo: producto.largo || '0',
      color: producto.color || 'Transparente',
      uso: producto.descripcion || 'Uso general',
      costo_proveedor: parseFloat(producto.costoProveedor) || 0,
      precio_neto: parseFloat(producto.precio) || 0,
      precio_con_iva: parseFloat(producto.precioConIva) || (parseFloat(producto.precio) * 1.19) || 0,
      ganancia: parseFloat(producto.ganancia) || 0,
      margen_ganancia: producto.margenGanancia || '0%',
      stock: parseInt(producto.stock) || 0,
      proveedor: producto.proveedor || 'Proveedor General',
      pestaña_origen: 'productos-policarbonato.json',
      orden_original: index,
      disponible_en_web: producto.disponible !== false,
      tiene_sku_valido: !!producto.codigo,
      tiene_stock_minimo: parseInt(producto.stock) > 0,
      tiene_imagen: !!producto.imagen,
      ruta_imagen: producto.imagen || null,
      motivo_no_disponible: producto.disponible === false ? 'No disponible temporalmente' : null
    }));

    // Insertar productos en lotes de 100
    const batchSize = 100;
    let insertados = 0;
    let errores = 0;

    for (let i = 0; i < productosParaInsertar.length; i += batchSize) {
      const batch = productosParaInsertar.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from('productos')
        .upsert(batch, { 
          onConflict: 'codigo',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`Error en lote ${i / batchSize + 1}:`, error);
        errores += batch.length;
      } else {
        insertados += data?.length || 0;
        console.log(`✅ Lote ${i / batchSize + 1} insertado: ${data?.length} productos`);
      }
    }

    // Obtener estadísticas finales
    const { count: finalCount } = await client
      .from('productos')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      estadisticas: {
        productosLocales: productosLocales.length,
        productosAntes: existingCount || 0,
        productosInsertados: insertados,
        errores: errores,
        totalDespues: finalCount || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en sincronización:', error);
    return NextResponse.json({
      success: false,
      message: 'Error en sincronización de productos',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET para verificar estado actual
export async function GET() {
  try {
    const client = supabaseAdmin || supabase;
    
    // Obtener conteo y muestra de productos
    const { count, data: muestra, error } = await client
      .from('productos')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Error obteniendo productos',
        error: error.message
      }, { status: 500 });
    }

    // Estadísticas por categoría
    const { data: categorias } = await client
      .from('productos')
      .select('categoria')
      .limit(1000);

    const categoriasCount: Record<string, number> = {};
    if (categorias) {
      categorias.forEach((p: any) => {
        categoriasCount[p.categoria] = (categoriasCount[p.categoria] || 0) + 1;
      });
    }

    return NextResponse.json({
      success: true,
      totalProductos: count || 0,
      categorias: categoriasCount,
      muestra: muestra?.slice(0, 3).map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        precio: p.precio_con_iva,
        stock: p.stock
      })),
      mensaje: count === 0 
        ? 'No hay productos. Usa POST para sincronizar desde el archivo JSON' 
        : `${count} productos en base de datos`
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error obteniendo información',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}