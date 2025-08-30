import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// ID de tu Google Sheet
const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

// Configurar OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL}/api/auth/google/callback`
);

// Función para cargar tokens guardados
function loadTokens() {
  const tokensPath = path.join(process.cwd(), 'google-tokens.json');
  if (fs.existsSync(tokensPath)) {
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    oauth2Client.setCredentials(tokens);
    return true;
  }
  return false;
}

// Función para obtener datos de Google Sheets usando API autenticada
async function getSheetDataAuthenticated() {
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1', // o el nombre de tu hoja
  });

  return response.data.values || [];
}

// Función para procesar datos de Google Sheets API
async function processSheetData(sheetData: any[][]) {
  if (!sheetData || sheetData.length === 0) {
    return NextResponse.json({ 
      success: false, 
      error: 'No se encontraron datos en la hoja' 
    });
  }

  console.log('📋 Datos obtenidos de Google Sheets API, primera fila:', sheetData[0]);
  console.log(`📋 Procesando ${sheetData.length} filas...`);
  
  // Procesar headers y datos
  const headers = sheetData[0];
  const dataRows = sheetData.slice(1).filter(row => row && row.length > 1 && row[0]); // Filtrar filas vacías

  console.log('📝 Headers:', headers);
  console.log(`📦 Filas de datos válidas: ${dataRows.length}`);

  // Buscar índices de columnas
  const findIndex = (searchTerms: string[]) => {
    return headers.findIndex(header => 
      searchTerms.some(term => 
        header && header.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const indices = {
    codigo: findIndex(['codigo', 'sku', 'id']),
    nombre: findIndex(['nombre', 'name', 'producto']),
    precioVenta: findIndex(['precio_neto', 'precio neto']), // Precio de venta al cliente
    costoProveedor: findIndex(['costo por proveedor', 'costo_proveedor', 'precio_proveedor']), // Precio interno
    stock: findIndex(['stock', 'cantidad', 'inventario']),
    espesor: findIndex(['espesor', 'grosor', 'milimetros']),
    color: findIndex(['color', 'colour']),
    dimensiones: findIndex(['dimensiones', 'medidas', 'tamaño', 'size', 'ancho', 'largo']),
    tipo: findIndex(['tipo', 'type', 'categoria'])
  };

  console.log('🔍 Índices encontrados:', indices);

  // Verificar que tenemos las columnas esenciales
  if (indices.codigo === -1 || indices.nombre === -1 || (indices.precioVenta === -1 && indices.costoProveedor === -1)) {
    return NextResponse.json({
      success: false,
      error: 'Faltan columnas esenciales (codigo, nombre, precio)',
      foundColumns: headers,
      requiredColumns: ['codigo/sku', 'nombre', 'precio_neto o costo_proveedor']
    });
  }

  // Convertir datos a formato JSON
  const variantes = dataRows.map((row, index) => {
    const codigo = row[indices.codigo] || `VAR-${index}`;
    const nombre = row[indices.nombre] || 'Sin nombre';
    
    // Obtener precios
    const precioVentaStr = indices.precioVenta !== -1 ? (row[indices.precioVenta] || '0') : '0';
    const costoProveedorStr = indices.costoProveedor !== -1 ? (row[indices.costoProveedor] || '0') : '0';
    const stockStr = row[indices.stock] || '0';
    
    // Parsear números eliminando caracteres no numéricos
    const precioVenta = parseInt(precioVentaStr.toString().replace(/[^0-9]/g, '') || '0');
    const costoProveedor = parseInt(costoProveedorStr.toString().replace(/[^0-9]/g, '') || '0');
    const stock = parseInt(stockStr.toString().replace(/[^0-9]/g, '') || '0');
    
    // Calcular ganancia (diferencia entre precio de venta y costo)
    const ganancia = precioVenta - costoProveedor;
    const margenGanancia = precioVenta > 0 ? ((ganancia / precioVenta) * 100).toFixed(2) : '0';
    
    return {
      codigo,
      nombre,
      descripcion: nombre,
      categoria: "Policarbonato",
      tipo: row[indices.tipo] || "Producto",
      precio_neto: precioVenta, // Precio de venta al cliente
      precio_con_iva: Math.round(precioVenta * 1.19),
      costo_proveedor: costoProveedor, // Precio interno/costo
      ganancia: ganancia,
      margen_ganancia: `${margenGanancia}%`,
      espesor: row[indices.espesor] || '',
      dimensiones: indices.dimensiones !== -1 ? row[indices.dimensiones] || '' : '',
      color: row[indices.color] || 'Sin especificar',
      uso: "Uso general",
      stock: stock, // ¡Stock real desde Google Sheets!
      uv_protection: true,
      garantia: "10 años",
      proveedor: "Leker"
    };
  }).filter(v => v.codigo && (v.precio_neto > 0 || v.costo_proveedor > 0)); // Filtrar productos inválidos

  const updatedProducts = {
    productos_policarbonato: [
      {
        id: "leker-sincronizado",
        nombre: "Productos Leker",
        descripcion: "Productos sincronizados desde Google Sheets con API autenticada",
        categoria: "Policarbonatos",
        proveedor: "Leker",
        variantes: variantes
      }
    ]
  };

  console.log(`✅ Procesados ${variantes.length} productos válidos`);

  // Guardar archivo actualizado
  const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
  const backupPath = path.join(process.cwd(), 'src', 'data', `productos-backup-${Date.now()}.json`);
  
  // Crear backup del archivo actual
  if (fs.existsSync(filePath)) {
    const currentData = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, currentData, 'utf8');
    console.log('💾 Backup creado:', backupPath);
  }
  
  // Guardar nuevos datos
  fs.writeFileSync(filePath, JSON.stringify(updatedProducts, null, 2), 'utf8');
  console.log('💾 Archivo actualizado:', filePath);

  // Calcular estadísticas
  const stats = {
    totalVariantes: variantes.length,
    totalStock: variantes.reduce((sum, v) => sum + v.stock, 0),
    valorInventarioCosto: variantes.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
    valorInventarioVenta: variantes.reduce((sum, v) => sum + (v.precio_neto * v.stock), 0),
    gananciaTotal: variantes.reduce((sum, v) => sum + (v.ganancia * v.stock), 0),
    sincronizadoEn: new Date().toISOString(),
    fuente: 'google_sheets_api',
    columnas_encontradas: headers,
    indices_utilizados: indices
  };

  console.log('📊 Sincronización completada:', stats);

  return NextResponse.json({
    success: true,
    message: '🎉 Sincronización completada exitosamente con Google Sheets API',
    stats,
    backupCreated: path.basename(backupPath),
    instructions: 'Los datos se han actualizado con precios de venta y costos. Recarga la página del admin para ver los cambios.'
  });
}

async function processCSVData(csvData: string) {
  if (!csvData || csvData.trim().length === 0) {
    return NextResponse.json({ 
      success: false, 
      error: 'No se encontraron datos en la hoja' 
    });
  }

  console.log('📋 Datos obtenidos, primera línea:', csvData.split('\n')[0]);
  
  // Parsear CSV simple
  const rows = csvData.trim().split('\n').map(row => {
    return row.split(',').map(cell => cell.replace(/"/g, '').trim());
  });

  console.log(`📋 Procesando ${rows.length} filas...`);
  
  // Procesar headers y datos
  const headers = rows[0];
  const dataRows = rows.slice(1).filter(row => row.length > 1 && row[0]); // Filtrar filas vacías

  console.log('📝 Headers:', headers);
  console.log(`📦 Filas de datos válidas: ${dataRows.length}`);

  // Buscar índices de columnas
  const findIndex = (searchTerms: string[]) => {
    return headers.findIndex(header => 
      searchTerms.some(term => 
        header.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const indices = {
    codigo: findIndex(['codigo', 'sku', 'id']),
    nombre: findIndex(['nombre', 'name', 'producto']),
    precioVenta: findIndex(['precio_neto', 'precio neto']), // Precio de venta al cliente
    costoProveedor: findIndex(['costo por proveedor', 'costo_proveedor', 'precio_proveedor']), // Precio interno
    stock: findIndex(['stock', 'cantidad', 'inventario']),
    espesor: findIndex(['espesor', 'grosor']),
    color: findIndex(['color', 'colour']),
    dimensiones: findIndex(['dimensiones', 'medidas', 'tamaño', 'size']),
    tipo: findIndex(['tipo', 'type', 'categoria'])
  };

  console.log('🔍 Índices encontrados:', indices);

  // Verificar que tenemos las columnas esenciales
  if (indices.codigo === -1 || indices.nombre === -1 || indices.precioNeto === -1) {
    return NextResponse.json({
      success: false,
      error: 'Faltan columnas esenciales (codigo, nombre, precio_neto)',
      foundColumns: headers,
      requiredColumns: ['codigo/sku', 'nombre', 'precio_neto']
    });
  }

  // Convertir datos a formato JSON
  const variantes = dataRows.map((row, index) => {
    const codigo = row[indices.codigo] || `VAR-${index}`;
    const nombre = row[indices.nombre] || 'Sin nombre';
    const precioNetoStr = row[indices.precioNeto] || '0';
    const stockStr = row[indices.stock] || '0';
    
    // Parsear números eliminando caracteres no numéricos
    const precioNeto = parseInt(precioNetoStr.toString().replace(/[^0-9]/g, '') || '0');
    const stock = parseInt(stockStr.toString().replace(/[^0-9]/g, '') || '0');
    
    return {
      codigo,
      nombre,
      descripcion: nombre,
      categoria: "Policarbonato",
      tipo: row[indices.tipo] || "Producto",
      precio_neto: precioNeto,
      precio_con_iva: Math.round(precioNeto * 1.19),
      espesor: row[indices.espesor] || '',
      dimensiones: row[indices.dimensiones] || '',
      color: row[indices.color] || 'Sin especificar',
      uso: "Uso general",
      stock: stock, // ¡Stock real desde Google Sheets!
      uv_protection: true,
      garantia: "10 años",
      proveedor: "Leker"
    };
  }).filter(v => v.codigo && v.precio_neto > 0); // Filtrar productos inválidos

  const updatedProducts = {
    productos_policarbonato: [
      {
        id: "leker-sincronizado",
        nombre: "Productos Leker",
        descripcion: "Productos sincronizados desde Google Sheets",
        categoria: "Policarbonatos",
        proveedor: "Leker",
        variantes: variantes
      }
    ]
  };

  console.log(`✅ Procesados ${variantes.length} productos válidos`);

  // Guardar archivo actualizado
  const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
  const backupPath = path.join(process.cwd(), 'src', 'data', `productos-backup-${Date.now()}.json`);
  
  // Crear backup del archivo actual
  if (fs.existsSync(filePath)) {
    const currentData = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, currentData, 'utf8');
    console.log('💾 Backup creado:', backupPath);
  }
  
  // Guardar nuevos datos
  fs.writeFileSync(filePath, JSON.stringify(updatedProducts, null, 2), 'utf8');
  console.log('💾 Archivo actualizado:', filePath);

  // Calcular estadísticas
  const stats = {
    totalVariantes: variantes.length,
    totalStock: variantes.reduce((sum, v) => sum + v.stock, 0),
    valorInventario: variantes.reduce((sum, v) => sum + (v.precio_neto * v.stock), 0),
    sincronizadoEn: new Date().toISOString(),
    fuente: 'google_sheets',
    columnas_encontradas: headers,
    indices_utilizados: indices
  };

  console.log('📊 Sincronización completada:', stats);

  return NextResponse.json({
    success: true,
    message: '🎉 Sincronización completada exitosamente',
    stats,
    backupCreated: backupPath.split('/').pop(),
    instructions: 'Los datos se han actualizado. Recarga la página del admin para ver los cambios.'
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronización con Google Sheets...');
    
    // Intentar usar API autenticada primero
    const hasTokens = loadTokens();
    
    if (hasTokens) {
      try {
        console.log('🔐 Usando autenticación OAuth2 para acceso a Google Sheets API...');
        const sheetData = await getSheetDataAuthenticated();
        
        if (sheetData && sheetData.length > 0) {
          console.log('✅ Datos obtenidos exitosamente con API autenticada');
          return await processSheetData(sheetData);
        }
      } catch (authError) {
        console.warn('⚠️ Error con autenticación OAuth2, usando método de respaldo:', authError);
        
        // Si hay error de autenticación, devolver URL para re-autenticar
        if (authError instanceof Error && authError.message.includes('invalid_grant')) {
          return NextResponse.json({
            success: false,
            error: 'Tokens de autenticación expirados',
            needsAuth: true,
            authUrl: `${process.env.BASE_URL}/api/auth/google`,
            instructions: 'Necesitas re-autenticar el acceso a Google Sheets. Haz clic en el enlace para autorizar nuevamente.'
          });
        }
      }
    } else {
      console.log('🔑 No se encontraron tokens OAuth2, se requiere autenticación');
      return NextResponse.json({
        success: false,
        error: 'No se encontraron credenciales de autenticación',
        needsAuth: true,
        authUrl: `${process.env.BASE_URL}/api/auth/google`,
        instructions: 'Necesitas autorizar el acceso a Google Sheets primero. Haz clic en el enlace para autenticar.'
      });
    }
    
    // Método de respaldo: CSV público (como antes)
    console.log('🔄 Usando método de respaldo con CSV público...');
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    console.log('📊 Obteniendo datos desde:', csvUrl);
    
    const response = await fetch(csvUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log('❌ Error al acceder a Google Sheets:', response.status);
      
      // Intentar con URL alternativa si falla
      if (response.status === 400 || response.status === 403) {
        console.log('🔄 Intentando URL alternativa...');
        const alternativeUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        
        const altResponse = await fetch(alternativeUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (altResponse.ok) {
          console.log('✅ URL alternativa funcionó!');
          const altCsvData = await altResponse.text();
          if (altCsvData && altCsvData.trim().length > 0) {
            return await processCSVData(altCsvData);
          }
        }
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Error al acceder a Google Sheets',
        details: `Status: ${response.status} - ${response.statusText}`,
        needsAuth: true,
        authUrl: `${process.env.BASE_URL}/api/auth/google`,
        instructions: 'Considera autorizar el acceso completo a Google Sheets API para mejor funcionamiento.'
      });
    }

    const csvData = await response.text();
    return await processCSVData(csvData);

  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno en la sincronización',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
      needsAuth: true,
      authUrl: `${process.env.BASE_URL}/api/auth/google`,
      suggestion: 'Considera autorizar el acceso a Google Sheets API para mejor funcionamiento.'
    }, { status: 500 });
  }
}