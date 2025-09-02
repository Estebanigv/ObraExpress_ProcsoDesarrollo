import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Actualizar timestamp de actualización para todos los productos visibles
    const { data, error } = await supabase
      .from('productos')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('disponible_en_web', true) // Solo publicar productos visibles
      .select('codigo');

    if (error) {
      console.error('Error publicando productos en Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const count = data ? data.length : 0;

    return NextResponse.json({
      success: true,
      message: `${count} productos publicados correctamente`,
      count,
      productos: data
    });

  } catch (error) {
    console.error('Error publicando todos los productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}