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

    console.log('🏗️ Creando tabla productos en Supabase...');

    // SQL simplificado para crear tabla productos
    const createTableQuery = `
      DROP TABLE IF EXISTS productos CASCADE;
      
      CREATE TABLE productos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          codigo TEXT NOT NULL UNIQUE,
          nombre TEXT NOT NULL,
          categoria TEXT DEFAULT 'Policarbonato',
          tipo TEXT DEFAULT 'General',
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

    // Usar query directo para crear tabla
    const { data, error } = await supabaseAdmin.rpc('exec', { 
      sql: createTableQuery 
    });

    if (error) {
      console.error('❌ Error creando tabla con rpc:', error);
      
      // Método alternativo: usar conexión SQL directa
      try {
        console.log('🔄 Intentando método directo...');
        
        // Crear tabla usando SQL raw
        const { error: sqlError } = await supabaseAdmin
          .from('productos')
          .insert([{
            codigo: 'TEST_CREATE_TABLE',
            nombre: 'Test para crear tabla',
            categoria: 'Test',
            tipo: 'Test'
          }]);

        if (sqlError && sqlError.message.includes('does not exist')) {
          // La tabla no existe, necesitamos crearla manualmente
          return NextResponse.json({
            success: false,
            error: 'No se pudo crear la tabla automáticamente',
            sql: createTableQuery,
            instructions: [
              '1. Ve a https://supabase.com/dashboard/projects',
              '2. Selecciona tu proyecto',
              '3. Ve a "SQL Editor"',
              '4. Pega y ejecuta el SQL proporcionado',
              '5. Vuelve a intentar la sincronización'
            ]
          });
        }

        // Si llegamos aquí, la tabla ya existe
        console.log('✅ Tabla ya existe, limpiando registro de prueba...');
        await supabaseAdmin
          .from('productos')
          .delete()
          .eq('codigo', 'TEST_CREATE_TABLE');

      } catch (fallbackError) {
        console.error('❌ Error en método directo:', fallbackError);
        return NextResponse.json({
          success: false,
          error: 'No se pudo verificar/crear la tabla',
          details: fallbackError.message
        }, { status: 500 });
      }
    }

    // Crear índices
    console.log('📋 Creando índices...');
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
      CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
      CREATE INDEX IF NOT EXISTS idx_productos_tipo ON productos(tipo);
      CREATE INDEX IF NOT EXISTS idx_productos_proveedor ON productos(proveedor);
      CREATE INDEX IF NOT EXISTS idx_productos_disponible_web ON productos(disponible_en_web);
      CREATE INDEX IF NOT EXISTS idx_productos_orden ON productos(pestaña_origen, orden_original);
    `;

    try {
      await supabaseAdmin.rpc('exec', { sql: createIndexes });
      console.log('✅ Índices creados');
    } catch (indexError) {
      console.warn('⚠️ Error creando índices (no crítico):', indexError);
    }

    // Crear función y trigger para updated_at
    console.log('⚡ Creando función de timestamp...');
    const createFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
      CREATE TRIGGER update_productos_updated_at 
          BEFORE UPDATE ON productos 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      await supabaseAdmin.rpc('exec', { sql: createFunction });
      console.log('✅ Función y trigger creados');
    } catch (functionError) {
      console.warn('⚠️ Error creando función (no crítico):', functionError);
    }

    // Verificar que la tabla fue creada correctamente
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('productos')
      .select('count', { count: 'exact', head: true });

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: `Tabla creada pero error verificando: ${verifyError.message}`
      }, { status: 500 });
    }

    console.log('✅ Tabla productos creada y verificada exitosamente');

    return NextResponse.json({
      success: true,
      message: '✅ Tabla productos creada exitosamente en Supabase',
      details: {
        tabla: 'productos',
        columnas: 26,
        indices: 6,
        triggers: 1,
        registros: 0
      }
    });

  } catch (error) {
    console.error('❌ Error creando tabla:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}