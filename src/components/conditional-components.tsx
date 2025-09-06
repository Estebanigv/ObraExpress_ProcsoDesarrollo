"use client";

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { logger } from "@/lib/logger";
import { useAuth } from '@/contexts/AuthContext';

// Dynamic import para evitar hydration issues
const CartModal = dynamic(() => import("@/modules/checkout/components/floating-cart"), {
  ssr: false
});

// Dynamic import para el chatbot flotante limpio
const FloatingChatSimple = dynamic(() => import("@/modules/chatbot/components/floating-chat-simple"), {
  ssr: false
});

export function ConditionalComponents({ hideForModal = false }: { hideForModal?: boolean }) {
  const pathname = usePathname();
  const { isLoading: authLoading } = useAuth();
  
  logger.log('ConditionalComponents - pathname:', pathname);
  logger.log('ConditionalComponents - authLoading:', authLoading);
  
  // No mostrar menú flotante ni carrito en ciertas páginas o durante autenticación
  const hideComponents = pathname === '/login' || 
                        pathname === '/register' ||
                        pathname === '/perfil' ||
                        pathname === '/mis-compras' ||
                        pathname === '/coordinador-despacho' || 
                        pathname === '/checkout' ||
                        pathname.startsWith('/admin') ||
                        pathname.startsWith('/auth') ||
                        pathname.includes('/callback') ||
                        pathname.includes('/oauth') ||
                        pathname.includes('/google') ||
                        pathname.includes('/microsoft') ||
                        pathname.includes('/facebook') ||
                        authLoading || // Ocultar también durante procesos de autenticación
                        hideForModal; // Ocultar cuando hay modales IA abiertos
  
  logger.log('ConditionalComponents - hideComponents:', hideComponents);
  logger.log('ConditionalComponents - pathname.startsWith(/auth):', pathname.startsWith('/auth'));
  
  if (hideComponents) {
    return null;
  }
  
  return (
    <>
      <CartModal />
      {/* <FloatingChatSimple /> - DESHABILITADO: Usando SmartGuide con OpenAI en su lugar */}
    </>
  );
}