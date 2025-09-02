import { useState, useCallback } from 'react';

interface SyncStatus {
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  productsCount: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  data?: {
    products_count: number;
    variants_count: number;
    updated_at: string;
  };
}

export function useSheetSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    error: null,
    lastSync: null,
    productsCount: 0
  });

  const syncSheets = useCallback(async (sheetId: string): Promise<SyncResult> => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/admin/sync-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheetId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync');
      }

      setStatus({
        isLoading: false,
        error: null,
        lastSync: result.data.updated_at,
        productsCount: result.data.products_count
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, []);

  const getSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sync-sheets');
      const result = await response.json();
      
      if (response.ok) {
        setStatus(prev => ({
          ...prev,
          lastSync: result.last_updated,
          productsCount: result.products_count
        }));
      }
    } catch (error) {
      console.error('Error getting sync status:', error);
    }
  }, []);

  const scheduleAutoSync = useCallback((sheetId: string, intervalMinutes: number = 60) => {
    const interval = setInterval(() => {
      syncSheets(sheetId).catch(error => {
        console.error('Auto-sync failed:', error);
      });
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [syncSheets]);

  return {
    status,
    syncSheets,
    getSyncStatus,
    scheduleAutoSync
  };
}