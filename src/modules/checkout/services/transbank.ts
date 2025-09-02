import { WebpayPlus, Environment, Options } from 'transbank-sdk';

// Configuración de Transbank basada en el entorno
export class TransbankService {
  private static instance: TransbankService;
  private webpayPlusTransaction: any;
  private options: Options;

  constructor() {
    this.options = {} as Options;
    this.configureTransbank();
  }

  public static getInstance(): TransbankService {
    if (!TransbankService.instance) {
      TransbankService.instance = new TransbankService();
    }
    return TransbankService.instance;
  }

  private configureTransbank() {
    const environment = process.env.TRANSBANK_ENVIRONMENT || 'development';
    
    if (environment === 'production') {
      // Configuración de PRODUCCIÓN
      const commerceCode = process.env.TRANSBANK_PRODUCTION_COMMERCE_CODE;
      const apiKey = process.env.TRANSBANK_PRODUCTION_API_KEY;
      
      if (!commerceCode || !apiKey) {
        throw new Error('Credenciales de producción de Transbank no configuradas');
      }
      
      this.options = {
        commerceCode,
        apiKey,
        environment: Environment.Production
      } as Options;
      
      console.log('🏦 Transbank configurado en modo PRODUCCIÓN');
    } else {
      // Configuración de DESARROLLO/INTEGRACIÓN  
      const commerceCode = process.env.TRANSBANK_COMMERCE_CODE || '597055555532';
      const apiKey = process.env.TRANSBANK_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
      
      this.options = {
        commerceCode,
        apiKey,
        environment: Environment.Integration
      } as Options;
      
      console.log('🧪 Transbank configurado en modo DESARROLLO');
    }
    
    this.webpayPlusTransaction = new WebpayPlus.Transaction(this.options);
  }

  // Crear una transacción
  public async createTransaction(data: {
    buyOrder: string;      // Orden de compra única
    sessionId: string;     // ID de sesión del usuario
    amount: number;        // Monto en pesos chilenos
    returnUrl: string;     // URL de retorno
  }) {
    try {
      console.log('🏦 Creando transacción Transbank:', data);

      const response = await this.webpayPlusTransaction.create(
        data.buyOrder,
        data.sessionId,
        data.amount,
        data.returnUrl
      );

      console.log('✅ Transacción creada exitosamente:', response);
      
      return {
        success: true,
        token: response.token,
        url: response.url,
        buyOrder: data.buyOrder,
        amount: data.amount
      };
    } catch (error) {
      console.error('❌ Error creando transacción Transbank:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        code: 'TRANSACTION_CREATE_ERROR'
      };
    }
  }

  // Confirmar una transacción
  public async confirmTransaction(token: string) {
    try {
      console.log('🔍 Confirmando transacción Transbank:', token);

      const response = await this.webpayPlusTransaction.commit(token);

      console.log('✅ Transacción confirmada:', response);

      return {
        success: true,
        transaction: {
          vci: response.vci,                           // Validación del comercio
          amount: response.amount,                     // Monto de la transacción
          status: response.status,                     // Estado de la transacción
          buyOrder: response.buy_order,                // Orden de compra
          sessionId: response.session_id,              // ID de sesión
          cardDetail: response.card_detail,            // Detalles de la tarjeta
          accountingDate: response.accounting_date,    // Fecha contable
          transactionDate: response.transaction_date,  // Fecha de transacción
          authorizationCode: response.authorization_code, // Código de autorización
          paymentTypeCode: response.payment_type_code, // Tipo de pago
          responseCode: response.response_code,        // Código de respuesta
          installmentsAmount: response.installments_amount, // Monto de cuotas
          installmentsNumber: response.installments_number, // Número de cuotas
          balance: response.balance                     // Saldo
        }
      };
    } catch (error) {
      console.error('❌ Error confirmando transacción Transbank:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        code: 'TRANSACTION_COMMIT_ERROR'
      };
    }
  }

  // Obtener estado de una transacción
  public async getTransactionStatus(token: string) {
    try {
      console.log('📊 Obteniendo estado de transacción:', token);

      const response = await this.webpayPlusTransaction.status(token);

      console.log('📈 Estado de transacción obtenido:', response);

      return {
        success: true,
        status: response
      };
    } catch (error) {
      console.error('❌ Error obteniendo estado de transacción:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        code: 'TRANSACTION_STATUS_ERROR'
      };
    }
  }

  // Refund de una transacción (anular/reversar)
  public async refundTransaction(token: string, amount: number) {
    try {
      console.log('💸 Procesando refund:', { token, amount });

      const response = await this.webpayPlusTransaction.refund(token, amount);

      console.log('✅ Refund procesado:', response);

      return {
        success: true,
        refund: response
      };
    } catch (error) {
      console.error('❌ Error procesando refund:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        code: 'REFUND_ERROR'
      };
    }
  }

  // Generar orden de compra única
  public static generateBuyOrder(prefix: string = 'ObraExpress'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  // Validar monto (Transbank acepta montos entre $50 y $10,000,000)
  public static validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount < 50) {
      return { valid: false, error: 'El monto mínimo es $50 CLP' };
    }
    
    if (amount > 10000000) {
      return { valid: false, error: 'El monto máximo es $10.000.000 CLP' };
    }
    
    if (!Number.isInteger(amount)) {
      return { valid: false, error: 'El monto debe ser un número entero' };
    }
    
    return { valid: true };
  }

  // Formatear monto chileno
  public static formatChileanAmount(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Interpretar código de respuesta de Transbank
  public static interpretResponseCode(code: number): string {
    const codes: Record<number, string> = {
      0: 'Transacción aprobada',
      [-1]: 'Rechazo de transacción - Reintente',
      [-2]: 'Transacción debe reintentarse',
      [-3]: 'Error en transacción',
      [-4]: 'Rechazo de transacción - No Reintente',
      [-5]: 'Rechazo por error de tasa',
      [-6]: 'Excede cupo máximo mensual',
      [-7]: 'Excede límite diario por transacción',
      [-8]: 'Rubro no autorizado'
    };
    
    return codes[code] || `Código de respuesta: ${code}`;
  }

  // Interpretar tipo de pago
  public static interpretPaymentType(code: string): string {
    const types: Record<string, string> = {
      'VD': 'Venta Débito',
      'VN': 'Venta Normal',
      'VC': 'Venta en cuotas',
      'SI': 'Sin cuotas',
      'S2': '2 cuotas sin interés',
      'S3': '3 cuotas sin interés',
      'S4': '4 cuotas sin interés',
      'S5': '5 cuotas sin interés',
      'S6': '6 cuotas sin interés',
      'S7': '7 cuotas sin interés',
      'S8': '8 cuotas sin interés',
      'S9': '9 cuotas sin interés',
      'S10': '10 cuotas sin interés',
      'S11': '11 cuotas sin interés',
      'S12': '12 cuotas sin interés'
    };
    
    return types[code] || `Tipo de pago: ${code}`;
  }
}

// Interfaces TypeScript para mayor seguridad de tipos
export interface TransactionCreateData {
  buyOrder: string;
  sessionId: string;
  amount: number;
  returnUrl: string;
}

export interface TransactionResponse {
  success: boolean;
  token?: string;
  url?: string;
  buyOrder?: string;
  amount?: number;
  error?: string;
  code?: string;
}

export interface TransactionConfirmation {
  success: boolean;
  transaction?: {
    vci: string;
    amount: number;
    status: string;
    buyOrder: string;
    sessionId: string;
    cardDetail: any;
    accountingDate: string;
    transactionDate: string;
    authorizationCode: string;
    paymentTypeCode: string;
    responseCode: number;
    installmentsAmount: number;
    installmentsNumber: number;
    balance: number;
  };
  error?: string;
  code?: string;
}

export default TransbankService;