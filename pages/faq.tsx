import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../src/components/ui/accordion';
import { Layout } from '../src/components/Layout';

export const faqs = [
  {
    question: 'Como posso rastrear meu pedido?',
    answer: 'Na página inicial do portal, insira o número do seu pedido e o CNPJ cadastrado na compra. Em seguida, clique em "Rastrear Pedido" para ver todos os detalhes.'
  },
  {
    question: 'O que cada status do pedido significa?',
    answer: `
      <ul>
        <li><strong>Confirmado:</strong> Seu pedido foi recebido e está em processamento.</li>
        <li><strong>Faturado:</strong> A nota fiscal do seu pedido foi emitida.</li>
        <li><strong>Em transporte:</strong> Seu pedido já foi coletado pela transportadora e está a caminho.</li>
        <li><strong>Aguardando retirada:</strong> Seu pedido está pronto e aguardando a retirada pela transportadora.</li>
        <li><strong>Entregue:</strong> O pedido foi entregue com sucesso no endereço de destino.</li>
        <li><strong>Cancelado:</strong> O pedido foi cancelado.</li>
      </ul>
    `
  },
  {
    question: 'Onde encontro a Nota Fiscal (NF-e) e o boleto?',
    answer: 'Após localizar seu pedido, navegue até a seção "Documentos". Lá você encontrará a Nota Fiscal, boletos e outros arquivos relevantes para visualização e download.'
  },
  {
    question: 'Como sei qual é a transportadora e o código de rastreio?',
    answer: 'Assim que o pedido for despachado, as informações da transportadora, incluindo o nome e o código de rastreio, aparecerão na seção "Transporte" dentro dos detalhes do seu pedido.'
  },
  {
    question: 'A previsão de entrega pode mudar?',
    answer: 'Sim, a previsão de entrega é uma estimativa inicial. Ela pode ser atualizada conforme o andamento da produção ou com base em novas informações da transportadora. A data exibida no portal é sempre a mais recente.'
  },
  {
    question: 'Não consigo encontrar meu pedido. O que devo fazer?',
    answer: 'Primeiro, verifique se o número do pedido e o CNPJ foram digitados exatamente como na confirmação da compra. Se o erro persistir, por favor, entre em contato com nosso suporte ao cliente.'
  }
];

export const FAQPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Perguntas Frequentes (FAQ)</h1>
          <p className="text-lg text-gray-600 mt-2">Encontre aqui as respostas para as dúvidas mais comuns.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
};

