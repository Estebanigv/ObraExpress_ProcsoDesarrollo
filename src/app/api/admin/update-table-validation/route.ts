import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Actualizando tabla productos con campos de validación...');

    // SQL para agregar nuevas columnas de validación
    const updateTableQuery = `
      -- Campos para control de cambios de precio
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS precio_anterior NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tiene_cambio_precio BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS fecha_cambio_precio TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS porcentaje_cambio_precio NUMERIC DEFAULT 0;
      
      -- Campos para validaciones web más estrictas
      ALTER TABLE productos
      ADD COLUMN IF NOT EXISTS dimensiones_completas BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS cumple_stock_minimo BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS motivos_no_disponible_web TEXT[];
      
      -- Índices para optimizar consultas
      CREATE INDEX IF NOT EXISTS idx_productos_cambio_precio ON productos(tiene_cambio_precio);
      CREATE INDEX IF NOT EXISTS idx_productos_dimensiones_completas ON productos(dimensiones_completas);
      CREATE INDEX IF NOT EXISTS idx_productos_cumple_stock_minimo ON productos(cumple_stock_minimo);
    `;

    const { error } = await supabaseAdmin.rpc('exec', { 
      sql: updateTableQuery 
    });

    if (error) {
      console.error('❌ Error actualizando tabla:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Tabla actualizada con campos de validación');

    return NextResponse.json({
      success: true,
      message: '✅ Campos de validación agregados exitosamente',
      nuevos_campos: [
        'precio_anterior',
        'tiene_cambio_precio', 
        'fecha_cambio_precio',
        'porcentaje_cambio_precio',
        'dimensiones_completas',
        'cumple_stock_minimo',
        'motivos_no_disponible_web'
      ]
    });

  } catch (error) {
    console.error('❌ Error actualizando tabla:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}