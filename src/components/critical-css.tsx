// Server Component for critical CSS inlining
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