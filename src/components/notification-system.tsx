"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  tipo: 'compra' | 'despacho' | 'cotizacion' | 'promocion' | 'sistema';
  titulo: string;
  mensaje: string;
  leida: boolean;
  data?: any;
  created_at: string;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasCreatedDiscountNotification, setHasCreatedDiscountNotification] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Función para crear notificación de descuento automática
  const createDiscountNotification = () => {
    if (!user?.tieneDescuento || !user?.porcentajeDescuento || hasCreatedDiscountNotification) {
      console.log('🔔 No se creará notificación de descuento:', {
        tieneDescuento: user?.tieneDescuento,
        porcentajeDescuento: user?.porcentajeDescuento,
        hasCreatedDiscountNotification
      });
      return;
    }
    
    // Verificar en localStorage si ya se mostró esta notificación para este usuario
    const notificationKey = `discount-notification-${user.email}`;
    const wasNotificationShown = localStorage.getItem(notificationKey);
    
    if (wasNotificationShown) {
      console.log('🔔 Notificación ya mostrada para:', user.email);
      return;
    }
    
    console.log('🎁 Creando notificación de bienvenida para:', user.email);
    
    // Simular "cliente nuevo" - descuento por primera compra en policarbonatos alveolares
    const discountNotification: Notification = {
      id: `discount-${user.email}-welcome`,
      tipo: 'promocion',
      titulo: `🎉 ¡Bienvenido! ${user.porcentajeDescuento}% de Descuento en Láminas Alveolares`,
      mensaje: `Como cliente nuevo, tienes un ${user.porcentajeDescuento}% de descuento en todos los Policarbonatos Alveolares. ¡Perfecto para techos, cerramientos y proyectos de construcción!`,
      leida: false,
      data: { 
        action: 'go-to-products', 
        discount: user.porcentajeDescuento, 
        isWelcome: true,
        applicableProducts: 'categoria',
        categories: ['Láminas Alveolares'],
        productType: 'Policarbonatos Alveolares'
      },
      created_at: new Date().toISOString()
    };
    
    setNotifications(prev => {
      console.log('📝 Agregando notificación a la lista. Total anterior:', prev.length);
      return [discountNotification, ...prev];
    });
    setUnreadCount(prev => {
      const newCount = prev + 1;
      console.log('🔴 Actualizando contador de no leídas:', newCount);
      return newCount;
    });
    setHasCreatedDiscountNotification(true);
    
    // Marcar en localStorage que ya se mostró (comentado para testing)
    // localStorage.setItem(notificationKey, 'shown');
    console.log('✅ Notificación de descuento creada exitosamente');
  };

  // Función para manejar clics en notificaciones
  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída
    if (!notification.leida) {
      markAsRead(notification.id);
    }
    
    // Si es una promoción con descuento, activar el descuento
    if (notification.tipo === 'promocion' && notification.data?.discount) {
      console.log('🎁 Activando descuento del', notification.data.discount, '%');
      
      // Guardar en localStorage que el descuento fue activado
      const discountData = {
        percentage: notification.data.discount,
        activatedAt: new Date().toISOString(),
        fromNotification: notification.id,
        applicableProducts: notification.data.applicableProducts || 'categoria',
        categories: notification.data.categories || ['Láminas Alveolares'],
        productType: notification.data.productType || 'Policarbonatos Alveolares',
        userId: user?.id,
        userEmail: user?.email,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
      };
      
      localStorage.setItem('active-discount', JSON.stringify(discountData));
      
      // Mostrar feedback visual específico
      const productTypeText = notification.data.productType || 'Policarbonatos Alveolares';
      setDiscountMessage(`¡Descuento del ${notification.data.discount}% aplicado en ${productTypeText}!`);
      setDiscountApplied(true);
      setTimeout(() => setDiscountApplied(false), 4000); // 4 segundos para que se pueda leer
      
      console.log('✅ Descuento del', notification.data.discount, '% aplicado exitosamente en', notification.data.productType || 'Policarbonatos Alveolares');
      console.log('📝 Datos del descuento guardados:', discountData);
      console.log('🏷️ Categorías aplicables:', discountData.categories);
      
      // Actualizar el usuario con el descuento (simulado por ahora)
      if (user) {
        // En producción, esto se haría con una API call al backend
        console.log('✅ Descuento aplicado al usuario:', user.email);
      }
    }
    
    // Manejar acciones específicas según el tipo
    if (notification.data?.action === 'go-to-products') {
      // NO cerrar el dropdown, solo navegar
      router.push('/productos');
    } else if (notification.tipo === 'promocion') {
      router.push('/productos');
    } else if (notification.tipo === 'compra') {
      router.push('/mis-compras');
    }
  };

  // useEffect para cargar notificaciones
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      
      // Suscribirse a cambios en tiempo real
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notificaciones',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  // useEffect separado para crear notificación de descuento (solo una vez)
  useEffect(() => {
    if (user?.id && user?.tieneDescuento && user?.porcentajeDescuento > 0 && !hasCreatedDiscountNotification) {
      // Pequeño delay para asegurar que todo esté cargado
      const timer = setTimeout(() => {
        createDiscountNotification();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id, user?.tieneDescuento, user?.porcentajeDescuento, hasCreatedDiscountNotification]);

  // Hook para manejar clicks fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Si el click es en el botón de notificaciones, no hacer nada
      if (target.closest('.notifications-button')) {
        return;
      }
      
      // Si el click es dentro del dropdown, no hacer nada
      if (target.closest('.notifications-dropdown')) {
        return;
      }
      
      // Solo cerrar el dropdown, mantener las notificaciones y el contador
      if (showNotifications) {
        setShowNotifications(false);
        console.log('🔔 Dropdown cerrado - notificaciones y contador mantenidos');
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error cargando notificaciones:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.leida).length);
      }
    } catch (error) {
      console.error('Error con Supabase:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Para notificaciones locales (como las de descuento)
    if (notificationId.startsWith('discount-')) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Si es notificación de bienvenida, mantenerla pero marcada como leída
      // No la removemos para que el usuario pueda volver a verla
      return;
    }

    // Para notificaciones de base de datos
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marcando notificación como leída:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error con Supabase:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    // Marcar notificaciones locales como leídas
    setNotifications(prev => 
      prev.map(n => ({ ...n, leida: true }))
    );
    setUnreadCount(0);

    // Marcar notificaciones de base de datos como leídas
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user.id)
        .eq('leida', false);

      if (error) {
        console.error('Error marcando todas las notificaciones como leídas:', error);
      }
    } catch (error) {
      console.error('Error con Supabase:', error);
    }
  };

  // Función para resetear notificación (solo para desarrollo/testing)
  const resetDiscountNotification = () => {
    if (!user?.email) return;
    
    const notificationKey = `discount-notification-${user.email}`;
    localStorage.removeItem(notificationKey);
    setHasCreatedDiscountNotification(false);
    
    // Recrear la notificación después de un breve delay
    setTimeout(() => {
      createDiscountNotification();
    }, 500);
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return '🛒';
      case 'despacho':
        return '🚚';
      case 'cotizacion':
        return '📋';
      case 'promocion':
        return '🎁'; // Cambiado a regalo para descuentos
      case 'sistema':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'despacho':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cotizacion':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'promocion':
        return 'text-orange-600 bg-orange-50 border-orange-200'; // Naranja para descuentos
      case 'sistema':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      return date.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // No mostrar si no hay usuario logueado
  if (!user?.id) return null;

  return (
    <div className="relative">
      {/* Feedback visual para descuento aplicado - mejorado */}
      {discountApplied && (
        <div className="fixed top-4 right-4 bg-green-500 text-white text-sm px-4 py-3 rounded-lg shadow-xl z-[9999] border border-green-400">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{discountMessage}</span>
          </div>
        </div>
      )}
      
      {/* Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="notifications-button relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="Notificaciones"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.leida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.titulo}
                        </h4>
                        {!notification.leida && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${!notification.leida ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 border ${getNotificationColor(notification.tipo)}`}>
                    {notification.tipo.charAt(0).toUpperCase() + notification.tipo.slice(1)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center space-y-2">
            <button
              onClick={() => setShowNotifications(false)}
              className="text-sm text-gray-600 hover:text-gray-800 block mx-auto"
            >
              Cerrar
            </button>
            
            {/* Botón de desarrollo - solo visible en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={resetDiscountNotification}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                title="Resetear notificación de descuento (solo desarrollo)"
              >
                🔄 Resetear Descuento
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Función utilitaria para crear notificaciones desde otros componentes
export const createNotification = async (
  userId: string,
  tipo: 'compra' | 'despacho' | 'cotizacion' | 'promocion' | 'sistema',
  titulo: string,
  mensaje: string,
  data?: any
) => {
  try {
    const { error } = await supabase
      .from('notificaciones')
      .insert({
        user_id: userId,
        tipo,
        titulo,
        mensaje,
        data,
        leida: false
      });

    if (error) {
      console.error('Error creando notificación:', error);
    }
  } catch (error) {
    console.error('Error con Supabase:', error);
  }
};