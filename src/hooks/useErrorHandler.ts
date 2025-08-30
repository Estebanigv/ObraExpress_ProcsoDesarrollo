"use client";

import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface UseErrorHandlerReturn {
  error: ErrorState;
  handleError: (error: Error, context?: string) => void;
  clearError: () => void;
  retry: (fn: () => void | Promise<void>) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null
  });

  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    setError({
      hasError: true,
      error,
      errorInfo: context || null
    });

    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      // errorReportingService.captureException(error, {
      //   extra: { context }
      // });
    }
  }, []);

  const clearError = useCallback(() => {
    setError({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }, []);

  const retry = useCallback(async (fn: () => void | Promise<void>) => {
    try {
      clearError();
      await fn();
    } catch (error) {
      handleError(error as Error, 'retry attempt');
    }
  }, [handleError, clearError]);

  return { error, handleError, clearError, retry };
};

// Hook específico para APIs
export const useApiErrorHandler = () => {
  const { error, handleError, clearError, retry } = useErrorHandler();

  const handleApiError = useCallback((error: any, endpoint?: string) => {
    let errorMessage = 'Error de conexión';
    let errorDetails = '';

    if (error.response) {
      // Error de respuesta del servidor
      errorMessage = `Error ${error.response.status}`;
      errorDetails = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      // Error de red
      errorMessage = 'Error de red';
      errorDetails = 'No se pudo conectar con el servidor';
    } else {
      // Error de configuración
      errorMessage = 'Error interno';
      errorDetails = error.message;
    }

    const contextError = new Error(`${errorMessage}: ${errorDetails}`);
    handleError(contextError, endpoint ? `API: ${endpoint}` : 'API');
  }, [handleError]);

  return { error, handleApiError, clearError, retry };
};

// Hook para componentes de productos
export const useProductErrorHandler = () => {
  const { error, handleError, clearError, retry } = useErrorHandler();

  const handleProductError = useCallback((error: Error, productId?: string) => {
    const context = productId ? `Product ${productId}` : 'Product component';
    handleError(error, context);
  }, [handleError]);

  return { error, handleProductError, clearError, retry };
};

// Utilidad para wrappear funciones async con manejo de errores
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler: (error: Error) => void,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${context || 'async function'}:`, error);
      errorHandler(error as Error);
      return null;
    }
  };
};