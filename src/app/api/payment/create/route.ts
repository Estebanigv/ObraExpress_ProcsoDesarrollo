import { NextRequest, NextResponse } from 'next/server';
import TransbankService from '@/modules/checkout/services/transbank';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      cartItems, 
      customerData,
      sessionId 
    } = body;

    // Validar datos requeridos
    if (!amount || !cartItems || !customerData || !sessionId) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Validar monto
    const amountValidation = TransbankService.validateAmount(amount);
    if (!amountValidation.valid) {
      return NextResponse.json(
        { error: amountValidation.error },
        { status: 400 }
      );
    }

    // Generar orden de compra única
    const buyOrder = TransbankService.generateBuyOrder();
    
    // URL de retorno
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004';
    const returnUrl = `${siteUrl}/payment/return`;

    // Crear transacción en Transbank
    const transbank = TransbankService.getInstance();
    const transactionResult = await transbank.createTransaction({
      buyOrder,
      sessionId,
      amount,
      returnUrl
    });

    if (!transactionResult.success) {
      console.error('Error creando transacción:', transactionResult.error);
      return NextResponse.json(
        { error: 'Error al crear la transacción de pago' },
        { status: 500 }
      );
    }

    // Guardar la compra en Supabase como "pendiente"
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: customerData.userId || null,
          nombre_cliente: customerData.nombre,
          telefono_cliente: customerData.telefono,
          email_cliente: customerData.email,
          region: customerData.region,
          comuna: customerData.comuna,
          direccion: customerData.direccion,
          comentarios: customerData.comentarios || null,
          metodo_pago: 'transbank',
          total: amount,
          estado: 'pendiente',
          transaccion_id: transactionResult.token // Token de Transbank
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Error guardando compra:', purchaseError);
      } else if (purchase) {
        // Guardar items de la compra
        const purchaseItems = cartItems.map((item: any) => ({
          purchase_id: purchase.id,
          producto_id: item.id,
          nombre: item.nombre,
          descripcion: item.descripcion || null,
          precio_unitario: item.precioUnitario,
          cantidad: item.cantidad,
          total: item.total,
          imagen: item.imagen || null,
          tipo: item.tipo || 'producto',
          fecha_despacho: item.fechaDespacho || null,
          region_despacho: item.region || null,
          comuna_despacho: item.comuna || null
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(purchaseItems);

        if (itemsError) {
          console.error('Error guardando items:', itemsError);
        }
      }
    } catch (dbError) {
      console.error('Error con base de datos:', dbError);
      // Continuar con el pago aunque falle la BD
    }

    // Retornar datos para redirección a Webpay
    return NextResponse.json({
      success: true,
      token: transactionResult.token,
      url: transactionResult.url,
      buyOrder: buyOrder,
      amount: amount
    });

  } catch (error) {
    console.error('Error en API de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}