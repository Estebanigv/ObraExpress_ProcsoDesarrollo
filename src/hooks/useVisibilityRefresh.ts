import { useCallback, useEffect, useState, useRef } from 'react';

// Hook para manejar refrescado automático cuando cambia visibilidad
export function useVisibilityRefresh(onRefresh?: () => void) {
  const [refreshKey, setRefreshKey] = useState(0);
  const lastRefreshRef = useRef<number>(0);
  
  // Función para triggear refresh (estable con useCallback)
  const triggerRefresh = useCallback(() => {
    const now = Date.now();
    // Throttle: solo permitir un refresh cada 2 segundos
    if (now - lastRefreshRef.current < 2000) {
      console.log('⏸️ Refresh throttled, muy reciente');
      return;
    }
    
    console.log('👀 Disparando refresh de visibilidad...');
    lastRefreshRef.current = now;
    setRefreshKey(prev => prev + 1);
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);
  
  // Event listener para cambios de visibilidad (solo escucha eventos reales)
  useEffect(() => {
    const handleVisibilityChange = (event: CustomEvent) => {
      console.log('👀 Evento de visibilidad recibido:', event.detail);
      // Solo disparar si es un evento real con detalles válidos
      if (event.detail && 
          event.detail.categoryName && 
          typeof event.detail.visible === 'boolean') {
        
        // Verificar que no estemos sincronizando
        if (typeof window !== 'undefined') {
          const isSyncing = sessionStorage.getItem('obraexpress_sync_in_progress') === 'true';
          if (isSyncing) {
            console.log('⏸️ Sync en progreso, ignorando cambio de visibilidad');
            return;
          }
        }
        
        triggerRefresh();
      }
    };
    
    // Crear evento personalizado para cambios de visibilidad
    window.addEventListener('categoryVisibilityChanged', handleVisibilityChange as EventListener);
    
    return () => {
      window.removeEventListener('categoryVisibilityChanged', handleVisibilityChange as EventListener);
    };
  }, [triggerRefresh]);
  
  return { refreshKey, triggerRefresh };
}