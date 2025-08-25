Portal de Rastreamento de Pedidos

Uma aplicação moderna e intuitiva para gerenciamento e rastreamento de pedidos em tempo real, desenvolvida com React, TypeScript e Supabase.

✨ Funcionalidades
📦 Gestão de Pedidos
Cadastro completo de pedidos com informações detalhadas

Atualização em tempo real do status dos pedidos

Histórico completo de alterações e movimentações

Busca e filtros avançados por número de pedido, cliente ou status

📎 Gerenciamento de Documentos
Upload de arquivos (PDF, imagens, documentos)

Organização visual dos documentos por pedido

Visualização rápida sem necessidade de download

Armazenamento seguro no Supabase Storage

🚚 Rastreamento de Transporte
Monitoramento em tempo real da localização

Atualizações de status de transporte

Informações detalhadas de entrega e previsões

Integração com sistemas de logística

⭐ Sistema de Feedback
Avaliação por estrelas (1-5)

Comentários opcionais para feedback qualitativo

Coleta de email para retorno

Armazenamento no banco de dados Supabase

🔔 Notificações
Alertas em tempo real para mudanças de status

Notificações push (se habilitadas pelo usuário)

Histórico de notificações

🛠️ Tecnologias Utilizadas
Frontend
React 18 com hooks e functional components

TypeScript para type safety

Vite para build tooling rápido

Tailwind CSS para estilização

Lucide React para ícones

Backend & Database
Supabase (PostgreSQL) para banco de dados

Supabase Storage para armazenamento de arquivos

Supabase Auth para autenticação (pronto para implementação)

Deploy & Infra
Netlify para deploy e hosting

Environment Variables para configurações sensíveis

🚀 Como Executar o Projeto
Pré-requisitos
Node.js 16+

npm ou yarn

Conta no Supabase

1. Clone o repositório
bash
git clone https://github.com/codebyjv/PortaldeRastreio.git
cd PortaldeRastreio

2. Instale as dependências
bash
npm install
# ou
yarn install

3. Configure as variáveis de ambiente
Crie um arquivo .env.local na raiz do projeto:

env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

4. Execute em desenvolvimento
bash
npm run dev
# ou
yarn dev

5. Abra no navegador
text
http://localhost:5173

📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

👨‍💻 Autor
João Vitor

⭐️ Se este projeto te ajudou, deixe uma estrela no repositório!
