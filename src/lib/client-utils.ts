// Utility functions for safe client-side operations

// Safe window access that works in SSR
export const safeWindow = {
  open: (url: string, target: string = '_blank') => {
    if (typeof window !== 'undefined') {
      window.open(url, target);
    }
  },
  
  redirect: (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },
  
  getScrollY: (): number => {
    if (typeof window !== 'undefined') {
      return window.scrollY;
    }
    return 0;
  },
  
  addEventListener: (event: string, handler: EventListener, options?: AddEventListenerOptions) => {
    if (typeof window !== 'undefined') {
      window.addEventListener(event, handler, options);
    }
  },
  
  removeEventListener: (event: string, handler: EventListener) => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(event, handler);
    }
  }
};

// Safe localStorage access that works in SSR
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        // Handle storage quota exceeded or other errors
      }
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Handle errors silently
      }
    }
  }
};

// Safe document access that works in SSR
export const safeDocument = {
  getElementById: (id: string): HTMLElement | null => {
    if (typeof document !== 'undefined') {
      return document.getElementById(id);
    }
    return null;
  },
  
  addEventListener: (event: string, handler: EventListener, options?: AddEventListenerOptions) => {
    if (typeof document !== 'undefined') {
      document.addEventListener(event, handler, options);
    }
  },
  
  removeEventListener: (event: string, handler: EventListener) => {
    if (typeof document !== 'undefined') {
      document.removeEventListener(event, handler);
    }
  },
  
  setBodyOverflow: (value: string) => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = value;
    }
  }
};

// Safe check for client-side only operations
export const isClient = typeof window !== 'undefined';

// Safe navigation utilities
export const navigate = {
  openInNewTab: (url: string) => safeWindow.open(url, '_blank'),
  redirect: (url: string) => safeWindow.redirect(url)
};