/**
 * Configuración React Query para ObraExpress
 * Tarea 3.3: Caché y Estado - React Query
 */

import { QueryClient } from '@tanstack/react-query';

// Configuración optimizada para ObraExpress
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos (productos no cambian frecuentemente)
      staleTime: 5 * 60 * 1000,
      // Mantener cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry automático en caso de fallos
      retry: (failureCount, error: any) => {
        // No retry en errores 404 
        if (error?.status === 404) return false;
        // Máximo 2 reintentos
        return failureCount < 2;
      },
      // Refetch cuando la ventana toma foco
      refetchOnWindowFocus: false,
      // Refetch cuando se reconecta la red
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry para mutaciones críticas
      retry: 1,
    },
  },
});

// Query keys centralizadas para consistencia
export const queryKeys = {
  // Productos
  products: {
    all: ['products'] as const,
    public: () => [...queryKeys.products.all, 'public'] as const,
    admin: () => [...queryKeys.products.all, 'admin'] as const,
    byCategory: (category: string) => [...queryKeys.products.all, 'category', category] as const,
    byId: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },
  
  // Admin
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    notifications: () => [...queryKeys.admin.all, 'notifications'] as const,
    pending: () => [...queryKeys.admin.all, 'pending'] as const,
  },
  
  // Sync
  sync: {
    all: ['sync'] as const,
    status: () => [...queryKeys.sync.all, 'status'] as const,
    progress: () => [...queryKeys.sync.all, 'progress'] as const,
  },
  
  // Chatbot
  chatbot: {
    all: ['chatbot'] as const,
    knowledge: () => [...queryKeys.chatbot.all, 'knowledge'] as const,
    session: (sessionId: string) => [...queryKeys.chatbot.all, 'session', sessionId] as const,
  },
} as const;

// Helper para invalidar queries relacionadas
export const invalidateQueries = {
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  admin: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
  sync: () => queryClient.invalidateQueries({ queryKey: queryKeys.sync.all }),
  chatbot: () => queryClient.invalidateQueries({ queryKey: queryKeys.chatbot.all }),
};

// Prefetch común para mejorar UX
export const prefetchQueries = {
  products: {
    public: () =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.public(),
        queryFn: () => fetch('/api/productos-publico').then(res => res.json()),
      }),
    admin: () =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.admin(),
        queryFn: () => fetch('/api/admin/productos').then(res => res.json()),
      }),
  },
  admin: {
    stats: () =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.admin.stats(),
        queryFn: () => fetch('/api/admin/stats').then(res => res.json()),
      }),
  },
};

export default queryClient;