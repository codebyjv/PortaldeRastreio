import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SupabaseService } from '../services/supabaseService';
import { EnrichedOrderItem, Order } from '../types/order';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Layout } from './Layout';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { BellRing, Undo2 } from 'lucide-react';

// Função para calcular a diferença em dias úteis
const getBusinessDaysDifference = (startDate: Date, endDate: Date) => {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count - 1;
};

// Agrupa itens por pedido
const groupItemsByOrder = (items: EnrichedOrderItem[]) => {
  return items.reduce((acc, item) => {
    const orderId = item.orders.order_number;
    if (!acc[orderId]) {
      acc[orderId] = {
        ...item.orders,
        items: []
      };
    }
    acc[orderId].items.push(item);
    return acc;
  }, {} as Record<string, Order & { items: EnrichedOrderItem[] }>);
};


export const RbcDashboard = () => {
  const [pendingApprovalItems, setPendingApprovalItems] = useState<Record<string, Order & { items: EnrichedOrderItem[] }>>({});
  const [approvedItems, setApprovedItems] = useState<Record<string, Order & { items: EnrichedOrderItem[] }>>({});
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<EnrichedOrderItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const allRbcItems = await SupabaseService.getRbcItems();

    const pending = allRbcItems.filter(item => !item.proposal_approved);
    const approved = allRbcItems.filter(item => item.proposal_approved);

    setPendingApprovalItems(groupItemsByOrder(pending));
    setApprovedItems(groupItemsByOrder(approved));

    // Lógica de Lembrete
    const today = new Date();
    const reminderItems = pending.filter(item => {
      if (!item.proposal_sent_date) return false;
      const proposalDate = new Date(item.proposal_sent_date);
      return getBusinessDaysDifference(proposalDate, today) > 2;
    });
    setReminders(reminderItems);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveProposal = async (itemIds: number[]) => {
    try {
      await SupabaseService.approveRbcProposal(itemIds);
      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao aprovar proposta:', error);
      alert('Não foi possível aprovar a proposta.');
    }
  };

  const handleRejectProposal = async (itemIds: number[]) => {
    try {
      await SupabaseService.rejectRbcProposal(itemIds);
      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao reverter proposta:', error);
      alert('Não foi possível reverter a proposta.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Gestão de Propostas RBC</h1>

        {reminders.length > 0 && (
          <Alert variant="destructive">
            <BellRing className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Existem {reminders.length} proposta(s) pendente(s) há mais de 2 dias úteis.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Propostas a Aprovar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Carregando...</p> : Object.keys(pendingApprovalItems).length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma proposta pendente.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Aprovar</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data do Pedido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(pendingApprovalItems).map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox onCheckedChange={() => handleApproveProposal(order.items.map(i => i.id))} />
                      </TableCell>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside">
                          {order.items.map(item => (
                            <li key={item.id}>
                              {item.product_description}
                              {item.capacity && ` Cap.: ${item.capacity}`}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <ul className="list-none">
                          {order.items.map(item => (
                            <li key={item.id}>{item.quantity}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propostas Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Carregando...</p> : Object.keys(approvedItems).length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma proposta aprovada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data da Aprovação</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(approvedItems).map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside">
                          {order.items.map(item => (
                            <li key={item.id}>
                              {item.product_description}
                              {item.capacity && ` Cap.: ${item.capacity}`}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <ul className="list-none">
                          {order.items.map(item => (
                            <li key={item.id}>{item.quantity}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>{order.items[0]?.proposal_approved_date ? new Date(order.items[0].proposal_approved_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRejectProposal(order.items.map(i => i.id))}>
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};