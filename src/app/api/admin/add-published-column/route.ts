import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Agregando columna published_at...');

    // Ejecutar SQL para agregar la columna published_at
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE productos 
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Actualizar registros existentes
        UPDATE productos 
        SET published_at = updated_at 
        WHERE published_at IS NULL;
      `
    });

    if (error) {
      console.error('Error ejecutando SQL:', error);
      
      // Intentar método alternativo usando la API directa de PostgreSQL
      const { data: alterData, error: alterError } = await supabase
        .from('productos')
        .select('id')
        .limit(1);
      
      if (alterError) {
        return NextResponse.json(
          { success: false, error: alterError.message },
          { status: 500 }
        );
      }
      
      // Si llegamos aquí, la tabla existe pero no podemos agregar columnas vía RPC
      return NextResponse.json({
        success: false,
        error: 'No se pudo agregar la columna. Debe agregarse manualmente en el dashboard de Supabase.',
        instruction: 'Ve a Supabase Dashboard -> Tabla productos -> Add Column -> published_at (TIMESTAMPTZ)'
      });
    }

    console.log('✅ Columna published_at agregada correctamente');

    return NextResponse.json({
      success: true,
      message: 'Columna published_at agregada correctamente',
      data
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}