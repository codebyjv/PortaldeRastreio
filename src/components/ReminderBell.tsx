import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { SupabaseService } from '../services/supabaseService';

// Definindo o tipo de notificação aqui para clareza
export interface ReminderNotification {
  id: number;
  created_at: string;
  message: string;
  order_id: string;
  is_read: boolean;
}

export const ReminderBell = () => {
  const [notifications, setNotifications] = useState<ReminderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    const data = await SupabaseService.getUnreadNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();

    // Opcional: buscar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await SupabaseService.markNotificationAsRead(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = async () => {
    await SupabaseService.markAllNotificationsAsRead();
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs font-bold text-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-medium">Lembretes Automáticos</h4>
          <p className="text-sm text-muted-foreground">
            Pedidos que precisam de atenção.
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Marcar como lido"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              Nenhum lembrete novo.
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="link"
              className="w-full"
              onClick={handleMarkAllAsRead}
            >
              Marcar todos como lidos
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};