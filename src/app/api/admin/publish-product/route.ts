import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { codigo } = await request.json();

    if (!codigo) {
      return NextResponse.json(
        { success: false, error: 'Código es requerido' },
        { status: 400 }
      );
    }

    // Actualizar timestamp de actualización en Supabase (sin published_at por ahora)
    const { data, error } = await supabase
      .from('productos')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('codigo', codigo)
      .eq('disponible_en_web', true) // Solo publicar productos visibles
      .select()
      .single();

    if (error) {
      console.error('Error publicando producto en Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado o no visible en web' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Producto ${codigo} publicado correctamente`,
      codigo,
      data
    });

  } catch (error) {
    console.error('Error publicando producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}