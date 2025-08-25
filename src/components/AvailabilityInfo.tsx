// import React from 'react'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'

interface AvailabilityPeriod {
  start: string
  end: string
}

interface AvailabilityInfoProps {
  availabilityPeriod: AvailabilityPeriod
}

export function AvailabilityInfo({ availabilityPeriod }: AvailabilityInfoProps) {
  const startDate = new Date(availabilityPeriod.start)
  const endDate = new Date(availabilityPeriod.end)
  const currentDate = new Date()
  
  // Calcular dias restantes
  const daysRemaining = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calcular progresso (dias passados / total de dias)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))

  const getStatusInfo = () => {
    if (daysRemaining < 0) {
      return {
        status: 'expired',
        badge: { text: 'Expirado', color: 'destructive' },
        message: 'Os dados deste pedido não estão mais disponíveis para consulta.',
        icon: AlertCircle,
        iconColor: 'text-red-500'
      }
    } else if (daysRemaining <= 7) {
      return {
        status: 'expiring',
        badge: { text: 'Expirando em breve', color: 'destructive' },
        message: `Os dados deste pedido estarão disponíveis por apenas mais ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}.`,
        icon: AlertCircle,
        iconColor: 'text-orange-500'
      }
    } else {
      return {
        status: 'active',
        badge: { text: 'Ativo', color: 'secondary' },
        message: `Os dados deste pedido estarão disponíveis por mais ${daysRemaining} dias.`,
        icon: Clock,
        iconColor: 'text-green-500'
      }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Período de Disponibilidade
          </CardTitle>
          <Badge variant={statusInfo.badge.color as any}>
            {statusInfo.badge.text}
          </Badge>
        </div>
        <CardDescription>
          Período em que os dados deste pedido ficam disponíveis no portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso do período</span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  statusInfo.status === 'expired' ? 'bg-red-500' :
                  statusInfo.status === 'expiring' ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Início</p>
                <p className="text-sm text-gray-600">{startDate.toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                statusInfo.status === 'expired' ? 'bg-red-100' :
                statusInfo.status === 'expiring' ? 'bg-orange-100' : 
                'bg-green-100'
              }`}>
                <StatusIcon className={`w-5 h-5 ${statusInfo.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Fim</p>
                <p className="text-sm text-gray-600">{endDate.toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <Alert variant={statusInfo.status === 'expired' ? 'destructive' : 'default'}>
            <StatusIcon className="h-4 w-4" />
            <AlertDescription>
              {statusInfo.message}
            </AlertDescription>
          </Alert>

          {/* Additional Info */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Após o período de disponibilidade, os dados serão arquivados</p>
            <p>• Para consultas posteriores, entre em contato com nosso suporte</p>
            <p>• Recomendamos fazer o download dos documentos necessários</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}