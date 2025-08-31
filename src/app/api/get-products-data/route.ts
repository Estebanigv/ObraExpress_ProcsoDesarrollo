import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Cache en memoria para mantener los datos entre solicitudes
let memoryCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function GET() {
  try {
    console.log('🔍 Obteniendo datos de productos...');

    // NO usar caché para el panel de admin - siempre datos frescos
    // Solo usar caché para la web pública
    const forceRefresh = true; // Por ahora siempre refrescar

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
            
            // Agregar como variante con dimensiones formateadas
            const dimensiones = producto.ancho && producto.largo ? 
              `${producto.ancho} x ${producto.largo}` : 
              (producto.dimensiones || `${producto.ancho || ''} x ${producto.largo || ''}`.trim());
            
            productoExistente.variantes.push({
              codigo: producto.codigo,
              nombre: producto.nombre,
              categoria: producto.categoria,
              tipo: producto.tipo,
              espesor: producto.espesor,
              ancho: producto.ancho,
              largo: producto.largo,
              dimensiones: dimensiones,
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

          const responseData = {
            productos_por_categoria: productosPorCategoria,
            productos_policarbonato: productosPorCategoria['Policarbonato'] || []
          };

          // Guardar en caché solo si hay datos
          if (Object.keys(productosPorCategoria).length > 0) {
            memoryCache = responseData;
            cacheTimestamp = Date.now();
          }

          return NextResponse.json(responseData);
        } else {
          console.log('⚠️ No hay datos en Supabase o error:', error?.message);
          // Si no hay datos en Supabase pero hay en caché, usarlos
          if (memoryCache) {
            console.log('📦 Usando caché de respaldo por falta de datos en Supabase');
            return NextResponse.json(memoryCache);
          }
        }
      } catch (supabaseError) {
        console.error('❌ Error leyendo desde Supabase:', supabaseError);
      }
    }

    // FALLBACK: Leer desde JSON como antes
    console.log('📄 Fallback: Leyendo desde JSON...');
    const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
    
    if (!fs.existsSync(filePath)) {
      // Si hay datos en caché, usarlos
      if (memoryCache) {
        console.log('📦 Usando caché de memoria como fallback');
        return NextResponse.json(memoryCache);
      }
      return NextResponse.json({
        productos_policarbonato: [],
        productos_por_categoria: {}
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Guardar en caché
    if (data && data.productos_por_categoria) {
      memoryCache = data;
      cacheTimestamp = Date.now();
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading products data:', error);
    
    // Si hay datos en caché, usarlos aunque hayan expirado
    if (memoryCache) {
      console.log('⚠️ Error al obtener datos, usando caché de respaldo');
      return NextResponse.json(memoryCache);
    }
    
    return NextResponse.json({
      productos_policarbonato: [],
      productos_por_categoria: {}
    });
  }
}