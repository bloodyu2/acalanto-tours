# Acalanto Tours — Design Brief para Claude Design

> **Documento vivo** — iniciado em 04/05/2026, populado até quarta-feira 07/05/2026.
> Usado para construir identidade visual completa, logo e UI final do site.

---

## 1. Quem é a Acalanto Tours

**Empresa:** Acalanto Tours (anteriormente Brisa Tours / brisatours.com.br)
**Localização:** Paraty, RJ — Costa Verde, Brasil
**Produto principal:** Passeios de escuna em baías, ilhas e praias da Costa Verde
**Tom:** Náutico premium com autenticidade caiçara — não é resort 5 estrelas, é a experiência genuína da cultura marítima de Paraty

**Frota:**
- **Ilha Rasa IV** — gastronomia de bordo, cultura local, cenário do filme Crepúsculo
- **Ilha Rasa V** — familiar, pet-friendly, escorregador a bordo
- **Tânia** — premium, ofurô panorâmico, pet-friendly
- **Soberano** — contemplativa, 40 minutos por parada, mais calma

**Preços:** R$100–R$110 / adulto | Saídas 10h30–11h | Duração 5–5h30h

---

## 2. Problema de Marca Atual

O site WordPress atual (brisatours.com.br) tem:
- Nome errado ("Brisa Studio" na logo) — novo nome é **Acalanto Tours**
- Logo genérica sem identidade náutica
- Calendário de reservas completamente quebrado
- Páginas sem conteúdo (Quem Somos, Experiências, etc.)
- Imagens PNG não comprimidas, sem otimização
- Sem identidade visual consistente

---

## 3. Paleta de Cores (já definida no código)

| Token | Hex | Uso |
|-------|-----|-----|
| `--ocean-deep` | `#0A3D5C` | Primária escura — headers, textos principais |
| `--ocean-mid` | `#1A6B8A` | Primária média — botões, destaques |
| `--ocean-light` | `#2E9EC5` | Primária clara — ícones, acentos |
| `--sand-warm` | `#F5EDD8` | Background quente — sections alternadas |
| `--sand` | `#EEE3C8` | Background levemente mais escuro |
| `--sunset` | `#F4A623` | Âmbar/dourado — preços, CTAs, badges |
| `--sunset-dark` | `#D4891A` | Hover do sunset |

**Conceito cromático:** Água profunda (azuis) + areia da praia (tons creme/ocre) + pôr-do-sol marítimo (âmbar/dourado). A paleta deve evocar o entardecer no oceano.

---

## 4. Tipografia (já definida no código)

| Fonte | Peso | Uso |
|-------|------|-----|
| **Playfair Display** | 400–700 | Headings, nome do barco, títulos de seção |
| **Plus Jakarta Sans** | 400–800 | Corpo, navegação, botões, labels |

**Conceito tipográfico:** Playfair traz o romantismo e o classicismo náutico (pensa em livros de viagem, cartazes vintage de cruzeiros). Jakarta é moderna, limpa, legível — o contraste cria elegância sem ser pesado.

---

## 5. Logo — Direções a Explorar

### Opção A — Wordmark náutico
- Nome "Acalanto" em Playfair Display
- "TOURS" em Jakarta Sans all-caps, espaçado, menor
- Um elemento gráfico simples: âncora estilizada ou vela triangular

### Opção B — Símbolo + Wordmark
- Símbolo: silhueta de escuna de perfil (velas latinas triangulares)
- Nome ao lado ou abaixo
- Cores: ocean-deep + sunset como acento

### Opção C — Monograma
- "A" estilizado com elemento náutico incorporado (onda, âncora, bússola)
- Mais compacto — funciona bem como favicon e ícone de app

**Referências visuais:**
- Companhias de ferry europeus (Grimaldi Lines, Brittany Ferries) — não corporativo, mais artesanal
- Logotipos de marinas boutique
- Postais de Paraty e da Costa Verde — as cores naturais do lugar
- Evitar: âncoras genéricas, wave clipart, fontes serifadas muito ornamentadas

---

## 6. Identidade de Voz

| Aspecto | Como é |
|---------|--------|
| Tom geral | Caloroso, convidativo, um guia local que você confia |
| Não é | Corporativo, turístico genérico, excessivamente pomposo |
| Linguagem | Português brasileiro natural, sem jargão, sem "experiência única imperdível" |
| Personalidade | Um barqueiro experiente que ama o que faz e quer que você aproveite o passeio |

**Exemplos de copy aprovada:**
- "Paraty vista de dentro d'água" ✅
- "Suba a bordo, esqueça a pressa" ✅
- "Experiência única e inesquecível" ❌ (genérico)
- "Serviços de turismo náutico premium" ❌ (corporativo)

---

## 7. Componentes UI Existentes (para consistência no redesign)

O site já tem uma implementação funcional em Next.js. O redesign deve respeitar a estrutura de componentes:

```
Header (fixo, frosted-glass no scroll)
  └─ Logo | Nav (Escunas, Serviços, Quem Somos, Contato) | Btn WhatsApp

HeroSection (fullscreen, gradiente ocean)
  └─ Título | Subtítulo | 2 CTAs | Wave SVG bottom

TourCard (card de escuna)
  └─ Cover image (220px) | Price badge | Nome | Tagline | Meta | Features | CTA

BookingWidget (sticky no detalhe da escuna)
  └─ Data picker | Adult/child counter | Total ao vivo | Botão WhatsApp

Footer (ocean-deep bg)
  └─ 4 colunas | Wave SVG top | Balaio credit
```

---

## 8. Páginas do Site (para redesign)

| Página | Rota | Status |
|--------|------|--------|
| Home | `/` | ✅ Implementada |
| Catálogo de escunas | `/escunas` | ✅ Implementada |
| Detalhe de escuna | `/escunas/[slug]` | ✅ Implementada |
| Serviços extras | `/servicos` | ✅ Implementada |
| Quem Somos | `/quem-somos` | ✅ Implementada |
| Galeria | `/galeria` | ✅ Implementada (sem fotos ainda) |
| Contato | `/#contato` | ✅ (seção na home) |
| Admin | `/admin` | ✅ (painel interno) |

---

## 9. Conteúdo Real das Escunas (para mockups)

### Ilha Rasa IV
- **Tagline:** Clássica com gastronomia caiçara
- **Destaques:** Gastronomia de bordo, roteiro cultural (cenário de Crepúsculo), 40+ anos de história
- **Roteiro:** Praia Conceição → Praia Lula → Santa Rita → Praia Vermelha
- **Saída:** 11h | Duração: 5h | R$110/adulto

### Ilha Rasa V
- **Tagline:** Familiar, kids e pet-friendly
- **Destaques:** Escorregador a bordo, aceita pets, ideal para famílias com crianças
- **Roteiro:** Ilha dos Cocos → Praia Conceição → Aquário Natural → Praia da Lula
- **Saída:** 11h | Duração: 5h | R$110/adulto

### Tânia
- **Tagline:** Premium com ofurô panorâmico
- **Destaques:** Ofurô vista para o mar, pet-friendly, mais exclusiva
- **Roteiro:** Ilha dos Cocos → Praia da Lula → Lagoa Azul → Ilha Comprida → Praia Vermelha → Ilha do Mantimento
- **Saída:** 10h30 | Duração: 5h30 | R$110/adulto

### Soberano
- **Tagline:** Contemplativa — 40 minutos por parada
- **Destaques:** Mais tempo em cada parada, ritmo calmo, ideal para quem quer mergulhar e explorar
- **Roteiro:** Ilha dos Cocos → Praia da Lula → Lagoa Azul → Ilha Comprida → Praia Vermelha → Ilha do Mantimento
- **Saída:** 10h30 | Duração: 5h | R$100/adulto

---

## 10. O que ainda precisa ser decidido (bloqueadores pós-reunião)

| Item | Status | Quando |
|------|--------|--------|
| Número WhatsApp real de Gustavo | ⏳ Aguardando | Reunião seg |
| Nome de domínio definitivo | ⏳ Aguardando | Reunião seg |
| Fotos profissionais das escunas | ⏳ Aguardando | Gustavo providenciar |
| Logo aprovada (diretamente em Canva ou Figma) | ⏳ Quarta | Claude Design |
| Número de parceiros a cadastrar | ⏳ Aguardando | Reunião seg |
| Decisão sobre gateway de pagamento (Phase 2) | ⏳ Reunião qua | AbacatePay vs Pix manual |

---

## 11. Referências Visuais para Mood Board

- https://www.paratytours.com.br — concorrente direto (estrutura a evitar repetir)
- Paleta real de Paraty: água esverdeada das baías, pedras do calçadão histórico, casarões brancos com janelas coloridas, matas da Serra do Mar
- Texturas: madeira de barco envelhecida, cordas náuticas, velas de tecido
- Fotografia: contraluz no mar, silhuetas de velas, cores quentes do entardecer

---

## 12. Próximos Passos (Cronograma)

| Dia | Ação |
|-----|------|
| Seg 05/05 | Reunião com Gustavo — coleta de bloqueadores, fotos, WhatsApp |
| Seg 05/05 | Atualizar `.env.local` e Vercel com dados reais |
| Ter 06/05 | Revisar site com dados reais, testes de booking |
| **Qua 07/05** | **Claude Design: construir logo + redesign visual completo** |
| Qui 08/05 | Revisão final, ajustes de conteúdo |
| Sex 09/05 | Entrega + migração de DNS |

---

*Documento mantido por Victor Lima / Balaio Digital — victor.lima@balaio.net*
