import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { History } from 'lucide-react';

interface ActionLogFeedProps {
  orderId: string;
}

interface ActionLog {
  id: number;
  created_at: string;
  user_email: string;
  action: string;
  details: any;
}

export const ActionLogFeed = ({ orderId }: ActionLogFeedProps) => {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const logData = await SupabaseService.getActionLogs(orderId);
        setLogs(logData);
      } catch (error) {
        console.error('Erro ao buscar histórico de ações:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchLogs();
    }
  }, [orderId]);

  if (loading) {
    return <p>Carregando histórico...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                    <div className="w-px h-full bg-gray-200 mt-2"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium text-gray-800">{log.action}</p>
                  <p className="text-sm text-gray-500">
                    por {log.user_email} em {new Date(log.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhuma atividade registrada para este pedido.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};