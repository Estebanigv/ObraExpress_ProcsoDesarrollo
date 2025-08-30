export interface CompanyBillingInfo {
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono: string;
  email: string;
  contactoNombre: string;
  contactoCargo: string;
}

export interface PaymentMethod {
  type: 'transbank_webpay' | 'transbank_onepay' | 'transfer';
  name: string;
  description: string;
  available: boolean;
}

export interface Invoice {
  id: string;
  numero: number;
  fecha: Date;
  vencimiento: Date;
  rut: string;
  razonSocial: string;
  direccion: string;
  items: InvoiceItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada';
  metodoPago?: string;
  transactionId?: string;
  pdfUrl?: string;
}

export interface InvoiceItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  codigo?: string;
}

export interface TransbankResponse {
  token: string;
  url: string;
}

export interface TransbankConfirmation {
  vci: string;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail: {
    card_number: string;
  };
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_amount: number;
  installments_number: number;
  balance: number;
}