# Portal de Rastreamento de Pedidos

Portal web para rastreamento de pedidos integrado com Google Sheets, desenvolvido em React + TypeScript + Tailwind CSS.

## 🚀 Funcionalidades

- ✅ Busca de pedidos por CNPJ de faturamento
- ✅ Timeline detalhado do status do pedido
- ✅ Download de documentos (NF, boleto, comprovantes)
- ✅ Formulário de feedback opcional
- ✅ Controle de período de disponibilidade dos dados
- ✅ Integração com Google Sheets API
- ✅ Interface responsiva e profissional

## 🛠️ Tecnologias

- **React 18** - Framework frontend
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **Vite** - Build tool e dev server
- **Google Sheets API** - Fonte de dados
- **Lucide React** - Ícones
- **Shadcn/UI** - Componentes de interface

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Google Cloud (para API do Google Sheets)

## 🔧 Instalação e Configuração

### 1. Clonar e instalar dependências

```bash
# Navegar para a pasta do projeto
cd portal-rastreamento-pedidos

# Instalar dependências
npm install
```

### 2. Executar em modo desenvolvimento

```bash
npm run dev
```

O projeto será executado em `http://localhost:3000`

### 3. Configurar Google Sheets API

#### 3.1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**
4. Crie uma **API Key** em "Credenciais"

#### 3.2. Preparar a planilha

Crie uma planilha no Google Sheets com as seguintes colunas na primeira linha:

| Numero_Pedido | Nome_Cliente | Data_Pedido | Status_Pedido | Data_Emissao_NF | Data_Expiracao | Anexos | CNPJ |
|---------------|--------------|-------------|---------------|-----------------|----------------|--------|------|

**Exemplo de dados:**
```
PED-2024-001234 | Empresa Exemplo Ltda | 2024-08-15 | Em Transporte | 2024-08-18 | 2024-09-15 | nota_fiscal.pdf;boleto.pdf;comprovante.pdf | 12.345.678/0001-90
```

#### 3.3. Configurar no portal

1. Abra o portal no navegador
2. Clique em "Configurar"
3. Insira:
   - **API Key**: Sua chave da API do Google
   - **ID da Planilha**: Encontrado na URL da planilha
   - **Nome da Aba**: Nome da aba (padrão: "Pedidos")

## 📁 Estrutura de Pastas

```
├── components/           # Componentes React
│   ├── ui/              # Componentes base (Shadcn/UI)
│   ├── OrderTrackingPortal.tsx
│   ├── SheetsConfiguration.tsx
│   └── ...
├── services/            # Serviços (API Google Sheets)
├── utils/               # Utilitários e mapeadores
├── styles/              # Estilos globais (Tailwind)
└── README.md
```

## 🔍 Como Usar

### Para o usuário final:
1. Acesse o portal
2. Digite o CNPJ de faturamento
3. Visualize o status detalhado do pedido
4. Faça download dos documentos disponíveis
5. Deixe feedback (opcional)

### Para quem alimenta os dados:
1. Configure a integração uma única vez
2. Preencha a planilha do Google Sheets
3. Os dados aparecem automaticamente no portal

## 📊 Estrutura da Planilha Google Sheets

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `Numero_Pedido` | Número único do pedido | PED-2024-001234 |
| `Nome_Cliente` | Nome da empresa/cliente | Empresa Exemplo Ltda |
| `Data_Pedido` | Data do pedido (YYYY-MM-DD) | 2024-08-15 |
| `Status_Pedido` | Status atual | Em Transporte |
| `Data_Emissao_NF` | Data da nota fiscal | 2024-08-18 |
| `Data_Expiracao` | Até quando ficará disponível | 2024-09-15 |
| `Anexos` | Nomes dos arquivos (separados por ;) | nota.pdf;boleto.pdf |
| `CNPJ` | CNPJ para busca | 12.345.678/0001-90 |

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Executar em desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificar código
```

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 📝 Personalização

- **Cores**: Edite `styles/globals.css`
- **Componentes**: Modifique arquivos em `components/`
- **Lógica de negócio**: Ajuste `services/` e `utils/`

## 🤝 Suporte

Para dúvidas sobre configuração ou uso, consulte:
- [Documentação Google Sheets API](https://developers.google.com/sheets/api)
- [Guia Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação React](https://react.dev)

---

**Desenvolvido com ❤️ para otimizar o acompanhamento de pedidos**
```