# Acalanto Tours — ASAAS Payments + Platform Improvements
**Data:** 2026-05-07  
**Versão:** 1.0  
**Status:** Aprovado — pronto para implementação  

---

## 1. Escopo

Integração completa do ASAAS como processador de pagamentos, substituindo o InfinityPay. Inclui:

- Checkout com todos os métodos de pagamento (PIX, cartão, boleto, débito)
- CPF obrigatório no checkout, hasheado no banco (SHA-256 + salt)
- Cobrança única com split múltiplo (preparado, ativado via env var)
- Checklist/roadmap dinâmico no admin (editável pelo painel)
- Portal do parceiro funcional
- Painel financeiro de repasses

---

## 2. Integração ASAAS

### 2.1 Modelo de cobrança

Uma única `charge` por checkout, independente de quantos itens estão no carrinho.

```
Carrinho: Ilha Rasa IV (R$220) + Lancha Privativa (R$400) + Fotografia (R$300)
→ 1 charge no ASAAS: R$920
→ split[] com 3 entradas (quando ASAAS_SPLIT_ENABLED=true)
```

### 2.2 Fluxo de pagamento

```
Cliente → Checkout → POST /api/checkout
  → Cria/encontra customer no ASAAS (CPF raw, não armazenar)
  → Cria charge com billingType escolhido
  → Se ASAAS_SPLIT_ENABLED=true: inclui split[] por parceiro
  → Retorna paymentUrl (PIX qrCode / link cartão / boleto PDF)
  → Redireciona cliente para confirmação

ASAAS → Webhook POST /api/webhooks/asaas
  → Verifica assinatura (ASAAS-Access-Token header)
  → PAYMENT_RECEIVED → atualiza booking status = 'confirmed'
  → PAYMENT_OVERDUE → status = 'overdue', notifica admin
  → PAYMENT_REFUNDED → status = 'refunded'
```

### 2.3 Métodos de pagamento no carrinho

Mostrar os 4 métodos com prazo de confirmação:

| Método | Label no UI | Prazo |
|--------|-------------|-------|
| PIX | PIX — instantâneo | Confirmado em segundos |
| CREDIT_CARD | Cartão de crédito | Confirmado em minutos |
| BOLETO | Boleto bancário | Até 3 dias úteis |
| DEBIT_CARD | Débito online | Confirmado em minutos |

### 2.4 Split preparado (inativo por padrão)

```typescript
// lib/asaas/split.ts
export function buildSplit(items: CartItem[]): AasasSplit[] | undefined {
  if (!process.env.ASAAS_SPLIT_ENABLED) return undefined
  return items
    .filter(i => i.partnerWalletId)
    .map(i => ({
      walletId: i.partnerWalletId!,
      percentualValue: i.partnerCommissionPct ?? 90,
    }))
}
```

Quando `ASAAS_SPLIT_ENABLED` não está definido, `split` é `undefined` e o ASAAS cobra normalmente para a conta mãe.

### 2.5 Env vars necessárias

```env
# ASAAS — fornecidas por Gustavo
ASAAS_API_KEY=                    # chave de produção ($aact_...)
ASAAS_SANDBOX_API_KEY=            # chave sandbox ($aaas_...)
ASAAS_WEBHOOK_TOKEN=              # token para validar webhooks
ASAAS_ENVIRONMENT=sandbox         # sandbox | production
ASAAS_WALLET_ID=                  # wallet ID da conta mãe (Acalanto)

# Split — ativar quando KYC aprovado + subcontas criadas
# ASAAS_SPLIT_ENABLED=true
```

---

## 3. CPF no Checkout

### 3.1 UX

CPF aparece no passo final do checkout, campo obrigatório para todos os métodos.

```
[Nome completo      ] [CPF            ]
[Email              ] [Telefone       ]
[ ] Aceito os Termos de Serviço e Política de Cancelamento
[  CONFIRMAR RESERVA  ]
```

Validação: dígitos verificadores do CPF (algoritmo padrão, client-side + server-side).

### 3.2 Armazenamento

CPF **nunca** é armazenado em plaintext no banco.

```typescript
// lib/crypto/cpf.ts
import { createHmac } from 'crypto'

export function hashCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return createHmac('sha256', process.env.CPF_HASH_SECRET!)
    .update(clean)
    .digest('hex')
}
```

- Env: `CPF_HASH_SECRET` — string aleatória de 64 chars, gerada no setup
- CPF raw → ASAAS API (para criação do customer)
- CPF hasheado → coluna `cpf_hash` em `acalanto_bookings`
- O CPF raw **nunca toca o banco de dados**

---

## 4. Schema de Banco de Dados — Alterações

### 4.1 Tabela `acalanto_bookings` — colunas novas

```sql
ALTER TABLE acalanto_bookings ADD COLUMN IF NOT EXISTS
  cpf_hash          text,          -- SHA-256 HMAC do CPF
  customer_email    text,
  customer_phone    text,
  asaas_payment_id  text,          -- ID da charge no ASAAS
  payment_method    text,          -- PIX | CREDIT_CARD | BOLETO | DEBIT_CARD
  payment_status    text DEFAULT 'pending',
  payment_url       text,          -- link do boleto ou checkout
  pix_qr_code       text,          -- base64 do QR code PIX
  pix_copy_paste    text,          -- linha digitável PIX
  paid_at           timestamptz;
```

### 4.2 Tabela `acalanto_partners` — coluna nova

```sql
ALTER TABLE acalanto_partners ADD COLUMN IF NOT EXISTS
  asaas_wallet_id   text;          -- preenchido quando subconta ativada
  commission_pct    integer DEFAULT 90; -- % que vai para o parceiro
```

### 4.3 Migration

Nova migration: `supabase/migrations/004_asaas_payments.sql`

---

## 5. Checklist/Roadmap Dinâmico no Admin

### 5.1 Problema atual

`/admin/roadmap/page.tsx` é hardcoded — array `tasks` estático no código. Não é editável pelo painel.

### 5.2 Solução

Nova tabela `acalanto_roadmap_tasks` + CRUD no admin.

```sql
CREATE TABLE acalanto_roadmap_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area        text NOT NULL,
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'pending', -- done | in_progress | pending | blocked
  priority    text NOT NULL DEFAULT 'média',   -- alta | média | baixa
  eta         text,
  notes       text,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
```

Admin pode:
- Criar nova tarefa
- Editar status (clique direto no badge)
- Editar título, descrição, notas inline
- Reordenar por drag-and-drop (sort_order)
- Deletar tarefa

A página `/admin/roadmap` migra os tasks hardcoded para o banco na primeira carga (seed automático).

---

## 6. Portal do Parceiro

### 6.1 Autenticação

Parceiros fazem login em `/parceiros/login` via email + senha (Supabase Auth).
Admin cria a conta do parceiro no painel (`/admin/parceiros/novo`).

### 6.2 Páginas do portal (`/parceiros/dashboard/`)

| Rota | O que mostra |
|------|-------------|
| `/` | Resumo: reservas hoje, receita do mês, próximas saídas |
| `/reservas` | Lista de reservas dos seus produtos |
| `/financeiro` | Vendas, comissão retida, repasses pagos e pendentes |
| `/disponibilidade` | Calendário para bloquear/liberar datas |
| `/perfil` | Editar dados, fotos, descrição |

### 6.3 RLS Supabase

```sql
-- Parceiro só vê dados dos seus próprios produtos
CREATE POLICY "partner_own_bookings" ON acalanto_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM acalanto_partners p
      WHERE p.auth_user_id = auth.uid()
      AND p.id = acalanto_bookings.partner_id
    )
  );
```

---

## 7. Painel Financeiro de Repasses

### 7.1 Visão admin (`/admin/repasses`)

- Tabela com todas as reservas confirmadas
- Colunas: parceiro, produto, data, valor total, comissão Acalanto, valor a repassar, status repasse
- Botão "Marcar como repassado" (manual por enquanto)
- Quando `ASAAS_SPLIT_ENABLED=true`: coluna "Split automático" aparece e o botão some

### 7.2 Visão parceiro (`/parceiros/dashboard/financeiro`)

- Resumo: total recebido no mês, pendente de repasse, histórico
- Quando split ativo: mostra "recebido diretamente no ASAAS"

---

## 8. Segurança

| Item | Implementação |
|------|--------------|
| CPF em trânsito | HTTPS (Vercel força) + nunca logado |
| CPF no banco | HMAC-SHA256 com secret exclusivo |
| Webhook ASAAS | Validar `ASAAS-Access-Token` header em cada request |
| API Key ASAAS | Apenas em env vars server-side, nunca no cliente |
| Rate limiting | `/api/checkout` — 5 req/min por IP (Vercel Edge) |
| Validação de valor | Server-side: recalcular total do carrinho no servidor, nunca confiar no cliente |

---

## 9. O que pedir ao Gustavo (entregar ao finalizar)

```
Olá Gustavo, precisamos das seguintes informações do ASAAS
para ativar os pagamentos no site:

1. API Key de PRODUÇÃO
   (Configurações → Integrações → Chave de API → copiar a chave $aact_...)

2. API Key de SANDBOX (para testes)
   (mesma tela, aba Sandbox)

3. Wallet ID da conta principal
   (Configurações → Dados da conta → ID da carteira)

4. Token do Webhook
   (Configurações → Integrações → Webhooks → criar novo webhook
    URL: https://[dominio]/api/webhooks/asaas
    Eventos: PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
    Copiar o token gerado)

5. Confirmação: o plano atual permite subcontas/marketplace?
   (verificar em Configurações → Plano)

Não é necessário nenhum setup adicional no painel ASAAS agora —
o sistema já está pronto para receber essas informações.
```

---

## 10. Fora do Escopo (próximas fases)

- SEO completo + sitemap
- GTM + GA4
- Página de fotografia completa  
- iCal bidirecional (importação de reservas externas)
- Subcontas ASAAS (aguarda KYC + aprovação)

---

*Spec aprovado em conversa com Victor Lima — 2026-05-07*
