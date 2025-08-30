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

    console.log('🧪 Probando inserción individual...');

    // Datos de prueba muy básicos
    const testProduct = {
      codigo: 'TEST001',
      nombre: 'Producto de Prueba',
      categoria: 'Test',
      tipo: 'Prueba',
      espesor: '6mm',
      ancho: '1.22',
      largo: '2.44',
      color: 'Clear',
      uso: 'Uso de prueba',
      costo_proveedor: 1000,
      precio_neto: 1500,
      precio_con_iva: 1785,
      ganancia: 500,
      margen_ganancia: '33.33%',
      stock: 10,
      proveedor: 'Leker',
      pestaña_origen: 'Sheet1',
      orden_original: 1,
      disponible_en_web: true,
      tiene_sku_valido: true,
      tiene_stock_minimo: true,
      tiene_imagen: false,
      ruta_imagen: null,
      motivo_no_disponible: null
    };

    // Limpiar cualquier registro de prueba anterior
    await supabaseAdmin
      .from('productos')
      .delete()
      .eq('codigo', 'TEST001');

    // Intentar insertar
    const { data, error } = await supabaseAdmin
      .from('productos')
      .insert([testProduct])
      .select();

    if (error) {
      console.error('❌ Error insertando producto de prueba:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    console.log('✅ Producto de prueba insertado:', data);

    // Verificar que se puede leer
    const { data: readData, error: readError } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('codigo', 'TEST001')
      .single();

    if (readError) {
      console.error('❌ Error leyendo producto de prueba:', readError);
      return NextResponse.json({
        success: false,
        error: `Insertado pero no se puede leer: ${readError.message}`
      });
    }

    // Limpiar después de la prueba
    await supabaseAdmin
      .from('productos')
      .delete()
      .eq('codigo', 'TEST001');

    return NextResponse.json({
      success: true,
      message: '✅ Prueba de inserción exitosa',
      data: readData
    });

  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}