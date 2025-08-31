import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const status = {
    supabase: {
      configured: false,
      connected: false,
      productCount: 0,
      error: null as string | null
    },
    jsonBackup: {
      exists: false,
      productCount: 0,
      lastModified: null as string | null
    },
    recommendation: ''
  };

  // Verificar Supabase
  if (supabaseAdmin) {
    status.supabase.configured = true;
    try {
      const { data, error, count } = await supabaseAdmin
        .from('productos')
        .select('*', { count: 'exact', head: false })
        .limit(1);
      
      if (!error) {
        status.supabase.connected = true;
        status.supabase.productCount = count || 0;
      } else {
        status.supabase.error = error.message;
      }
    } catch (err) {
      status.supabase.error = err instanceof Error ? err.message : 'Error desconocido';
    }
  }

  // Verificar archivo JSON de respaldo
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
    if (fs.existsSync(filePath)) {
      status.jsonBackup.exists = true;
      const stats = fs.statSync(filePath);
      status.jsonBackup.lastModified = stats.mtime.toISOString();
      
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Contar productos en todas las categorías
      let totalProducts = 0;
      if (data.productos_por_categoria) {
        Object.values(data.productos_por_categoria).forEach((productos: any) => {
          if (Array.isArray(productos)) {
            productos.forEach(p => {
              if (p.variantes && Array.isArray(p.variantes)) {
                totalProducts += p.variantes.length;
              }
            });
          }
        });
      }
      status.jsonBackup.productCount = totalProducts;
    }
  } catch (err) {
    console.error('Error verificando archivo JSON:', err);
  }

  // Generar recomendación
  if (!status.supabase.configured) {
    status.recommendation = 'Supabase no está configurado. Los productos se cargarán desde el archivo JSON de respaldo.';
  } else if (!status.supabase.connected) {
    status.recommendation = `Error de conexión con Supabase: ${status.supabase.error}. Usando archivo JSON de respaldo.`;
  } else if (status.supabase.productCount === 0) {
    status.recommendation = 'La base de datos está vacía. Ejecute la sincronización para cargar los productos desde Google Sheets.';
  } else if (status.supabase.productCount < status.jsonBackup.productCount) {
    status.recommendation = `La base de datos tiene menos productos (${status.supabase.productCount}) que el archivo de respaldo (${status.jsonBackup.productCount}). Considere ejecutar una sincronización.`;
  } else {
    status.recommendation = `Sistema funcionando correctamente. ${status.supabase.productCount} productos en la base de datos.`;
  }

  return NextResponse.json(status);
}