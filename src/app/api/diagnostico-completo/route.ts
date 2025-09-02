import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

// Parser robusto de CSV
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function diagnosticarGoogleSheets() {
  console.log('📊 ETAPA 1: Diagnosticando Google Sheets...');
  
  const pestanas = ['Policarbonato', 'Perfiles Alveolar'];
  const diagnostico: any = {};

  for (const pestana of pestanas) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(pestana)}`;
      
      const response = await fetch(csvUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (!response.ok) {
        diagnostico[pestana] = { error: `HTTP ${response.status}` };
        continue;
      }

      const csvData = await response.text();
      const lines = csvData.trim().split('\n');
      
      if (lines.length < 2) {
        diagnostico[pestana] = { error: 'Sin datos' };
        continue;
      }

      const headers = parseCSVLine(lines[0]);
      const primeraFila = parseCSVLine(lines[1]);
      
      // Analizar estructura
      const muestraProductos = lines.slice(1, 4).map(line => {
        const cols = parseCSVLine(line);
        return {
          sku: cols[0] || '',
          nombre: cols[1] || '',
          precio: cols[7] || '', // Asumiendo que precio está en columna 7
          stock: cols[12] || '', // Asumiendo que stock está en columna 12
          ancho: cols[3] || '',
          largo: cols[4] || ''
        };
      });

      diagnostico[pestana] = {
        totalFilas: lines.length - 1,
        headers: headers.slice(0, 10), // Primeros 10 headers
        muestraProductos,
        estructuraOK: true
      };

    } catch (error) {
      diagnostico[pestana] = { 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  return diagnostico;
}

async function diagnosticarSupabase() {
  console.log('📊 ETAPA 2: Diagnosticando Supabase...');
  
  try {
    // Obtener estadísticas generales
    const { data: productos, error } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, categoria, precio_neto, precio_con_iva, stock, ancho, largo, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return { error: error.message };
    }

    if (!productos || productos.length === 0) {
      return { error: 'Sin productos en Supabase' };
    }

    // Agrupar por categoría
    const porCategoria: any = {};
    productos.forEach(producto => {
      const cat = producto.categoria || 'Sin Categoría';
      if (!porCategoria[cat]) {
        porCategoria[cat] = [];
      }
      porCategoria[cat].push({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_neto: producto.precio_neto,
        precio_con_iva: producto.precio_con_iva,
        stock: producto.stock,
        ancho: producto.ancho,
        largo: producto.largo,
        created_at: producto.created_at
      });
    });

    return {
      totalProductos: productos.length,
      categorias: Object.keys(porCategoria),
      porCategoria: Object.fromEntries(
        Object.entries(porCategoria).map(([cat, prods]: [string, any]) => [
          cat, 
          (prods as any[]).slice(0, 3) // Solo 3 productos de muestra por categoría
        ])
      ),
      ultimaActualizacion: productos[0]?.created_at
    };

  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Error de conexión Supabase' 
    };
  }
}

async function diagnosticarAdmin() {
  console.log('📊 ETAPA 3: Diagnosticando API del Admin...');
  
  try {
    // Simular llamada a la API del admin (desde el servidor)
    const adminUrl = 'http://localhost:3000/api/get-products-simple';
    const response = await fetch(adminUrl);
    
    if (!response.ok) {
      return { error: `API Admin HTTP ${response.status}` };
    }

    const data = await response.json();
    
    if (!data.success) {
      return { error: data.error || 'API Admin falló' };
    }

    const categorias = Object.keys(data.productos_por_categoria || {});
    const totalProductos = Object.values(data.productos_por_categoria || {})
      .reduce((total, productos: any) => total + productos.length, 0);

    return {
      totalProductos,
      categorias,
      muestaPorCategoria: Object.fromEntries(
        Object.entries(data.productos_por_categoria || {}).map(([cat, prods]: [string, any]) => [
          cat,
          prods.slice(0, 2).map((prod: any) => ({
            nombre: prod.nombre,
            totalVariantes: prod.variantes?.length || 0,
            primeraVariante: prod.variantes?.[0] ? {
              codigo: prod.variantes[0].codigo,
              precio_con_iva: prod.variantes[0].precio_con_iva,
              ancho: prod.variantes[0].ancho,
              largo: prod.variantes[0].largo
            } : null
          }))
        ])
      )
    };

  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Error consultando API Admin' 
    };
  }
}

export async function GET() {
  try {
    console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DEL FLUJO DE DATOS...');
    
    const [googleSheets, supabase, adminApi] = await Promise.all([
      diagnosticarGoogleSheets(),
      diagnosticarSupabase(),
      diagnosticarAdmin()
    ]);

    // Comparar discrepancias
    const discrepancias: string[] = [];
    
    // Comparar Google Sheets vs Supabase
    const totalGoogleSheets = Object.values(googleSheets)
      .reduce((total: number, hoja: any) => total + (hoja.totalFilas || 0), 0);
    
    const totalSupabase = supabase.totalProductos || 0;
    const totalAdmin = adminApi.totalProductos || 0;

    if (Math.abs(totalGoogleSheets - totalSupabase) > 5) {
      discrepancias.push(`Diferencia significativa: Google Sheets (${totalGoogleSheets}) vs Supabase (${totalSupabase})`);
    }

    if (Math.abs(totalSupabase - totalAdmin) > 5) {
      discrepancias.push(`Diferencia significativa: Supabase (${totalSupabase}) vs Admin (${totalAdmin})`);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostico: {
        googleSheets,
        supabase,
        adminApi
      },
      resumen: {
        totalGoogleSheets,
        totalSupabase,
        totalAdmin,
        discrepancias: discrepancias.length > 0 ? discrepancias : ['✅ Datos consistentes']
      },
      recomendaciones: discrepancias.length > 0 ? [
        '1. Verificar sincronización Google Sheets → Supabase',
        '2. Revisar filtros en API del Admin', 
        '3. Limpiar cachés y recargar datos'
      ] : [
        '✅ Flujo de datos funcionando correctamente'
      ]
    });

  } catch (error) {
    console.error('💥 Error en diagnóstico completo:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error en diagnóstico'
    });
  }
}