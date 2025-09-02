import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

// Parser robusto de CSV que maneja comas dentro de comillas
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

// Función para detectar automáticamente la estructura correcta
function detectarEstructura(headers: string[], firstDataRow: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  // Buscar patrones conocidos para identificar columnas
  headers.forEach((header, index) => {
    const value = firstDataRow[index] || '';
    
    // SKU: usualmente empieza con números
    if (header.toLowerCase().includes('sku') || /^\d{8,}$/.test(value)) {
      mapping['sku'] = index;
    }
    // Nombre: usualmente texto descriptivo
    else if (header.toLowerCase().includes('nombre') || header.toLowerCase().includes('producto')) {
      mapping['nombre'] = index;
    }
    // Tipo: valores como "Ondulado", "Alveolar", etc.
    else if (header.toLowerCase().includes('tipo') || ['ondulado', 'alveolar', 'compacto', 'perfil'].some(t => value.toLowerCase().includes(t))) {
      mapping['tipo'] = index;
    }
    // Ancho: valores numéricos pequeños como 0.81, 2.1
    else if (header.toLowerCase().includes('ancho') || (parseFloat(value) > 0 && parseFloat(value) < 100 && value.includes('.'))) {
      mapping['ancho'] = index;
    }
    // Largo: valores numéricos como 2, 2.5, 11.6
    else if (header.toLowerCase().includes('largo') || (parseFloat(value) > 0 && parseFloat(value) < 20)) {
      mapping['largo'] = index;
    }
    // Precio: valores con $ o números grandes
    else if (header.toLowerCase().includes('precio') && (value.includes('$') || parseFloat(value.replace(/[^0-9.]/g, '')) > 1000)) {
      mapping['precio'] = index;
    }
    // Stock: números enteros típicamente entre 10-100
    else if (header.toLowerCase().includes('stock') || (/^\d{1,3}$/.test(value) && parseInt(value) > 5)) {
      mapping['stock'] = index;
    }
  });
  
  return mapping;
}

export async function POST(request: NextRequest) {
  try {
    const { sheet } = await request.json();
    const sheetName = sheet || 'Perfiles Alveolar';
    
    console.log(`🔧 Reparando sincronización de: ${sheetName}`);
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    
    const response = await fetch(csvUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const csvData = await response.text();
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: `Pestaña ${sheetName} vacía`
      });
    }

    // Parser robusto de encabezados
    const headers = parseCSVLine(lines[0]);
    const firstDataRow = parseCSVLine(lines[1]);
    
    console.log('📋 Encabezados detectados:', headers);
    console.log('📋 Primera fila de datos:', firstDataRow);
    
    // Detectar automáticamente la estructura correcta
    const estructura = detectarEstructura(headers, firstDataRow);
    console.log('🎯 Estructura detectada:', estructura);
    
    const productos: any[] = [];
    
    // Procesar todas las filas con la estructura corregida
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      
      if (cols.length < 3) continue; // Saltar filas vacías
      
      const producto = {
        codigo: cols[estructura.sku] || '',
        nombre: cols[estructura.nombre] || '',
        categoria: sheetName === 'Perfiles Alveolar' ? 'Perfiles' : 'Policarbonato',
        tipo: cols[estructura.tipo] || '',
        ancho: cols[estructura.ancho] || '',
        largo: cols[estructura.largo] || '',
        precio_neto: parseFloat((cols[estructura.precio] || '0').replace(/[^0-9.]/g, '')) || 0,
        stock: parseInt(cols[estructura.stock] || '0') || 0,
        proveedor: 'Leker',
        disponible_en_web: true,
        tiene_imagen: false
      };
      
      // Solo procesar productos con código válido
      if (producto.codigo && /^\d{8,}$/.test(producto.codigo)) {
        productos.push(producto);
      }
    }
    
    console.log(`✅ Procesados ${productos.length} productos de ${sheetName}`);
    
    // Si hay productos, sincronizar a Supabase
    if (productos.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('productos')
        .upsert(productos, { onConflict: 'codigo' });
      
      if (error) {
        console.error('❌ Error sincronizando a Supabase:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        });
      }
      
      console.log('✅ Productos sincronizados a Supabase exitosamente');
    }
    
    return NextResponse.json({
      success: true,
      sheet: sheetName,
      productosProcessed: productos.length,
      estructura,
      muestra: productos.slice(0, 3), // Primeros 3 productos como muestra
      message: `${productos.length} productos de ${sheetName} sincronizados correctamente`
    });
    
  } catch (error) {
    console.error('💥 Error en fix-sync:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}