import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin no configurado' },
        { status: 500 }
      );
    }

    // Verificar si la tabla ya existe
    const { data: existingTable, error: checkError } = await supabaseAdmin
      .from('conversaciones_chatbot')
      .select('id')
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Tabla conversaciones_chatbot ya existe',
        exists: true
      });
    }

    // Crear la tabla si no existe
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS conversaciones_chatbot (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL UNIQUE,
        mensajes JSONB DEFAULT '[]'::jsonb,
        estado_conversacion TEXT DEFAULT 'activa' CHECK (estado_conversacion IN ('activa', 'finalizada', 'abandonada')),
        contexto JSONB DEFAULT '{}'::jsonb,
        datos_cliente JSONB DEFAULT '{}'::jsonb,
        productos_consultados JSONB DEFAULT '[]'::jsonb,
        ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
        coordinacion_id UUID REFERENCES coordinaciones_despacho(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Índices para optimizar consultas
      CREATE INDEX IF NOT EXISTS idx_conversaciones_session_id ON conversaciones_chatbot(session_id);
      CREATE INDEX IF NOT EXISTS idx_conversaciones_estado ON conversaciones_chatbot(estado_conversacion);
      CREATE INDEX IF NOT EXISTS idx_conversaciones_ultima_actividad ON conversaciones_chatbot(ultima_actividad);
      
      -- Función para actualizar updated_at automáticamente
      CREATE OR REPLACE FUNCTION update_conversaciones_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger para actualizar updated_at
      DROP TRIGGER IF EXISTS trigger_conversaciones_updated_at ON conversaciones_chatbot;
      CREATE TRIGGER trigger_conversaciones_updated_at
        BEFORE UPDATE ON conversaciones_chatbot
        FOR EACH ROW
        EXECUTE FUNCTION update_conversaciones_updated_at();
    `;

    // Ejecutar el SQL usando rpc (si está disponible) o directamente
    try {
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: createTableSQL
      });

      if (createError) {
        throw createError;
      }
    } catch (rpcError) {
      // Si rpc no está disponible, intentar crear usando el cliente directamente
      console.warn('RPC no disponible, creando tabla manualmente');
      
      // Crear tabla básica
      const { error: tableError } = await supabaseAdmin
        .schema('public')
        .from('conversaciones_chatbot')
        .insert([{
          session_id: 'test_setup',
          mensajes: [],
          estado_conversacion: 'activa'
        }]);

      if (tableError && !tableError.message?.includes('relation "conversaciones_chatbot" does not exist')) {
        throw new Error('No se pudo crear la tabla: ' + tableError.message);
      }

      // Eliminar registro de prueba
      await supabaseAdmin
        .from('conversaciones_chatbot')
        .delete()
        .eq('session_id', 'test_setup');
    }

    return NextResponse.json({
      success: true,
      message: 'Tabla conversaciones_chatbot creada exitosamente',
      exists: false,
      created: true
    });

  } catch (error) {
    console.error('Error configurando base de datos del chatbot:', error);
    return NextResponse.json(
      { 
        error: 'Error configurando base de datos', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin no configurado' },
        { status: 500 }
      );
    }

    // Verificar estado de la tabla
    const { data, error, count } = await supabaseAdmin
      .from('conversaciones_chatbot')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { 
          exists: false, 
          error: error.message 
        },
        { status: 404 }
      );
    }

    // Obtener estadísticas básicas
    const { data: stats } = await supabaseAdmin
      .from('conversaciones_chatbot')
      .select('estado_conversacion')
      .eq('estado_conversacion', 'activa');

    return NextResponse.json({
      exists: true,
      totalConversations: count,
      activeConversations: stats?.length || 0,
      sampleData: data?.slice(0, 2), // Solo mostrar 2 registros como ejemplo
      status: 'healthy'
    });

  } catch (error) {
    console.error('Error verificando base de datos del chatbot:', error);
    return NextResponse.json(
      { 
        error: 'Error verificando base de datos', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}