"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { AIRecommendation, AIRecommendationResponse } from '@/services/ai-recommendations';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  recommendations?: AIRecommendation[];
  confidence?: number;
}

export default function AIProductAssistant() {
  // TEMPORALMENTE DESHABILITADO - Usando SmartGuide en su lugar
  return null;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, addItem } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now().toString(),
        type: 'ai',
        content: '¡Hola! Soy tu asistente inteligente de ObraExpress. Te ayudo a encontrar los productos perfectos para tu proyecto. ¿En qué puedo ayudarte?',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  // Sanitizar entrada del usuario
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>\"'&]/g, '') // Prevenir XSS
      .trim()
      .slice(0, 500); // Limitar longitud
  };

  // Enviar mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanInput = sanitizeInput(inputValue);
    if (!cleanInput) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: cleanInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Llamar a la API de recomendaciones
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          consulta: cleanInput,
          productos_en_carrito: state.items.map(item => ({
            nombre: item.nombre,
            categoria: item.categoria,
            cantidad: item.cantidad
          })),
          experiencia_usuario: 'principiante' // Esto podría venir del perfil del usuario
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error del servidor');
      }

      const data: { success: boolean; data: AIRecommendationResponse } = await response.json();
      
      if (!data.success) {
        throw new Error('Error en la respuesta del servidor');
      }

      // Agregar respuesta de IA
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.data.pregunta_seguimiento || 'Aquí están mis recomendaciones para tu proyecto:',
        timestamp: new Date(),
        recommendations: data.data.recomendaciones,
        confidence: data.data.confianza_global
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Error en AI Assistant:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Lo siento, hubo un problema: ${error.message}. ¿Podrías intentar de nuevo o ser más específico sobre lo que necesitas?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar producto recomendado al carrito
  const handleAddRecommendation = (recommendation: AIRecommendation) => {
    // Esta función se conectaría con tu sistema de productos real
    console.log('Agregando recomendación al carrito:', recommendation);
    
    // Por ahora, mostrar una confirmación
    alert(`Funcionalidad en desarrollo: Agregar ${recommendation.producto} al carrito`);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl z-50"
        aria-label="Asistente IA"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          AI
        </div>
      </button>

      {/* Modal del chat */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Asistente Inteligente ObraExpress</h3>
                  <p className="text-sm text-blue-100">Especialista en productos de policarbonato</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Mostrar recomendaciones */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.recommendations.map((rec, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg shadow-sm border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{rec.producto}</h4>
                                <p className="text-xs text-gray-600 mt-1">{rec.razon}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  <strong>Cantidad:</strong> {rec.cantidad_sugerida}
                                </p>
                                {rec.consideraciones && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    <strong>Importante:</strong> {rec.consideraciones}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleAddRecommendation(rec)}
                                className="ml-2 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors"
                              >
                                Ver
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Mostrar nivel de confianza */}
                    {message.confidence && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Confianza:</span>
                        <div className="bg-gray-200 rounded-full h-2 flex-1">
                          <div
                            className={`h-2 rounded-full ${
                              message.confidence > 80 ? 'bg-green-500' :
                              message.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${message.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{message.confidence}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Indicador de carga */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Área de entrada */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              {error && (
                <div className="mb-2 p-2 bg-red-100 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregunta sobre productos de policarbonato..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}