import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    console.log('🏗️ Configurando base de datos...');

    // SQL para crear la tabla productos
    const createTableSQL = `
      -- Crear tabla productos
      CREATE TABLE IF NOT EXISTS productos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          codigo TEXT NOT NULL UNIQUE,
          nombre TEXT NOT NULL,
          categoria TEXT NOT NULL,
          tipo TEXT NOT NULL,
          espesor TEXT DEFAULT '',
          ancho TEXT DEFAULT '',
          largo TEXT DEFAULT '',
          color TEXT DEFAULT '',
          uso TEXT DEFAULT '',
          costo_proveedor NUMERIC DEFAULT 0,
          precio_neto NUMERIC DEFAULT 0,
          precio_con_iva NUMERIC DEFAULT 0,
          ganancia NUMERIC DEFAULT 0,
          margen_ganancia TEXT DEFAULT '0%',
          stock INTEGER DEFAULT 0,
          proveedor TEXT DEFAULT 'Leker',
          pestaña_origen TEXT DEFAULT 'Sheet1',
          orden_original INTEGER DEFAULT 0,
          disponible_en_web BOOLEAN DEFAULT false,
          tiene_sku_valido BOOLEAN DEFAULT false,
          tiene_stock_minimo BOOLEAN DEFAULT false,
          tiene_imagen BOOLEAN DEFAULT false,
          ruta_imagen TEXT,
          motivo_no_disponible TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ejecutar la creación de la tabla
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (error) {
      console.error('❌ Error creando tabla:', error);
      
      // Fallback: intentar crear usando client directo
      try {
        console.log('🔄 Intentando método alternativo...');
        
        // Crear tabla usando query directo
        const { error: directError } = await supabaseAdmin
          .from('productos')
          .select('id')
          .limit(1);

        if (directError && directError.message.includes('does not exist')) {
          return NextResponse.json({
            success: false,
            error: 'La tabla productos no existe. Por favor, ejecuta el SQL manualmente en Supabase.',
            sql: createTableSQL,
            instructions: [
              '1. Ve al panel de Supabase',
              '2. Abre SQL Editor',
              '3. Ejecuta el SQL proporcionado',
              '4. Vuelve a ejecutar este endpoint'
            ]
          });
        }
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Crear índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
      CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
      CREATE INDEX IF NOT EXISTS idx_productos_disponible_web ON productos(disponible_en_web);
      CREATE INDEX IF NOT EXISTS idx_productos_orden ON productos(pestaña_origen, orden_original);
    `;

    try {
      await supabaseAdmin.rpc('exec_sql', { sql: createIndexesSQL });
      console.log('✅ Índices creados');
    } catch (indexError) {
      console.warn('⚠️ Error creando índices (no crítico):', indexError);
    }

    // Verificar que la tabla existe y obtener información
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('productos')
      .select('id')
      .limit(1);

    if (tableError) {
      return NextResponse.json(
        { success: false, error: `Tabla creada pero error verificando: ${tableError.message}` },
        { status: 500 }
      );
    }

    // Contar registros existentes
    const { count } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: '✅ Base de datos configurada correctamente',
      stats: {
        tablaExiste: true,
        registrosExistentes: count || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Verificar el estado de la base de datos
    const { data, error } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        needsSetup: error.message.includes('does not exist')
      });
    }

    const { count } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      stats: {
        tablaExiste: true,
        totalProductos: count || 0,
        ultimosProductos: data || []
      }
    });

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}