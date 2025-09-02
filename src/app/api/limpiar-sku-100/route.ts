import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE() {
  try {
    console.log('🧹 ELIMINANDO SKU 100 Y REGISTROS CORRUPTOS...');
    
    // Eliminar específicamente el SKU 100
    const { data: eliminados, error } = await supabaseAdmin
      .from('productos')
      .delete()
      .eq('codigo', '100')
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Error eliminando SKU 100: ' + error.message
      });
    }

    console.log('✅ SKU 100 eliminado:', eliminados);

    return NextResponse.json({
      success: true,
      message: `✅ SKU 100 eliminado exitosamente`,
      eliminados: eliminados || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error eliminando SKU 100:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error en eliminación'
    });
  }
}