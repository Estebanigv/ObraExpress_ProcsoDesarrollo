import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando base de datos para sistema de ventas...');

    // Verificar si ya existen las tablas
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['proveedores', 'ventas', 'ordenes_trabajo_proveedor']);

    if (checkError) {
      console.log('Tablas no encontradas, creando estructura...');
    }

    // Crear tabla de proveedores
    await createProveedoresTable();
    
    // Crear tabla de productos_proveedor
    await createProductosProveedorTable();
    
    // Crear tabla de ventas
    await createVentasTable();
    
    // Crear tabla de órdenes de trabajo
    await createOrdenesTrabajoTable();
    
    // Crear tabla de alertas
    await createAlertasTable();
    
    // Crear tabla de configuración
    await createConfiguracionTable();
    
    // Crear tabla de logs
    await createLogsTable();
    
    // Crear tabla de archivos
    await createArchivosTable();
    
    // Insertar datos iniciales
    await insertInitialData();

    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos configurada correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    return NextResponse.json({ 
      error: 'Error configurando base de datos', 
      details: error.message 
    }, { status: 500 });
  }
}

async function createProveedoresTable() {
  try {
    // Crear tabla directamente usando SQL
    const { error } = await supabase
      .from('proveedores')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      // La tabla no existe, vamos a crear los datos en las tablas existentes del usuario
      console.log('⚠️ Creando tabla proveedores mediante insert');
      
      // Intentar insertar datos para forzar la creación de la estructura
      const { error: insertError } = await supabase
        .from('proveedores')
        .insert({
          nombre: 'Leker Chile',
          codigo_proveedor: 'leker',
          contacto_email: 'contacto@lekerchile.cl',
          contacto_telefono: '+56 2 2345 6789',
          direccion: 'Santiago, Chile'
        });
      
      if (insertError) {
        console.error('Error insertando en proveedores:', insertError);
      } else {
        console.log('✅ Datos insertados en proveedores');
      }
    } else {
      console.log('✅ Tabla proveedores existe');
    }
  } catch (error) {
    console.error('Error con tabla proveedores:', error);
  }
}

async function createProductosProveedorTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS productos_proveedor (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proveedor_id UUID REFERENCES proveedores(id),
        codigo_proveedor VARCHAR(100) NOT NULL,
        codigo_polimax VARCHAR(100) NOT NULL,
        nombre_producto VARCHAR(255) NOT NULL,
        precio_proveedor DECIMAL(10,2),
        tiempo_entrega_dias INTEGER,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla productos_proveedor:', error);
  else console.log('✅ Tabla productos_proveedor creada');
}

async function createVentasTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ventas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero_orden VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID,
        cliente_nombre VARCHAR(255) NOT NULL,
        cliente_email VARCHAR(255) NOT NULL,
        cliente_telefono VARCHAR(50),
        productos JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        impuestos DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado VARCHAR(50) DEFAULT 'pendiente',
        metodo_pago VARCHAR(50),
        transaccion_id VARCHAR(255),
        direccion_entrega TEXT,
        fecha_entrega_estimada DATE,
        notas TEXT,
        email_enviado BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla ventas:', error);
  else console.log('✅ Tabla ventas creada');
}

async function createOrdenesTrabajoTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ordenes_trabajo_proveedor (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venta_id UUID REFERENCES ventas(id),
        proveedor_id UUID REFERENCES proveedores(id),
        numero_orden_trabajo VARCHAR(50) UNIQUE NOT NULL,
        productos_solicitados JSONB NOT NULL,
        total_orden DECIMAL(10,2) NOT NULL,
        estado VARCHAR(50) DEFAULT 'enviada',
        fecha_envio TIMESTAMP DEFAULT NOW(),
        fecha_confirmacion TIMESTAMP,
        fecha_completado TIMESTAMP,
        orden_compra_proveedor VARCHAR(100),
        tiempo_respuesta_horas INTEGER,
        alertas_enviadas INTEGER DEFAULT 0,
        ultima_alerta TIMESTAMP,
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla ordenes_trabajo_proveedor:', error);
  else console.log('✅ Tabla ordenes_trabajo_proveedor creada');
}

async function createAlertasTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS alertas_sistema (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tipo VARCHAR(50) NOT NULL,
        orden_trabajo_id UUID REFERENCES ordenes_trabajo_proveedor(id),
        venta_id UUID REFERENCES ventas(id),
        titulo VARCHAR(255) NOT NULL,
        mensaje TEXT NOT NULL,
        prioridad VARCHAR(20) DEFAULT 'media',
        leida BOOLEAN DEFAULT false,
        usuario_asignado VARCHAR(255),
        fecha_limite TIMESTAMP,
        acciones_disponibles JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla alertas_sistema:', error);
  else console.log('✅ Tabla alertas_sistema creada');
}

async function createConfiguracionTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS configuracion_sistema (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        tipo VARCHAR(50) DEFAULT 'string',
        categoria VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla configuracion_sistema:', error);
  else console.log('✅ Tabla configuracion_sistema creada');
}

async function createLogsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS logs_actividad (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario VARCHAR(255),
        accion VARCHAR(255) NOT NULL,
        entidad VARCHAR(100),
        entidad_id UUID,
        detalles JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla logs_actividad:', error);
  else console.log('✅ Tabla logs_actividad creada');
}

async function createArchivosTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS archivos_sistema (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre_archivo VARCHAR(255) NOT NULL,
        tipo_archivo VARCHAR(50),
        categoria VARCHAR(100),
        ruta_archivo TEXT NOT NULL,
        tamaño_bytes BIGINT,
        mime_type VARCHAR(100),
        subido_por VARCHAR(255),
        descripcion TEXT,
        version VARCHAR(20),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
  
  if (error) console.error('Error creando tabla archivos_sistema:', error);
  else console.log('✅ Tabla archivos_sistema creada');
}

async function insertInitialData() {
  try {
    // Insertar configuraciones iniciales
    const { error: configError } = await supabase
      .from('configuracion_sistema')
      .upsert([
        {
          clave: 'email_admin_ventas',
          valor: 'gonzalezvogel@gmail.com',
          descripcion: 'Email del administrador de ventas',
          categoria: 'notificaciones'
        },
        {
          clave: 'tiempo_alerta_orden_minutos',
          valor: '10',
          descripcion: 'Minutos entre alertas de órdenes pendientes',
          categoria: 'alertas'
        },
        {
          clave: 'proveedor_principal_policarbonato',
          valor: 'leker',
          descripcion: 'Código del proveedor principal',
          categoria: 'proveedores'
        }
      ], { onConflict: 'clave' });

    if (configError) console.error('Error insertando configuración:', configError);
    else console.log('✅ Configuración inicial insertada');

    // Insertar proveedor Leker
    const { error: proveedorError } = await supabase
      .from('proveedores')
      .upsert([
        {
          nombre: 'Leker Chile',
          codigo_proveedor: 'leker',
          contacto_email: 'contacto@lekerchile.cl',
          contacto_telefono: '+56 2 2345 6789',
          direccion: 'Santiago, Chile'
        }
      ], { onConflict: 'codigo_proveedor' });

    if (proveedorError) console.error('Error insertando proveedor:', proveedorError);
    else console.log('✅ Proveedor Leker insertado');

    // Crear una venta de ejemplo para testing
    const { error: ventaError } = await supabase
      .from('ventas')
      .upsert([
        {
          numero_orden: 'DEMO-001',
          cliente_nombre: 'Cliente de Prueba',
          cliente_email: 'test@example.com',
          productos: [
            {
              codigo: 'DEMO-001',
              nombre: 'Producto de Prueba',
              cantidad: 1,
              precio: 50000
            }
          ],
          subtotal: 50000,
          impuestos: 9500,
          total: 59500,
          estado: 'aprobada',
          metodo_pago: 'transferencia'
        }
      ], { onConflict: 'numero_orden' });

    if (ventaError) console.error('Error insertando venta demo:', ventaError);
    else console.log('✅ Venta demo insertada');

  } catch (error) {
    console.error('Error insertando datos iniciales:', error);
  }
}

// Endpoint para verificar el estado de la base de datos
export async function GET() {
  try {
    const { data: tablas, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'proveedores', 
        'productos_proveedor', 
        'ventas', 
        'ordenes_trabajo_proveedor', 
        'alertas_sistema',
        'configuracion_sistema',
        'logs_actividad',
        'archivos_sistema'
      ]);

    const tablasExistentes = tablas?.map(t => t.table_name) || [];
    
    return NextResponse.json({
      status: 'ok',
      tablas_existentes: tablasExistentes,
      tablas_requeridas: [
        'proveedores', 
        'productos_proveedor', 
        'ventas', 
        'ordenes_trabajo_proveedor', 
        'alertas_sistema',
        'configuracion_sistema',
        'logs_actividad',
        'archivos_sistema'
      ],
      configuracion_completa: tablasExistentes.length === 8
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}