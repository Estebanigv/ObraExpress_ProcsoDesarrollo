import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/env-validation';

export async function GET() {
  try {
    console.log('🔍 Verificando configuración de Supabase...');
    
    // Verificar si Supabase está configurado
    const isConfigured = isSupabaseConfigured();
    
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'Supabase no está configurado. Verifica las variables de entorno.',
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }
      });
    }
    
    // Verificar si supabaseAdmin existe
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        configured: true,
        adminClient: false,
        message: 'Cliente admin de Supabase no disponible'
      });
    }
    
    // Intentar hacer una consulta simple
    const { data, error, count } = await supabaseAdmin
      .from('productos')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return NextResponse.json({
        success: false,
        configured: true,
        adminClient: true,
        connectionTest: false,
        error: error.message,
        message: 'Error al conectar con la base de datos'
      });
    }
    
    // Obtener información de productos
    const { data: productos, error: prodError } = await supabaseAdmin
      .from('productos')
      .select('codigo, nombre, categoria, disponible_en_web')
      .limit(5);
    
    return NextResponse.json({
      success: true,
      configured: true,
      adminClient: true,
      connectionTest: true,
      productCount: count || 0,
      sampleProducts: productos || [],
      message: `Conexión exitosa. ${count || 0} productos en la base de datos.`
    });
    
  } catch (error) {
    console.error('Error en check-supabase:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al verificar Supabase'
    });
  }
}