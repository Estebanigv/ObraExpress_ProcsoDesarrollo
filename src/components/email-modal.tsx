"use client";

import React, { useState } from "react";

interface EmailModalProps {
  email: string;
  subject?: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
  buttonText?: string;
}

export function EmailModal({ 
  email, 
  subject = "", 
  body = "", 
  children, 
  className = "",
  buttonText = "Enviar Email"
}: EmailModalProps) {
  const [showModal, setShowModal] = useState(false);

  const emailClients = [
    {
      name: "Gmail",
      description: "Acceso rápido desde web",
      icon: (
        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-red-200">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
          </svg>
        </div>
      ),
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      bgColor: "from-red-50 via-red-50 to-red-100",
      borderColor: "hover:border-red-300",
      shadowColor: "hover:shadow-red-100"
    },
    {
      name: "Outlook",
      description: "Plataforma empresarial",
      icon: (
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V11.4l1.5.6v.01zm-6.4-1.8l1.5.6V2.55H9.05V6H5.13v10.35l4.95-1.98v-7.5q0-.4.3-.7.29-.28.7-.28H12l6.6 2.61zm.4 2.4l-5.5-2.2V16h5.5v-3.4z"/>
          </svg>
        </div>
      ),
      url: `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      bgColor: "from-blue-50 via-blue-50 to-blue-100",
      borderColor: "hover:border-blue-300",
      shadowColor: "hover:shadow-blue-100"
    },
    {
      name: "Yahoo",
      description: "Interfaz clásica y confiable",
      icon: (
        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-200">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 4.6L14.4 21h-1.9L18.7 8.5l-6.2 9.9h-1.9L4.3 8.5 10.5 21H8.6L-1 4.6h2.1l8.4 11.8L17.9 4.6H24z"/>
          </svg>
        </div>
      ),
      url: `https://compose.mail.yahoo.com/?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      bgColor: "from-purple-50 via-purple-50 to-purple-100",
      borderColor: "hover:border-purple-300",
      shadowColor: "hover:shadow-purple-100"
    },
    {
      name: "App Predeterminada",
      description: "Outlook, Apple Mail, etc.",
      icon: (
        <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-gray-200">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
      ),
      url: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      bgColor: "from-gray-50 via-gray-50 to-gray-100",
      borderColor: "hover:border-gray-300",
      shadowColor: "hover:shadow-gray-100"
    }
  ];

  const handleEmailClick = (url: string) => {
    console.log('📧 Opening email client:', url);
    window.open(url, '_blank');
    setShowModal(false);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📧 Email modal opening');
    setShowModal(true);
  };

  return (
    <>
      {/* CSS para asegurar que el modal se muestre correctamente */}
      <style jsx>{`
        .modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 100000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow-y: auto !important;
        }
        .modal-content {
          position: relative !important;
          z-index: 100001 !important;
          max-width: 32rem !important;
          width: 100% !important;
          margin: 1rem !important;
        }
      `}</style>

      {/* Trigger */}
      {children ? (
        <div onClick={handleOpenModal} className={`cursor-pointer ${className}`}>
          {children}
        </div>
      ) : (
        <button onClick={handleOpenModal} className={className}>
          {buttonText}
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70"
            onClick={() => setShowModal(false)}
            style={{ zIndex: 99999 }}
          />
          
          {/* Modal Content */}
          <div className="modal-content bg-white rounded-3xl shadow-2xl overflow-hidden"
               onClick={(e) => e.stopPropagation()}>
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Enviar Email</h3>
                    <p className="text-blue-100 text-sm">Elige tu cliente preferido</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Email Preview mejorado */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border border-blue-100">
                <div className="text-sm">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-700 bg-white px-2 py-1 rounded-full text-xs">Para:</span>
                    <span className="ml-3 text-blue-600 font-medium">{email}</span>
                  </div>
                  {subject && (
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 bg-white px-2 py-1 rounded-full text-xs">Asunto:</span>
                      <span className="ml-3 text-gray-800">{subject}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Clients con mejor diseño */}
              <div className="grid grid-cols-2 gap-4">
                {emailClients.map((client, index) => (
                  <button
                    key={client.name}
                    onClick={() => handleEmailClick(client.url)}
                    className={`p-6 rounded-3xl border-2 border-transparent bg-gradient-to-br ${client.bgColor} ${client.borderColor} hover:scale-105 transform transition-all duration-300 hover:shadow-2xl ${client.shadowColor} group relative overflow-hidden`}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    {/* Particle effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    
                    <div className="relative flex flex-col items-center space-y-3">
                      {client.icon}
                      <div className="text-center">
                        <div className="font-bold text-gray-900 text-base mb-1 group-hover:text-gray-700 transition-colors">{client.name}</div>
                        <div className="text-xs text-gray-600 leading-tight group-hover:text-gray-500 transition-colors">{client.description}</div>
                      </div>
                    </div>

                    {/* Click ripple effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-3xl scale-0 group-active:scale-100 transition-transform duration-150"></div>
                  </button>
                ))}
              </div>

              {/* Footer note mejorado */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Se abrirá en nueva pestaña de forma segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}