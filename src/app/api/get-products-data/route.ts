import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('🔍 Obteniendo datos de productos...');

    // PRIORIDAD 1: Intentar leer desde Supabase
    if (supabaseAdmin) {
      try {
        console.log('📊 Leyendo datos desde Supabase...');
        const { data: supabaseData, error } = await supabaseAdmin
          .from('productos')
          .select('*')
          .order('codigo');

        if (!error && supabaseData && supabaseData.length > 0) {
          console.log(`✅ ${supabaseData.length} productos encontrados en Supabase`);
          
          // Agrupar por categoría como esperaba la interfaz
          const productosPorCategoria = supabaseData.reduce((grupos, producto) => {
            const categoria = producto.categoria || 'Policarbonato';
            
            if (!grupos[categoria]) {
              grupos[categoria] = [];
            }
            
            // Crear estructura de producto con variantes
            let productoExistente = grupos[categoria].find(p => p.nombre === producto.nombre);
            if (!productoExistente) {
              productoExistente = {
                id: producto.codigo,
                nombre: producto.nombre,
                categoria: categoria,
                tipo: producto.tipo,
                variantes: []
              };
              grupos[categoria].push(productoExistente);
            }
            
            // Agregar como variante
            productoExistente.variantes.push({
              codigo: producto.codigo,
              nombre: producto.nombre,
              categoria: producto.categoria,
              tipo: producto.tipo,
              espesor: producto.espesor,
              ancho: producto.ancho,
              largo: producto.largo,
              color: producto.color,
              uso: producto.uso,
              costo_proveedor: producto.costo_proveedor,
              precio_neto: producto.precio_neto,
              precio_con_iva: producto.precio_con_iva,
              ganancia: producto.ganancia,
              margen_ganancia: producto.margen_ganancia,
              stock: producto.stock,
              proveedor: producto.proveedor,
              pestaña_origen: producto.pestaña_origen,
              orden_original: producto.orden_original,
              disponible_en_web: producto.disponible_en_web,
              tiene_sku_valido: producto.tiene_sku_valido,
              tiene_stock_minimo: producto.tiene_stock_minimo,
              tiene_imagen: producto.tiene_imagen,
              ruta_imagen: producto.ruta_imagen,
              motivo_no_disponible: producto.motivo_no_disponible
            });

            return grupos;
          }, {} as any);

          console.log('📈 Estructura de datos creada:', Object.keys(productosPorCategoria));

          return NextResponse.json({
            productos_por_categoria: productosPorCategoria,
            productos_policarbonato: productosPorCategoria['Policarbonato'] || []
          });
        } else {
          console.log('⚠️ No hay datos en Supabase o error:', error?.message);
        }
      } catch (supabaseError) {
        console.error('❌ Error leyendo desde Supabase:', supabaseError);
      }
    }

    // FALLBACK: Leer desde JSON como antes
    console.log('📄 Fallback: Leyendo desde JSON...');
    const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        productos_policarbonato: []
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading products data:', error);
    return NextResponse.json({
      productos_policarbonato: []
    });
  }
}