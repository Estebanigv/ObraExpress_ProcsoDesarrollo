import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Verificar conexión con Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('Error de conexión:', connectionError);
      return NextResponse.json({
        success: false,
        message: 'Error conectando con Supabase',
        error: connectionError.message,
        details: connectionError
      }, { status: 500 });
    }

    // Test 2: Verificar que las tablas existen
    const tables = ['users', 'sessions', 'productos', 'purchases', 'contactos', 'notificaciones'];
    const tableStatus: any = {};
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      tableStatus[table] = error ? '❌ No existe o sin acceso' : '✅ OK';
    }

    // Test 3: Verificar configuración de Auth
    const authConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Falta',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Falta',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Falta',
    };

    return NextResponse.json({
      success: true,
      message: 'Prueba de autenticación y conexión',
      connection: '✅ Conectado a Supabase',
      tables: tableStatus,
      authConfig,
      projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en test de autenticación:', error);
    return NextResponse.json({
      success: false,
      message: 'Error inesperado',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Test de registro de usuario
export async function POST(request: Request) {
  try {
    const { email, password, nombre } = await request.json();

    if (!email || !password || !nombre) {
      return NextResponse.json({
        success: false,
        message: 'Faltan campos requeridos'
      }, { status: 400 });
    }

    // Intentar crear usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          full_name: nombre
        }
      }
    });

    if (authError) {
      return NextResponse.json({
        success: false,
        message: 'Error creando usuario',
        error: authError.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: authData.user,
      requiresEmailVerification: true,
      note: 'Revisa tu email para confirmar tu cuenta'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({
      success: false,
      message: 'Error inesperado en registro',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}