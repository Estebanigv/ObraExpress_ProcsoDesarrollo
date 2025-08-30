import { NextRequest, NextResponse } from 'next/server';
import { TransbankResponse } from '@/types/billing';

// Configuración de Transbank (usar variables de entorno en producción)
const TRANSBANK_CONFIG = {
  // Ambiente de integración
  apiUrl: 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions',
  commerceCode: '597055555532', // Código de comercio de prueba
  apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // API Key de prueba
  returnUrl: process.env.NEXT_PUBLIC_BASE_URL + '/api/payments/transbank/return',
  
  // Para producción usar:
  // apiUrl: 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions',
  // commerceCode: process.env.TRANSBANK_COMMERCE_CODE,
  // apiKey: process.env.TRANSBANK_API_KEY,
};

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, amount, orderId, sessionId } = await request.json();
    
    // Validar datos requeridos
    if (!invoiceId || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Datos requeridos: invoiceId, amount, orderId' },
        { status: 400 }
      );
    }

    // Preparar datos para Transbank
    const transactionData = {
      buy_order: orderId,
      session_id: sessionId || `SESSION-${Date.now()}`,
      amount: Math.round(amount), // Transbank requiere enteros
      return_url: TRANSBANK_CONFIG.returnUrl
    };

    // En ambiente de desarrollo, simular respuesta de Transbank
    if (process.env.NODE_ENV === 'development') {
      const mockResponse: TransbankResponse = {
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/mock-transbank-payment?token=mock_token&amount=${amount}&order=${orderId}`
      };
      
      return NextResponse.json(mockResponse);
    }

    // Llamada real a Transbank API
    const response = await fetch(TRANSBANK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tbk-Api-Key-Id': TRANSBANK_CONFIG.commerceCode,
        'Tbk-Api-Key-Secret': TRANSBANK_CONFIG.apiKey,
      },
      body: JSON.stringify(transactionData)
    });

    if (!response.ok) {
      throw new Error(`Error en Transbank: ${response.status}`);
    }

    const transbankResponse = await response.json();
    
    // Guardar referencia de la transacción para posterior confirmación
    await saveTransactionReference(invoiceId, transbankResponse.token, orderId);

    return NextResponse.json({
      token: transbankResponse.token,
      url: transbankResponse.url
    });

  } catch (error) {
    console.error('Error initializing Transbank payment:', error);
    return NextResponse.json(
      { error: 'Error al inicializar el pago con Transbank' },
      { status: 500 }
    );
  }
}

// Simulación de guardado de referencia de transacción
let transactionReferences: Array<{
  invoiceId: string;
  token: string;
  orderId: string;
  createdAt: Date;
}> = [];

async function saveTransactionReference(invoiceId: string, token: string, orderId: string) {
  transactionReferences.push({
    invoiceId,
    token,
    orderId,
    createdAt: new Date()
  });
  
  console.log(`Transaction reference saved: ${token} for invoice ${invoiceId}`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (token) {
      const reference = transactionReferences.find(ref => ref.token === token);
      return NextResponse.json({ reference });
    }
    
    return NextResponse.json({ references: transactionReferences });
    
  } catch (error) {
    console.error('Error fetching transaction references:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}