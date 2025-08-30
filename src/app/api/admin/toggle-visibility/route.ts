import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { codigo, visible } = await request.json();

    if (!codigo || visible === undefined) {
      return NextResponse.json(
        { success: false, error: 'Código y visibilidad son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('productos')
      .update({ 
        disponible_en_web: visible,
        updated_at: new Date().toISOString()
      })
      .eq('codigo', codigo)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando visibilidad en Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Visibilidad actualizada correctamente en Supabase',
      codigo,
      newVisibility: visible,
      data
    });

  } catch (error) {
    console.error('Error actualizando visibilidad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}