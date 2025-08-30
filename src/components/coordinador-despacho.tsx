"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import type { CartItem } from '@/contexts/CartContext';
import { safeDocument } from '@/lib/client-utils';
import { supabase } from '@/lib/supabase';
import { createNotification } from './notification-system';
import { useAuth } from '@/contexts/AuthContext';

interface DespachoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Productos específicos basados en las fichas técnicas
const productosObraExpress = {
  'Policarbonato Ondulado': {
    nombre: 'Policarbonato Ondulado',
    descripcion: 'Planchas onduladas resistentes para techos y cubiertas',
    especificaciones: [
      'Ancho total: 810mm, Ancho útil: 762mm',
      'Altura de onda: 15mm, Paso: 76.2mm',
      'Largos estándar: 2.00m / 2.50m / 3.0m / 3.66m',
      'Largos especiales: A pedido',
      'Colores: Clear, Bronce, Opal',
      'Protección UV: Bloquea 98% radiación dañina',
      'Garantía: 10 años'
    ],
    aplicaciones: ['Almacenes', 'Granjas avícolas', 'Supermercados', 'Centros comerciales', 'Terrazas', 'Estacionamientos']
  },
  'Policarbonato Alveolar': {
    nombre: 'Policarbonato Alveolar',
    descripcion: 'Estructura celular liviana con excelente aislamiento',
    especificaciones: [
      'Anchos: 2.10m / 1.05m',
      'Largos: 2.90m / 5.80m / 8.70m / 11.60m',
      'Espesores: 4mm / 6mm / 8mm / 10mm',
      'Colores: Clear, Bronce, Opal',
      'Estructura: Doble pared alveolar',
      'Protección UV: Bloquea 98% radiación dañina',
      'Aislamiento acústico: 13-20 dB según espesor'
    ],
    aplicaciones: ['Invernaderos', 'Cubiertas industriales', 'Centros deportivos', 'Arquitectura', 'Patios de luz', 'Lucarnas']
  }
};

// Regiones y comunas de Chile
const regionesChile = {
  'Región Metropolitana': [
    'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú', 'La Florida', 'Peñalolén', 
    'Puente Alto', 'San Bernardo', 'Melipilla', 'Pudahuel', 'Quilicura', 'Renca', 
    'Independencia', 'Recoleta', 'Conchalí', 'Huechuraba', 'Vitacura', 'Lo Barnechea', 
    'La Reina', 'Macul', 'San Joaquín', 'San Miguel', 'San Ramón', 'La Granja', 
    'La Pintana', 'El Bosque', 'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 
    'Cerrillos', 'Quinta Normal', 'Lo Prado', 'Cerro Navia', 'Colina', 
    'Lampa', 'Tiltil', 'María Pinto', 'Curacaví', 'San Pedro', 
    'Alhué', 'Buin', 'Paine', 'Calera de Tango', 'Pirque', 'San José de Maipo', 
    'Padre Hurtado', 'Peñaflor', 'Talagante', 'El Monte', 'Isla de Maipo'
  ],
  'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Casablanca', 'San Antonio'],
  'Región del Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel', 'San Pedro de la Paz'],
  'Región de la Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Nueva Imperial', 'Angol'],
  'Región de Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas', 'Frutillar'],
  'Región de Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama'],
  'Región de Atacama': ['Copiapó', 'Vallenar', 'Chañaral', 'Diego de Almagro', 'Tierra Amarilla'],
  'Región de Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Monte Patria'],
  'Región del Libertador Bernardo O\'Higgins': ['Rancagua', 'San Fernando', 'Pichilemu', 'Santa Cruz', 'Rengo'],
  'Región del Maule': ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución', 'Molina'],
  'Región de Ñuble': ['Chillán', 'San Carlos', 'Bulnes', 'Yungay', 'Quirihue'],
  'Región de Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Lanco'],
  'Región de Aysén': ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
  'Región de Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Cabo de Hornos'],
  'Región de Arica y Parinacota': ['Arica', 'Putre', 'General Lagos'],
  'Región de Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica']
};

export const CoordinadorDespacho: React.FC<DespachoModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [step, setStep] = useState<'form' | 'calendar' | 'payment' | 'success'>('form');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [selectedProducto, setSelectedProducto] = useState<string>('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    email: '',
    totalAmount: 50000
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transbank'>('card');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    productos: '',
    comentarios: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      safeDocument.setBodyOverflow('hidden');
    } else {
      safeDocument.setBodyOverflow('unset');
    }
    
    return () => {
      safeDocument.setBodyOverflow('unset');
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (selectedSpecs.length > 0 && selectedProducto) {
      const especificacionesText = selectedSpecs.join('\n• ');
      const currentText = formData.productos;
      
      if (!currentText.includes('Especificaciones técnicas seleccionadas:')) {
        const newText = currentText.trim() + 
          (currentText.trim() ? '\n\n' : '') + 
          'Especificaciones técnicas seleccionadas:\n• ' + especificacionesText + 
          '\n\nCantidad y detalles adicionales:\n';
        
        setFormData({...formData, productos: newText});
      }
    } else if (selectedSpecs.length === 0 && formData.productos.includes('Especificaciones técnicas seleccionadas:')) {
      const cleanText = formData.productos
        .replace(/Especificaciones técnicas seleccionadas:[\s\S]*?(?=\n\nCantidad y detalles adicionales:|$)/g, '')
        .replace(/\n\nCantidad y detalles adicionales:\n/g, '')
        .trim();
      
      setFormData({...formData, productos: cleanText});
    }
  }, [selectedSpecs, selectedProducto]);

  // Función para obtener fechas del calendario para los próximos 6 meses
  const getCalendarDates = () => {
    const today = new Date();
    const months = [];
    
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const targetYear = today.getFullYear();
      const targetMonth = today.getMonth() + monthOffset;
      
      const actualYear = targetYear + Math.floor(targetMonth / 12);
      const actualMonth = targetMonth % 12;
      
      const firstDayOfMonth = new Date(actualYear, actualMonth, 1);
      const lastDayOfMonth = new Date(actualYear, actualMonth + 1, 0);
      
      const monthData = {
        name: firstDayOfMonth.toLocaleDateString('es-CL', { 
          month: 'long', 
          year: 'numeric' 
        }).replace(/^\w/, c => c.toUpperCase()),
        dates: [] as (Date | null)[]
      };
      
      const startingDayOfWeek = firstDayOfMonth.getDay();
      
      for (let i = 0; i < startingDayOfWeek; i++) {
        monthData.dates.push(null);
      }
      
      const daysInMonth = lastDayOfMonth.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(actualYear, actualMonth, day);
        monthData.dates.push(date);
      }
      
      months.push(monthData);
    }
    
    return months;
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const isThursday = dayOfWeek === 4;
    const isPast = checkDate < today;
    const isToday = checkDate.getTime() === today.getTime();
    
    if (isThursday) {
      if (isPast) {
        return 'past-thursday';
      }
      if (today.getDay() === 3 && checkDate.getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
        return 'unavailable-thursday';
      }
      return 'available-thursday';
    }
    
    if (isPast) {
      return 'past-day';
    }
    if (isToday) {
      return 'today-not-thursday';
    }
    return 'future-not-thursday';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('payment');
  };

  const addToCart = async () => {
    // Validar campos requeridos
    const missingFields = [];
    if (!formData.nombre) missingFields.push('Nombre completo');
    if (!formData.telefono) missingFields.push('Teléfono');
    if (!selectedRegion) missingFields.push('Región');
    if (!selectedComuna) missingFields.push('Comuna');
    if (!formData.direccion) missingFields.push('Dirección específica');
    if (!selectedProducto) missingFields.push('Tipo de producto');
    if (!formData.productos) missingFields.push('Especificaciones del pedido');
    
    if (missingFields.length > 0) {
      alert(`Por favor completa los siguientes campos requeridos:\n\n• ${missingFields.join('\n• ')}`);
      return;
    }

    try {
      // Guardar en Supabase (coordinaciones_despacho)
      const { data, error } = await supabase
        .from('coordinaciones_despacho')
        .insert({
          nombre_cliente: formData.nombre,
          telefono_cliente: formData.telefono,
          email_cliente: '', // Por ahora vacío, se puede mejorar pidiendo email
          region: selectedRegion,
          comuna: selectedComuna,
          direccion: formData.direccion,
          fecha_despacho: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          comentarios: formData.comentarios || null,
          tipo_producto: selectedProducto,
          cantidad: 1,
          descripcion_producto: formData.productos,
          precio_estimado: 50000,
          estado: 'programado'
        });

      if (error) {
        console.error('Error guardando coordinación:', error);
        // Continuar con el flujo aunque falle Supabase
      } else if (data && user?.id) {
        // Crear notificación para el usuario
        await createNotification(
          user.id,
          'despacho',
          'Coordinación de Despacho Programada',
          `Tu coordinación de despacho para ${selectedProducto} ha sido programada para ${selectedDate ? formatDate(selectedDate) : 'fecha seleccionada'}.`,
          { coordinacion_id: data[0]?.id, fecha_despacho: selectedDate }
        );
      }
    } catch (error) {
      console.error('Error en Supabase:', error);
    }
    
    // Crear item para el carrito
    const cartItem: CartItem = {
      id: `coordinacion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tipo: 'coordinacion',
      nombre: `Coordinación de Despacho - ${selectedProducto}`,
      descripcion: `Servicio de coordinación para ${productosObraExpress[selectedProducto as keyof typeof productosObraExpress]?.nombre || selectedProducto}`,
      especificaciones: selectedSpecs,
      cantidad: 1,
      precioUnitario: 50000, // Precio fijo por coordinación
      total: 50000,
      region: selectedRegion,
      comuna: selectedComuna,
      direccion: formData.direccion,
      comentarios: formData.comentarios
    };
    
    // Agregar al carrito global
    addItem(cartItem);
    
    // Mostrar mensaje de éxito y opciones
    alert('¡Producto agregado al carrito! Puedes continuar comprando o proceder al pago desde el carrito flotante.');
    
    // Resetear formulario para agregar más productos
    resetModal();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToCart();
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      if (paymentMethod === 'transbank') {
        await processTransbankPayment();
      } else {
        await processCardPayment();
      }
    } catch (error) {
      alert('Error en el procesamiento del pago. Por favor, intenta nuevamente.');
      setPaymentProcessing(false);
    }
  };

  const processCardPayment = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.1;
    
    if (success) {
      setStep('success');
      setPaymentProcessing(false);
      setTimeout(() => {
        resetModal();
        onClose();
      }, 5000);
    } else {
      alert('Error en el procesamiento del pago. Por favor, verifica tus datos e intenta nuevamente.');
      setPaymentProcessing(false);
    }
  };

  const processTransbankPayment = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const confirmRedirect = confirm(`Se abrirá Transbank Webpay Plus para completar el pago.\n\n¿Continuar con el pago de $50.000?`);
    
    if (confirmRedirect) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = Math.random() > 0.05;
      
      if (success) {
        setStep('success');
        setPaymentProcessing(false);
        setTimeout(() => {
          resetModal();
          onClose();
        }, 5000);
      } else {
        alert('El pago fue rechazado por Transbank. Por favor, intenta nuevamente.');
        setPaymentProcessing(false);
      }
    } else {
      setPaymentProcessing(false);
    }
  };

  const validatePaymentData = () => {
    const { email } = paymentData;
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      alert('Por favor ingresa un email válido');
      return false;
    }
    
    if (paymentMethod === 'card') {
      const { cardNumber, cardHolder, expiryDate, cvv } = paymentData;
      
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        alert('Por favor ingresa un número de tarjeta válido');
        return false;
      }
      
      if (!cardHolder.trim()) {
        alert('Por favor ingresa el nombre del titular');
        return false;
      }
      
      if (!expiryDate || !/\d{2}\/\d{2}/.test(expiryDate)) {
        alert('Por favor ingresa una fecha de vencimiento válida (MM/AA)');
        return false;
      }
      
      if (!cvv || cvv.length < 3) {
        alert('Por favor ingresa un CVV válido');
        return false;
      }
    }
    
    return true;
  };

  const handlePayment = () => {
    if (validatePaymentData()) {
      processPayment();
    }
  };

  const resetModal = () => {
    setSelectedDate(null);
    setStep('form');
    setSelectedRegion('');
    setSelectedComuna('');
    setSelectedProducto('');
    setSelectedSpecs([]);
    setPaymentProcessing(false);
    setPaymentMethod('card');
    setFormData({
      nombre: '',
      telefono: '',
      direccion: '',
      productos: '',
      comentarios: ''
    });
    setPaymentData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      email: '',
      totalAmount: 50000
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        backgroundImage: 'url(/assets/images/Despachos/DespachoA.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/40"></div>
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center relative">
            {/* Título central */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-1">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-800">Calendario de Despacho de Productos</h1>
              </div>
              <p className="text-sm text-gray-600">Sistema ObraExpress</p>
            </div>
            
            {/* Botón cerrar derecha */}
            <button 
              onClick={() => { 
                resetModal(); 
                onClose(); 
              }}
              className="absolute right-0 flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition-colors text-black font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
          <div className="p-8">
            {/* CONTINUARÁ EN LA PRÓXIMA PARTE... */}
            
            {step === 'form' && (
              <div>
                {/* Menú flotante sobre el formulario */}
                <div className="mb-6">
                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-md border border-gray-200/50">
                    <div className="flex items-center justify-center space-x-8">
                      <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm font-medium">Inicio</span>
                      </Link>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <a href="/productos" className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-sm font-medium">Productos</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Especifica tu Pedido</h3>
                  </div>
                  <p className="text-gray-600">Coordina tu despacho de policarbonato - Solo disponible los jueves</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Región *</span>
                        </div>
                      </label>
                      <select
                        required
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value);
                          setSelectedComuna('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">-- Selecciona tu región --</option>
                        {Object.keys(regionesChile).map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Comuna *</span>
                        </div>
                      </label>
                      <select
                        required
                        value={selectedComuna}
                        onChange={(e) => setSelectedComuna(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={!selectedRegion}
                      >
                        <option value="">
                          {selectedRegion ? '-- Selecciona tu comuna --' : '-- Primero selecciona una región --'}
                        </option>
                        {selectedRegion && regionesChile[selectedRegion as keyof typeof regionesChile]?.map((comuna) => (
                          <option key={comuna} value={comuna}>
                            {comuna}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección específica *
                    </label>
                    <textarea
                      required
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={2}
                      placeholder="Calle, número, depto/casa, referencias adicionales"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Tipo de Producto *</span>
                      </div>
                    </label>
                    <select
                      required
                      value={selectedProducto}
                      onChange={(e) => setSelectedProducto(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">-- Selecciona un producto --</option>
                      {Object.keys(productosObraExpress).map((producto) => (
                        <option key={producto} value={producto}>
                          {productosObraExpress[producto as keyof typeof productosObraExpress].nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProducto && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
                      <h4 className="text-sm font-bold text-gray-800 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-yellow-100 rounded">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            {productosObraExpress[selectedProducto as keyof typeof productosObraExpress].nombre}
                          </span>
                        </div>
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        {productosObraExpress[selectedProducto as keyof typeof productosObraExpress].descripcion}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Especificaciones (selecciona las que necesitas):</h5>
                          <div className="space-y-2">
                            {productosObraExpress[selectedProducto as keyof typeof productosObraExpress].especificaciones.map((spec, index) => (
                              <label key={index} className="flex items-start cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedSpecs.includes(spec)}
                                  onChange={(e) => {
                                    let newSpecs;
                                    if (e.target.checked) {
                                      newSpecs = [...selectedSpecs, spec];
                                    } else {
                                      newSpecs = selectedSpecs.filter(s => s !== spec);
                                    }
                                    setSelectedSpecs(newSpecs);
                                  }}
                                  className="mt-1 mr-2 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 text-xs">{spec}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Aplicaciones:</h5>
                          <ul className="space-y-1">
                            {productosObraExpress[selectedProducto as keyof typeof productosObraExpress].aplicaciones.slice(0, 6).map((app, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span className="text-gray-700">{app}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especificaciones detalladas de tu pedido *
                    </label>
                    <textarea
                      required
                      value={formData.productos}
                      onChange={(e) => setFormData({...formData, productos: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={4}
                      placeholder="Especifica cantidad, medidas exactas, color, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentarios adicionales
                    </label>
                    <textarea
                      value={formData.comentarios}
                      onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={2}
                      placeholder="Horario preferido, instrucciones especiales, etc."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                  
                  {/* Bullets de beneficios */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Datos seguros</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Respuesta &lt; 1 hora</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Cobertura RM y regiones</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Calendar */}
            {step === 'calendar' && (
              <div>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Selecciona tu fecha de despacho</h3>
                  </div>
                  <p className="text-gray-600">Despacho de policarbonato solo los jueves de 9:00 a 18:00 hrs</p>
                  <div className="flex flex-col items-center space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">Solo despacho a domicilio - No hay retiro en tienda</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-sm text-orange-600 font-medium">Si pides el miércoles, se despacha el jueves siguiente</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-600 font-medium">Disponibles los próximos 6 meses para mayor flexibilidad</p>
                    </div>
                  </div>
                </div>

                {/* Calendario */}
                <div className="space-y-8">
                  {getCalendarDates().map((month, monthIndex) => (
                    <div key={monthIndex} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                      
                      {/* Cabecera del Mes */}
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-6 text-center">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium opacity-75">
                            Mes {monthIndex + 1} de 6
                          </div>
                          <div className="flex space-x-1">
                            {Array.from({ length: 6 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i === monthIndex ? 'bg-black' : 'bg-black/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          <div className="flex items-center justify-center space-x-3">
                            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-2xl font-bold">{month.name.toUpperCase()}</span>
                          </div>
                        </h3>
                        <p className="text-yellow-900 text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-yellow-900 text-sm font-medium">POLICARBONATO - SOLO JUEVES 9:00-18:00</span>
                          </div>
                        </p>
                      </div>
                      
                      <div className="p-6">
                        {/* Días de la semana */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                          {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, index) => (
                            <div 
                              key={day} 
                              className={`text-center py-2 px-1 rounded-lg font-semibold text-sm ${
                                day === 'Jueves' 
                                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' 
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {day === 'Jueves' ? (
                                <div className="flex flex-col items-center">
                                  <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                  </svg>
                                  <span className="text-xs">Jueves</span>
                                </div>
                              ) : (
                                <span className="text-xs">{day}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Fechas del mes */}
                        <div className="grid grid-cols-7 gap-2">
                          {month.dates.map((date, dateIndex) => {
                            if (!date) {
                              return <div key={dateIndex} className="h-10"></div>;
                            }
                            
                            const dayOfWeek = date.getDay();
                            const isThursday = dayOfWeek === 4;
                            const status = getDateStatus(date);
                            const isAvailableThursday = isThursday && (status === 'available-thursday');
                            const isSelectable = isAvailableThursday;
                            
                            let buttonClass = 'h-10 w-full rounded-lg font-medium transition-all duration-200 relative flex items-center justify-center ';
                            
                            if (isAvailableThursday) {
                              buttonClass += 'bg-yellow-500 text-black hover:bg-yellow-600 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 font-bold';
                            } else {
                              if (status === 'past-day' || status === 'past-thursday') {
                                buttonClass += 'bg-gray-200 text-gray-400 cursor-not-allowed';
                              } else if (status === 'today-not-thursday') {
                                buttonClass += 'bg-gray-100 text-gray-600 cursor-not-allowed border-2 border-gray-300';
                              } else {
                                buttonClass += 'bg-gray-50 text-gray-500 cursor-not-allowed hover:bg-gray-100';
                              }
                            }
                            
                            if (selectedDate && selectedDate.getTime() === date.getTime()) {
                              buttonClass += ' ring-4 ring-yellow-400 ring-opacity-75';
                            }
                            
                            return (
                              <button
                                key={dateIndex}
                                onClick={() => isSelectable ? handleDateSelect(date) : null}
                                disabled={!isSelectable}
                                className={buttonClass}
                                title={`${date.getDate()} - ${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek]} ${isAvailableThursday ? '(Disponible para despacho)' : '(No disponible)'}`}
                              >
                                <span className="text-sm font-bold">{date.getDate()}</span>
                                {isAvailableThursday && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 flex justify-between">
                  <button
                    onClick={() => setStep('form')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    ← Editar información
                  </button>
                  
                  {selectedDate && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg font-medium">
                      Fecha seleccionada: {formatDate(selectedDate)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Pago Seguro</h3>
                  </div>
                  <p className="text-gray-600">Completa tus datos de pago para confirmar la coordinación</p>
                </div>

                <div className="space-y-6">
                  {/* Selección de método de pago */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h4 className="text-lg font-bold text-gray-800">Método de Pago</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Opción Tarjeta Directa */}
                      <div 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === 'card' 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 bg-white hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'card' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <h5 className="font-semibold text-gray-800">Tarjeta de Crédito/Débito</h5>
                            </div>
                            <p className="text-sm text-gray-600">Pago directo con tu tarjeta</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-bold">VISA</div>
                          <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-bold">MASTERCARD</div>
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-bold">AMEX</div>
                          <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-bold">REDCOMPRA</div>
                        </div>
                      </div>

                      {/* Opción Transbank */}
                      <div 
                        onClick={() => setPaymentMethod('transbank')}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === 'transbank' 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 bg-white hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'transbank' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'transbank' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <h5 className="font-semibold text-gray-800">Transbank Webpay Plus</h5>
                            </div>
                            <p className="text-sm text-gray-600">Pago seguro a través de Transbank</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-bold">TRANSBANK</div>
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-bold">WEBPAY</div>
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-bold">VISA</div>
                          <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-bold">MASTERCARD</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen del servicio */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h4 className="text-lg font-bold text-yellow-800">Resumen del Servicio</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Servicio:</strong> Coordinación de Despacho</p>
                        <p><strong>Fecha:</strong> {selectedDate ? formatDate(selectedDate) : 'No seleccionada'}</p>
                        <p><strong>Cliente:</strong> {formData.nombre}</p>
                      </div>
                      <div>
                        <p><strong>Región:</strong> {selectedRegion}</p>
                        <p><strong>Comuna:</strong> {selectedComuna}</p>
                        <p><strong>Total:</strong> <span className="text-xl font-bold text-yellow-600">$50.000</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de pago */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paymentMethod === 'card' ? "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" : "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"} />
                        </svg>
                        <span className="text-lg font-bold text-gray-800">
                          {paymentMethod === 'card' ? 'Información de Tarjeta' : 'Información para Transbank'}
                        </span>
                      </div>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email - Siempre visible */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email para confirmación *
                        </label>
                        <input
                          type="email"
                          value={paymentData.email}
                          onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                          placeholder="tucorreo@email.com"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>

                      {/* Campos de tarjeta - Solo si es pago directo */}
                      {paymentMethod === 'card' && (
                        <>
                          {/* Número de tarjeta */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Número de Tarjeta *
                            </label>
                            <input
                              type="text"
                              value={paymentData.cardNumber}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                                if (value.replace(/\s/g, '').length <= 16) {
                                  setPaymentData({...paymentData, cardNumber: value});
                                }
                              }}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>

                          {/* Titular */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nombre del Titular *
                            </label>
                            <input
                              type="text"
                              value={paymentData.cardHolder}
                              onChange={(e) => setPaymentData({...paymentData, cardHolder: e.target.value.toUpperCase()})}
                              placeholder="JUAN PÉREZ"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>

                          {/* Fecha de vencimiento */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Fecha de Vencimiento *
                            </label>
                            <input
                              type="text"
                              value={paymentData.expiryDate}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                let formatted = value;
                                if (value.length >= 2) {
                                  formatted = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                if (formatted.length <= 5) {
                                  setPaymentData({...paymentData, expiryDate: formatted});
                                }
                              }}
                              placeholder="MM/AA"
                              maxLength={5}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>

                          {/* CVV */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              CVV *
                            </label>
                            <input
                              type="text"
                              value={paymentData.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 4) {
                                  setPaymentData({...paymentData, cvv: value});
                                }
                              }}
                              placeholder="123"
                              maxLength={4}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>
                        </>
                      )}

                      {/* Información para Transbank */}
                      {paymentMethod === 'transbank' && (
                        <div className="md:col-span-2">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">TB</span>
                              </div>
                              <div>
                                <h5 className="font-semibold text-blue-900 mb-2">Pago con Transbank Webpay Plus</h5>
                                <ul className="text-sm text-blue-800 space-y-1">
                                  <li className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Serás redirigido a la plataforma segura de Transbank</span>
                                  </li>
                                  <li className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Acepta Visa, Mastercard, Redcompra, Diners y más</span>
                                  </li>
                                  <li className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Proceso 100% seguro y encriptado</span>
                                  </li>
                                  <li className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Confirmación instantánea del pago</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Información de seguridad */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {paymentMethod === 'card' 
                            ? 'Pago seguro protegido con encriptación SSL'
                            : 'Transacción procesada por Transbank con máxima seguridad'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="pt-6 flex space-x-4">
                  <button
                    onClick={() => setStep('calendar')}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    ← Volver al calendario
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                    className={`flex-1 ${paymentProcessing ? 'bg-gray-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'} text-black px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2`}
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {paymentMethod === 'card' ? 'Pagar $50.000' : 'Pagar con Transbank'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">✅ ¡Pago Confirmado!</h3>
                  <p className="text-gray-600">Tu coordinación de despacho ha sido procesada exitosamente</p>
                </div>

                {/* Resumen final */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="text-lg font-bold text-blue-900">Información del Cliente</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p><strong>Nombre:</strong> {formData.nombre}</p>
                        <p><strong>Teléfono:</strong> {formData.telefono}</p>
                      </div>
                      <div>
                        <p><strong>Región:</strong> {selectedRegion}</p>
                        <p><strong>Comuna:</strong> {selectedComuna}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p><strong>Dirección:</strong> {formData.direccion}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h4 className="text-lg font-bold text-emerald-900">Producto Seleccionado</h4>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><strong>Tipo:</strong> {selectedProducto ? productosObraExpress[selectedProducto as keyof typeof productosObraExpress].nombre : 'No especificado'}</p>
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <p><strong>Especificaciones del pedido:</strong></p>
                        <p className="mt-1 text-emerald-800 bg-emerald-100 p-2 rounded">{formData.productos}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-lg font-bold text-orange-900">Fecha de Despacho</h4>
                    </div>
                    <div className="text-sm">
                      <p><strong>Fecha seleccionada:</strong> {selectedDate ? formatDate(selectedDate) : 'No especificada'}</p>
                      <p className="text-orange-700 mt-2">
                        <strong>Recordatorio:</strong> Policarbonato se despacha solo los jueves. Si pides el miércoles, va para el jueves siguiente.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h4 className="text-lg font-bold text-gray-900">Próximos Pasos</h4>
                    </div>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>• Nuestro equipo revisará tu solicitud de coordinación</p>
                      <p>• Te contactaremos al teléfono <strong>{formData.telefono}</strong> para confirmar detalles</p>
                      <p>• Coordinaremos el despacho para el día <strong>{selectedDate ? formatDate(selectedDate) : 'seleccionado'}</strong></p>
                      <p>• Venta mínima: 10 unidades | Solo despacho a domicilio</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => { 
                      resetModal(); 
                      onClose(); 
                    }}
                    className="bg-yellow-500 text-black px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};