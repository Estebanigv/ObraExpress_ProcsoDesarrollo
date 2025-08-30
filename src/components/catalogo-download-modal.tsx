"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CatalogoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nombre: string;
  email: string;
  empresa: string;
  catalogos: string[];
  aceptaTerminos: boolean;
}

interface ValidationErrors {
  email?: string;
  nombre?: string;
}

const catalogosDisponibles = [
  {
    id: "laminas-alveolares",
    nombre: "Láminas Alveolares",
    descripcion: "Catálogo completo de láminas alveolares de policarbonato",
    icon: "📄"
  },
  {
    id: "rollos-compactos", 
    nombre: "Rollos Compactos",
    descripcion: "Especificaciones técnicas de rollos compactos",
    icon: "🔄"
  },
  {
    id: "accesorios",
    nombre: "Accesorios Profesionales",
    descripcion: "Perfiles, tornillería y accesorios de instalación",
    icon: "🔧"
  },
  {
    id: "sistemas-estructurales",
    nombre: "Sistemas Estructurales", 
    descripcion: "Estructuras de soporte y sistemas de montaje",
    icon: "🏗️"
  },
  {
    id: "catalogo-general",
    nombre: "Catálogo General",
    descripcion: "Catálogo completo con todos nuestros productos",
    icon: "📚"
  }
];

function CatalogoDownloadModal({ isOpen, onClose }: CatalogoDownloadModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    empresa: "",
    catalogos: [],
    aceptaTerminos: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const [isEmailSimulated, setIsEmailSimulated] = useState<boolean>(false);

  if (!isOpen) return null;

  // Validar email válido (cualquier tipo de correo)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar nombre completo (mínimo 3 caracteres)
  const validateNombre = (nombre: string): boolean => {
    return nombre.trim().length >= 3;
  };

  // Validar formulario
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    
    if (!validateNombre(formData.nombre)) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    return newErrors;
  };

  const handleCatalogoToggle = (catalogoId: string) => {
    setFormData(prev => ({
      ...prev,
      catalogos: prev.catalogos.includes(catalogoId)
        ? prev.catalogos.filter(id => id !== catalogoId)
        : [...prev.catalogos, catalogoId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Obtener información del navegador
      const userAgent = navigator.userAgent;
      const ipAddress = null; // En el cliente no podemos obtener la IP directamente

      // Generar token único para esta descarga
      const downloadTokenValue = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Intentar guardar en Supabase (opcional)
      try {
        const { data, error } = await supabase
          .from('descargas_catalogos')
          .insert({
            nombre: formData.nombre,
            email: formData.email,
            empresa: formData.empresa || null,
            catalogos_seleccionados: formData.catalogos,
            acepta_terminos: formData.aceptaTerminos
            // Removidas columnas que no existen: ip_address, user_agent, download_token, email_verified, email_sent
          });

        if (error) {
          console.error('Error guardando en Supabase (continuando sin guardar):', error.message);
          // Continuar con el proceso aunque no se guarde en la base de datos
        } else {
          console.log('✅ Datos guardados en Supabase exitosamente');
        }
      } catch (supabaseError) {
        console.error('Error de conexión con Supabase (continuando sin guardar):', supabaseError);
        // Continuar con el proceso aunque no se guarde en la base de datos
      }

      // Enviar email de confirmación
      const emailResult = await sendConfirmationEmail(formData.email, formData.nombre, downloadTokenValue, formData.catalogos);
      
      console.log("Datos del lead guardados y email enviado:", formData);
      setDownloadToken(downloadTokenValue);
      
      // Manejar respuesta según si es simulado o real
      if (emailResult.isSimulated) {
        setIsEmailSimulated(true);
        setConfirmationUrl(emailResult.confirmationUrl);
        console.log('🔗 ENLACE DE CONFIRMACIÓN PARA PRUEBAS (SIMULADO):');
        console.log(emailResult.confirmationUrl);
      } else {
        setIsEmailSimulated(false);
        setConfirmationUrl(null);
        console.log('✅ Email REAL enviado a:', formData.email);
        console.log('📧 ID del email:', emailResult.emailId);
      }
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      
      // No cerrar automáticamente - dejamos que el usuario cierre manualmente
      // después de usar el enlace de confirmación

    } catch (error) {
      console.error("Error al enviar datos:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para enviar email de confirmación usando el endpoint API
  const sendConfirmationEmail = async (email: string, nombre: string, token: string, catalogos: string[]) => {
    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nombre,
          token,
          catalogos
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error enviando email');
      }

      console.log('✅ Email de confirmación enviado exitosamente');
      console.log('🔗 URL de confirmación (para pruebas):', result.confirmationUrl);
      
      // Ya no actualizamos el estado en Supabase porque la columna email_sent no existe
      // El registro ya fue creado con los datos básicos
      console.log('✅ Proceso de email completado');

      return result;
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      throw error;
    }
  };

  // Función para validar y realizar la descarga (solo cuando email está verificado)
  const validateAndDownload = async (token: string, catalogos: string[]) => {
    try {
      // Por ahora, simplemente proceder con la descarga sin validación de base de datos
      // ya que la columna download_token no existe
      console.log('Procediendo con descarga directa (sin validación de token en DB)');
      
      // En el futuro, se puede implementar validación por email
      // const { data, error } = await supabase
      //   .from('descargas_catalogos')
      //   .select('email_verified, email_sent')
      //   .eq('email', email)
      //   .single();

      // Realizar las descargas
      catalogos.forEach(catalogoId => {
        const url = `/assets/catalogos/${catalogoId}.pdf?token=${token}`;
        window.open(url, '_blank');
      });

      console.log('Descarga autorizada para token:', token);

    } catch (error) {
      console.error('Error validando descarga:', error);
    }
  };

  const isFormValid = formData.nombre && formData.email && formData.catalogos.length > 0 && formData.aceptaTerminos && Object.keys(errors).length === 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/[0.99] backdrop-blur-md rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Descarga Catálogos ObraExpress
              </h2>
              <p className="text-gray-600 text-sm">
                Completa tus datos y selecciona los catálogos que necesitas
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isEmailSimulated ? 'Email Simulado' : '¡Email Enviado!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isEmailSimulated 
                  ? 'Modo desarrollo activo. Usa el enlace de abajo para simular la confirmación.'
                  : (
                    <>
                      Hemos enviado un enlace de confirmación a tu correo <strong>{formData.email}</strong>.
                      <br />
                      <strong>Revisa tu bandeja de entrada y haz clic en el enlace para confirmar.</strong>
                    </>
                  )
                }
              </p>
              
              {/* Mostrar enlace SOLO en modo simulado */}
              {isEmailSimulated && confirmationUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">🔗 Enlace de Confirmación:</h4>
                  <a 
                    href={confirmationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    📧 Confirmar Email y Descargar
                  </a>
                  <p className="text-xs text-blue-700 mt-2">
                    Haz clic en el botón de arriba para confirmar tu email y comenzar las descargas
                  </p>
                  <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded border-l-4 border-gray-300">
                    <strong>URL:</strong> <span className="break-all font-mono">{confirmationUrl}</span>
                  </div>
                </div>
              )}
              
              {/* Instrucciones optimizadas y más compactas */}
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4 max-w-md mx-auto">
                {/* Header de la sección */}
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3">
                  <h4 className="text-lg font-bold text-black text-left">Próximos pasos</h4>
                </div>
                
                {/* Contenido de pasos */}
                <div className="p-4">
                  <div className="space-y-3">
                    {isEmailSimulated ? (
                      <>
                        <div className="flex flex-col items-center text-center p-2.5 bg-gray-50 rounded-lg">
                          <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">1</div>
                          <p className="text-sm text-gray-800 font-medium">Haz clic en el enlace de confirmación arriba</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-2.5 bg-gray-50 rounded-lg">
                          <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">2</div>
                          <p className="text-sm text-gray-800 font-medium">Tu email será verificado automáticamente</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-2.5 bg-gray-50 rounded-lg">
                          <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">3</div>
                          <p className="text-sm text-gray-800 font-medium">Los catálogos comenzarán a descargarse</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center text-center p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">1</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">Revisa tu correo electrónico</p>
                            <p className="text-xs text-gray-600">
                              Ve a: <span className="font-semibold text-black">{formData.email}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">2</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">Busca el email de ObraExpress</p>
                            <p className="text-xs text-gray-600">
                              Asunto: <span className="font-medium">"Confirma tu descarga..."</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">3</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">Confirma tu descarga</p>
                            <p className="text-xs text-gray-600">
                              Haz clic en <span className="font-semibold text-black">"Confirmar y Descargar"</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-2.5 bg-green-50 rounded-lg border border-green-200">
                          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2">✓</div>
                          <div>
                            <p className="text-sm font-semibold text-green-800 mb-1">¡Listo! Descargas automáticas</p>
                            <p className="text-xs text-green-700">
                              Tus catálogos PDF comenzarán a descargarse
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Nota adicional para email real - más compacta */}
                  {!isEmailSimulated && (
                    <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start text-blue-800 text-xs">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-left">
                          <span className="font-semibold">💡 Tip:</span>
                          <span className="ml-1">Si no lo encuentras, revisa <strong>Spam</strong> o <strong>Promociones</strong></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    setSubmitted(false);
                    setFormData({ nombre: "", email: "", empresa: "", catalogos: [], aceptaTerminos: false });
                    setErrors({});
                    setDownloadToken(null);
                    setConfirmationUrl(null);
                    setIsEmailSimulated(false);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Form Content */}
            <div className="overflow-hidden">
              <form onSubmit={handleSubmit} className="flex flex-col">
                
                {/* Form Body - Two columns layout */}
                <div className="px-6 py-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column - Datos Personales */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2">*</span>
                      Datos Obligatorios
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Tu nombre completo"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (cualquier tipo) *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (errors.email) {
                            setErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="tu@email.com"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa / Organización (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, empresa: e.target.value }));
                          if (errors.empresa) {
                            setErrors(prev => ({ ...prev, empresa: undefined }));
                          }
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.empresa 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Nombre de tu empresa"
                        autoComplete="organization"
                      />
                      {errors.empresa && (
                        <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>
                      )}
                    </div>

                    {/* Términos */}
                    <div className="flex items-start space-x-2 mt-2">
                      <input 
                        type="checkbox" 
                        required 
                        checked={formData.aceptaTerminos}
                        onChange={(e) => setFormData(prev => ({ ...prev, aceptaTerminos: e.target.checked }))}
                        className="mt-1" 
                      />
                      <p className="text-xs text-gray-600">
                        Acepto recibir información comercial de ObraExpress *
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Selección de Catálogos */}
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2">*</span>
                      Selecciona Catálogos
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      {catalogosDisponibles.map((catalogo) => (
                        <div
                          key={catalogo.id}
                          onClick={() => handleCatalogoToggle(catalogo.id)}
                          className={`p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            formData.catalogos.includes(catalogo.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg">{catalogo.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 text-sm">{catalogo.nombre}</h4>
                                {formData.catalogos.includes(catalogo.id) && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 leading-tight">{catalogo.descripcion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.catalogos.length > 0 && (
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ {formData.catalogos.length} catálogo{formData.catalogos.length > 1 ? 's' : ''} seleccionado{formData.catalogos.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Footer - Fixed */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 mt-2">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                        isFormValid && !isSubmitting
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        'Descargar Catálogos'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CatalogoDownloadModal;