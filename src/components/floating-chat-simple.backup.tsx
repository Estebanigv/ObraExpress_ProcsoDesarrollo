"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function FloatingChatSimple() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', phone: '' });
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipOnLoad, setShowTooltipOnLoad] = useState(true);
  const [showTooltipOnScroll, setShowTooltipOnScroll] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  
  const router = useRouter();
  const { user, login } = useAuth();

  // Cerrar chat al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowLogin(false);
        setShowRegister(false);
        setLoginData({ email: '', password: '' });
        setRegisterData({ name: '', email: '', password: '', phone: '' });
        setChatMessages([]);
        setMessage('');
        setIsTyping(false);
        setIsHovered(false); // Reset hover state
        setShowTooltipOnScroll(true); // Mostrar etiqueta de nuevo
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Controlar tooltip basado en scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Si está en el top (menos de 100px de scroll), mostrar tooltip
      if (scrollTop <= 100) {
        setShowTooltipOnScroll(true);
      } else {
        setShowTooltipOnScroll(false);
      }
    };

    // Verificar posición inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    // Limpiar el input primero
    const currentMessage = message.trim();
    setMessage('');
    
    // Agregar mensaje del usuario inmediatamente
    setChatMessages(prev => [...prev, userMessage]);
    
    // Agrandar el chat cuando comience una conversación
    const chatElement = chatRef.current;
    if (chatElement) {
      chatElement.style.width = '600px';
      chatElement.style.maxHeight = '700px';
      // Asegurar que se haga scroll hacia abajo para ver el último mensaje
      setTimeout(() => {
        const messagesContainer = chatElement.querySelector('[data-messages-container]');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }
    
    // Mostrar indicador de que la IA está escribiendo
    setIsTyping(true);
    
    // Intentar conectar al webhook con manejo robusto de errores
    const connectToWebhook = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        
        const response = await fetch('https://n8n.srv865688.hstgr.cloud/webhook-test/60a0fb64-995b-450e-8a36-cfb498269c30', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            user: user ? user.name : 'Invitado',
            timestamp: new Date().toISOString(),
            session_id: `session_${Date.now()}`
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
          success: true,
          message: data.response || data.message || data.text || 'Gracias por tu mensaje. ¿En qué más puedo ayudarte?'
        };
        
      } catch (error) {
        console.warn('Webhook no disponible, usando respuesta local:', error.message);
        
        // Respuestas contextuales inteligentes como fallback
        const messageLower = currentMessage.toLowerCase();
        let fallbackResponse = '';
        
        if (messageLower.includes('hola') || messageLower.includes('buenos') || messageLower.includes('buenas')) {
          fallbackResponse = '¡Hola! 👋 Soy el Especialista de ObraExpress. Para brindarte mejor servicio, ¿podrías decirme tu nombre?';
        } else if (messageLower.includes('mi nombre es') || messageLower.includes('me llamo') || messageLower.includes('soy ')) {
          const nameMatch = currentMessage.match(/(?:mi nombre es|me llamo|soy )([a-záéíóúñü\\s]+)/i);
          const name = nameMatch ? nameMatch[1].trim() : 'cliente';
          fallbackResponse = `¡Perfecto, ${name}! Ahora puedo ayudarte mejor. ¿En qué puedo asistirte hoy? Puedo ayudarte con productos, precios, despachos y asesoría técnica.`;
        } else if (messageLower.includes('producto') || messageLower.includes('material')) {
          fallbackResponse = 'Excelente, puedo ayudarte con nuestros productos de construcción. Tenemos policarbonatos, perfiles, selladores y más. ¿Qué tipo de material necesitas?';
        } else if (messageLower.includes('precio') || messageLower.includes('costo') || messageLower.includes('cotiz')) {
          fallbackResponse = 'Con gusto te ayudo con precios. Para una cotización precisa, necesito saber qué productos te interesan y las cantidades. ¿Podrías darme más detalles?';
        } else {
          fallbackResponse = 'Gracias por tu mensaje. Para ofrecerte una atención personalizada, ¿podrías decirme tu nombre? Después podré ayudarte con productos, precios y asesoría.';
        }
        
        return {
          success: false,
          message: fallbackResponse
        };
      }
    };
    
    const result = await connectToWebhook();
    
    const aiMessage = {
      id: Date.now() + 1,
      text: result.message,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setIsTyping(false);
    setChatMessages(prev => [...prev, aiMessage]);
    
    // Auto scroll después de agregar la respuesta
    setTimeout(() => {
      const chatElement = chatRef.current;
      if (chatElement) {
        const messagesContainer = chatElement.querySelector('[data-messages-container]');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }, 100);
    
    // Código comentado para cuando se reactive el webhook
    /*
    try {
      const response = await fetch('https://n8n.srv865688.hstgr.cloud/webhook-test/60a0fb64-995b-450e-8a36-cfb498269c30', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          user: user ? user.name : 'Invitado',
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response || 'Gracias por tu consulta.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [...prev, aiMessage]);
      }, 1000);
      
    } catch (error) {
      console.error('Error conectando con IA:', error);
      const fallbackMessage = {
        id: Date.now() + 1,
        text: 'Disculpa, estoy experimentando problemas técnicos.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [...prev, fallbackMessage]);
      }, 1000);
    }
    */
  };

  const handleLogin = async () => {
    try {
      await login(loginData.email, loginData.password);
      setShowLogin(false);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      console.error('Error login:', error);
    }
  };

  const handleRegister = async () => {
    try {
      // Aquí implementarías el registro
      console.log('Registrando usuario:', registerData);
      setShowRegister(false);
      setRegisterData({ name: '', email: '', password: '', phone: '' });
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error registro:', error);
    }
  };

  return (
    <>
      {/* Botón flotante con tooltip */}
      {!isOpen && (
        <div className="fixed bottom-12 right-8 z-50">
          {/* Tooltip - visible solo cuando no se ha hecho scroll */}
          {showTooltipOnScroll && (
            <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 whitespace-nowrap text-sm font-medium">
                ¡Pregúntame lo que necesites!
                <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-white"></div>
                <div className="absolute top-1/2 left-full transform -translate-y-1/2 translate-x-[-1px] w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-200"></div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setIsOpen(true);
              setShowTooltipOnLoad(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>
            </svg>
          </button>
        </div>
      )}

      {/* Fondo difuso que cubre TODO incluyendo nav y headers */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-all duration-300" 
          style={{ zIndex: 9998 }}
        />
      )}
      
      {/* Ventana de chat */}
      {isOpen && (
        <div 
          ref={chatRef} 
          className="fixed bottom-16 right-6 bg-white rounded-3xl shadow-2xl border-2 border-gray-300 w-[520px] max-h-[720px] transition-all duration-300 overflow-hidden ring-4 ring-gray-900/10"
          style={{ zIndex: 9999 }}
        >
          {/* Header elegante - colores oscuros profesionales */}
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-t-3xl px-5 py-5 flex items-center justify-between border-b border-slate-600/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-600/40 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-slate-500/30 shadow-lg">
                <svg className="w-6 h-6 text-slate-100 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-base drop-shadow-sm">Especialista ObraExpress</h3>
                <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm"></span>
                  En línea • Asistente IA Profesional
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Botón de expandir */}
              <button 
                onClick={() => {
                  const chatElement = chatRef.current;
                  if (chatElement) {
                    if (chatElement.classList.contains('w-[600px]')) {
                      chatElement.classList.remove('w-[600px]', 'max-h-[800px]');
                      chatElement.classList.add('w-[520px]', 'max-h-[720px]');
                    } else {
                      chatElement.classList.remove('w-[520px]', 'max-h-[720px]');
                      chatElement.classList.add('w-[600px]', 'max-h-[800px]');
                    }
                  }
                }}
                className="w-9 h-9 bg-slate-600/50 hover:bg-slate-500/60 text-slate-200 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
                title="Expandir"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              {/* Botón de cerrar */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setShowLogin(false);
                  setShowRegister(false);
                  setLoginData({ email: '', password: '' });
                  setRegisterData({ name: '', email: '', password: '', phone: '' });
                  setChatMessages([]);
                  setMessage('');
                  setIsTyping(false);
                  setIsHovered(false);
                  setShowTooltipOnScroll(true);
                }}
                className="w-9 h-9 bg-slate-600/50 hover:bg-red-500/80 text-slate-200 hover:text-white rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
                title="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido principal - diseño elegante */}
          <div className="p-6">
            {!showLogin && !showRegister && chatMessages.length === 0 ? (
              <div className="space-y-5">
                {/* Mensaje de bienvenida del bot - mejorado */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-slate-500/20">
                      <svg className="w-5 h-5 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">
                        ¡Hola! 👋 Soy tu <span className="font-semibold text-slate-800">Especialista de ObraExpress</span>. 
                        Estoy aquí para ayudarte con productos, precios, despachos y asesoría técnica.
                      </p>
                      <p className="text-xs text-slate-600 mb-3">
                        Puedes <span className="font-semibold">escribirme directamente</span> o crear una cuenta para una experiencia personalizada.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Iconos de acceso rápido - diseño elegante */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-sm text-slate-600 text-center mb-4 font-medium">Accesos rápidos</p>
                  <div className="flex justify-center gap-5 mb-4">
                    {/* Productos */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          const productMessage = 'Quiero ver información sobre productos disponibles';
                          setMessage(productMessage);
                          handleSendMessage();
                        }}
                        className="w-14 h-14 bg-slate-100 hover:bg-slate-700 text-slate-600 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-600"
                      >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </button>
                      <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg">Productos</div>
                      </div>
                    </div>
                    
                    {/* Despacho con icono de auto */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          const deliveryMessage = '¿Cuáles son las opciones de despacho y costos?';
                          setMessage(deliveryMessage);
                          handleSendMessage();
                        }}
                        className="w-14 h-14 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg border border-emerald-200 hover:border-emerald-600"
                      >
                        <svg className="w-7 h-7" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                          <path d="M18.92 2.01C18.72 1.42 18.16 1 17.5 1h-11C5.84 1 5.28 1.42 5.08 2.01L3 8v10c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-1h8v1c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2V8l-1.92-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11V8l1.5-4.5h11L19 8v3H5z"/>
                        </svg>
                      </button>
                      <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg">Despacho</div>
                      </div>
                    </div>
                    
                    {/* Contacto */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          const contactMessage = 'Necesito información de contacto y asesoría personalizada';
                          setMessage(contactMessage);
                          handleSendMessage();
                        }}
                        className="w-14 h-14 bg-amber-100 hover:bg-amber-600 text-amber-700 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg border border-amber-200 hover:border-amber-600"
                      >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg">Contacto</div>
                      </div>
                    </div>
                    
                    {/* Cotización */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          const quoteMessage = 'Quiero una cotización para mi proyecto de construcción';
                          setMessage(quoteMessage);
                          handleSendMessage();
                        }}
                        className="w-14 h-14 bg-violet-100 hover:bg-violet-600 text-violet-700 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg border border-violet-200 hover:border-violet-600"
                      >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg">Cotización</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botones de registro/login - diseño elegante */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRegister(true)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Crear cuenta
                  </button>
                  
                  <button
                    onClick={() => setShowLogin(true)}
                    className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Iniciar sesión
                  </button>
                </div>
                
                {/* Input de pregunta elegante - siempre visible */}
                <div className="pt-3 border-t-2 border-slate-200">
                  <p className="text-sm text-slate-600 mb-3 text-center font-medium">O escríbeme directamente:</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="¿En qué puedo ayudarte hoy?"
                      className="w-full p-4 pr-14 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all duration-200 bg-white focus:bg-slate-50 shadow-sm focus:shadow-md"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : chatMessages.length > 0 || showLogin || showRegister ? (
              <div className="space-y-4">
                {/* Mensaje de bienvenida para usuario logueado */}
                {user && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-800 font-medium">¡Bienvenido, {user.name}!</p>
                    <p className="text-xs text-green-600 mt-1">Estoy aquí para ayudarte con tus proyectos</p>
                  </div>
                )}
                
                {/* Mensajes del chat - diseño elegante */}
                {chatMessages.length > 0 && (
                  <div data-messages-container className="max-h-80 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-slate-200 shadow-inner">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 shadow-lg border border-slate-600' 
                            : 'bg-white text-slate-800 border-2 border-slate-200 shadow-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Indicador de typing - elegante */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-5 py-3 shadow-md border-2 border-slate-200">
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-slate-600 mr-3 font-medium">Escribiendo</span>
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Input de mensaje elegante - siempre visible en chat activo */}
                {chatMessages.length > 0 && (
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 p-4 shadow-lg">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 p-4 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-all duration-200 bg-white focus:bg-slate-50 shadow-sm focus:shadow-md"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 disabled:from-slate-300 disabled:to-slate-400 text-white p-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            
            {/* Formulario de Login */}
            {showLogin && !user && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Iniciar Sesión</h3>
                  <p className="text-sm text-gray-600">Accede a tu cuenta de ObraExpress</p>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="space-y-2">
                    <button
                      onClick={handleLogin}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => setShowLogin(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-xl text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Formulario de Registro */}
            {showRegister && !user && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Crear Cuenta</h3>
                  <p className="text-sm text-gray-600">Regístrate en ObraExpress para comenzar</p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono WhatsApp"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="space-y-2">
                    <button
                      onClick={handleRegister}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Crear Cuenta
                    </button>
                    <button
                      onClick={() => setShowRegister(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-xl text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
          
        </div>
      )}
      
      {/* Botón de minimizar elegante - esquina inferior derecha */}
      {isOpen && (
        <button
          onClick={() => {
            setIsOpen(false);
            setShowLogin(false);
            setShowRegister(false);
            setLoginData({ email: '', password: '' });
            setRegisterData({ name: '', email: '', password: '', phone: '' });
            setChatMessages([]);
            setMessage('');
            setIsTyping(false);
            setIsHovered(false);
            setShowTooltipOnScroll(true);
          }}
          className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl border-2 border-slate-600/50 backdrop-blur-sm ring-4 ring-slate-900/20"
          style={{ zIndex: 10000 }}
          aria-label="Minimizar chat"
        >
          <svg
            className="w-7 h-7 text-slate-100 drop-shadow-md"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </>
  );
}

export default FloatingChatSimple;