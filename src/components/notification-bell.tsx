"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'discount' | 'offer' | 'info';
  title: string;
  message: string;
  discount?: number;
  isNew: boolean;
  createdAt: Date;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generar notificaciones basadas en el usuario
  useEffect(() => {
    if (user) {
      const userNotifications: Notification[] = [];

      // Notificación de descuento activo
      if (user.tieneDescuento) {
        userNotifications.push({
          id: 'discount-active',
          type: 'discount',
          title: '🎉 Descuento Activo',
          message: `Tienes ${user.porcentajeDescuento}% de descuento en tu próxima compra`,
          discount: user.porcentajeDescuento,
          isNew: true,
          createdAt: new Date()
        });
      }

      // Notificaciones de ofertas especiales
      userNotifications.push({
        id: 'welcome-offer',
        type: 'offer',
        title: '🚀 Oferta de Bienvenida',
        message: 'Materiales de construcción con envío gratis en pedidos +$50.000',
        isNew: true,
        createdAt: new Date()
      });

      userNotifications.push({
        id: 'bulk-discount',
        type: 'offer',
        title: '📦 Descuento por Volumen',
        message: 'Compra al por mayor y obtén hasta 15% adicional en pedidos grandes',
        isNew: false,
        createdAt: new Date(Date.now() - 86400000) // 1 día atrás
      });

      userNotifications.push({
        id: 'new-products',
        type: 'info',
        title: '🆕 Nuevos Productos',
        message: 'Descubre nuestra nueva línea de materiales eco-amigables',
        isNew: false,
        createdAt: new Date(Date.now() - 172800000) // 2 días atrás
      });

      setNotifications(userNotifications);
    }
  }, [user]);

  // Solo mostrar si el usuario está logueado
  if (!user) return null;

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'discount':
        return '🎉';
      case 'offer':
        return '🔥';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'discount':
        return 'border-l-green-500 bg-green-50';
      case 'offer':
        return 'border-l-orange-500 bg-orange-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isNew: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campanita */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="Notificaciones"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge de notificaciones nuevas */}
        {newNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {newNotificationsCount > 9 ? '9+' : newNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {newNotificationsCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationColor(notification.type)} ${
                    notification.isNew ? 'bg-blue-25' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        {notification.isNew && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {notification.createdAt.toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con acciones */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <button
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Ver todas las ofertas →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}