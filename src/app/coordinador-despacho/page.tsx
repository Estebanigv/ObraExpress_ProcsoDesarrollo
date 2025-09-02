"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function CoordinadorDespachoPage() {
  const router = useRouter();
  const { addItem } = useCart();
  
  const [formData, setFormData] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
    region: '',
    comuna: '',
    direccion: '',
    fechaDespacho: '',
    comentarios: '',
    tipoProducto: '',
    cantidad: 1,
    descripcionProducto: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const regiones = [
    'Región Metropolitana',
    'Región de Valparaíso',
    'Región del Libertador Bernardo O\'Higgins',
    'Región del Maule',
    'Región del Biobío',
    'Región de La Araucanía',
    'Región de Los Ríos',
    'Región de Los Lagos',
    'Región de Aysén',
    'Región de Magallanes',
    'Región de Tarapacá',
    'Región de Antofagasta',
    'Región de Atacama',
    'Región de Coquimbo',
    'Región de Arica y Parinacota'
  ];

  const tiposProducto = [
    'Policarbonato Alveolar',
    'Policarbonato Ondulado', 
    'Policarbonato Compacto',
    'Greca Industrial',
    'Rollos de Policarbonato',
    'Perfiles y Accesorios',
    'Pinturas y Selladores'
  ];

  // Función para obtener el estado de cada día
  const getDateStatus = (date: Date): 'available' | 'past' | 'too-soon' | 'not-thursday' => {
    const today = new Date();
    const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Si no es jueves, no está disponible
    if (date.getDay() !== 4) return 'not-thursday';
    
    if (daysDiff < 0) return 'past';
    if (daysDiff < 2) return 'too-soon';
    return 'available';
  };


  // Función para generar los días del mes para el calendario
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, monthIndex, 1);
    // Último día del mes
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Días a mostrar antes del primer día (del mes anterior)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Días a mostrar después del último día (del mes siguiente)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Función para manejar la selección de fecha
  const handleDateSelect = (date: Date) => {
    const status = getDateStatus(date);
    if (status === 'available') {
      setSelectedDate(date);
      setFormData({ ...formData, fechaDespacho: date.toISOString().split('T')[0] });
    }
  };

  // Función para navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear item para el carrito
    const cartItem = {
      id: `coordinacion-${Date.now()}`,
      tipo: 'coordinacion' as const,
      nombre: `Coordinación de Despacho - ${formData.tipoProducto}`,
      descripcion: formData.descripcionProducto,
      cantidad: formData.cantidad,
      precioUnitario: 0, // Coordinación sin costo
      total: 0,
      fechaDespacho: new Date(formData.fechaDespacho),
      region: formData.region,
      comuna: formData.comuna,
      direccion: formData.direccion,
      comentarios: formData.comentarios,
      nombreCliente: formData.nombreCliente,
      telefonoCliente: formData.telefonoCliente
    };
    
    addItem(cartItem);
    router.push('/');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      {/* Hero Section con imagen profesional */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="/assets/images/Despachos/imagen_convertida.webp"
            alt="Coordinación profesional de despacho"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <Link href="/" className="inline-block mb-8">
              <div className="flex items-center justify-center bg-white/90 backdrop-blur rounded-full p-4 shadow-2xl border-3 border-yellow-400 w-20 h-20">
                <Image 
                  src="/assets/images/Logotipo/isotipo_obraexpress.webp" 
                  alt="ObraExpress" 
                  width={40}
                  height={40}
                  className="object-contain" 
                />
              </div>
            </Link>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Coordinación Profesional
              <span className="block text-yellow-400">de Despacho</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Para clientes que ya tienen claro su producto y necesitan coordinar la entrega de manera profesional y segura.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Despacho Jueves</div>
                  <div className="text-sm text-gray-400">9:00 a 18:00 hrs</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-white">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Servicio Gratuito</div>
                  <div className="text-sm text-gray-400">Sin costo adicional</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-white">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Asesoría Personal</div>
                  <div className="text-sm text-gray-400">Seguimiento completo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative">
          {/* Botón X de cierre */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors group"
            title="Cerrar formulario"
          >
            <svg 
              className="w-6 h-6 text-gray-400 group-hover:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Cliente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonoCliente}
                    onChange={(e) => setFormData({ ...formData, telefonoCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.emailCliente}
                    onChange={(e) => setFormData({ ...formData, emailCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información del Producto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Producto a Despachar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Producto *
                  </label>
                  <select
                    value={formData.tipoProducto}
                    onChange={(e) => setFormData({ ...formData, tipoProducto: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {tiposProducto.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción del Producto *
                  </label>
                  <textarea
                    value={formData.descripcionProducto}
                    onChange={(e) => setFormData({ ...formData, descripcionProducto: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    rows={3}
                    placeholder="Describe las especificaciones del producto (medidas, color, espesor, etc.)"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de Despacho */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Dirección de Despacho
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Región *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Selecciona una región</option>
                    {regiones.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comuna *
                  </label>
                  <input
                    type="text"
                    value={formData.comuna}
                    onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Calle, número, departamento, etc."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fecha de Despacho */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Fecha de Despacho
              </h3>
              
              {/* Info de despachos */}
              <div className="bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold">
                    📦 Despachos únicamente los JUEVES de 9:00 AM a 6:00 PM
                  </span>
                </div>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• ⏰ Mínimo 2 días de anticipación</p>
                  <p>• 📅 Los pedidos del miércoles van para el jueves siguiente</p>
                  <p>• 🚚 Solo despacho a domicilio</p>
                </div>
              </div>

              {/* Calendario Visual */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <h4 className="text-lg font-bold text-gray-800">
                    {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                  </h4>
                  
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
                    <div key={day} className="text-center p-2 text-sm font-medium text-gray-600">
                      <span className={index === 4 ? 'text-yellow-600 font-bold' : ''}>
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Días del calendario */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays(currentMonth).map((date, index) => {
                    const status = getDateStatus(date);
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = new Date().toDateString() === date.toDateString();
                    
                    let dayClasses = 'relative w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer ';
                    
                    if (!isCurrentMonth) {
                      dayClasses += 'text-gray-300 ';
                    } else {
                      switch (status) {
                        case 'available':
                          dayClasses += isSelected 
                            ? 'bg-yellow-500 text-white font-bold shadow-lg scale-110 ' 
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold border-2 border-yellow-300 hover:border-yellow-400 ';
                          break;
                        case 'past':
                          dayClasses += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
                          break;
                        case 'too-soon':
                          dayClasses += 'bg-orange-100 text-orange-600 cursor-not-allowed ';
                          break;
                        case 'not-thursday':
                          dayClasses += 'text-gray-400 hover:bg-gray-50 cursor-not-allowed ';
                          break;
                      }
                    }
                    
                    if (isToday && !isSelected) {
                      dayClasses += 'ring-2 ring-blue-400 ';
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        disabled={!isCurrentMonth || status !== 'available'}
                        className={dayClasses}
                        title={
                          status === 'available' ? 'Día de despacho disponible' :
                          status === 'past' ? 'Fecha pasada' :
                          status === 'too-soon' ? 'Muy pronto para coordinar' :
                          'No es día de despacho'
                        }
                      >
                        {date.getDate()}
                        {date.getDay() === 4 && isCurrentMonth && status === 'available' && (
                          <span className="absolute -bottom-1 text-xs">📦</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
                      <span className="text-gray-600">Jueves disponible</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-gray-600">Fecha seleccionada</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <span className="text-gray-600">No disponible</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                      <span className="text-gray-600">Muy pronto</span>
                    </div>
                  </div>
                </div>

                {/* Fecha seleccionada */}
                {selectedDate && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        Fecha seleccionada: {selectedDate.toLocaleDateString('es-CL', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Input oculto para el formulario */}
                <input
                  type="hidden"
                  name="fechaDespacho"
                  value={formData.fechaDespacho}
                  required
                />
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comentarios Adicionales
              </label>
              <textarea
                value={formData.comentarios}
                onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                rows={3}
                placeholder="Instrucciones especiales para el despacho, horarios preferidos, etc."
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-6">
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Coordinar Despacho
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">¿Necesitas ayuda con tu producto?</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Si no tienes claro qué producto necesitas, usa nuestro <Link href="/" className="underline font-medium">formulario de asesoría</Link></p>
            <p>• Para cotizaciones detalladas con múltiples productos, visita nuestro <Link href="/cotizador-detallado" className="underline font-medium">cotizador detallado</Link></p>
            <p>• Para consultas técnicas, contáctanos por WhatsApp: +56 9 6334-8909</p>
          </div>
        </div>
      </div>
    </div>
  );
}