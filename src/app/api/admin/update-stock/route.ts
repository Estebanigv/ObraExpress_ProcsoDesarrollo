import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { codigo, stock } = await request.json();

    if (!codigo || stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Código y stock son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('productos')
      .update({ 
        stock: parseInt(stock),
        updated_at: new Date().toISOString()
      })
      .eq('codigo', codigo)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando stock en Supabase:', error);
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
      message: 'Stock actualizado correctamente en Supabase',
      codigo,
      newStock: stock,
      data
    });

  } catch (error) {
    console.error('Error actualizando stock:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}