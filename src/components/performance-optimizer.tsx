"use client";

import { useEffect } from 'react';

// Componente para optimizar Core Web Vitals
export function PerformanceOptimizer() {
  useEffect(() => {
    // Prefetch critical resources
    const prefetchResources = () => {
      const criticalRoutes = [
        '/productos',
        '/nosotros', 
        '/contacto'
      ];

      criticalRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    };

    // Optimize images loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // Reduce layout shift
    const reduceLayoutShift = () => {
      // Reserve space for dynamic content
      const dynamicElements = document.querySelectorAll('[data-dynamic]');
      dynamicElements.forEach(element => {
        const minHeight = element.getAttribute('data-min-height');
        if (minHeight) {
          (element as HTMLElement).style.minHeight = minHeight;
        }
      });
    };

    // Optimize third-party scripts
    const optimizeThirdParty = () => {
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[data-defer]');
      scripts.forEach(script => {
        script.setAttribute('loading', 'lazy');
      });
    };

    // Service Worker registration for caching
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Web Vitals reporting - solo en producción
    const reportWebVitals = async () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        try {
          const webVitals = await import('web-vitals');
          
          // Usar la nueva API de web-vitals v4+
          if (webVitals.onCLS) {
            webVitals.onCLS(() => {});
            webVitals.onFID?.(() => {});
            webVitals.onFCP(() => {});
            webVitals.onLCP(() => {});
            webVitals.onTTFB(() => {});
          }
        } catch (error) {
          // Silenciar error en desarrollo
        }
      }
    };

    // Run optimizations con delay para no afectar el rendimiento inicial
    setTimeout(() => {
      prefetchResources();
      optimizeImages();
      reduceLayoutShift();
      optimizeThirdParty();
    }, 1000);
    
    // Solo en producción
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
      reportWebVitals();
    }

    // Cleanup function
    return () => {
      // Clean up observers if needed
    };
  }, []);

  return null; // This component doesn't render anything
}

// Hook for performance monitoring - solo en producción
export function usePerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    
    // Monitor page load performance
    const observer = new PerformanceObserver(() => {});
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (error) {
      // Silenciar error
    }

    return () => observer.disconnect();
  }, []);
}

// Component for critical CSS inlining
export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical above-the-fold styles */
        .hero-section {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
        }
        
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4rem;
          background-color: white;
          z-index: 1000;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Responsive base */
        @media (max-width: 768px) {
          .hero-section {
            min-height: 40vh;
            padding: 1rem;
          }
          
          .navbar {
            height: 3.5rem;
          }
        }
      `
    }} />
  );
}

// Preload critical resources component
export function ResourcePreloader() {
  useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap'
    ];

    fontPreloads.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = fontUrl;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/assets/images/Logotipo/isotipo_obraexpress.webp',
      '/assets/images/Home/bannerB-q82.webp'
    ];

    criticalImages.forEach(imageUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    });

    // DNS prefetch for external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.whatsapp.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}