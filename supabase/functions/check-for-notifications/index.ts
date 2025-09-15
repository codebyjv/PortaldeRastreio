import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0-rc.10'
import { corsHeaders } from '../_shared/cors.ts'

// Função para calcular a diferença em dias úteis
const getBusinessDaysDifference = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count -1; // Subtrai 1 para não contar o dia inicial
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
    );

    const notificationsToCreate: { message: string; order_id?: string }[] = [];
    const today = new Date();

    // 1. Pedidos em "Preparando" por mais de 7 dias úteis
    const sevenBusinessDaysAgo = new Date(today);
    sevenBusinessDaysAgo.setDate(sevenBusinessDaysAgo.getDate() - 10); // Aproximação, filtro primário
    const { data: preparingOrders, error: preparingError } = await supabase
      .from('orders')
      .select('id, order_number, status_updated_at')
      .eq('status', 'Preparando')
      .lt('status_updated_at', sevenBusinessDaysAgo.toISOString());

    if (preparingError) throw preparingError;

    for (const order of preparingOrders) {
      if (getBusinessDaysDifference(new Date(order.status_updated_at), today) > 7) {
        notificationsToCreate.push({
          message: `O pedido ${order.order_number} está há mais de 7 dias com o status "Preparando", verificar.`,
          order_id: order.id,
        });
      }
    }

    // 2. Pedidos "Aguardando retirada" por mais de 3 dias úteis
    const threeBusinessDaysAgo = new Date(today);
    threeBusinessDaysAgo.setDate(threeBusinessDaysAgo.getDate() - 5);
    const { data: waitingOrders, error: waitingError } = await supabase
      .from('orders')
      .select('id, order_number, status_updated_at')
      .eq('status', 'Aguardando retirada')
      .lt('status_updated_at', threeBusinessDaysAgo.toISOString());

    if (waitingError) throw waitingError;

    for (const order of waitingOrders) {
      if (getBusinessDaysDifference(new Date(order.status_updated_at), today) > 3) {
        notificationsToCreate.push({
          message: `O pedido ${order.order_number} está há mais de 3 dias com o status "Aguardando retirada", verificar.`,
          order_id: order.id,
        });
      }
    }

    // 3. Itens aguardando aferição IPEM por mais de 2 dias úteis
    const twoBusinessDaysAgo = new Date(today);
    twoBusinessDaysAgo.setDate(twoBusinessDaysAgo.getDate() - 4);
    const { data: ipemItems, error: ipemError } = await supabase.rpc('get_pending_ipem_items_for_notification', { 
      date_limit: twoBusinessDaysAgo.toISOString() 
    });

    if (ipemError) throw ipemError;

    if (ipemItems && ipemItems.length > 0) {
        const itemsCount = ipemItems.length;
        // Verifica se já existe uma notificação recente para não duplicar
        const { data: existingIpemNotif } = await supabase.from('notifications').select('id').eq('message', 'Existem itens aguardando aferição IPEM há mais de 2 dias.').gt('created_at', twoBusinessDaysAgo.toISOString()).limit(1);
        if (!existingIpemNotif || existingIpemNotif.length === 0) {
            notificationsToCreate.push({ message: `Existem ${itemsCount} itens aguardando aferição IPEM há mais de 2 dias.` });
        }
    }

    // 4. Propostas RBC não aprovadas em 2 dias úteis
    const { data: rbcItems, error: rbcError } = await supabase
      .from('order_items')
      .select('id, proposal_sent_date')
      .eq('certificate_type', 'RBC')
      .eq('proposal_approved', false)
      .not('proposal_sent_date', 'is', null)
      .lt('proposal_sent_date', twoBusinessDaysAgo.toISOString());

    if (rbcError) throw rbcError;
    
    if (rbcItems && rbcItems.length > 0) {
        const itemsCount = rbcItems.filter(item => getBusinessDaysDifference(new Date(item.proposal_sent_date!), today) > 2).length;
        if (itemsCount > 0) {
            const message = `Existem ${itemsCount} propostas RBC para aprovar há mais de 2 dias.`;
            const { data: existingRbcNotif } = await supabase.from('notifications').select('id').eq('message', message).gt('created_at', twoBusinessDaysAgo.toISOString()).limit(1);
            if (!existingRbcNotif || existingRbcNotif.length === 0) {
                notificationsToCreate.push({ message });
            }
        }
    }

    // 5. Pedidos sem documentos anexados após X dias
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const { data: ordersWithoutDocs, error: docsError } = await supabase.rpc('get_orders_without_documents', { 
      date_limit: fiveDaysAgo.toISOString() 
    });

    if (docsError) throw docsError;

    if (ordersWithoutDocs && ordersWithoutDocs.length > 0) {
      for (const order of ordersWithoutDocs) {
        const message = `O pedido ${order.order_number} está sem documentos anexados há mais de 5 dias.`;
        notificationsToCreate.push({ message, order_id: order.id });
      }
    }

    // Insere as notificações no banco de dados
    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabase.from('notifications').insert(notificationsToCreate);
      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ count: notificationsToCreate.length, notifications: notificationsToCreate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});