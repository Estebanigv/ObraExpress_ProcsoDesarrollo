/**
 * Asistente de IA para Admin de ObraExpress
 * Sprint 4: Admin con IA - Tarea 4.3
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/ai-service';
import { ChatMessage, AdminQuery, AdminContext } from '../types/ai.types';

interface AIAssistantProps {
  adminContext: AdminContext;
  onAction?: (action: any) => void;
  className?: string;
}

export default function AIAssistant({ adminContext, onAction, className = '' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mensajes de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `¡Hola ${adminContext.user.name}! 👋 

Soy tu asistente de IA para ObraExpress. Puedo ayudarte con:

📊 **Análisis de datos** - "¿Cuáles son mis productos más vendidos?"
📦 **Gestión de inventario** - "¿Qué productos tienen stock bajo?"
💰 **Análisis financiero** - "¿Cuáles fueron las ventas del mes?"
📈 **Predicciones** - "¿Qué demanda espero la próxima semana?"
🎯 **Recomendaciones** - "¿Cómo puedo optimizar mis precios?"

¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
      setSuggestions([
        'Mostrar productos con stock crítico',
        'Análisis de ventas último mes', 
        'Predicción de demanda próxima semana',
        'Productos más rentables'
      ]);
    }
  }, [adminContext.user.name, messages.length]);

  // Auto-scroll a mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (message: string = inputValue) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Preparar consulta para el servicio de IA
      const query: AdminQuery = {
        query: message,
        context: adminContext,
        expectedResponseType: detectResponseType(message)
      };

      // Procesar con IA
      const response = await aiService.processAdminQuery(query);

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.success ? 
          (response.data?.response || 'He procesado tu consulta.') :
          'Disculpa, tuve problemas procesando tu consulta. ¿Podrías reformularla?',
        timestamp: new Date(),
        attachments: response.data?.attachments || [],
        actions: response.data?.actions || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Actualizar sugerencias si las hay
      if (response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
      }

    } catch (error) {
      console.error('Error AI Assistant:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Disculpa, tuve un problema técnico. ¿Puedes intentar nuevamente?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const handleActionClick = (action: any) => {
    console.log('Ejecutando acción:', action);
    if (onAction) {
      onAction(action);
    }

    // Mensaje de confirmación
    const actionMessage: ChatMessage = {
      id: `action_${Date.now()}`,
      role: 'assistant',
      content: `✅ He ejecutado la acción: ${action.label}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, actionMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 group"
          title="Asistente IA"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Badge AI */}
          <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            IA
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Asistente IA</h3>
              <p className="text-xs text-blue-100">Análisis inteligente</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-4'
                    : 'bg-gray-100 text-gray-800 mr-4'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="block w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl mr-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600 mb-2 font-medium">Sugerencias:</p>
            <div className="space-y-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregúntame sobre tu negocio..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detectar tipo de respuesta esperada basada en el mensaje
 */
function detectResponseType(message: string): 'analytics' | 'recommendation' | 'data' | 'action' {
  const lower = message.toLowerCase();
  
  if (lower.includes('análisis') || lower.includes('análisis') || lower.includes('estadística')) {
    return 'analytics';
  }
  
  if (lower.includes('recomend') || lower.includes('suger') || lower.includes('debería')) {
    return 'recommendation';
  }
  
  if (lower.includes('muestra') || lower.includes('lista') || lower.includes('cuál') || lower.includes('cuánt')) {
    return 'data';
  }
  
  return 'action';
}