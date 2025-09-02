import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Leer el archivo JSON actual
    const filePath = path.join(process.cwd(), 'src/data/productos-policarbonato.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Extraer todas las variantes de productos
    const allVariants = [];
    
    // Manejar ambas estructuras: productos_por_categoria y productos_policarbonato
    const productosData = data.productos_por_categoria || { 'Policarbonato': data.productos_policarbonato || [] };
    
    Object.entries(productosData).forEach(([categoria, productos]) => {
      (productos as any[]).forEach(producto => {
        producto.variantes.forEach((variante: any) => {
          // Calcular valores derivados
          const precioNeto = variante.precio_neto || 0;
          const costoProveedor = variante.costo_proveedor || (precioNeto > 0 ? Math.round(precioNeto * 0.54) : 0);
          const precioConIva = variante.precio_con_iva || (precioNeto > 0 ? Math.round(precioNeto * 1.19) : 0);
          const ganancia = precioNeto > 0 && costoProveedor > 0 ? precioNeto - costoProveedor : 0;
          const margenGanancia = precioNeto > 0 && ganancia > 0 ? `${Math.round((ganancia / precioNeto) * 100)}%` : '0%';
          
          allVariants.push({
            codigo: variante.codigo,
            nombre: variante.nombre,
            categoria: categoria,
            tipo: variante.tipo || producto.tipo,
            espesor: variante.espesor || '',
            ancho: variante.ancho || '',
            largo: variante.largo || '',
            color: variante.color || '',
            uso: variante.uso || '',
            costo_proveedor: costoProveedor,
            precio_neto: precioNeto,
            precio_con_iva: precioConIva,
            ganancia: ganancia,
            margen_ganancia: margenGanancia,
            stock: variante.stock || 0,
            proveedor: variante.proveedor || 'Leker',
            pestaña_origen: variante.pestaña_origen || 'Sheet1',
            orden_original: variante.orden_original || 0,
            disponible_en_web: variante.disponible_en_web || false,
            tiene_sku_valido: variante.tiene_sku_valido || false,
            tiene_stock_minimo: variante.tiene_stock_minimo || false,
            tiene_imagen: variante.tiene_imagen || false,
            ruta_imagen: variante.ruta_imagen || null,
            motivo_no_disponible: variante.motivo_no_disponible || null,
            updated_at: new Date().toISOString()
          });
        });
      });
    });

    console.log(`🔄 Iniciando sincronización con Supabase: ${allVariants.length} productos`);

    // Verificar si la tabla productos existe y tiene datos
    const { count } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Productos existentes en Supabase: ${count || 0}`);

    let syncStats = {
      total: allVariants.length,
      inserted: 0,
      updated: 0,
      errors: 0
    };

    // Si no hay datos, hacer inserción masiva
    if (!count || count === 0) {
      console.log('🚀 Inserción masiva inicial...');
      
      const { error } = await supabaseAdmin
        .from('productos')
        .insert(allVariants.map(v => ({
          ...v,
          created_at: new Date().toISOString()
        })));

      if (error) {
        console.error('Error en inserción masiva:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      syncStats.inserted = allVariants.length;
    } else {
      // Sincronización incremental - upsert producto por producto
      console.log('🔄 Sincronización incremental...');
      
      for (const variant of allVariants) {
        try {
          // Verificar si el producto ya existe ANTES del upsert
          const { data: existing } = await supabaseAdmin
            .from('productos')
            .select('id, nombre, precio_neto, stock, updated_at')
            .eq('codigo', variant.codigo)
            .single();
          
          const isUpdate = !!existing;
          
          // Hacer el upsert
          const { error } = await supabaseAdmin
            .from('productos')
            .upsert({
              ...variant,
              created_at: isUpdate ? existing?.created_at : new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'codigo'
            });

          if (error) {
            console.error(`Error sincronizando ${variant.codigo}:`, error);
            syncStats.errors++;
          } else {
            if (isUpdate) {
              syncStats.updated++;
              console.log(`✅ Actualizado: ${variant.codigo} - ${variant.nombre}`);
            } else {
              syncStats.inserted++;
              console.log(`➕ Insertado: ${variant.codigo} - ${variant.nombre}`);
            }
          }
        } catch (err) {
          console.error(`Error procesando ${variant.codigo}:`, err);
          syncStats.errors++;
        }
      }
    }

    // Verificar conteo final
    const { count: finalCount } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Sincronización completada. Productos en Supabase: ${finalCount}`);

    return NextResponse.json({
      success: true,
      message: '✅ Sincronización con Supabase completada',
      stats: {
        ...syncStats,
        finalCount: finalCount || 0,
        sincronizadoEn: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en sincronización Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Obtener estadísticas de la tabla productos
    const { count } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    const { data: sampleData } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, proveedor, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalProductos: count || 0,
        ultimosActualizados: sampleData || []
      }
    });

  } catch (error) {
    console.error('Error obteniendo stats Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}