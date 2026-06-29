# Cliniq — Gestão para Clínicas Odontológicas

> SaaS multi-tenant desenvolvido do zero para simplificar a gestão de clínicas odontológicas — agenda, pacientes, métricas e cobrança em um só lugar.

## ✨ Funcionalidades

- **Agenda inteligente** — visualização por lista, semana ou mês, com bloqueio automático de conflitos de horário
- **Gestão de pacientes** — cadastro completo com histórico de consultas, observações clínicas e busca rápida
- **Retornos** — agendamento de retorno com grade semanal dinâmica e sugestão de horários disponíveis
- **Métricas em tempo real** — receita, taxa de comparecimento e desempenho por procedimento, com filtro por período
- **Onboarding self-service** — cadastro público com trial de 30 dias, sem intervenção manual
- **Cobrança recorrente** — geração automática de Pix mensal via Edge Function agendada, com bloqueio por inadimplência
- **Painel administrativo** — gestão completa de tenants, cobranças e suporte
- **Landing page** — página pública com fluxo de conversão direto para o cadastro

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Back-end | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| E-mail | Resend |
| Automação | Supabase pg_cron + pg_net |
| Deploy | Vercel (planejado) |

## 🏗 Arquitetura

- **Multi-tenant** com isolamento total de dados via Row Level Security (RLS) no PostgreSQL
- **Middleware de autenticação** com verificação de role (admin/client), trial e status do tenant
- **APIs protegidas** — `tenant_id` sempre resolvido no servidor, nunca enviado pelo cliente
- **Rate limiting** nas rotas sensíveis (cadastro, reset de senha)
- **Edge Functions** para lógica serverless agendada (cobrança mensal automatizada)

## 📁 Estrutura

src/
├── app/
│   ├── (auth)/          # Login, cadastro público
│   ├── (dashboard)/     # Área do cliente
│   ├── (admin)/         # Painel administrativo
│   └── api/             # API routes
├── components/
│   ├── ui/              # Design system (Button, Card, StatusBadge...)
│   ├── dashboard/       # Componentes do painel
│   ├── admin/           # Componentes do admin
│   └── landing/         # Seções da landing page
└── lib/                 # Utilitários, clientes Supabase, rate limiting

## 🚀 Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/brunocperez/clinic-saas.git
cd clinic-saas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha com suas chaves do Supabase e Resend

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

## 🔑 Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## 📄 Licença

Este projeto é de uso pessoal e educacional.