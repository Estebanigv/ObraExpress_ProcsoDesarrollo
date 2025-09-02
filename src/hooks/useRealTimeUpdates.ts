'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpdateEvent {
  type: string;
  message: string;
  data?: any;
  timestamp: string;
}

export function useRealTimeUpdates() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<UpdateEvent | null>(null);

  const handleUpdate = useCallback((event: UpdateEvent) => {
    console.log('🔄 Real-time update received:', event);
    setLastUpdate(event);
    
    if (event.type === 'PRICE_UPDATE') {
      // Only refresh the page silently for users
      // Admin notifications are handled by the indicator component
      setTimeout(() => {
        router.refresh();
      }, 1000);
    }
  }, [router]);

  useEffect(() => {
    // Only enable notifications in admin panel
    const isAdminPage = window.location.pathname.startsWith('/admin');
    
    if (isAdminPage && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Create EventSource connection
    const eventSource = new EventSource('/api/webhook/sheets-update');
    
    eventSource.onopen = () => {
      console.log('🔗 Connected to real-time updates');
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleUpdate(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('🔌 SSE connection error:', error);
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        eventSource.close();
        // The effect will run again and create a new connection
      }, 5000);
    };
    
    // Cleanup function
    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
      setIsConnected(false);
    };
  }, [handleUpdate]);

  return {
    isConnected,
    lastUpdate
  };
}