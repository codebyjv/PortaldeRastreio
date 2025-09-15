import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SupabaseService } from '../services/supabaseService';
import { EnrichedOrderItem, IpemAssessment } from '../types/order';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Layout } from './Layout';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Printer, Trash2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';

export const IpemDashboard = () => {
  const [pendingItems, setPendingItems] = useState<EnrichedOrderItem[]>([]);
  const [selectedPendingItems, setSelectedPendingItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const [assessments, setAssessments] = useState<IpemAssessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [assessmentItems, setAssessmentItems] = useState<EnrichedOrderItem[]>([]);
  const [loadingAssessmentItems, setLoadingAssessmentItems] = useState(false);

  const [newAssessmentDate, setNewAssessmentDate] = useState<Date | undefined>();

  const fetchData = async () => {
    setLoading(true);
    const [pending, assess] = await Promise.all([
      SupabaseService.getPendingIpemItems(),
      SupabaseService.getIpemAssessments(),
    ]);
    setPendingItems(pending);
    setAssessments(assess);
    if (assess.length > 0 && !selectedAssessmentId) {
      setSelectedAssessmentId(assess[0].id.toString());
    }
    setLoading(false);
  };

  const fetchAssessmentItems = async () => {
    if (!selectedAssessmentId) {
      setAssessmentItems([]);
      return;
    }
    setLoadingAssessmentItems(true);
    const items = await SupabaseService.getAssessmentItems(parseInt(selectedAssessmentId, 10));
    setAssessmentItems(items);
    setLoadingAssessmentItems(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAssessmentItems();
  }, [selectedAssessmentId]);

  const handleSelectItem = (itemId: number) => {
    setSelectedPendingItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    setSelectedPendingItems(isChecked ? pendingItems.map(item => item.id) : []);
  };

  const handleCreateAssessment = async () => {
    if (!newAssessmentDate) return;
    try {
      const newAssessment = await SupabaseService.createIpemAssessment({ assessment_date: newAssessmentDate.toISOString() });
      setAssessments(prev => [newAssessment, ...prev]);
      setSelectedAssessmentId(newAssessment.id.toString());
      setNewAssessmentDate(undefined);
    } catch (error) {
      console.error('Erro ao criar aferição:', error);
      alert('Não foi possível criar a aferição.');
    }
  };

  const handleAddItemsToAssessment = async () => {
    if (selectedPendingItems.length === 0 || !selectedAssessmentId) return;
    try {
      await SupabaseService.addItemsToAssessment(parseInt(selectedAssessmentId, 10), selectedPendingItems);
      setSelectedPendingItems([]);
      fetchData();
      fetchAssessmentItems();
    } catch (error) {
      console.error('Erro ao adicionar itens:', error);
      alert('Não foi possível adicionar os itens à aferição.');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedAssessmentId) return;
    try {
      await SupabaseService.removeItemFromAssessment(parseInt(selectedAssessmentId, 10), itemId);
      fetchData();
      fetchAssessmentItems();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      alert('Não foi possível remover o item da aferição.');
    }
  };

  const isAllSelected = pendingItems.length > 0 && selectedPendingItems.length === pendingItems.length;
  const selectedAssessment = assessments.find(a => a.id.toString() === selectedAssessmentId);

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6 no-print">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">Gestão de Aferição IPEM</h1>
          <Button onClick={handleAddItemsToAssessment} disabled={selectedPendingItems.length === 0 || !selectedAssessmentId}>
            Adicionar {selectedPendingItems.length > 0 ? selectedPendingItems.length : ''} item(s) à Aferição
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens IPEM Aguardando Aferição</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Carregando itens...</p> : pendingItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum item IPEM pendente encontrado.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="w-[50px]"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} /></TableHead><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Item / Descrição</TableHead><TableHead className="w-[100px]">Capacidade</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pendingItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell><Checkbox checked={selectedPendingItems.includes(item.id)} onCheckedChange={() => handleSelectItem(item.id)} /></TableCell>
                        <TableCell><div className="font-medium">{item.orders.order_number}</div><div className="text-xs text-gray-500">{new Date(item.orders.order_date).toLocaleDateString()}</div></TableCell>
                        <TableCell>{item.orders.customer_name}</TableCell>
                        <TableCell>{item.product_description}</TableCell>
                        <TableCell>{item.capacity && <Badge variant="secondary">{item.capacity}</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Relação de Itens para Aferição</CardTitle>
            <Button variant="outline" size="icon" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-slate-50">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="assessment-select" className="text-sm font-medium mb-1 block">Selecionar Aferição</label>
                <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                  <SelectTrigger><SelectValue placeholder="Escolha uma aferição..." /></SelectTrigger>
                  <SelectContent>
                    {assessments.map(a => <SelectItem key={a.id} value={a.id.toString()}>Aferição de {format(new Date(a.assessment_date), 'dd/MM/yyyy')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center text-sm text-gray-500">OU</div>
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="new-assessment-date" className="text-sm font-medium mb-1 block">Criar Nova Aferição</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAssessmentDate ? format(newAssessmentDate, 'dd/MM/yyyy') : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newAssessmentDate} onSelect={setNewAssessmentDate} initialFocus /></PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button className="relative top-3" onClick={handleCreateAssessment} disabled={!newAssessmentDate}><PlusCircle className="w-4 h-4 mr-2"/> Criar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="printable-area">
        {selectedAssessment && (
          <div className="mb-4 p-4">
            <h2 className="text-lg font-semibold">Aferição de {format(new Date(selectedAssessment.assessment_date), 'dd/MM/yyyy')}</h2>
            <p className="text-sm text-gray-600">Total de Itens: {assessmentItems.length}</p>
          </div>
        )}
        {loadingAssessmentItems ? <p>Carregando itens da aferição...</p> : assessmentItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum item nesta aferição.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto p-4 mb-12 print-no-scroll">
            <Table>
              <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Item / Descrição</TableHead><TableHead className="w-[100px]">Capacidade</TableHead><TableHead className="w-[50px] no-print"></TableHead></TableRow></TableHeader>
              <TableBody>
                {assessmentItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell><div className="font-medium">{item.orders.order_number}</div><div className="text-xs text-gray-500">{new Date(item.orders.order_date).toLocaleDateString()}</div></TableCell>
                    <TableCell>{item.orders.customer_name}</TableCell>
                    <TableCell>{item.product_description}</TableCell>
                    <TableCell>{item.capacity && <Badge variant="secondary">{item.capacity}</Badge>}</TableCell>
                    <TableCell className="no-print">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};