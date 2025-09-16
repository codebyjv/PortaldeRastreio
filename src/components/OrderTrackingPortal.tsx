import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'
import { Search, Package, Settings, TriangleAlert, Truck, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { OrderStatus } from './OrderStatus'
import { DocumentsSection } from './DocumentsSection'
import { FeedbackForm } from './FeedbackForm'
import { AvailabilityInfo } from './AvailabilityInfo'
import { SupabaseService } from '../services/supabaseService'
import { Order } from '../types/order';
import { OrderMapperService } from '../services/orderMapperService'
import { LoginModal } from './LoginModal'
import { Layout } from './Layout';
import { FAQPage } from '../../pages/faq';

export function OrderTrackingPortal() {
   const navigate = useNavigate();
  
  const [cnpj, setCnpj] = useState('')
  const [searchResult, setSearchResult] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setCnpj(formatted)
  }

  const handleSearch = async () => {
    if (!cnpj.trim()) {
      setError('Por favor, digite um CNPJ válido')
      return
    }

    setIsLoading(true)
    setError('')
    setSearchResult(null)
    
    try {
      // Limpar formatação do CNPJ para busca
      const cleanCnpj = cnpj.replace(/\D/g, '')
      console.log('Buscando CNPJ:', cleanCnpj);

      const orders = await SupabaseService.getOrdersByCNPJ(cleanCnpj)
      console.log('Pedidos encontrados:', orders);
      
      if (orders && orders.length > 0) {
        setSearchResult(orders[0]);
      } else {
        setError('Nenhum pedido encontrado para este CNPJ');
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      setError('Erro ao buscar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Função para mapear dados para a timeline (adaptação temporária)
  const mapOrderToTimeline = (order: Order) => {
    const baseDate = order.order_date
    return [
      {
        date: baseDate.toString(),
        status: 'Pedido Confirmado',
        description: 'Pedido recebido e confirmado',
        completed: true
      },
      {
        date: OrderMapperService.addDays(baseDate, 1).toISOString(),
        status: 'Em Andamento',
        description: 'Pedido em processamento',
        completed: order.status !== 'Confirmado',
        current: order.status === 'Em Andamento'
      },
      {
        date: OrderMapperService.addDays(baseDate, 2).toISOString(),
        status: 'Faturado',
        description: 'Nota fiscal emitida',
        completed: ['Faturado', 'Despachado', 'Em Transporte', 'Entregue'].includes(order.status),
        current: order.status === 'Faturado'
      },
      {
        date: OrderMapperService.addDays(baseDate, 3).toISOString(),
        status: 'Despachado',
        description: 'Produto saiu para entrega',
        completed: ['Despachado', 'Em Transporte', 'Entregue'].includes(order.status),
        current: order.status === 'Despachado'
      },
      {
        date: OrderMapperService.addDays(baseDate, 5).toISOString(),
        status: 'Em Transporte',
        description: 'A caminho do destino',
        completed: ['Em Transporte', 'Entregue'].includes(order.status),
        current: order.status === 'Em Transporte'
      },
      {
        date: OrderMapperService.addDays(baseDate, 7).toISOString(),
        status: 'Entregue',
        description: 'Produto entregue',
        completed: order.status === 'Entregue',
        current: order.status === 'Entregue'
      }
    ]
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const getTrackingUrl = (carrier: string, code: string) => {
    const normalizedCarrier = carrier.toLowerCase();
    
    if (normalizedCarrier.includes('correios')) {
      return `https://www2.correios.com.br/sistemas/rastreamento/resultado.cfm?objetos=${code}`;
    }
    
    if (normalizedCarrier.includes('jadlog')) {
      return `https://www.jadlog.com.br/siteInstitucional/tracking.jad?cte=${code}`;
    }
    
    if (normalizedCarrier.includes('dhl')) {
      return `https://www.dhl.com/track?trackingNumber=${code}`;
    }
    
    // URL genérica para outras transportadoras
    return `https://www.google.com/search?q=rastrear+${code}+${carrier}`;
  };

  return (
      <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://res.cloudinary.com/ditwnysdl/image/upload/v1742989047/ff0nv3sruwxndjos7fhz.png"
                alt="Logo do Portal"
                className="w-12 h-12 mr-3 object-contain"
              />
              <h1 className="text-3xl font-bold text-gray-900">Portal de Rastreio - WL Pesos Padrão</h1>
            </div>
            <p className="text-lg text-gray-600">
              Acompanhe o status dos seus pedidos e acesse documentos (NF-e, Boletos, Certificados, etc)
            </p>

            {/* Botão de Configurações */}
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={handleAdminAccess}
                className="flex items-center mx-auto"
              >
                <Settings className="w-4 h-4 mr-2 text-red-600" />
                {isAuthenticated ? 'Ir para Admin' : 'Acesso Administrativo'}
              </Button>
            </div>

            {/* Modal de Login */}
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Pedido
              </CardTitle>
              <CardDescription>
                Digite o CNPJ conforme o aprovado pela proposta comercial enviada e aprovada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={handleCNPJChange}
                    onKeyPress={handleKeyPress}
                    maxLength={18}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-8"
                >
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
              
              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {searchResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Número do Pedido</p>
                      <p className="font-semibold">{searchResult.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-semibold">{searchResult.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data do Pedido</p>
                      <p className="font-semibold">{searchResult.order_date.toString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="font-semibold text-green-600">
                        {OrderMapperService.formatCurrency(searchResult.total_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold capitalize">{searchResult.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Previsão de Entrega</p>
                      <p className="font-semibold">
                        {searchResult.expected_delivery.toString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CNPJ</p>
                      <p className="font-semibold">{searchResult.cnpj}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <OrderStatus 
                timeline={mapOrderToTimeline(searchResult)} 
                expectedDelivery={searchResult.expected_delivery.toString()} 
              />

              {/* NOVA SEÇÃO: Informações de Transporte */}
              {(searchResult.tracking_code || searchResult.shipping_carrier) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Informações de Transporte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResult.shipping_carrier && (
                        <div>
                          <p className="text-sm text-gray-600">Transportadora</p>
                          <p className="font-semibold">{searchResult.shipping_carrier}</p>
                        </div>
                      )}
                      
                      {searchResult.shipping_method && (
                        <div>
                          <p className="text-sm text-gray-600">Método de Envio</p>
                          <p className="font-semibold">{searchResult.shipping_method}</p>
                        </div>
                      )}
                      
                      {searchResult.collection_number && (
                        <div>
                          <p className="text-sm text-gray-600">Número da Coleta</p>
                          <p className="font-semibold">{searchResult.collection_number}</p>
                        </div>
                      )}
                      
                      {searchResult.tracking_code && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Código de Rastreio</p>
                          <div className="flex items-center">
                            <p className="font-semibold mr-2">{searchResult.tracking_code}</p>
                            {searchResult.shipping_carrier && (
                              <a
                                href={getTrackingUrl(searchResult.shipping_carrier, searchResult.tracking_code)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Rastrear
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Instruções de rastreamento */}
                    {searchResult.tracking_code && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          Como rastrear seu pedido:
                        </h4>
                        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                          <li>Copie o código de rastreio: <strong>{searchResult.tracking_code}</strong></li>
                          <li>Clique no link &quot;Rastrear&quot; acima ou visite o site da transportadora</li>
                          <li>Cole o código no campo de rastreamento</li>
                          <li>Acompanhe a situação do seu pedido</li>
                        </ol>
                        <p className="text-xs text-blue-600 mt-2">
                          O rastreamento geralmente fica disponível 24h após a postagem.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <DocumentsSection 
                orderId={searchResult.id!}
                orderNumber={searchResult.order_number}
                customerName={searchResult.customer_name}
              />
              
              <AvailabilityInfo 
                availabilityPeriod={{
                  start: searchResult.order_date.toString(),
                  end: searchResult.expiration_date.toString()
                }} 
              />
              
              <FeedbackForm orderNumber={searchResult.order_number} />
            </div>
          )}

          {!searchResult && !error && (
            <Card className="text-center py-12">
              <CardContent>
                <TriangleAlert className="w-16 h-16 text-amber-100 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Digite o CNPJ de faturamento para consultar seus pedidos
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Os dados são buscados diretamente do nosso sistema
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ===== FAQ - Perguntas Frequentes ===== */}
        <FAQPage/>
      </div>
    </Layout>
  )
}