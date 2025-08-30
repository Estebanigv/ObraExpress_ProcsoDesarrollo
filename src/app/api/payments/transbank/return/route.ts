import { NextRequest, NextResponse } from 'next/server';
import { TransbankConfirmation } from '@/types/billing';

// Configuración de Transbank
const TRANSBANK_CONFIG = {
  apiUrl: 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions',
  commerceCode: '597055555532',
  apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
};

export async function POST(request: NextRequest) {
  try {
    const { token_ws, TBK_TOKEN, TBK_ORDEN_COMPRA, TBK_ID_SESION } = await request.json();
    
    // Verificar si hay errores de Transbank
    if (TBK_TOKEN || TBK_ORDEN_COMPRA || TBK_ID_SESION) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/pago-cancelado?error=transbank_error`,
        { status: 302 }
      );
    }

    if (!token_ws) {
      return NextResponse.json(
        { error: 'Token de transacción requerido' },
        { status: 400 }
      );
    }

    // En ambiente de desarrollo, simular confirmación
    if (process.env.NODE_ENV === 'development') {
      const mockConfirmation: TransbankConfirmation = {
        vci: 'TSY',
        amount: 50000,
        status: 'AUTHORIZED',
        buy_order: 'ORDER-123456',
        session_id: 'SESSION-123456',
        card_detail: {
          card_number: '6623'
        },
        accounting_date: '1023',
        transaction_date: new Date().toISOString(),
        authorization_code: '1213',
        payment_type_code: 'VN',
        response_code: 0,
        installments_amount: 50000,
        installments_number: 0,
        balance: 0
      };

      // Actualizar estado de la factura
      await updateInvoiceStatus(token_ws, mockConfirmation);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/pago-exitoso?token=${token_ws}`,
        { status: 302 }
      );
    }

    // Confirmar transacción con Transbank
    const confirmResponse = await fetch(`${TRANSBANK_CONFIG.apiUrl}/${token_ws}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Tbk-Api-Key-Id': TRANSBANK_CONFIG.commerceCode,
        'Tbk-Api-Key-Secret': TRANSBANK_CONFIG.apiKey,
      }
    });

    if (!confirmResponse.ok) {
      throw new Error(`Error confirmando transacción: ${confirmResponse.status}`);
    }

    const confirmation: TransbankConfirmation = await confirmResponse.json();
    
    // Verificar estado de la transacción
    if (confirmation.status === 'AUTHORIZED' && confirmation.response_code === 0) {
      // Pago exitoso
      await updateInvoiceStatus(token_ws, confirmation);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/pago-exitoso?token=${token_ws}`,
        { status: 302 }
      );
    } else {
      // Pago rechazado
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/pago-rechazado?token=${token_ws}`,
        { status: 302 }
      );
    }

  } catch (error) {
    console.error('Error processing Transbank return:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/pago-error`,
      { status: 302 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Manejar retorno GET de Transbank (menos común pero posible)
  const { searchParams } = new URL(request.url);
  const token_ws = searchParams.get('token_ws');
  const TBK_TOKEN = searchParams.get('TBK_TOKEN');
  
  if (TBK_TOKEN) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/pago-cancelado?error=user_cancel`,
      { status: 302 }
    );
  }
  
  if (token_ws) {
    // Procesar como POST
    return POST(request);
  }
  
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/pago-error`,
    { status: 302 }
  );
}

// Simulación de actualización del estado de la factura
async function updateInvoiceStatus(token: string, confirmation: TransbankConfirmation) {
  console.log(`Actualizando estado de factura para token: ${token}`);
  console.log('Confirmación:', confirmation);
  
  // Aquí actualizarías la base de datos real
  // Por ejemplo:
  // - Marcar factura como pagada
  // - Guardar detalles de la transacción
  // - Enviar email de confirmación
  // - Activar proceso de despacho
  
  return new Promise(resolve => setTimeout(resolve, 100));
}