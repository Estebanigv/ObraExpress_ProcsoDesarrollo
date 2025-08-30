"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const router = useRouter();
  const { user, login, register } = useAuth();
  const pathname = usePathname();

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isNearTop = scrollTop < 100;
      setIsAtTop(isNearTop);
      
      if (scrollTop > 50) {
        setShowWelcome(false);
      } else if (scrollTop < 20 && pathname === '/') {
        setShowWelcome(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Inicializar chat con mensaje de bienvenida
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: Date.now(),
        text: "¡Hola! Soy el Asistente ObraExpress. ¿En qué puedo ayudarte hoy?",
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [chatMessages.length]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Gracias por tu mensaje. Un ejecutivo te contactará pronto para ayudarte con tu consulta.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    }, 2000);
  };

  const handleLogin = async () => {
    try {
      await login(loginData.email, loginData.password);
      setShowLoginForm(false);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      await register(registerData.nombre, registerData.email, registerData.password);
      setShowRegisterForm(false);
      setRegisterData({ nombre: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  const handleProducts = () => router.push('/productos');
  const handleContact = () => router.push('/contacto');
  const handleCalendar = () => {
    // Abrir calendario o modal de citas
    console.log('Abrir calendario');
  };

  return (
    <>
      {/* Mensaje de bienvenida flotante */}
      {!isOpen && (showWelcome || isHovering) && pathname === '/' && (
        <div className="fixed bottom-32 right-8 z-[9999] pointer-events-none">
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-4 shadow-xl max-w-xs relative">
            <div className={`transition-all duration-300 ease-in-out ${
              isHovering ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}>
              <p className="text-sm font-semibold text-gray-800">
                ¡Hola! 👋 ¿En qué puedo ayudarte hoy?
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Haz clic en mí para ver opciones rápidas
              </p>
            </div>
            
            <div className={`absolute top-4 left-4 right-4 transition-all duration-300 ease-in-out ${
              isHovering ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
            }`}>
              <p className="text-sm font-semibold text-gray-800">
                ✨ ¡Haz clic para explorar!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Accede a opciones rápidas y más
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-yellow-400 transform rotate-45"></div>
        </div>
      )}

      {/* Botón flotante principal */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-[10000]">
          <button
            onClick={handleOpen}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        </div>
      )}

      {/* Menú expandido */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-[10000]">
          <div className={`${isExpanded ? 'menu-expanded' : ''} transition-all duration-300 ease-out`}>
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-2xl shadow-slate-900/10 p-5 max-h-[75vh] overflow-y-auto ring-1 ring-slate-900/5 w-[420px]">
              {isExpanded && (
                <div className="transition-all duration-500 ease-in-out">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-800">Asistente ObraExpress</h3>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-slate-500">En línea</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Chat Area */}
                  <div className="bg-slate-50/50 rounded-xl p-4 h-[25vh] flex flex-col border border-slate-200/50">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                      {chatMessages.map((message, index) => (
                        <div key={message.id}>
                          <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                              message.sender === 'user' 
                                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-sm'
                                : 'bg-white text-slate-800 shadow-sm border border-slate-200/60'
                            }`}>
                              <p className="text-sm">{message.text}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                              }`}>
                                {message.timestamp.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          {message.sender === 'ai' && index === 0 && !user && (
                            <div className="flex justify-start mt-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowLoginForm(true)}
                                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Iniciar Sesión
                                </button>
                                <button
                                  onClick={() => setShowRegisterForm(true)}
                                  className="text-xs bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Crear Cuenta
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white text-slate-800 rounded-2xl px-3 py-2.5 shadow-sm border border-slate-200/60">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim()}
                        className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Login Form */}
                  {showLoginForm && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-slate-800">Iniciar Sesión</h4>
                        <button
                          onClick={() => setShowLoginForm(false)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="email"
                          placeholder="Email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <button
                          onClick={handleLogin}
                          className="w-full bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Entrar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Register Form */}
                  {showRegisterForm && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-slate-800">Crear Cuenta</h4>
                        <button
                          onClick={() => setShowRegisterForm(false)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={registerData.nombre}
                          onChange={(e) => setRegisterData({...registerData, nombre: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirmar contraseña"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                        <button
                          onClick={handleRegister}
                          className="w-full bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Crear Cuenta
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Access */}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <p className="text-xs font-medium text-slate-600 mb-3">Accesos Rápidos</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={handleProducts}
                        className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                      >
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700">Productos</span>
                      </button>

                      <button
                        onClick={handleCalendar}
                        className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                      >
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700">Agendar</span>
                      </button>

                      <button
                        onClick={handleContact}
                        className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                      >
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-xs text-slate-600 group-hover:text-slate-700">Contactar</span>
                      </button>
                    </div>

                    {/* Info */}
                    <div className="bg-slate-50/80 rounded-xl p-3 text-center mt-4 border border-slate-200/40">
                      <p className="text-xs text-slate-600">Asistente disponible 24/7</p>
                      <p className="text-xs font-medium text-slate-700 mt-1">Respuesta inmediata</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}