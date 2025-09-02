"use client";

import { useEffect } from 'react';

// Componente para precargar recursos críticos
export function CriticalResourcePreloader() {
  useEffect(() => {
    // Precargar imágenes críticas
    const criticalImages = [
      '/assets/images/Logotipo/imagotipo_obraexpress.webp',
      '/assets/images/Logotipo/isotipo_obraexpress.webp',
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Precargar fuentes críticas si no están ya cargadas
    const fontPreloads = [
      'https://fonts.gstatic.com/s/geist/v1/gyB4hywfBDvI-goUG52GY1EKAmg.woff2',
    ];

    fontPreloads.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = src;
      document.head.appendChild(link);
    });

    // Prefetch de páginas importantes
    const importantPages = ['/productos', '/contacto', '/nosotros'];
    
    importantPages.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}