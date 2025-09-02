import { NextRequest, NextResponse } from 'next/server';
import TransbankService from '@/modules/checkout/services/transbank';
import { createNotification } from '@/components/notification-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Confirmar transacción con Transbank
    const transbank = TransbankService.getInstance();
    const confirmationResult = await transbank.confirmTransaction(token);

    if (!confirmationResult.success) {
      console.error('Error confirmando transacción:', confirmationResult.error);
      return NextResponse.json(
        { error: 'Error al confirmar el pago' },
        { status: 500 }
      );
    }

    const transaction = confirmationResult.transaction!;
    
    // Determinar si el pago fue exitoso
    const isApproved = transaction.responseCode === 0 && transaction.status === 'AUTHORIZED';
    const newStatus = isApproved ? 'pagado' : 'cancelado';

    // Actualizar estado de la compra en Supabase
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data: purchase, error: updateError } = await supabase
        .from('purchases')
        .update({
          estado: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('transaccion_id', token)
        .select('*, purchase_items(*)')
        .single();

      if (updateError) {
        console.error('Error actualizando compra:', updateError);
      } else if (purchase && isApproved) {
        // Crear notificación para el usuario si el pago fue exitoso
        if (purchase.user_id) {
          await createNotification(
            purchase.user_id,
            'compra',
            'Compra Confirmada',
            `Tu compra por ${TransbankService.formatChileanAmount(transaction.amount)} ha sido procesada exitosamente.`,
            {
              buyOrder: transaction.buyOrder,
              amount: transaction.amount,
              authorizationCode: transaction.authorizationCode
            }
          );
        }
      }
    } catch (dbError) {
      console.error('Error actualizando base de datos:', dbError);
    }

    // Retornar resultado detallado
    return NextResponse.json({
      success: true,
      approved: isApproved,
      transaction: {
        buyOrder: transaction.buyOrder,
        amount: transaction.amount,
        authorizationCode: transaction.authorizationCode,
        paymentType: TransbankService.interpretPaymentType(transaction.paymentTypeCode),
        installments: transaction.installmentsNumber,
        cardDetail: transaction.cardDetail,
        responseCode: transaction.responseCode,
        responseMessage: TransbankService.interpretResponseCode(transaction.responseCode),
        transactionDate: transaction.transactionDate,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Error en confirmación de pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}