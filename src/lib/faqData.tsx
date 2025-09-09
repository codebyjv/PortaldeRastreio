export const faqs = [
    {
        question: 'Como posso rastrear meu pedido?',
        answer: 'Na página inicial do portal, insira o número do seu CNPJ (O mesmo informado na proposta enviada a você). Em seguida, clique em "Rastrear Pedido" para ver todos os detalhes.'
    },
    {
        question: 'O que cada status do pedido significa?',
        answer: (
            <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><span className="font-semibold text-gray-800">Confirmado:</span> Seu pedido foi recebido e está em processamento.</li>
                <li><span className="font-semibold text-gray-800">Faturado:</span> A nota fiscal do seu pedido foi emitida.</li>
                <li><span className="font-semibold text-gray-800">Em transporte:</span> Seu pedido já foi coletado pela transportadora/Correios e está a caminho.</li>
                <li><span className="font-semibold text-gray-800">Aguardando retirada:</span> Seu pedido está pronto e aguardando a retirada.</li>
                <li><span className="font-semibold text-gray-800">Entregue:</span> O pedido foi entregue com sucesso no endereço de destino.</li>
                <li><span className="font-semibold text-gray-800">Cancelado:</span> O pedido foi cancelado.</li>
            </ul>
        )
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