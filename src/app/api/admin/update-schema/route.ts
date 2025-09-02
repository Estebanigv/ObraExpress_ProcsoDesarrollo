import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 Iniciando actualización de schema de base de datos...');
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Cliente admin de Supabase no disponible'
      }, { status: 500 });
    }
    
    // Verificar si las columnas ya existen
    const { data: existingColumns, error: checkError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'productos' });
    
    if (checkError) {
      console.log('⚠️ No se pudo verificar columnas existentes, intentando agregar directamente...');
    }
    
    const existingColumnNames = existingColumns?.map((col: any) => col.column_name) || [];
    console.log('📊 Columnas existentes:', existingColumnNames);
    
    // Lista de columnas a agregar para el sistema de aprobación
    const columnasAAgregar = [
      {
        name: 'aprobado_para_web',
        sql: 'ALTER TABLE productos ADD COLUMN IF NOT EXISTS aprobado_para_web BOOLEAN DEFAULT false;',
        description: 'Indica si el producto está aprobado para mostrarse en el sitio web'
      },
      {
        name: 'razones_rechazo',
        sql: 'ALTER TABLE productos ADD COLUMN IF NOT EXISTS razones_rechazo TEXT[];',
        description: 'Lista de razones por las que el producto no está aprobado para web'
      },
      {
        name: 'fecha_aprobacion',
        sql: 'ALTER TABLE productos ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP WITH TIME ZONE;',
        description: 'Fecha y hora de la última aprobación del producto'
      },
      {
        name: 'validado_automaticamente',
        sql: 'ALTER TABLE productos ADD COLUMN IF NOT EXISTS validado_automaticamente BOOLEAN DEFAULT true;',
        description: 'Indica si el producto fue validado automáticamente o manualmente'
      }
    ];
    
    const resultados = [];
    
    for (const columna of columnasAAgregar) {
      try {
        console.log(`🔧 Agregando columna: ${columna.name}`);
        
        // Ejecutar el ALTER TABLE usando rpc si está disponible, sino usar una consulta SQL directa
        const { error } = await supabaseAdmin.rpc('execute_sql', {
          sql_query: columna.sql
        });
        
        if (error) {
          // Si rpc no funciona, intentar usando una consulta directa
          console.log(`⚠️ RPC falló, intentando método alternativo para ${columna.name}`);
          
          // Método alternativo: insertar y capturar el error si la columna ya existe
          const { error: altError } = await supabaseAdmin
            .from('productos')
            .select(columna.name)
            .limit(1);
          
          if (altError && altError.message.includes('column') && altError.message.includes('does not exist')) {
            console.log(`❌ Columna ${columna.name} no existe y no se pudo crear automáticamente`);
            resultados.push({
              columna: columna.name,
              estado: 'error',
              mensaje: `No se pudo crear la columna. Debe agregarse manualmente en Supabase SQL Editor: ${columna.sql}`,
              sql: columna.sql
            });
          } else {
            console.log(`✅ Columna ${columna.name} ya existe o se creó correctamente`);
            resultados.push({
              columna: columna.name,
              estado: 'ok',
              mensaje: 'Columna disponible'
            });
          }
        } else {
          console.log(`✅ Columna ${columna.name} agregada correctamente`);
          resultados.push({
            columna: columna.name,
            estado: 'creada',
            mensaje: 'Columna creada exitosamente'
          });
        }
      } catch (err) {
        console.error(`❌ Error agregando columna ${columna.name}:`, err);
        resultados.push({
          columna: columna.name,
          estado: 'error',
          mensaje: err instanceof Error ? err.message : 'Error desconocido',
          sql: columna.sql
        });
      }
    }
    
    // Contar resultados
    const creadas = resultados.filter(r => r.estado === 'creada').length;
    const existentes = resultados.filter(r => r.estado === 'ok').length;
    const errores = resultados.filter(r => r.estado === 'error').length;
    
    console.log('📊 Resumen actualización schema:', { creadas, existentes, errores });
    
    return NextResponse.json({
      success: errores === 0,
      mensaje: `Schema actualizado: ${creadas} columnas creadas, ${existentes} ya existían, ${errores} errores`,
      detalles: resultados,
      instrucciones: errores > 0 ? 'Algunas columnas no se pudieron crear automáticamente. Ejecuta los comandos SQL manualmente en el editor SQL de Supabase.' : null
    });
    
  } catch (error) {
    console.error('❌ Error actualizando schema:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido actualizando schema'
    }, { status: 500 });
  }
}

// GET para verificar estado actual del schema
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Cliente admin de Supabase no disponible'
      }, { status: 500 });
    }
    
    // Obtener información de las columnas requeridas
    const columnasRequeridas = ['aprobado_para_web', 'razones_rechazo', 'fecha_aprobacion', 'validado_automaticamente'];
    const estadoColumnas = [];
    
    for (const columna of columnasRequeridas) {
      try {
        const { error } = await supabaseAdmin
          .from('productos')
          .select(columna)
          .limit(1);
        
        if (error && error.message.includes('column') && error.message.includes('does not exist')) {
          estadoColumnas.push({ columna, existe: false });
        } else {
          estadoColumnas.push({ columna, existe: true });
        }
      } catch {
        estadoColumnas.push({ columna, existe: false });
      }
    }
    
    const existentes = estadoColumnas.filter(c => c.existe).length;
    const faltantes = estadoColumnas.filter(c => !c.existe).length;
    
    return NextResponse.json({
      success: true,
      schema: {
        columnasRequeridas: columnasRequeridas.length,
        columnasExistentes: existentes,
        columnasFaltantes: faltantes,
        listo: faltantes === 0
      },
      detalles: estadoColumnas
    });
    
  } catch (error) {
    console.error('❌ Error verificando schema:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error verificando schema'
    }, { status: 500 });
  }
}