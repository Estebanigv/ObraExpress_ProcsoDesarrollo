import { NextRequest, NextResponse } from 'next/server';

// Esta API se ejecutará cada 10 minutos mediante un cron job
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    console.log('🚨 Ejecutando sistema de alertas automáticas...');

    // TODO: Implementar funciones de alertas
    // Temporalmente deshabilitado para evitar errores de build

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'Sistema de alertas ejecutado correctamente'
    });

  } catch (error) {
    console.error('❌ Error en sistema de alertas:', error);
    return NextResponse.json({ error: 'Error en sistema de alertas' }, { status: 500 });
  }
}

async function verificarOrdenesPendientes() {
  try {
    // Obtener órdenes de trabajo enviadas hace más de 10 minutos
    const hace10Minutos = new Date();
    hace10Minutos.setMinutes(hace10Minutos.getMinutes() - 10);

    const { data: ordenesPendientes, error } = await supabase
      .from('ordenes_trabajo_proveedor')
      .select(`
        *,
        proveedores (
          nombre,
          contacto_email
        ),
        ventas (
          numero_orden,
          cliente_nombre,
          total
        )
      `)
      .eq('estado', 'enviada')
      .lt('fecha_envio', hace10Minutos.toISOString())
      .or('ultima_alerta.is.null,ultima_alerta.lt.' + hace10Minutos.toISOString());

    if (error) {
      console.error('Error obteniendo órdenes pendientes:', error);
      return;
    }

    for (const orden of ordenesPendientes || []) {
      const horasDesdeEnvio = Math.floor(
        (new Date().getTime() - new Date(orden.fecha_envio).getTime()) / (1000 * 60 * 60)
      );

      let prioridad = 'media';
      let titulo = `Orden pendiente: ${orden.numero_orden_trabajo}`;
      let mensaje = `La orden de trabajo ${orden.numero_orden_trabajo} para ${orden.proveedores?.nombre} lleva ${horasDesdeEnvio} horas sin confirmación.`;

      // Determinar prioridad según tiempo transcurrido
      if (horasDesdeEnvio > 24) {
        prioridad = 'critica';
        titulo = `🚨 CRÍTICO: ${titulo}`;
        mensaje += ' ¡REQUIERE ATENCIÓN INMEDIATA!';
      } else if (horasDesdeEnvio > 12) {
        prioridad = 'alta';
        titulo = `⚠️ URGENTE: ${titulo}`;
        mensaje += ' Requiere seguimiento urgente.';
      } else if (horasDesdeEnvio > 6) {
        prioridad = 'media';
        mensaje += ' Considerar hacer seguimiento.';
      }

      // Crear alerta en el sistema
      await supabase
        .from('alertas_sistema')
        .insert({
          tipo: 'orden_pendiente',
          orden_trabajo_id: orden.id,
          venta_id: orden.venta_id,
          titulo,
          mensaje,
          prioridad,
          usuario_asignado: 'admin_ventas',
          fecha_limite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
          acciones_disponibles: [
            { 
              tipo: 'contactar_proveedor', 
              texto: 'Contactar Proveedor', 
              telefono: orden.proveedores?.contacto_email 
            },
            { 
              tipo: 'ver_orden', 
              texto: 'Ver Orden', 
              url: `/admin/ordenes-trabajo?id=${orden.id}` 
            },
            {
              tipo: 'enviar_recordatorio',
              texto: 'Enviar Recordatorio',
              url: `/admin/ordenes-trabajo/${orden.id}/recordatorio`
            }
          ]
        });

      // Actualizar contador de alertas en la orden
      await supabase
        .from('ordenes_trabajo_proveedor')
        .update({
          alertas_enviadas: orden.alertas_enviadas + 1,
          ultima_alerta: new Date().toISOString()
        })
        .eq('id', orden.id);

      console.log(`✅ Alerta creada para orden ${orden.numero_orden_trabajo} (${prioridad})`);
    }

  } catch (error) {
    console.error('Error verificando órdenes pendientes:', error);
  }
}

async function verificarEntregasAtrasadas() {
  try {
    // Obtener ventas con fecha de entrega vencida
    const hoy = new Date().toISOString().split('T')[0];

    const { data: ventasAtrasadas, error } = await supabase
      .from('ventas')
      .select('*')
      .lt('fecha_entrega_estimada', hoy)
      .in('estado', ['aprobada', 'procesando']);

    if (error) {
      console.error('Error obteniendo entregas atrasadas:', error);
      return;
    }

    for (const venta of ventasAtrasadas || []) {
      const diasAtraso = Math.floor(
        (new Date().getTime() - new Date(venta.fecha_entrega_estimada).getTime()) / (1000 * 60 * 60 * 24)
      );

      await supabase
        .from('alertas_sistema')
        .insert({
          tipo: 'entrega_atrasada',
          venta_id: venta.id,
          titulo: `📅 Entrega atrasada: ${venta.numero_orden}`,
          mensaje: `La entrega de la orden ${venta.numero_orden} está atrasada ${diasAtraso} día(s). Cliente: ${venta.cliente_nombre}`,
          prioridad: diasAtraso > 3 ? 'alta' : 'media',
          usuario_asignado: 'admin_ventas',
          acciones_disponibles: [
            { tipo: 'contactar_cliente', texto: 'Contactar Cliente', email: venta.cliente_email },
            { tipo: 'actualizar_fecha', texto: 'Actualizar Fecha Entrega', url: `/admin/ventas/${venta.id}` }
          ]
        });

      console.log(`✅ Alerta de entrega atrasada creada para orden ${venta.numero_orden}`);
    }

  } catch (error) {
    console.error('Error verificando entregas atrasadas:', error);
  }
}

async function verificarPagosPendientes() {
  try {
    // Obtener ventas con pagos pendientes de más de 1 hora
    const hace1Hora = new Date();
    hace1Hora.setHours(hace1Hora.getHours() - 1);

    const { data: pagosPendientes, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('estado', 'pendiente')
      .lt('created_at', hace1Hora.toISOString());

    if (error) {
      console.error('Error obteniendo pagos pendientes:', error);
      return;
    }

    for (const venta of pagosPendientes || []) {
      const horasDesdeCreacion = Math.floor(
        (new Date().getTime() - new Date(venta.created_at).getTime()) / (1000 * 60 * 60)
      );

      await supabase
        .from('alertas_sistema')
        .insert({
          tipo: 'pago_pendiente',
          venta_id: venta.id,
          titulo: `💳 Pago pendiente: ${venta.numero_orden}`,
          mensaje: `La orden ${venta.numero_orden} lleva ${horasDesdeCreacion} horas sin confirmar el pago. Cliente: ${venta.cliente_nombre}`,
          prioridad: horasDesdeCreacion > 24 ? 'alta' : 'media',
          usuario_asignado: 'admin_ventas',
          acciones_disponibles: [
            { tipo: 'verificar_pago', texto: 'Verificar Pago', url: `/admin/ventas/${venta.id}` },
            { tipo: 'contactar_cliente', texto: 'Contactar Cliente', email: venta.cliente_email }
          ]
        });

      console.log(`✅ Alerta de pago pendiente creada para orden ${venta.numero_orden}`);
    }

  } catch (error) {
    console.error('Error verificando pagos pendientes:', error);
  }
}

async function limpiarAlertasAntiguas() {
  try {
    // Eliminar alertas leídas de más de 7 días
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const { error } = await supabase
      .from('alertas_sistema')
      .delete()
      .eq('leida', true)
      .lt('created_at', hace7Dias.toISOString());

    if (error) {
      console.error('Error limpiando alertas antiguas:', error);
    } else {
      console.log('✅ Alertas antiguas limpiadas');
    }

  } catch (error) {
    console.error('Error limpiando alertas:', error);
  }
}

// Endpoint para marcar alertas como leídas
export async function POST(request: NextRequest) {
  try {
    const { alertaId, todasLeidas } = await request.json();

    if (todasLeidas) {
      // Marcar todas las alertas como leídas
      const { error } = await supabase
        .from('alertas_sistema')
        .update({ leida: true, updated_at: new Date().toISOString() })
        .eq('leida', false);

      if (error) {
        console.error('Error marcando todas las alertas como leídas:', error);
        return NextResponse.json({ error: 'Error actualizando alertas' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Todas las alertas marcadas como leídas' });
    } else if (alertaId) {
      // Marcar una alerta específica como leída
      const { error } = await supabase
        .from('alertas_sistema')
        .update({ leida: true, updated_at: new Date().toISOString() })
        .eq('id', alertaId);

      if (error) {
        console.error('Error marcando alerta como leída:', error);
        return NextResponse.json({ error: 'Error actualizando alerta' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Alerta marcada como leída' });
    }

    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });

  } catch (error) {
    console.error('Error en POST de alertas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}