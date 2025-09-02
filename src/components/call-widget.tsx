"use client";

import { useState, useEffect } from 'react';

export function CallWidget() {
  const [isHovered, setIsHovered] = useState(false);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // DESHABILITADO: Widget de ElevenLabs deshabilitado para evitar elementos extraños en la UI
    console.log('🚫 Widget ElevenLabs deshabilitado - usando fallback telefónico directo');
    setShowFallback(true);
    setIsWidgetLoaded(false);
    
    // Limpiar cualquier elemento elevenlabs que pueda existir
    const cleanupElevenLabsElements = () => {
      const elevenLabsElements = document.querySelectorAll('elevenlabs-convai');
      elevenLabsElements.forEach(el => {
        console.log('🧹 Eliminando elemento ElevenLabs encontrado');
        el.remove();
      });
      
      // También limpiar posibles iframes o elementos shadow
      const iframes = document.querySelectorAll('iframe[src*="elevenlabs"]');
      iframes.forEach(iframe => {
        console.log('🧹 Eliminando iframe ElevenLabs');
        iframe.remove();
      });
    };

    cleanupElevenLabsElements();
    
    // Limpiar cada 5 segundos por si aparecen nuevos elementos
    const cleanupInterval = setInterval(cleanupElevenLabsElements, 5000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <div 
      id="elevenlabs-widget-container"
      style={{ 
        display: 'none',
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99999999,
        maxWidth: '405px',
        maxHeight: '531px',
        width: '405px',
        height: '531px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Widget de ElevenLabs */}
      <div 
        id="widget-content"
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Fallback UI si el widget no está disponible */}
      {showFallback && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>📞</div>
            <h3 style={{
              margin: '0 0 12px 0',
              color: '#1f2937',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>¡Te llamamos ahora!</h3>
            <p style={{
              margin: '0 0 20px 0',
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>Nuestro especialista se comunicará<br />contigo inmediatamente</p>
            <a 
              href="tel:+56963348909"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: isHovered ? '#047857' : '#059669',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              Llamar Ahora
            </a>
          </div>
        </div>
      )}

      {/* Estilos para el widget */}
      <style>{`
        #elevenlabs-widget-container elevenlabs-convai {
          width: 100% !important;
          height: 100% !important;
          background: white !important;
          border-radius: 16px !important;
          overflow: hidden !important;
        }
        
        #elevenlabs-widget-container elevenlabs-convai iframe {
          background: white !important;
          border-radius: 16px !important;
          border: none !important;
        }
        
        /* Ocultar textos descriptivos si aparecen */
        #elevenlabs-widget-container elevenlabs-convai p,
        #elevenlabs-widget-container elevenlabs-convai .description,
        #elevenlabs-widget-container elevenlabs-convai .text {
          display: none !important;
        }
        
        /* Estilo para botones del widget */
        #elevenlabs-widget-container elevenlabs-convai button {
          border-radius: 12px !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
        }
        
        /* Estilo específico para el botón de colgar */
        #elevenlabs-widget-container elevenlabs-convai button[aria-label*="end"],
        #elevenlabs-widget-container elevenlabs-convai button[aria-label*="hang"],
        #elevenlabs-widget-container elevenlabs-convai button[title*="end"],
        #elevenlabs-widget-container elevenlabs-convai button[title*="hang"] {
          background-color: #dc2626 !important;
          border-color: #dc2626 !important;
          color: white !important;
        }
        
        #elevenlabs-widget-container elevenlabs-convai button[aria-label*="end"]:hover,
        #elevenlabs-widget-container elevenlabs-convai button[aria-label*="hang"]:hover,
        #elevenlabs-widget-container elevenlabs-convai button[title*="end"]:hover,
        #elevenlabs-widget-container elevenlabs-convai button[title*="hang"]:hover {
          background-color: #b91c1c !important;
          border-color: #b91c1c !important;
          transform: scale(1.05) !important;
        }
      `}</style>
    </div>
  );
}