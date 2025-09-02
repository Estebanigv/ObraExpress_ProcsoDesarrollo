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
    console.log('🔍 INICIANDO DIAGNÓSTICO DE PRECIOS...');
    
    // 1. Obtener datos directos del Excel (Google Sheets)
    console.log('📊 ETAPA 1: Obteniendo datos directos del Excel...');
    
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
        
        console.log(`📋 ${pestana} - Headers:`, headers.slice(0, 8));
        console.log(`🎯 ${pestana} - Mapeo:`, indices);

        // Procesar TODAS las filas para diagnóstico completo
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
            // Precios parseados
            precioNeto: parseFloat(precioNetoRaw.replace(/[^0-9.-]/g, '')) || 0,
            costoProveedor: parseFloat(costoProveedorRaw.replace(/[^0-9.-]/g, '')) || 0,
            precioConIva: parseFloat(precioConIvaRaw.replace(/[^0-9.-]/g, '')) || 0,
            ganancia: parseFloat(gananciaRaw.replace(/[^0-9.-]/g, '')) || 0,
            filaOriginal: i + 1
          });
        }
        
        console.log(`✅ ${pestana}: ${datosExcel.filter(d => d.pestana === pestana).length} productos de muestra extraídos`);
      } catch (error) {
        console.error(`❌ Error procesando ${pestana}:`, error);
      }
    }

    // 2. Obtener datos de Supabase
    console.log('📊 ETAPA 2: Obteniendo datos de Supabase...');
    
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

    console.log(`✅ Supabase: ${datosSupabase?.length || 0} productos encontrados`);

    // 3. Comparar datos
    console.log('📊 ETAPA 3: Comparando precios...');
    
    const comparaciones = datosExcel.map(excel => {
      const supabase = datosSupabase?.find(s => s.codigo === excel.codigo);
      
      if (!supabase) {
        return {
          codigo: excel.codigo,
          nombre: excel.nombre,
          estado: 'NO_ENCONTRADO_SUPABASE',
          excel: {
            precioNeto: excel.precioNeto,
            costoProveedor: excel.costoProveedor,
            precioConIva: excel.precioConIva,
            ganancia: excel.ganancia
          },
          supabase: null,
          diferencias: ['Producto no existe en Supabase']
        };
      }

      const diferencias = [];
      
      // Comparar precios con tolerancia de 1 peso
      if (Math.abs(excel.precioNeto - supabase.precio_neto) > 1) {
        diferencias.push(`Precio Neto: Excel=${excel.precioNeto} vs Supabase=${supabase.precio_neto}`);
      }
      
      if (Math.abs(excel.costoProveedor - supabase.costo_proveedor) > 1) {
        diferencias.push(`Costo Proveedor: Excel=${excel.costoProveedor} vs Supabase=${supabase.costo_proveedor}`);
      }
      
      if (Math.abs(excel.precioConIva - supabase.precio_con_iva) > 1) {
        diferencias.push(`Precio con IVA: Excel=${excel.precioConIva} vs Supabase=${supabase.precio_con_iva}`);
      }
      
      if (Math.abs(excel.ganancia - supabase.ganancia) > 1) {
        diferencias.push(`Ganancia: Excel=${excel.ganancia} vs Supabase=${supabase.ganancia}`);
      }

      return {
        codigo: excel.codigo,
        nombre: excel.nombre,
        estado: diferencias.length > 0 ? 'DIFERENCIAS_ENCONTRADAS' : 'COINCIDE',
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
        },
        diferencias: diferencias.length > 0 ? diferencias : ['Precios coinciden correctamente']
      };
    });

    // Estadísticas del diagnóstico
    const stats = {
      totalComparaciones: comparaciones.length,
      coinciden: comparaciones.filter(c => c.estado === 'COINCIDE').length,
      conDiferencias: comparaciones.filter(c => c.estado === 'DIFERENCIAS_ENCONTRADAS').length,
      noEncontrados: comparaciones.filter(c => c.estado === 'NO_ENCONTRADO_SUPABASE').length
    };

    console.log('📊 Estadísticas finales:', stats);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      estadisticas: stats,
      comparaciones: comparaciones,
      recomendaciones: stats.conDiferencias > 0 ? [
        '🚨 Se encontraron diferencias de precios significativas',
        '1. Revisar proceso de sincronización Excel → Supabase', 
        '2. Verificar parsing de números con comas chilenas',
        '3. Ejecutar sincronización completa para corregir datos',
        '4. Validar cálculos de IVA y ganancias'
      ] : [
        '✅ Los precios están sincronizados correctamente'
      ]
    });

  } catch (error) {
    console.error('💥 Error en diagnóstico de precios:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error en diagnóstico'
    });
  }
}