"use client";

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Tipos para el chat
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  sessionId: string;
  userName: string;
  error: string | null;
}

// Reducer para manejar el estado del chat
function chatReducer(state: ChatState, action: any): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return { ...state, isOpen: true };
    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isTyping: false, isLoading: false };
    case 'LOAD_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    default:
      return state;
  }
}

function FloatingChatSimple() {
  // Estado principal del chat usando useReducer
  const [chatState, dispatch] = useReducer(chatReducer, {
    isOpen: false,
    messages: [],
    isTyping: false,
    isLoading: false,
    sessionId: '',
    userName: '',
    error: null
  });

  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipOnScroll, setShowTooltipOnScroll] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const { user } = useAuth();

  // Generar ID de sesión único
  useEffect(() => {
    const savedSessionId = localStorage.getItem('obraexpress_chat_session');
    if (savedSessionId) {
      dispatch({ type: 'SET_SESSION_ID', payload: savedSessionId });
      // Cargar mensajes guardados si existen
      loadChatHistory(savedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: 'SET_SESSION_ID', payload: newSessionId });
      localStorage.setItem('obraexpress_chat_session', newSessionId);
    }
  }, []);

  // Cargar historial del chat desde localStorage (simplificado)
  const loadChatHistory = async (sessionId: string) => {
    try {
      const savedMessages = localStorage.getItem(`obraexpress_chat_messages_${sessionId}`);
      if (savedMessages) {
        const messages = JSON.parse(savedMessages).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // Asegurar que timestamp sea Date
        }));
        dispatch({ type: 'LOAD_MESSAGES', payload: messages });
        console.log(`📁 Cargados ${messages.length} mensajes del historial`);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      // Limpiar localStorage corrupto
      localStorage.removeItem(`obraexpress_chat_messages_${sessionId}`);
    }
  };

  // Guardar mensajes en localStorage
  const saveToLocalStorage = (messages: ChatMessage[]) => {
    if (chatState.sessionId) {
      localStorage.setItem(`obraexpress_chat_messages_${chatState.sessionId}`, JSON.stringify(messages));
    }
  };

  // Auto scroll a los últimos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatState.messages]);

  // Controlar tooltip basado en scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop <= 100) {
        setShowTooltipOnScroll(true);
      } else {
        setShowTooltipOnScroll(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Cerrar chat al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        dispatch({ type: 'CLOSE_CHAT' });
        setIsHovered(false);
        setShowTooltipOnScroll(true);
      }
    };

    if (chatState.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [chatState.isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim() || chatState.isLoading) return;
    
    const currentMessage = message.trim();
    setMessage('');

    // Crear mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    // Agregar mensaje del usuario inmediatamente
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });
    dispatch({ type: 'SET_LOADING', payload: true });

    // NUEVO: Sistema híbrido - Webhook principal + API fallback
    const tryWebhookFirst = async () => {
      try {
        console.log('🔄 Intentando webhook principal (n8n)...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        
        const webhookResponse = await fetch('https://n8n.srv865688.hstgr.cloud/webhook-test/60a0fb64-995b-450e-8a36-cfb498269c30', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            user_name: chatState.userName || user?.name || 'Invitado',
            session_id: chatState.sessionId,
            timestamp: new Date().toISOString(),
            is_first_message: isFirstMessage && chatState.messages.length === 0
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!webhookResponse.ok) {
          throw new Error(`Webhook HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`);
        }
        
        const webhookData = await webhookResponse.json();
        console.log('✅ Webhook respondió exitosamente');
        
        return {
          success: true,
          response: webhookData.response || webhookData.message || webhookData.text || 'Gracias por tu consulta.',
          source: 'webhook',
          intentions: extractIntentionsFromWebhook(webhookData.response || webhookData.message || '')
        };
        
      } catch (error) {
        console.warn('⚠️ Webhook falló, usando API local:', error.message);
        
        // Fallback a nuestra API local
        try {
          console.log('🔄 Fallback: usando API local...');
          
          const apiResponse = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: chatState.sessionId,
              message: currentMessage,
              userName: chatState.userName || user?.name || '',
              userEmail: user?.email || '',
              userPhone: user?.phone || '',
              isFirstMessage: isFirstMessage && chatState.messages.length === 0
            })
          });

          if (!apiResponse.ok) {
            throw new Error(`API local HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
          }

          const apiData = await apiResponse.json();
          console.log('✅ API local respondió exitosamente');

          if (apiData.success) {
            return {
              success: true,
              response: apiData.response,
              source: 'api',
              intentions: apiData.intentions
            };
          } else {
            throw new Error(apiData.error || 'Error en API local');
          }
          
        } catch (apiError) {
          console.error('❌ API local también falló:', apiError.message);
          
          // Último fallback: respuestas inteligentes offline
          return {
            success: false,
            response: generateOfflineFallback(currentMessage, chatState.userName || user?.name),
            source: 'offline',
            intentions: null
          };
        }
      }
    };

    try {
      const result = await tryWebhookFirst();
      
      // Crear mensaje del asistente
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        text: result.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

      // Guardar siempre en localStorage (persistencia principal)
      const updatedMessages = [...chatState.messages, userMessage, assistantMessage];
      saveToLocalStorage(updatedMessages);
      console.log('💾 Conversación guardada localmente');

      // Detectar nombre de usuario en el primer mensaje
      if (isFirstMessage && !chatState.userName) {
        const nameMatch = currentMessage.match(/(?:mi nombre es|me llamo|soy )([a-záéíóúñü\s]+)/i);
        if (nameMatch) {
          const detectedName = nameMatch[1].trim();
          dispatch({ type: 'SET_USER_NAME', payload: detectedName });
        }
      }

      // Procesar intenciones especiales
      if (result.intentions) {
        handleIntentions(result.intentions);
      }

      setIsFirstMessage(false);
      
      // Log de éxito con fuente
      console.log(`💬 Respuesta generada desde: ${result.source}`);

    } catch (error) {
      console.error('💥 Error crítico en chatbot:', error);
      
      // Mensaje de error para el usuario
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        text: 'Disculpa, estoy experimentando problemas técnicos. Por favor intenta de nuevo o contáctanos por WhatsApp.',
        sender: 'assistant',
        timestamp: new Date()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      dispatch({ type: 'SET_ERROR', payload: 'Error de sistema' });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Función para extraer intenciones del webhook (formato original)
  const extractIntentionsFromWebhook = (response: string) => {
    if (!response) return null;
    
    return {
      redirectToProducts: response.includes('[ACTION:REDIRECT_PRODUCTS]'),
      openWhatsApp: response.includes('[ACTION:OPEN_WHATSAPP]'),
      showProduct: response.match(/\[ACTION:SHOW_PRODUCT:([^\]]+)\]/)?.[1] || null,
      openCart: response.includes('[ACTION:OPEN_CART]'),
      openShippingCalculator: response.includes('[ACTION:OPEN_SHIPPING_CALCULATOR]')
    };
  };
  
  // Función para generar respuesta offline inteligente
  const generateOfflineFallback = (message: string, userName?: string) => {
    const messageLower = message.toLowerCase();
    const greeting = userName ? `${userName}` : 'cliente';
    
    if (messageLower.includes('hola') || messageLower.includes('buenos') || messageLower.includes('buenas')) {
      return `¡Hola${userName ? ` ${userName}` : ''}! 👋 Soy María Elena de ObraExpress. Estoy aquí para ayudarte con policarbonatos y materiales de construcción. ¿En qué puedo asistirte?`;
    } else if (messageLower.includes('mi nombre es') || messageLower.includes('me llamo')) {
      const nameMatch = message.match(/(?:mi nombre es|me llamo|soy )([a-záéíóúñü\s]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : 'cliente';
      return `¡Perfecto, ${name}! Ahora puedo ayudarte mejor. Tenemos policarbonato alveolar, compacto y ondulado, además de todos los accesorios. ¿Qué necesitas para tu proyecto?`;
    } else if (messageLower.includes('policarbonato') || messageLower.includes('material')) {
      return `Excelente, ${greeting}. Tenemos policarbonato alveolar (6mm, 10mm, 16mm), compacto (2-10mm) y ondulado. Precios desde $8.500/m². ¿Qué espesor necesitas y para qué uso? [ACTION:REDIRECT_PRODUCTS]`;
    } else if (messageLower.includes('precio') || messageLower.includes('costo') || messageLower.includes('cotiz')) {
      return `${greeting}, nuestros precios más populares:\n\n• Policarbonato 6mm: $8.500/m²\n• Policarbonato 10mm: $12.500/m²\n• Policarbonato 16mm: $18.500/m²\n\n¿Qué medidas necesitas para calcular el total? [ACTION:REDIRECT_PRODUCTS]`;
    } else if (messageLower.includes('envío') || messageLower.includes('despacho')) {
      return `${greeting}, hacemos envíos a todo Chile:\n\n• Santiago: 24-48 hrs\n• Regiones: 3-5 días\n• GRATIS sobre $150.000\n\n¿A qué comuna necesitas el envío?`;
    } else if (messageLower.includes('contacto') || messageLower.includes('whatsapp') || messageLower.includes('teléfono')) {
      return `${greeting}, puedes contactarnos:\n\n📞 WhatsApp: +56 9 xxxx xxxx\n📧 Email: ventas@obraexpress.cl\n🕒 Lun-Vie 9:00-18:00\n\n¿Prefieres que te contacte un asesor? [ACTION:OPEN_WHATSAPP]`;
    } else {
      return `Gracias por escribir, ${greeting}. Estoy aquí para ayudarte con policarbonatos y materiales de construcción. Puedo ayudarte con:\n\n• Productos y especificaciones\n• Precios y cotizaciones\n• Envíos y despachos\n• Asesoría técnica\n\n¿En qué puedo asistirte específicamente?`;
    }
  };
  
  // Función para limpiar sesiones antiguas (opcional)
  const cleanOldSessions = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('obraexpress_chat_messages_')
      );
      
      // Mantener solo las últimas 5 sesiones
      if (keys.length > 5) {
        keys.slice(0, -5).forEach(key => localStorage.removeItem(key));
        console.log('🧹 Limpiadas sesiones antiguas');
      }
    } catch (error) {
      console.warn('Error limpiando sesiones:', error.message);
    }
  };

  const handleIntentions = (intentions: any) => {
    if (!intentions) return;
    
    setTimeout(() => {
      if (intentions.redirectToProducts) {
        router.push('/productos');
      } else if (intentions.openWhatsApp) {
        window.open('https://wa.me/56912345678', '_blank');
      } else if (intentions.showProduct && intentions.showProduct !== 'null') {
        router.push(`/productos/${intentions.showProduct}`);
      } else if (intentions.openCart) {
        const cartEvent = new CustomEvent('openFloatingCart');
        window.dispatchEvent(cartEvent);
      } else if (intentions.openShippingCalculator) {
        // Abrir calculadora de envío
        const calcEvent = new CustomEvent('openShippingCalculator');
        window.dispatchEvent(calcEvent);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante con tooltip */}
      {!chatState.isOpen && (
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
            onClick={() => dispatch({ type: 'OPEN_CHAT' })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
            aria-label="Abrir chat de asistencia"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>
            </svg>
          </button>
        </div>
      )}

      {/* Fondo difuso */}
      {chatState.isOpen && (
        <div 
          className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-all duration-300" 
          style={{ zIndex: 9998 }}
        />
      )}
      
      {/* Ventana de chat */}
      {chatState.isOpen && (
        <div 
          ref={chatRef} 
          className="fixed bottom-16 right-6 bg-white rounded-3xl shadow-2xl border-2 border-gray-300 w-[520px] max-h-[720px] transition-all duration-300 overflow-hidden ring-4 ring-gray-900/10"
          style={{ zIndex: 9999 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-t-3xl px-5 py-4 flex items-center justify-between border-b border-slate-600/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-600/40 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-slate-500/30 shadow-lg">
                <svg className="w-6 h-6 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-base">Especialista ObraExpress</h3>
                <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  En línea • Asistente IA Profesional
                </p>
              </div>
            </div>
            
            <button
              onClick={() => dispatch({ type: 'CLOSE_CHAT' })}
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-600/50 p-2 rounded-full transition-all duration-200"
              aria-label="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" data-messages-container>
              {chatState.messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm">¡Hola! Soy tu especialista en ObraExpress.</p>
                  <p className="text-xs mt-1">Pregúntame sobre productos, precios o lo que necesites.</p>
                </div>
              )}

              {chatState.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString('es-CL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {chatState.isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="border-t border-gray-200 p-4">
              {chatState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                  <p className="text-red-600 text-xs">{chatState.error}</p>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={1}
                    maxLength={500}
                    disabled={chatState.isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || chatState.isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors duration-200"
                  aria-label="Enviar mensaje"
                >
                  {chatState.isLoading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Sesión: {chatState.sessionId.slice(-8)}</span>
                <span>{message.length}/500</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChatSimple;