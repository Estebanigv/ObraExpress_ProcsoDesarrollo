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

// Detectar automáticamente la estructura correcta de columnas
function detectarEstructura(headers: string[], firstDataRow: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  headers.forEach((header, index) => {
    const value = firstDataRow[index] || '';
    const headerLower = header.toLowerCase();
    
    // SKU: buscar por header o patrón numérico de 8+ dígitos
    if (headerLower.includes('sku') || headerLower.includes('código') || /^\d{8,}$/.test(value)) {
      mapping['sku'] = index;
    }
    // Nombre de producto
    else if (headerLower.includes('nombre') && headerLower.includes('producto')) {
      mapping['nombre'] = index;
    }
    // Tipo
    else if (headerLower.includes('tipo') || ['ondulado', 'alveolar', 'compacto', 'perfil'].some(t => value.toLowerCase().includes(t))) {
      mapping['tipo'] = index;
    }
    // Espesor
    else if (headerLower.includes('espesor') && !value.includes('$')) {
      mapping['espesor'] = index;
    }
    // Ancho
    else if (headerLower.includes('ancho')) {
      mapping['ancho'] = index;
    }
    // Largo
    else if (headerLower.includes('largo')) {
      mapping['largo'] = index;
    }
    // Color
    else if (headerLower.includes('color') && ['clear', 'bronce', 'opal'].some(c => value.toLowerCase().includes(c))) {
      mapping['color'] = index;
    }
    // Uso
    else if (headerLower.includes('uso') && value.toLowerCase().includes('para')) {
      mapping['uso'] = index;
    }
    // Precio Neto
    else if (headerLower.includes('precio') && headerLower.includes('neto')) {
      mapping['precio_neto'] = index;
    }
    // Costo por proveedor
    else if (headerLower.includes('costo') && headerLower.includes('proveedor')) {
      mapping['costo_proveedor'] = index;
    }
    // IVA incluido
    else if (headerLower.includes('iva') && headerLower.includes('incluido')) {
      mapping['precio_con_iva'] = index;
    }
    // Stock
    else if (headerLower.includes('stock') && (/^\d{1,4}$/.test(value))) {
      mapping['stock'] = index;
    }
    // Proveedor
    else if (headerLower.includes('proveedor') && value.toLowerCase() === 'leker') {
      mapping['proveedor'] = index;
    }
  });
  
  return mapping;
}

// Función para procesar una pestaña específica
async function procesarPestaña(sheetName: string) {
  console.log(`📊 Procesando pestaña: ${sheetName}`);
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(csvUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      return { productos: [], error: `Error HTTP ${response.status}` };
    }

    const csvData = await response.text();
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) {
      return { productos: [], error: 'Pestaña vacía' };
    }

    // Parsear con el nuevo parser robusto
    const headers = parseCSVLine(lines[0]);
    const firstDataRow = parseCSVLine(lines[1]);
    
    // Detectar estructura automáticamente
    const estructura = detectarEstructura(headers, firstDataRow);
    
    console.log(`🎯 Estructura detectada para ${sheetName}:`, estructura);

    const productos: any[] = [];
    
    // Procesar todas las filas
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      
      if (cols.length < 3 || !cols[estructura.sku]) continue;
      
      const codigo = cols[estructura.sku];
      if (!codigo || !/^\d{8,}$/.test(codigo)) continue;

      // Determinar categoría basada en el nombre de la pestaña
      let categoria = 'Productos';
      if (sheetName.toLowerCase().includes('policarbonato')) {
        categoria = 'Policarbonato';
      } else if (sheetName.toLowerCase().includes('perfil')) {
        categoria = 'Perfiles';
      } else if (sheetName.toLowerCase().includes('accesorio')) {
        categoria = 'Accesorios';
      }

      const producto = {
        codigo: codigo,
        nombre: cols[estructura.nombre] || '',
        categoria: categoria,
        tipo: cols[estructura.tipo] || '',
        espesor: cols[estructura.espesor] || '',
        ancho: cols[estructura.ancho] || '',
        largo: cols[estructura.largo] || '',
        color: cols[estructura.color] || 'Clear',
        uso: cols[estructura.uso] || '',
        precio_neto: parseFloat((cols[estructura.precio_neto] || '0').replace(/[^0-9.]/g, '')) || 0,
        costo_proveedor: parseFloat((cols[estructura.costo_proveedor] || '0').replace(/[^0-9.]/g, '')) || 0,
        precio_con_iva: parseFloat((cols[estructura.precio_con_iva] || '0').replace(/[^0-9.]/g, '')) || 0,
        stock: parseInt(cols[estructura.stock] || '0') || 0,
        proveedor: cols[estructura.proveedor] || 'Leker',
        disponible_en_web: true,
        tiene_imagen: false,
        ruta_imagen: null,
        pestaña_origen: sheetName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Calcular campos derivados
      if (producto.precio_con_iva === 0 && producto.precio_neto > 0) {
        producto.precio_con_iva = Math.round(producto.precio_neto * 1.19);
      }
      
      if (producto.precio_neto === 0 && producto.costo_proveedor > 0) {
        producto.precio_neto = Math.round(producto.costo_proveedor * 1.4); // Factor común
        producto.precio_con_iva = Math.round(producto.precio_neto * 1.19);
      }

      productos.push(producto);
    }

    console.log(`✅ Procesados ${productos.length} productos de ${sheetName}`);
    return { productos, estructura };

  } catch (error) {
    console.error(`❌ Error procesando ${sheetName}:`, error);
    return { productos: [], error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando sincronización completa Excel → Supabase → Admin');
    
    const pestañas = ['Policarbonato', 'Perfiles Alveolar'];
    const todosLosProductos: any[] = [];
    const reportePorPestaña: any[] = [];

    // Procesar cada pestaña
    for (const pestaña of pestañas) {
      const resultado = await procesarPestaña(pestaña);
      
      if (resultado.productos.length > 0) {
        todosLosProductos.push(...resultado.productos);
      }
      
      reportePorPestaña.push({
        pestaña,
        productos: resultado.productos.length,
        error: resultado.error,
        estructura: resultado.estructura
      });
    }

    if (todosLosProductos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron productos válidos en las pestañas'
      });
    }

    console.log(`📦 Total de productos para sincronizar: ${todosLosProductos.length}`);

    // Sincronizar a Supabase en lotes
    const BATCH_SIZE = 50;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < todosLosProductos.length; i += BATCH_SIZE) {
      const batch = todosLosProductos.slice(i, i + BATCH_SIZE);
      
      try {
        const { data, error } = await supabaseAdmin
          .from('productos')
          .upsert(batch, { onConflict: 'codigo' });

        if (error) {
          errors.push(`Lote ${Math.floor(i/BATCH_SIZE) + 1}: ${error.message}`);
          console.error(`❌ Error en lote ${Math.floor(i/BATCH_SIZE) + 1}:`, error);
        } else {
          totalInserted += batch.length;
          console.log(`✅ Lote ${Math.floor(i/BATCH_SIZE) + 1} sincronizado: ${batch.length} productos`);
        }
      } catch (batchError) {
        errors.push(`Lote ${Math.floor(i/BATCH_SIZE) + 1}: Error de conexión`);
        console.error(`❌ Error de conexión en lote ${Math.floor(i/BATCH_SIZE) + 1}:`, batchError);
      }
    }

    const response = {
      success: totalInserted > 0,
      message: `Sincronización completa: ${totalInserted} productos sincronizados`,
      totalProductos: todosLosProductos.length,
      productosInsertados: totalInserted,
      reportePorPestaña,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Sincronización completa finalizada:', response);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Error general en sincronización:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}