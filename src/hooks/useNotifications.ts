// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';

export type NotificationType = 'order' | 'document' | 'status' | 'system';

export interface NotificationOptions {
  type?: NotificationType;
  priority?: 'low' | 'normal' | 'high';
  persist?: boolean;
  data?: any;
  body?: string;
  tag?: string;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setEnabled(Notification.permission === 'granted');
      
      // Verificar se há suporte para notificações
      if (!('Notification' in window)) {
        console.warn('Notificações não são suportadas neste navegador');
      }
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      const isGranted = newPermission === 'granted';
      setEnabled(isGranted);
      return isGranted;
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }, []);

  const showNotification = useCallback((
    title: string, 
    options?: NotificationOptions & NotificationOptions
  ): Notification | null => {
    if (!enabled || permission !== 'granted') return null;

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      if (!options?.persist) {
        setTimeout(() => notification.close(), 10000);
      }
      
      return notification;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      return null;
    }
  }, [enabled, permission]);

  const showOrderNotification = useCallback((
    orderNumber: string,
    customerName: string,
    action: 'created' | 'updated' | 'status_changed' | 'document_added' | 'system',
    options?: NotificationOptions
  ) => {
    const titles = {
      created: 'Novo Pedido Criado',
      updated: 'Pedido Atualizado',
      status_changed: 'Status Alterado',
      document_added: 'Documento Adicionado',
      system: 'Sistema',
    };

    const bodies = {
      created: `Pedido ${orderNumber} criado para ${customerName}`,
      updated: `Pedido ${orderNumber} foi atualizado`,
      status_changed: `Status do pedido ${orderNumber} foi alterado`,
      document_added: `Novo documento adicionado ao pedido ${orderNumber}`,
      system: `Notificação do sistema: ${customerName}`,
    };

    return showNotification(titles[action], {
      body: bodies[action],
      tag: `order-${orderNumber}-${action}`,
      ...options
    });
  }, [showNotification]);

  const toggleNotifications = useCallback(async (): Promise<boolean> => {
    if (!enabled) {
      return await requestPermission();
    } else {
      setEnabled(false);
      return false;
    }
  }, [enabled, requestPermission]);

  return {
    permission,
    enabled,
    requestPermission,
    showNotification,
    showOrderNotification,
    toggleNotifications,
    setEnabled
  };
};