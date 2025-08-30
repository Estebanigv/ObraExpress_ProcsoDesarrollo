import { NextRequest, NextResponse } from 'next/server';

// Función auxiliar para parsear líneas CSV correctamente
function parseCsvLine(line: string): string[] {
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

interface GoogleSheetsProduct {
  SKU: string;
  Nombre: string;
  Tipo: string;
  'Espesor milimetros': string;
  'Ancho metros': string;
  'Largo metros': string;
  Color: string;
  Uso: string;
  'Precio Neto': string;
  Proveedor: string;
}

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  precio_neto: number;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  uso: string;
  stock: number;
  uv_protection: boolean;
  garantia: string;
  proveedor: string;
}

export async function POST(request: NextRequest) {
  try {
    const { sheetId, range = 'Sheet1!A:J' } = await request.json();
    
    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet ID is required' }, { status: 400 });
    }

    // URL para acceder a Google Sheets como CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=147076884`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets data');
    }
    
    const csvText = await response.text();
    
    // Parsear CSV con manejo de comillas y campos con comas
    const lines = csvText.trim().split('\n');
    const headers = parseCsvLine(lines[0]);
    
    const products: GoogleSheetsProduct[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length >= headers.length && values[0]) { // Skip empty rows
        const product: any = {};
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });
        products.push(product as GoogleSheetsProduct);
      }
    }

    // Convertir a formato interno
    const variants: ProductVariant[] = products.map(product => {
      // Procesar precio neto - formato chileno usa punto para miles y coma para decimales
      let precioText = product['Precio Neto'].toString();
      // Remover símbolo de moneda y espacios
      precioText = precioText.replace(/[$\s]/g, '');
      // Convertir formato chileno (7.523,50) a formato JS (7523.50)
      if (precioText.includes(',')) {
        // Tiene decimales: separar miles y decimales
        const parts = precioText.split(',');
        const enteros = parts[0].replace(/\./g, ''); // remover puntos de miles
        const decimales = parts[1];
        precioText = enteros + '.' + decimales;
      } else {
        // Solo enteros: remover puntos de miles
        precioText = precioText.replace(/\./g, '');
      }
      
      const precioNeto = parseFloat(precioText) || 0;
      const precioConIva = Math.round(precioNeto * 1.19);
      
      return {
        codigo: product.SKU,
        nombre: `${product.Nombre} ${product.Color} ${product['Ancho metros']}x${product['Largo metros']}m ${product['Espesor milimetros']}mm`,
        descripcion: `${product.Nombre} ${product['Espesor milimetros']}mm ${product['Ancho metros']}x${product['Largo metros']}m ${product.Color}`,
        categoria: "Policarbonato Ondulado",
        tipo: product.Tipo || product.Nombre,
        precio_neto: precioNeto,
        precio_con_iva: precioConIva,
        espesor: `${product['Espesor milimetros']}mm`,
        dimensiones: `${product['Ancho metros']}x${product['Largo metros']}m`,
        color: product.Color,
        uso: product.Uso || 'Uso general en construcción',
        stock: 50, // Default stock
        uv_protection: true,
        garantia: "10 años",
        proveedor: product.Proveedor || 'Leker'
      };
    });

    // Agrupar por tipo/proveedor
    const productGroups: { [key: string]: ProductVariant[] } = {};
    
    variants.forEach(variant => {
      const proveedor = variant.proveedor || 'Leker';
      const tipo = variant.tipo || 'Policarbonato Ondulado';
      const key = `${proveedor}-${tipo}`.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      productGroups[key].push(variant);
    });

    // Crear estructura final
    const finalProducts = Object.entries(productGroups).map(([key, variants]) => {
      const firstVariant = variants[0];
      const proveedor = firstVariant.proveedor || 'Leker';
      
      // Usar el nombre original del producto desde Google Sheets
      const nombreOriginal = products.find(p => p.SKU === firstVariant.codigo)?.Nombre || firstVariant.tipo || 'Policarbonato Ondulado';
      
      return {
        id: key,
        nombre: nombreOriginal, // Usar el nombre exacto de Google Sheets
        descripcion: `${nombreOriginal} de alta calidad del proveedor ${proveedor}.`,
        categoria: "Policarbonatos",
        proveedor: proveedor,
        variantes: variants
      };
    });

    // Guardar en Supabase si está configurado
    let supabaseResult = null;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Limpiar tabla existente
        await supabase.from('productos').delete().neq('id', '');
        
        // Insertar nuevos productos
        for (const product of finalProducts) {
          const { error } = await supabase.from('productos').insert({
            id: product.id,
            nombre: product.nombre,
            descripcion: product.descripcion,
            categoria: product.categoria,
            proveedor: product.proveedor,
            variantes: product.variantes,
            updated_at: new Date().toISOString()
          });
          
          if (error) {
            console.error('Error inserting product:', error);
          }
        }
        
        supabaseResult = { success: true, count: finalProducts.length };
      }
    } catch (error) {
      console.warn('Supabase not configured or error:', error);
    }

    // También actualizar el archivo JSON local como respaldo
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataPath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
    const updatedData = {
      productos_policarbonato: finalProducts,
      last_updated: new Date().toISOString(),
      source: 'google_sheets',
      sheet_id: sheetId
    };
    
    await fs.writeFile(dataPath, JSON.stringify(updatedData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Products synchronized successfully',
      data: {
        products_count: finalProducts.length,
        variants_count: variants.length,
        supabase: supabaseResult,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error syncing sheets:', error);
    return NextResponse.json(
      { error: 'Failed to sync sheets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Endpoint para verificar última sincronización
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataPath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(data);
    
    return NextResponse.json({
      last_updated: parsed.last_updated || null,
      source: parsed.source || 'unknown',
      products_count: parsed.productos_policarbonato?.length || 0,
      sheet_id: parsed.sheet_id || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}