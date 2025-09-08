import { useState, useMemo } from 'react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Order } from '../types/order';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';

interface OrderCalendarViewProps {
  orders: Order[];
}

export const OrderCalendarView = ({ orders }: OrderCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const deliveryDates = useMemo(() => {
    return orders.map(order => new Date(order.expected_delivery));
  }, [orders]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach(order => {
      const date = new Date(order.expected_delivery).toDateString();
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(order);
    });
    return map;
  }, [orders]);

  const DayWithOrders = (day: Date) => {
    const dateStr = day.toDateString();
    const ordersForDay = ordersByDate.get(dateStr);

    if (!ordersForDay) {
      return <div className="p-1 text-center">{day.getDate()}</div>;
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-full h-full flex items-center justify-center rounded-md cursor-pointer bg-blue-100 hover:bg-blue-200">
            <span className="font-bold text-blue-800">{day.getDate()}</span>
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 justify-center text-xs">{ordersForDay.length}</Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Entregas para {day.toLocaleDateString('pt-BR')}</h4>
              <p className="text-sm text-muted-foreground">
                {ordersForDay.length} pedido(s) previsto(s).
              </p>
            </div>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {ordersForDay.map(order => (
                <div key={order.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      #{order.order_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Calendário de Entregas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          numberOfMonths={2}
          modifiers={{ deliveries: deliveryDates }}
          modifiersClassNames={{
            deliveries: 'relative'
          }}
          components={{
            Day: ({ day }) => {
              const isDeliveryDay = deliveryDates.some(
                d => d.toDateString() === new Date(day.date).toDateString()
              );

              return (
                <td>
                  <div className="p-1 text-center">
                    {isDeliveryDay
                      ? DayWithOrders(new Date(day.date))
                      : new Date(day.date).getDate()}
                  </div>
                </td>
              );
            }
          }}
        />
      </CardContent>
    </Card>
  );
};