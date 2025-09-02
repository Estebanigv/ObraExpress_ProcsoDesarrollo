import { NextRequest, NextResponse } from 'next/server';

const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheet') || 'Perfiles Alveolar';
    
    console.log(`🔍 Debuggeando estructura de: ${sheetName}`);
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    
    const response = await fetch(csvUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Error HTTP: ${response.status}`
      });
    }

    const csvData = await response.text();
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Pestaña vacía o sin datos'
      });
    }

    // Procesar encabezados
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());
    
    // Tomar las primeras 5 filas de datos como muestra
    const sampleData = lines.slice(1, 6).map((line, idx) => {
      const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, colIdx) => {
        rowData[header] = cols[colIdx] || '';
      });
      
      return {
        row: idx + 2,
        data: rowData
      };
    });

    return NextResponse.json({
      success: true,
      sheetName,
      totalRows: lines.length - 1,
      headers,
      sampleData,
      rawFirstLine: headerLine
    });

  } catch (error) {
    console.error('Error debuggeando sheets:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, sheet } = await request.json();
    
    if (action === 'sync_specific') {
      // Forzar sincronización de una pestaña específica con debug detallado
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
      
      const response = await fetch(csvUrl);
      const csvData = await response.text();
      const lines = csvData.trim().split('\n');
      
      if (lines.length < 2) {
        return NextResponse.json({
          success: false,
          error: `Pestaña ${sheet} vacía`
        });
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const productos: any[] = [];
      
      for (let i = 1; i < Math.min(lines.length, 10); i++) { // Solo primeros 10 para debug
        const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        const producto: Record<string, string> = {};
        
        headers.forEach((header, colIdx) => {
          producto[header] = cols[colIdx] || '';
        });
        
        productos.push({
          row: i + 1,
          sku: producto['SKU'] || producto['Código'] || '',
          nombre: producto['Nombre de Producto'] || producto['Producto'] || '',
          ancho: producto['Ancho metros'] || producto['Ancho'] || '',
          largo: producto['Largo metros'] || producto['Largo'] || '',
          precio: producto['Precio Neto'] || producto['Precio'] || '',
          stock: producto['Stock'] || '',
          rawData: producto
        });
      }
      
      return NextResponse.json({
        success: true,
        sheet,
        headers,
        productos,
        message: `Analizada estructura de ${sheet} - ${productos.length} productos de muestra`
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Acción no reconocida'
    });
    
  } catch (error) {
    console.error('Error en debug POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}