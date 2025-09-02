"use client";

import React, { useState } from "react";

interface EmailSelectorProps {
  email: string;
  subject?: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
  buttonText?: string;
}

export function EmailSelector({ 
  email, 
  subject = "", 
  body = "", 
  children, 
  className = "",
  buttonText = "Enviar Email"
}: EmailSelectorProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  console.log('📧 EmailSelector rendered with props:', { email, hasChildren: !!children });

  const emailClients = [
    {
      name: "Gmail",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      ),
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      color: "from-red-500 to-red-600"
    },
    {
      name: "Outlook",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V11.4l1.5.6v.01zm-6.4-1.8l1.5.6V2.55H9.05V6H5.13v10.35l4.95-1.98v-7.5q0-.4.3-.7.29-.28.7-.28H12l6.6 2.61zm.4 2.4l-5.5-2.2V16h5.5v-3.4zM7.18 15.24q.51.06.86-.18.34-.25.48-.74.14-.48.14-1.24-.05-1.23-.47-1.74-.42-.52-1.16-.52-.72 0-1.14.53-.42.52-.42 1.74 0 1.22.42 1.68.42.45 1.28.47z"/>
        </svg>
      ),
      url: `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      color: "from-blue-600 to-blue-700"
    },
    {
      name: "Yahoo Mail",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.6L14.4 21h-1.9L18.7 8.5l-6.2 9.9h-1.9L4.3 8.5 10.5 21H8.6L-1 4.6h2.1l8.4 11.8L17.9 4.6H24z"/>
        </svg>
      ),
      url: `https://compose.mail.yahoo.com/?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      color: "from-purple-600 to-purple-700"
    },
    {
      name: "Cliente por defecto",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      url: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      color: "from-gray-600 to-gray-700"
    }
  ];

  const handleEmailClick = (url: string) => {
    console.log('📧 Opening email client:', url);
    window.open(url, '_blank');
    setShowOptions(false);
  };

  if (children) {
    return (
      <div className="relative inline-block">
        <div 
          onClick={(e) => {
            e.preventDefault();
            console.log('📧 Email selector clicked, current state:', showOptions);
            setShowOptions(!showOptions);
          }}
          className={className}
        >
          {children}
        </div>
        
        {showOptions && (
          <>
            <div 
              className="fixed inset-0 z-[9995]" 
              onClick={() => setShowOptions(false)}
            />
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-[9996]">
              <div className="text-sm font-semibold text-gray-700 mb-2 text-center">
                Selecciona tu cliente de correo:
              </div>
              <div className="space-y-2">
                {emailClients.map((client) => (
                  <button
                    key={client.name}
                    onClick={() => handleEmailClick(client.url)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r ${client.color} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                  >
                    {client.icon}
                    <span className="font-medium">{client.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.preventDefault();
          console.log('📧 Email button clicked, current state:', showOptions);
          setShowOptions(!showOptions);
        }}
        className={className || "inline-block bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors duration-300"}
      >
        {buttonText}
      </button>
      
      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-[9995]" 
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-[9996]">
            <div className="text-sm font-semibold text-gray-700 mb-2 text-center">
              Selecciona tu cliente de correo:
            </div>
            <div className="space-y-2">
              {emailClients.map((client) => (
                <button
                  key={client.name}
                  onClick={() => handleEmailClick(client.url)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r ${client.color} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                >
                  {client.icon}
                  <span className="font-medium">{client.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}