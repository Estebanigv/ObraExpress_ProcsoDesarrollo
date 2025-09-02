import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface VentaData {
  numeroOrden: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  productos: Array<{
    codigo: string;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }>;
  subtotal: number;
  impuestos: number;
  total: number;
  metodoPago: string;
  transaccionId?: string;
  direccionEntrega?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Importación dinámica para evitar errores en build time
    const { supabase } = await import('@/lib/supabase');
    
    const ventaData: VentaData = await request.json();
    
    console.log('📧 Procesando notificación de venta:', ventaData.numeroOrden);

    // 1. Guardar venta en base de datos
    const { data: ventaGuardada, error: errorVenta } = await supabase
      .from('ventas')
      .insert({
        numero_orden: ventaData.numeroOrden,
        cliente_nombre: ventaData.clienteNombre,
        cliente_email: ventaData.clienteEmail,
        cliente_telefono: ventaData.clienteTelefono,
        productos: ventaData.productos,
        subtotal: ventaData.subtotal,
        impuestos: ventaData.impuestos,
        total: ventaData.total,
        estado: 'aprobada',
        metodo_pago: ventaData.metodoPago,
        transaccion_id: ventaData.transaccionId,
        direccion_entrega: ventaData.direccionEntrega,
        email_enviado: false
      })
      .select()
      .single();

    if (errorVenta) {
      console.error('❌ Error guardando venta:', errorVenta);
      return NextResponse.json({ error: 'Error guardando venta' }, { status: 500 });
    }

    console.log('✅ Venta guardada en BD:', ventaGuardada.id);

    // 2. Crear órdenes de trabajo para proveedores
    await crearOrdenesTrabajoProveedores(ventaGuardada.id, ventaData.productos);

    // 3. Enviar email al administrador
    const emailEnviado = await enviarEmailAdministrador(ventaData);
    
    if (emailEnviado) {
      // Marcar email como enviado
      await supabase
        .from('ventas')
        .update({ email_enviado: true })
        .eq('id', ventaGuardada.id);
    }

    // 4. Crear alerta en el sistema
    await crearAlertaVenta(ventaGuardada.id, ventaData);

    // 5. Log de actividad
    await supabase
      .from('logs_actividad')
      .insert({
        usuario: 'sistema',
        accion: 'venta_aprobada',
        entidad: 'venta',
        entidad_id: ventaGuardada.id,
        detalles: {
          numero_orden: ventaData.numeroOrden,
          total: ventaData.total,
          cliente: ventaData.clienteNombre
        }
      });

    return NextResponse.json({ 
      success: true, 
      ventaId: ventaGuardada.id,
      numeroOrden: ventaData.numeroOrden,
      emailEnviado
    });

  } catch (error) {
    console.error('❌ Error procesando notificación de venta:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function crearOrdenesTrabajoProveedores(ventaId: string, productos: any[]) {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    // Obtener mapeo de productos con proveedores
    const { data: productosProveedor } = await supabase
      .from('productos_proveedor')
      .select(`
        *,
        proveedores (*)
      `)
      .in('codigo_polimax', productos.map(p => p.codigo));

    if (!productosProveedor) return;

    // Agrupar productos por proveedor
    const productosPorProveedor = new Map();
    
    productos.forEach(producto => {
      const productoProveedor = productosProveedor.find(pp => pp.codigo_polimax === producto.codigo);
      if (productoProveedor) {
        const proveedorId = productoProveedor.proveedor_id;
        if (!productosPorProveedor.has(proveedorId)) {
          productosPorProveedor.set(proveedorId, {
            proveedor: productoProveedor.proveedores,
            productos: []
          });
        }
        productosPorProveedor.get(proveedorId).productos.push({
          ...producto,
          codigo_proveedor: productoProveedor.codigo_proveedor,
          precio_proveedor: productoProveedor.precio_proveedor
        });
      }
    });

    // Crear orden de trabajo para cada proveedor
    for (const [proveedorId, datos] of productosPorProveedor) {
      const numeroOrdenTrabajo = `OT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const totalOrden = datos.productos.reduce((sum: number, p: any) => 
        sum + (p.precio_proveedor * p.cantidad), 0);

      await supabase
        .from('ordenes_trabajo_proveedor')
        .insert({
          venta_id: ventaId,
          proveedor_id: proveedorId,
          numero_orden_trabajo: numeroOrdenTrabajo,
          productos_solicitados: datos.productos,
          total_orden: totalOrden,
          estado: 'enviada'
        });

      console.log(`✅ Orden de trabajo creada: ${numeroOrdenTrabajo} para ${datos.proveedor.nombre}`);
    }

  } catch (error) {
    console.error('❌ Error creando órdenes de trabajo:', error);
  }
}

async function enviarEmailAdministrador(ventaData: VentaData): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Venta Aprobada - ObraExpress</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <header style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Nueva Venta Aprobada</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">ObraExpress - Sistema de Ventas</p>
          </header>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #10B981; margin-top: 0;">Detalles de la Venta</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Número de Orden:</td>
                <td style="padding: 8px 0;">${ventaData.numeroOrden}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Cliente:</td>
                <td style="padding: 8px 0;">${ventaData.clienteNombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">${ventaData.clienteEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Teléfono:</td>
                <td style="padding: 8px 0;">${ventaData.clienteTelefono || 'No proporcionado'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Total:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #10B981;">$${ventaData.total.toLocaleString('es-CL')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Método de Pago:</td>
                <td style="padding: 8px 0;">${ventaData.metodoPago}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e5e7eb;">
            <h3 style="color: #374151; margin-top: 0;">Productos Vendidos</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Producto</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Cant.</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Precio Unit.</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${ventaData.productos.map(producto => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">
                      <strong>${producto.nombre}</strong><br>
                      <small style="color: #6b7280;">Código: ${producto.codigo}</small>
                    </td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${producto.cantidad}</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">$${producto.precio.toLocaleString('es-CL')}</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: bold;">$${producto.subtotal.toLocaleString('es-CL')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Acción Requerida</h4>
            <p style="margin: 0; color: #92400e;">
              Se han generado automáticamente las órdenes de trabajo para los proveedores. 
              <strong>Revisa el panel de administración para gestionar las órdenes pendientes.</strong>
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/ventas" 
               style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Ver en Panel de Administración
            </a>
          </div>

          <footer style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>ObraExpress - Sistema Automatizado de Ventas</p>
            <p>Este email fue generado automáticamente el ${new Date().toLocaleString('es-CL')}</p>
          </footer>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'ObraExpress Ventas <ventas@obraexpress.cl>',
      to: [process.env.EMAIL_ADMIN_VENTAS || 'gonzalezvogel@gmail.com'],
      subject: `🎉 Nueva Venta Aprobada - Orden ${ventaData.numeroOrden} - $${ventaData.total.toLocaleString('es-CL')}`,
      html: htmlEmail,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }

    console.log('✅ Email enviado al administrador:', data?.id);
    return true;

  } catch (error) {
    console.error('❌ Error en enviarEmailAdministrador:', error);
    return false;
  }
}

async function crearAlertaVenta(ventaId: string, ventaData: VentaData) {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    await supabase
      .from('alertas_sistema')
      .insert({
        tipo: 'venta_aprobada',
        venta_id: ventaId,
        titulo: `Nueva venta aprobada: ${ventaData.numeroOrden}`,
        mensaje: `Venta de $${ventaData.total.toLocaleString('es-CL')} de ${ventaData.clienteNombre}. Se han generado las órdenes de trabajo correspondientes.`,
        prioridad: 'alta',
        usuario_asignado: 'admin_ventas',
        acciones_disponibles: [
          { tipo: 'ver_detalle', texto: 'Ver Detalle', url: `/admin/ventas/${ventaId}` },
          { tipo: 'gestionar_ordenes', texto: 'Gestionar Órdenes', url: `/admin/ordenes-trabajo` }
        ]
      });

    console.log('✅ Alerta creada para la venta');
  } catch (error) {
    console.error('❌ Error creando alerta:', error);
  }
}