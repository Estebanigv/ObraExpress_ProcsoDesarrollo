import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

// Parser robusto de CSV
function parseCSVLineSeguro(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  result.push(current.trim());
  return result.map(field => field.replace(/^\"|\"$/g, ''));
}

// Mapear índices de columnas
function mapearIndicesColumnas(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  headers.forEach((header, index) => {
    const headerLower = header.toLowerCase().trim();
    
    if (headerLower.includes('sku') || headerLower.includes('código')) {
      mapping.sku = index;
    } else if (headerLower.includes('nombre') && headerLower.includes('producto')) {
      mapping.nombre = index;
    } else if (headerLower.includes('precio') && headerLower.includes('neto')) {
      mapping.precioNeto = index;
    } else if (headerLower.includes('costo') && headerLower.includes('proveedor')) {
      mapping.costoProveedor = index;
    } else if (headerLower.includes('iva') && headerLower.includes('incluido')) {
      mapping.precioConIva = index;
    } else if (headerLower.includes('ganancia') && !headerLower.includes('margen')) {
      mapping.ganancia = index;
    }
  });

  return mapping;
}

export async function GET() {
  try {
    console.log('🔍 ANALIZANDO SOLO PRODUCTOS CON DIFERENCIAS DE PRECIOS...');
    
    // 1. Obtener datos directos del Excel
    const pestanas = ['Policarbonato', 'Perfiles Alveolar'];
    const datosExcel: any[] = [];
    
    for (const pestana of pestanas) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(pestana)}`;
        
        const response = await fetch(csvUrl, {
          redirect: 'follow',
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/csv,application/csv,text/plain'
          }
        });

        if (!response.ok) continue;

        const csvData = await response.text();
        const lines = csvData.trim().split('\n');
        
        if (lines.length < 2) continue;

        const headers = parseCSVLineSeguro(lines[0]);
        const indices = mapearIndicesColumnas(headers);

        // Procesar todas las filas
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLineSeguro(lines[i]);
          
          const codigo = cols[indices.sku]?.trim();
          if (!codigo || !/^\d{8,}$/.test(codigo)) continue;

          const precioNetoRaw = cols[indices.precioNeto] || '0';
          const costoProveedorRaw = cols[indices.costoProveedor] || '0';
          const precioConIvaRaw = cols[indices.precioConIva] || '0';
          const gananciaRaw = cols[indices.ganancia] || '0';

          datosExcel.push({
            pestana: pestana,
            codigo: codigo,
            nombre: cols[indices.nombre]?.trim() || '',
            precioNetoRaw: precioNetoRaw,
            costoProveedorRaw: costoProveedorRaw,
            precioConIvaRaw: precioConIvaRaw,
            gananciaRaw: gananciaRaw,
            precioNeto: parseFloat(precioNetoRaw.replace(/[^0-9.-]/g, '')) || 0,
            costoProveedor: parseFloat(costoProveedorRaw.replace(/[^0-9.-]/g, '')) || 0,
            precioConIva: parseFloat(precioConIvaRaw.replace(/[^0-9.-]/g, '')) || 0,
            ganancia: parseFloat(gananciaRaw.replace(/[^0-9.-]/g, '')) || 0,
            filaOriginal: i + 1
          });
        }
      } catch (error) {
        console.error(`❌ Error procesando ${pestana}:`, error);
      }
    }

    // 2. Obtener datos de Supabase
    const codigosExcel = datosExcel.map(d => d.codigo);
    const { data: datosSupabase, error } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, precio_neto, costo_proveedor, precio_con_iva, ganancia, categoria, created_at')
      .in('codigo', codigosExcel)
      .order('codigo');

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Error consultando Supabase: ' + error.message
      });
    }

    // 3. Encontrar solo las diferencias significativas
    const diferenciasEncontradas = [];
    
    datosExcel.forEach(excel => {
      const supabase = datosSupabase?.find(s => s.codigo === excel.codigo);
      
      if (!supabase) {
        diferenciasEncontradas.push({
          codigo: excel.codigo,
          nombre: excel.nombre,
          problema: 'NO_ENCONTRADO_EN_SUPABASE',
          excel: {
            precioNeto: excel.precioNeto,
            costoProveedor: excel.costoProveedor,
            precioConIva: excel.precioConIva,
            ganancia: excel.ganancia,
            datosRaw: {
              precioNetoRaw: excel.precioNetoRaw,
              costoProveedorRaw: excel.costoProveedorRaw,
              precioConIvaRaw: excel.precioConIvaRaw,
              gananciaRaw: excel.gananciaRaw
            }
          },
          supabase: null
        });
        return;
      }

      const diferencias = [];
      
      // Comparar con tolerancia de 1 peso
      if (Math.abs(excel.precioNeto - supabase.precio_neto) > 1) {
        diferencias.push({
          campo: 'Precio Neto',
          excel: excel.precioNeto,
          supabase: supabase.precio_neto,
          diferencia: Math.abs(excel.precioNeto - supabase.precio_neto)
        });
      }
      
      if (Math.abs(excel.costoProveedor - supabase.costo_proveedor) > 1) {
        diferencias.push({
          campo: 'Costo Proveedor',
          excel: excel.costoProveedor,
          supabase: supabase.costo_proveedor,
          diferencia: Math.abs(excel.costoProveedor - supabase.costo_proveedor)
        });
      }
      
      if (Math.abs(excel.precioConIva - supabase.precio_con_iva) > 1) {
        diferencias.push({
          campo: 'Precio con IVA',
          excel: excel.precioConIva,
          supabase: supabase.precio_con_iva,
          diferencia: Math.abs(excel.precioConIva - supabase.precio_con_iva)
        });
      }
      
      if (Math.abs(excel.ganancia - supabase.ganancia) > 1) {
        diferencias.push({
          campo: 'Ganancia',
          excel: excel.ganancia,
          supabase: supabase.ganancia,
          diferencia: Math.abs(excel.ganancia - supabase.ganancia)
        });
      }

      if (diferencias.length > 0) {
        diferenciasEncontradas.push({
          codigo: excel.codigo,
          nombre: excel.nombre,
          problema: 'DIFERENCIAS_DE_PRECIOS',
          diferencias: diferencias,
          excel: {
            precioNeto: excel.precioNeto,
            costoProveedor: excel.costoProveedor,
            precioConIva: excel.precioConIva,
            ganancia: excel.ganancia,
            datosRaw: {
              precioNetoRaw: excel.precioNetoRaw,
              costoProveedorRaw: excel.costoProveedorRaw,
              precioConIvaRaw: excel.precioConIvaRaw,
              gananciaRaw: excel.gananciaRaw
            }
          },
          supabase: {
            precioNeto: supabase.precio_neto,
            costoProveedor: supabase.costo_proveedor,
            precioConIva: supabase.precio_con_iva,
            ganancia: supabase.ganancia,
            categoria: supabase.categoria,
            fechaActualizacion: supabase.created_at
          }
        });
      }
    });

    console.log(`🚨 Encontradas ${diferenciasEncontradas.length} diferencias de ${datosExcel.length} productos total`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resumen: {
        totalProductos: datosExcel.length,
        productosConDiferencias: diferenciasEncontradas.length,
        porcentajeCorrectos: Math.round(((datosExcel.length - diferenciasEncontradas.length) / datosExcel.length) * 100)
      },
      diferenciasEncontradas: diferenciasEncontradas,
      recomendacion: diferenciasEncontradas.length > 0 
        ? `🚨 Se encontraron ${diferenciasEncontradas.length} productos con precios incorrectos. Revisar sincronización.`
        : '✅ Todos los precios están correctos entre Excel y Supabase'
    });

  } catch (error) {
    console.error('💥 Error analizando diferencias:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error en análisis'
    });
  }
}