# Acalanto Tours v2 — Design Spec
**Data:** 2026-05-06
**Status:** Aprovado pelo cliente

---

## 1. Escopo

13 itens agrupados em dois blocos:

**Bloco 1 — Correções imediatas** (mobile, emojis, hero, depoimentos, legal, humanizer)
**Bloco 2 — Marketplace de parceiros** (onboarding, hospedagem, dashboards, claim, seja-parceiro, admin)

Stack existente: Next.js 16, TypeScript, Tailwind CSS v4, Supabase dedicado `hnsbstmzbidfehvycptl` (sem prefixo nas tabelas), InfinitePay checkout, CartProvider.

---

## 2. Bloco 1 — Correções imediatas

### 2.1 Mobile

**Problemas:**
- Side-scroll causado por SVG de onda vazando além do viewport
- Hamburger perde posição ao scrollar (não está fixo)
- Botão de reserva ausente no mobile fora do menu
- Formulários com inputs mais largos que a tela

**Solução:**
- `body, html`: adicionar `overflow-x: hidden`
- Seções com wave SVG: `overflow: hidden` no container
- Hamburger: `position: fixed; right: 1.25rem; top: 1.125rem; z-index: 60`
- Botão "Reservar" fixo no rodapé mobile (acima do MobileBottomNav) em páginas de passeio e serviço
- Todos os inputs: `width: 100%; max-width: 100%; box-sizing: border-box`
- Remover padding horizontal excessivo em formulários no mobile (hotelaria, contato, seja-parceiro)

### 2.2 Emojis → SVGs inline

Substituições em `HeroSection.tsx` e `SejaParceiroPage`:

| Emoji | SVG substituto |
|-------|----------------|
| 📸 | camera (stroke, 22px) |
| 🏡 | house (stroke, 22px) |
| 🚤 | anchor ou barco (stroke, 22px) |
| 🎁 | gift (stroke, 22px) |
| ✅ | check-circle (stroke, 22px) |

Todos com `stroke="currentColor"`, sem dependência de biblioteca.

### 2.3 Hero — onda e barquinho

**Onda cobrindo texto:**
- Adicionar `paddingBottom: 6rem` ao hero section para que o conteúdo nunca fique atrás da onda
- Descer a onda: mudar path de `M0,40 C240,80...` para `M0,20 C240,60...` (crista mais baixa)

**Barquinho animado:**
- SVG simples de barco (outline, ~40px) posicionado `position: absolute` sobre a onda
- `useEffect` com listener em `window.scroll`: `translateX = Math.min(scrollY * 0.4, window.innerWidth - 80)` px
- Cria sensação de navegação ao scrollar a página

### 2.4 Depoimentos

- Verificar via Supabase MCP se a tabela `testimonials` existe no projeto `hnsbstmzbidfehvycptl`
- Se não existir: criar via migration com campos `id, author_name, author_city, content, rating, approved, created_at`
- Remover fallback hardcoded da `TestimonialsSection` — se banco retornar vazio, esconder a seção (não mostrar dados falsos)
- O painel `/admin/depoimentos` já existe; apenas garantir que aponta para a tabela correta

### 2.5 Páginas legais

Três páginas estáticas novas:

- `/privacidade` — Política de Privacidade: dados coletados (nome, email, telefone), cookies, LGPD, contato para dúvidas
- `/termos` — Termos de Uso: regras de reserva, responsabilidade da plataforma e do cliente
- `/cancelamento` — Política de Cancelamento: +48h = reembolso total; 24-48h = 50%; menos de 24h = sem reembolso

Links adicionados no footer (rodapé). Conteúdo com linguagem simples, sem jargão jurídico excessivo.

### 2.6 Humanizer + sem travessões longos

- Executar `/humanizer` nos textos públicos principais
- Regra global: substituir ` — ` (em-dash com espaços) por `, ` ou `: ` conforme contexto
- Arquivos a revisar: `layout.tsx` (metadata), `HeroSection.tsx`, `ServicesSection.tsx`, `ToursSection.tsx`, páginas de passeio, footer

---

## 3. Bloco 2 — Marketplace de Parceiros

### 3.1 Fluxo de onboarding

```
/parceiros/cadastro          → email + senha + nome do negócio
/parceiros/cadastro/tipo     → escolher tipo (Fotógrafo / Hospedagem / Jeep-Transfer / Guia)
/parceiros/cadastro/anuncio  → formulário específico por tipo
/parceiros/cadastro/aguardando → "Em análise — retorno em até 24h"
```

Após aprovação pelo admin, parceiro acessa `/conta/parceiro` com dashboard completo.

### 3.2 Campos do anúncio por tipo

**Fotógrafo:** nome, bio, especialidade, preço por pacote, galeria (até 10 fotos), Instagram, WhatsApp
**Hospedagem:** nome, tipo (pousada/hotel/airbnb), descrição, preço por noite (texto livre), max hóspedes, comodidades (checklist), galeria, WhatsApp ou link externo
**Jeep / Transfer:** nome, tipo de serviço, roteiros disponíveis, preço (texto), capacidade, fotos
**Guia:** nome, língua, experiências oferecidas, preço por pessoa, bio, foto de perfil

### 3.3 Schema — alterações na tabela `partners`

```sql
ALTER TABLE partners ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);
-- Usar 'approved' como default para não quebrar parceiros já existentes
ALTER TABLE partners ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending','approved','rejected'));
-- Novos cadastros via onboarding recebem 'pending' explicitamente no código
ALTER TABLE partners ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id);
```

Nova tabela `partner_listings`:

```sql
CREATE TABLE IF NOT EXISTS partner_listings (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id    uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  type          text NOT NULL, -- 'hospedagem','fotografia','jeep','guia'
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  description   text,
  price_label   text,
  cover_image   text,
  gallery       text[] DEFAULT '{}',
  metadata      jsonb DEFAULT '{}', -- campos específicos por tipo
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
```

### 3.4 Módulo de Hospedagem

**Páginas públicas:**
- `/hotelaria` — grid de hospedagens aprovadas com filtros (tipo, preço, comodidades)
- `/hotelaria/[slug]` — galeria, descrição, comodidades, CTA WhatsApp ou link externo

**Lógica:** listagens vêm da tabela `partner_listings` com `type = 'hospedagem'` e `status = 'approved'`. Substituir a página atual "em breve".

**Primeiros parceiros:** admin insere manualmente os parceiros reais do Google Drive (pasta "clientes e parceiros") como seed inicial.

### 3.5 Claim flow

Parceiros inseridos manualmente pelo admin têm CTA discreto na página pública:

> "Este é o seu negócio? Reivindique esta página"

Link aponta para `/parceiros/cadastro?claim=SLUG`. Após aprovação, o parceiro assume a gestão do listing. O slug público permanece inalterado.

### 3.6 Página "Seja Parceiro"

Substituir formulário atual por landing page informativa com 5 seções:

1. **Hero:** "Faça parte da Acalanto" + CTA "Cadastrar meu negócio"
2. **Como funciona:** 4 passos ilustrados (cadastro → anúncio → aprovação → vendas)
3. **Tipos de parceiro:** cards para Fotógrafo, Hospedagem, Jeep/Transfer, Guia — o que cada um ganha
4. **Comissionamento:** "Entre em contato para conhecer as condições"
5. **Garantias:** aprovação em 24h, suporte WhatsApp, página própria com SEO, link UTM próprio

CTA principal leva para `/parceiros/cadastro`.

### 3.7 Admin — aprovação de anúncios

Expandir `/admin/parceiros` com:

| Feature | Descrição |
|---------|-----------|
| Fila de aprovação | Listagens com `status = pending`, botões Aprovar / Rejeitar |
| Motivo de rejeição | Campo de texto enviado ao parceiro |
| Preview do anúncio | Ver como vai ficar antes de aprovar |
| Claims pendentes | Reivindicações aguardando verificação |

### 3.8 Dashboards por tipo de parceiro

**Compartilhado (todos os tipos):**
- Editar perfil (nome, foto, contato, bio)
- Status do cadastro (pendente / aprovado / rejeitado + motivo)
- Link UTM próprio
- Histórico de contatos / reservas recebidas
- Alterar senha / email

**Fotógrafo:** gerenciar pacotes, reservas recebidas, repasses
**Hospedagem:** gerenciar listagens, contatos recebidos, galeria
**Jeep / Transfer:** gerenciar serviços, solicitações recebidas, repasses
**Guia:** gerenciar experiências, reservas, repasses

---

## 4. Rotas novas resumidas

```
/parceiros/cadastro
/parceiros/cadastro/tipo
/parceiros/cadastro/anuncio
/parceiros/cadastro/aguardando
/parceiros/[slug]              ← página pública do parceiro
/hotelaria                     ← substituir página atual
/hotelaria/[slug]
/privacidade
/termos
/cancelamento
/conta/parceiro/anuncios       ← novo (CRUD de listagens)
```

---

## 5. O que NÃO muda

- InfinitePay checkout: backend existente está correto, só precisa das env vars no Vercel
- CartProvider, CartDrawer, CartIcon: funcionais, não alterar
- Schema de `boats`, `bookings`, `payments`: não alterar
- Escunas: gerenciadas diretamente pelo admin, não entram no fluxo de parceiros
- UTM tracking, NPS: não alterar

---

## 6. Perguntas abertas

- Percentual de comissão: deixado como "Entre em contato" até definição
- Email de notificação para parceiro ao ser aprovado/rejeitado: usar Resend ou apenas exibir no dashboard?
- WhatsApp da Acalanto para botão flutuante: confirmar número definitivo
