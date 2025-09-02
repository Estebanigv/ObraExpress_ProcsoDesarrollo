"use client";

import React, { useState } from "react";
import { NavbarSimple } from "@/components/navbar-simple";
// import { Chatbot } from "@/components/chatbot";
import { navigate } from "@/lib/client-utils";
import { supabase } from "@/lib/supabase";
import { EmailModalWrapper as EmailSelector } from "@/components/email-modal-wrapper";

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    rut: '',
    cargo: '',
    region: '',
    comuna: '',
    direccion: '',
    tipoContacto: 'cliente',
    tipoConsulta: 'cotizacion',
    prioridad: 'normal',
    mensaje: '',
    presupuesto: '',
    tiempoProyecto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const regionesChile = {
    'Region Metropolitana': ['Santiago', 'Las Condes', 'Providencia', 'Nunoa', 'Maipu', 'La Florida'],
    'Region de Valparaiso': ['Valparaiso', 'Vina del Mar', 'Quilpue', 'Villa Alemana', 'Casablanca'],
    'Region del Biobio': ['Concepcion', 'Talcahuano', 'Chillan', 'Los Angeles', 'Coronel'],
    'Region de la Araucania': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucon', 'Nueva Imperial'],
    'Region de Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas'],
    'Region de Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'],
    'Region de Atacama': ['Copiapo', 'Vallenar', 'Chanaral', 'Diego de Almagro'],
    'Region de Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuna'],
    'Region del Libertador Bernardo O\'Higgins': ['Rancagua', 'San Fernando', 'Pichilemu', 'Santa Cruz'],
    'Region del Maule': ['Talca', 'Curico', 'Linares', 'Cauquenes', 'Constitucion'],
    'Region de Los Rios': ['Valdivia', 'La Union', 'Rio Bueno', 'Panguipulli'],
    'Region de Aysen': ['Coyhaique', 'Puerto Aysen', 'Chile Chico', 'Cochrane'],
    'Region de Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir'],
    'Region de Arica y Parinacota': ['Arica', 'Putre'],
    'Region de Tarapaca': ['Iquique', 'Alto Hospicio', 'Pozo Almonte']
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalido';
    if (!formData.telefono.trim()) newErrors.telefono = 'Telefono es requerido';
    if (!formData.mensaje.trim()) newErrors.mensaje = 'Mensaje es requerido';
    
    if ((formData.tipoContacto === 'proveedor' || formData.tipoContacto === 'distribuidor') && !formData.empresa.trim()) {
      newErrors.empresa = `Empresa es requerida para ${formData.tipoContacto}s`;
    }
    
    if ((formData.tipoContacto === 'proveedor' || formData.tipoContacto === 'distribuidor') && !formData.rut.trim()) {
      newErrors.rut = `RUT de empresa es requerido para ${formData.tipoContacto}s`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const subject = `Nueva consulta - ${formData.nombre}`;
      const emailBody = `Nombre: ${formData.nombre}\nEmail: ${formData.email}\nTelefono: ${formData.telefono}\n\nMensaje:\n${formData.mensaje}`;
      const mailtoUrl = `mailto:contacto@obraexpress.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      navigate.openInNewTab(mailtoUrl);

      setShowSuccess(true);
      setTimeout(() => {
        setFormData({
          nombre: '', email: '', telefono: '', empresa: '', rut: '', cargo: '',
          region: '', comuna: '', direccion: '', tipoContacto: 'cliente',
          tipoConsulta: 'cotizacion', prioridad: 'normal', mensaje: '',
          presupuesto: '', tiempoProyecto: ''
        });
        setShowSuccess(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error('Error en el envio:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <NavbarSimple />
      
      <section className="pt-44 pb-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Contactanos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tu proyecto comienza aqui. Nuestros especialistas estan listos para asesorarte con soluciones profesionales.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Respuesta rapida</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Cotizacion gratuita</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Asesoria especializada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 50%, rgba(255, 255, 255, 0.95) 100%), url('/assets/images/Despachos/imagen_convertida.webp')`
          }}
        ></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100/50 rounded-full blur-xl transform translate-x-12 -translate-y-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">¿Necesitas ayuda?</h2>
                    </div>
                    
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                      Nuestros especialistas estan listos para asesorarte con soluciones profesionales para tu proyecto de construccion.
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">Respuesta garantizada</h3>
                          <p className="text-gray-600 text-sm">Te contactamos en menos de 1 hora</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">Cotizacion sin costo</h3>
                          <p className="text-gray-600 text-sm">Presupuesto detallado y gratuito</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">Asesoria especializada</h3>
                          <p className="text-gray-600 text-sm">Expertos en materiales de construccion</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-2">+500</div>
                    <div className="text-gray-600 text-sm font-medium">Proyectos completados</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900 mb-2">24/7</div>
                    <div className="text-gray-600 text-sm font-medium">Soporte disponible</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">Contacto Rapido</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.594z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">WhatsApp</div>
                        <div className="text-gray-600 text-xs">+56 9 3333 4444</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Email</div>
                        <div className="text-gray-600 text-xs">contacto@obraexpress.cl</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Horario</div>
                        <div className="text-gray-600 text-xs">Lun-Vie 9:00-18:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 sticky top-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Cuentanos tu proyecto</h3>
                    <p className="text-gray-600">Completa el formulario y te contactaremos pronto</p>
                  </div>
                  <div className="relative z-10">
              {showSuccess && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">¡Consulta enviada!</h3>
                      <p className="text-green-700">Se ha abierto tu cliente de email. Responderemos pronto.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 bg-white/95 ${
                        errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 ${
                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 bg-white/95 ${
                        errors.telefono ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+56 9 XXXX XXXX"
                    />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-2">
                      Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 bg-white/95"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripcion del Proyecto/Consulta *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 resize-vertical bg-white/95 ${
                      errors.mensaje ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Describe tu proyecto: tipo de construccion, ubicacion, especificaciones tecnicas, cantidades estimadas, etc."
                  />
                  {errors.mensaje && <p className="text-red-600 text-sm mt-1">{errors.mensaje}</p>}
                </div>

                <div className="text-center pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-10 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Consulta por Email'
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Informacion segura • Se abrira tu cliente de email • Respuesta rapida garantizada
                  </p>
                </div>
              </form>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6 tracking-wide">Canales de contacto</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Elige la forma mas conveniente para contactarnos. Nuestro equipo esta listo para atenderte.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-green-200">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.594z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Respuesta inmediata</p>
                <a 
                  href="https://wa.me/56933334444" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors duration-300"
                >
                  +56 9 3333 4444
                </a>
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Email</h3>
                <p className="text-gray-600 mb-4">Consultas detalladas</p>
                <EmailSelector
                  email="contacto@obraexpress.cl"
                  subject="Consulta desde ObraExpress"
                  body="Hola, me gustaria hacer una consulta sobre sus servicios..."
                  buttonText="contacto@obraexpress.cl"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors duration-300"
                />
              </div>

              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-purple-200">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Telefono</h3>
                <p className="text-gray-600 mb-4">Llamada directa</p>
                <a 
                  href="tel:+56933334444"
                  className="inline-block bg-purple-500 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-600 transition-colors duration-300"
                >
                  +56 9 3333 4444
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot manejado por ConditionalComponents en layout */}
    </main>
  );
}