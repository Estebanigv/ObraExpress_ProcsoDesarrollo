"use client";

import React, { useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { CompanyBillingInfo, PaymentMethod, Invoice } from '@/types/billing';
import { regionesComunas, getComunasByRegion } from '@/data/regiones-comunas';

interface EnterpriseCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnterpriseCheckout({ isOpen, onClose }: EnterpriseCheckoutProps) {
  const { state: cartState, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [billingInfo, setBillingInfo] = useState<CompanyBillingInfo>({
    rut: '',
    razonSocial: '',
    giro: '',
    direccion: '',
    comuna: '',
    region: '',
    telefono: '',
    email: '',
    contactoNombre: '',
    contactoCargo: ''
  });

  const [selectedPayment, setSelectedPayment] = useState<string>('transbank_webpay');
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // Obtener comunas basadas en la región seleccionada
  const comunasDisponibles = useMemo(() => {
    const regionSeleccionada = regionesComunas.find(r => r.nombre === billingInfo.region);
    return regionSeleccionada ? regionSeleccionada.comunas : [];
  }, [billingInfo.region]);

  const paymentMethods: PaymentMethod[] = [
    {
      type: 'transbank_webpay',
      name: 'WebPay Plus',
      description: 'Pago con tarjetas de crédito y débito',
      available: true
    },
    {
      type: 'transbank_onepay',
      name: 'OnePay',
      description: 'Pago con aplicación móvil',
      available: true
    },
    {
      type: 'transfer',
      name: 'Transferencia Bancaria',
      description: 'Pago por transferencia (30 días plazo)',
      available: true
    }
  ];

  // Calcular totales con IVA
  const subtotal = cartState.total;
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const handleInputChange = (field: keyof CompanyBillingInfo, value: string) => {
    setBillingInfo(prev => {
      // Si cambió la región, limpiar la comuna
      if (field === 'region') {
        return {
          ...prev,
          [field]: value,
          comuna: '' // Limpiar comuna cuando cambie la región
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const validateRUT = (rut: string): boolean => {
    // Validación básica de RUT chileno
    const cleanRUT = rut.replace(/[^0-9kK]/g, '');
    if (cleanRUT.length < 8) return false;
    
    const body = cleanRUT.slice(0, -1);
    const dv = cleanRUT.slice(-1).toUpperCase();
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = sum % 11;
    const calculatedDV = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'K' : (11 - remainder).toString());
    
    return dv === calculatedDV;
  };

  const validateForm = (): boolean => {
    const required = ['rut', 'razonSocial', 'giro', 'direccion', 'comuna', 'region', 'telefono', 'email', 'contactoNombre'];
    
    for (const field of required) {
      if (!billingInfo[field as keyof CompanyBillingInfo]) {
        alert(`El campo ${field} es requerido`);
        return false;
      }
    }
    
    if (!validateRUT(billingInfo.rut)) {
      alert('El RUT ingresado no es válido');
      return false;
    }
    
    return true;
  };

  const handleGenerateInvoice = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Generar factura
      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        numero: Math.floor(Math.random() * 1000000),
        fecha: new Date(),
        vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        rut: billingInfo.rut,
        razonSocial: billingInfo.razonSocial,
        direccion: `${billingInfo.direccion}, ${billingInfo.comuna}, ${billingInfo.region}`,
        items: cartState.items.map(item => ({
          descripcion: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          total: item.total,
          codigo: item.id
        })),
        subtotal,
        iva,
        total,
        estado: 'pendiente'
      };

      // Simular llamada API para generar factura
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice: newInvoice,
          billingInfo,
          paymentMethod: selectedPayment
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar la factura');
      }

      const result = await response.json();
      setInvoice(result.invoice);
      setStep(2);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar la factura. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!invoice) return;
    
    setLoading(true);
    
    try {
      if (selectedPayment === 'transbank_webpay') {
        // Iniciar transacción con Transbank
        const response = await fetch('/api/payments/transbank/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            amount: total,
            orderId: `ORDER-${invoice.numero}`,
            sessionId: `SESSION-${Date.now()}`
          })
        });

        if (!response.ok) {
          throw new Error('Error al inicializar el pago');
        }

        const { token, url } = await response.json();
        
        // Redirigir a Transbank
        window.location.href = url;
        
      } else if (selectedPayment === 'transfer') {
        // Mostrar datos para transferencia
        setStep(3);
        clearCart();
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 ? 'Datos de Facturación Empresarial' : 
                 step === 2 ? 'Resumen y Pago' : 
                 'Confirmación'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {step === 1 ? 'Complete los datos de su empresa para la facturación' :
                 step === 2 ? 'Revise los datos y seleccione método de pago' :
                 'Su pedido ha sido procesado exitosamente'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center mt-4 space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">Datos</span>
            </div>
            <div className={`h-px bg-gray-300 flex-1`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Pago</span>
            </div>
            <div className={`h-px bg-gray-300 flex-1`}></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm font-medium">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Resumen del carrito */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
                <div className="space-y-2">
                  {cartState.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.nombre} x{item.cantidad}</span>
                      <span>${item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (19%):</span>
                    <span>${iva.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Formulario de datos empresariales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RUT de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.rut}
                    onChange={(e) => handleInputChange('rut', e.target.value)}
                    placeholder="12.345.678-9"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.razonSocial}
                    onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                    placeholder="Nombre de la empresa"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giro *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.giro}
                    onChange={(e) => handleInputChange('giro', e.target.value)}
                    placeholder="Actividad comercial"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={billingInfo.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+56 9 8765 4321"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Calle, número, depto/oficina"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comuna *
                  </label>
                  <select
                    value={billingInfo.comuna}
                    onChange={(e) => handleInputChange('comuna', e.target.value)}
                    disabled={!billingInfo.region}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {billingInfo.region ? 'Seleccione comuna' : 'Primero seleccione una región'}
                    </option>
                    {comunasDisponibles.map(comuna => (
                      <option key={comuna.codigo} value={comuna.nombre}>
                        {comuna.nombre}
                      </option>
                    ))}
                  </select>
                  {billingInfo.region && comunasDisponibles.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No se encontraron comunas para esta región
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Región *
                  </label>
                  <select
                    value={billingInfo.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione región</option>
                    {regionesComunas.map(region => (
                      <option key={region.codigo} value={region.nombre}>
                        {region.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="facturacion@empresa.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Contacto *
                  </label>
                  <input
                    type="text"
                    value={billingInfo.contactoNombre}
                    onChange={(e) => handleInputChange('contactoNombre', e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cargo del Contacto
                  </label>
                  <input
                    type="text"
                    value={billingInfo.contactoCargo}
                    onChange={(e) => handleInputChange('contactoCargo', e.target.value)}
                    placeholder="Ej: Gerente de Compras"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && invoice && (
            <div className="space-y-6">
              {/* Datos de la factura */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Factura Generada</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Número:</span>
                    <span className="ml-2 font-semibold">{invoice.numero}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Fecha:</span>
                    <span className="ml-2">{invoice.fecha.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">RUT:</span>
                    <span className="ml-2">{invoice.rut}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total:</span>
                    <span className="ml-2 font-bold text-lg">${invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Seleccione método de pago</h3>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <div
                      key={method.type}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment === method.type 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPayment(method.type)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedPayment === method.type}
                          onChange={() => setSelectedPayment(method.type)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-900">¡Pedido Confirmado!</h3>
              <p className="text-gray-600">
                Su factura ha sido enviada al email: <strong>{billingInfo.email}</strong>
              </p>
              
              {selectedPayment === 'transfer' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Datos para Transferencia</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div>Banco: Banco Estado</div>
                    <div>Cuenta Corriente: 12345678-9</div>
                    <div>RUT: 12.345.678-9</div>
                    <div>Email: pagos@obraexpress.cl</div>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    Envíe el comprobante a pagos@obraexpress.cl
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {step === 1 && "Complete todos los campos obligatorios (*)"}
              {step === 2 && "Seleccione un método de pago para continuar"}
              {step === 3 && "Su pedido será procesado en 24-48 horas"}
            </div>
            <div className="flex space-x-3">
              {step > 1 && step < 3 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
              )}
              {step === 1 && (
                <button
                  onClick={handleGenerateInvoice}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Generando...' : 'Generar Factura'}
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={handleProcessPayment}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Procesando...' : selectedPayment === 'transfer' ? 'Confirmar Pedido' : 'Pagar Ahora'}
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}