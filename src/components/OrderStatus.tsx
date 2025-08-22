import React from 'react'
import { CheckCircle, Clock, Truck, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface TimelineItem {
  date: string
  status: string
  description: string
  completed: boolean
  current?: boolean
}

interface OrderStatusProps {
  timeline: TimelineItem[]
  expectedDelivery: string
}

export function OrderStatus({ timeline, expectedDelivery }: OrderStatusProps) {
  const getStatusIcon = (item: TimelineItem) => {
    if (item.completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (item.current) {
      return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
    } else {
      return <Clock className="w-5 h-5 text-gray-300" />
    }
  }

  const getStatusColor = (item: TimelineItem) => {
    if (item.completed) return 'bg-green-500'
    if (item.current) return 'bg-blue-500'
    return 'bg-gray-300'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Status do Pedido
          </CardTitle>
          <Badge variant="outline" className="flex items-center">
            <Package className="w-4 h-4 mr-1" />
            Previsão: {new Date(expectedDelivery).toLocaleDateString('pt-BR')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-start mb-6 last:mb-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center mr-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(item)}`} />
                {index < timeline.length - 1 && (
                  <div className={`w-0.5 h-12 mt-2 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`${item.completed || item.current ? 'text-gray-900' : 'text-gray-400'}`}>
                    {item.status}
                  </h4>
                  <div className="flex items-center">
                    {getStatusIcon(item)}
                    <span className={`ml-2 text-sm ${item.completed || item.current ? 'text-gray-600' : 'text-gray-400'}`}>
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <p className={`text-sm ${item.completed || item.current ? 'text-gray-600' : 'text-gray-400'}`}>
                  {item.description}
                </p>
                {item.current && (
                  <Badge variant="secondary" className="mt-2">
                    Status Atual
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}