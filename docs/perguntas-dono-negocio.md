# Acalanto Tours — Perguntas para o Dono do Negócio

> **Documento preparado pela Balaio Digital**  
> Data: 04/05/2026  
> Objetivo: validar informações antes do desenvolvimento do novo site. Algumas perguntas podem parecer óbvias, mas erros nessas áreas custam caro — tanto em confiança do cliente quanto em problemas operacionais.

---

## 1. IDENTIDADE E MARCA

1. **Nome oficial do negócio:** o site atual exibe "BRISA STUDIO" no logo, mas o nome da empresa legal e o nome comercial correto são quais? Há alguma razão para "Acalanto Tours" ou outro nome ser preferido?

2. **Logo:** existe um arquivo de logo oficial (SVG ou PNG com fundo transparente)? Qual a versão preferida para uso no site (texto + símbolo, só símbolo, só texto)?

3. **Domínio:** o domínio atual é `brisatours.com.br`. O novo site usará esse mesmo domínio ou haverá mudança? Se mudar, o domínio novo já foi registrado?

4. **E-mail de contato:** o footer atual exibe `contato@centralof.com`. Esse e-mail é correto e você tem acesso a ele? Ou o e-mail de contato deve ser outro?

5. **WhatsApp:** o número `0800 601601` exibido no site atual não funciona para WhatsApp. Qual o número correto de WhatsApp comercial? (formato: `55` + DDD + número)

6. **Redes sociais:** quais redes sociais existem e estão ativas? Instagram, Facebook, TikTok? Confirme os @handles.

7. **CNPJ:** qual o CNPJ da empresa? (necessário para rodapé, nota fiscal, termos de serviço)

---

## 2. EMBARCAÇÕES — CONFIRMAÇÃO E DETALHES

> O site WordPress lista 4 escunas. Precisamos confirmar todos os detalhes abaixo para cada uma.

### 2.1 Ilha Rasa IV
- Capacidade máxima de passageiros: ___
- Saída confirmada às 11h? Todos os dias ou dias específicos?
- Quantas paradas? Quais são as praias/ilhas exatas do roteiro?
- O que está incluído (bebidas, comida, âncora)? O que é extra?
- A escuna está ativa e disponível para reservas? Tem algum período de manutenção?

### 2.2 Ilha Rasa V
- Capacidade máxima: ___
- Saída às 11h confirmada?
- Tem escorregador a bordo de verdade? (anunciado no site atual)
- É pet-friendly — quais as condições? Algum porte máximo? Taxa extra para pet?
- Roteiro confirmado: Ilha dos Cocos → Praia Conceição → Aquário Natural → Praia da Lula?

### 2.3 Tânia
- Capacidade máxima: ___
- Saída às 10:30h confirmada?
- O ofurô panorâmico está funcional?
- É pet-friendly — mesmas perguntas da Ilha Rasa V?
- O roteiro premium com 6 paradas está confirmado?

### 2.4 Soberano
- Capacidade máxima: ___
- Saída às 10:30h confirmada?
- "Contemplativa, 40 min por parada" — isso é uma diferenciação oficial ou informal?
- O roteiro é idêntico ao da Tânia ou tem diferenças?

### 2.5 Geral — Embarcações
- Todas as 4 escunas saem todos os dias (incluindo fins de semana e feriados)?
- Existe número mínimo de passageiros para a saída acontecer? (ex: mínimo 10 pessoas)
- Existe número máximo simultâneo? (ex: não vender mais de X passagens para uma data específica)
- Qual o porto/píer exato de saída? Tem endereço ou ponto de referência para o Google Maps?
- Qual o horário de check-in (chegada recomendada antes do embarque)?
- Quanto tempo dura o passeio? (estimativa: 5–5h30 — confirmar)

---

## 3. PREÇOS E LÓGICA DE COBRANÇA

> **Atenção: esta seção é crítica.** Erros de precificação no site causam conflitos diretos com clientes.

### 3.1 Preços por embarcação
- Ilha Rasa IV: R$110/pessoa — **confirmado?**
- Ilha Rasa V: R$110/pessoa — **confirmado?**
- Tânia: R$110/pessoa — **confirmado?**
- Soberano: R$100/pessoa — **confirmado?**
- Esses preços são **por pessoa por passeio** (ida e volta incluídos)?

### 3.2 Crianças
- A partir de qual idade paga passagem (valor inteiro)?
- Entre quais idades paga meia-entrada (50%)?
- Até qual idade é gratuito?
- Bebês de colo (geralmente até 2 anos) — precisam de assento/colete? Tem restrição?
- A política de criança é igual para todas as 4 embarcações?

### 3.3 Grupos
- Existe desconto para grupos? A partir de quantas pessoas?
- Existe possibilidade de fretamento exclusivo (escuna inteira para um grupo)? Se sim, qual o valor mínimo?

### 3.4 Alta temporada / Preço dinâmico
- Os preços mudam em alta temporada (dezembro/janeiro/carnaval/julho)?
- Se sim, quais os preços em alta temporada para cada embarcação?
- O preço muda em feriados prolongados?

### 3.5 Taxa de embarque
- Existe taxa de embarque municipal (é comum em Paraty — geralmente R$2 a R$5)? Se sim, essa taxa está incluída no preço anunciado ou é cobrada à parte?

---

## 4. RESERVAS E DISPONIBILIDADE

> **Atenção: o calendário de reservas do WordPress está com TODAS as datas desabilitadas. Isso foi intencional (reservas suspensas) ou um erro técnico?**

4.1 Como as reservas são feitas atualmente? WhatsApp? E-mail? Telefone? Presencialmente?

4.2 É necessário reservar com antecedência mínima? (ex: reserva até 24h antes)

4.3 Existe prazo máximo para reservar com antecedência? (ex: reservas abertas com no máximo 3 meses de antecedência)

4.4 Qual o status atual das reservas — estão abertas para o público? Tem datas já com lotação?

4.5 Como é gerenciada a disponibilidade hoje? Planilha? Sistema? WhatsApp?

4.6 Há períodos do ano em que as escunas não operam (manutenção, baixa temporada)?

---

## 5. PAGAMENTO

> **Esta seção impacta diretamente a lógica de desenvolvimento. Precisamos de respostas precisas.**

5.1 Quais formas de pagamento são aceitas?
- [ ] PIX
- [ ] Cartão de crédito (débito?)
- [ ] Transferência bancária
- [ ] Dinheiro (presencial)
- [ ] Outro: ___

5.2 Se cartão de crédito: aceita parcelamento? Até quantas vezes? Tem juros ou é sem juros para o cliente?

5.3 É cobrado algum sinal/depósito para confirmar a reserva? (ex: 50% antecipado, restante no embarque)

5.4 Ou o pagamento é 100% antecipado no ato da reserva?

5.5 Ou o pagamento é 100% presencial no embarque?

5.6 Se PIX com desconto for uma opção, qual o percentual de desconto?

5.7 Existe link de pagamento já configurado (Mercado Pago, PagSeguro, Stripe, etc.) ou precisamos configurar do zero?

5.8 Você tem conta em alguma plataforma de pagamento online? Qual?

---

## 6. POLÍTICA DE CANCELAMENTO E REEMBOLSO

6.1 Qual é a política oficial de cancelamento? (ex: cancelamento gratuito até X dias antes; após isso, sem reembolso)

6.2 O cliente pode remarcar (trocar a data) em vez de cancelar? Com qual antecedência mínima?

6.3 O que acontece se o passeio for cancelado por vocês (mau tempo, problema mecânico)?
- Reembolso total?
- Remarcação obrigatória?
- Vale-crédito?

6.4 Quem determina se o tempo está bom para sair? Quem comunica o cancelamento por mau tempo e com quanto tempo de antecedência?

6.5 Existe seguro viagem ou seguro de responsabilidade civil para os passageiros? (DPEM — Danos Pessoais por Embarcações)

---

## 7. SERVIÇOS ADICIONAIS

### 7.1 Lancha Privativa
- Tem lancha disponível para contratação privativa?
- Qual a capacidade? Qual o valor? Por hora, por passeio ou por dia?
- Quais os roteiros disponíveis?

### 7.2 Fotografia
- Este é um serviço próprio ou indicação de terceiro?
- Se próprio: fotógrafo acompanha o passeio de escuna? É possível contratar separado?
- Qual o valor? O que é entregue (quantas fotos, formato, prazo)?

### 7.3 Passeio de Jeep
- Este é um serviço próprio ou parceria com outra empresa?
- Se parceria: vocês vendem e repassam ou apenas indicam?

### 7.4 Combo (escuna + outros)
- Existe algum pacote combo hoje? (ex: escuna + jeep + almoço)
- Há intenção de criar combos no novo site?

---

## 8. CONTEÚDO E FOTOS

8.1 Existe banco de fotos profissionais das embarcações e dos passeios? Se sim, em qual formato e onde estão armazenadas?

8.2 As fotos atuais no WordPress (algumas pesadas, 1–2MB) podem ser usadas no novo site?

8.3 Existe vídeo profissional dos passeios? Drone? Precisa produzir?

8.4 As 7 páginas publicadas no WordPress sem conteúdo (Quem Somos, Experiências, Fotografias, etc.) — existe algum rascunho de texto em algum lugar? Ou precisamos criar do zero?

8.5 Existem depoimentos reais de clientes que possam ser publicados (com autorização)? Ou usamos avaliações do Google/TripAdvisor?

---

## 9. SOBRE A EMPRESA

9.1 Há quanto tempo a empresa está no mercado?

9.2 Qual a história da empresa? (para a página "Quem Somos")

9.3 Quantos funcionários/tripulantes a empresa tem?

9.4 A empresa tem alguma premiação, certificação ou reconhecimento relevante? (ex: Tripadvisor Certificate of Excellence, Padrão de Qualidade EMBRATUR)

9.5 Qual o diferencial principal em relação à concorrência (Paraty Tours, Estrela da Manhã)?

9.6 Existe licença de turismo (CADASTUR ou similar)?

---

## 10. ERROS E INCONSISTÊNCIAS IDENTIFICADOS NO SITE ATUAL

> Os itens abaixo são **possíveis problemas** identificados durante a auditoria do site `brisatours.com.br`. Por favor confirme ou corrija cada um.

| # | Problema identificado | Confirma erro? | Informação correta |
|---|----------------------|----------------|--------------------|
| 1 | Logo exibe "BRISA STUDIO" — nome incorreto | | |
| 2 | Calendário de reservas com TODAS as datas desabilitadas | | |
| 3 | Número de contato `0800 601601` não funciona para WhatsApp | | |
| 4 | E-mail `contato@centralof.com` — é de outra empresa? | | |
| 5 | 7 páginas publicadas sem nenhum conteúdo | | |
| 6 | WordPress admin bar visível para visitantes comuns (risco de segurança) | | |
| 7 | Imagens muito pesadas (1–2MB cada) sem compressão | | |
| 8 | Preço da Tânia: R$110 ou outro valor? | | |
| 9 | Preço do Soberano: R$100 ou outro valor? | | |
| 10 | Horário de saída Ilha Rasa IV e V: 11h confirmado? | | |
| 11 | Horário de saída Tânia e Soberano: 10:30h confirmado? | | |
| 12 | Soberano — "40 min por parada" — isso é diferencial oficial? | | |

---

## 11. TÉCNICO E JURÍDICO

11.1 Existe contrato padrão com o cliente (Termos de Serviço) que deve aparecer no site?

11.2 Existe Política de Privacidade? (obrigatório pela LGPD para sites que coletam dados)

11.3 As embarcações têm o TIE (Título de Inscrição de Embarcação) em dia? (Marinha do Brasil)

11.4 O número de lotação máxima das embarcações está regularizado na DPC (Diretoria de Portos e Costas)?

11.5 Existe seguro de responsabilidade civil para passageiros?

11.6 Existe alguma restrição legal sobre o que pode ser vendido online para passeios náuticos em Paraty? (algumas prefeituras têm regras específicas)

---

## 12. CONCORRÊNCIA E POSICIONAMENTO

12.1 Quem você considera seu principal concorrente direto em Paraty?

12.2 O que a Acalanto Tours faz melhor que os concorrentes?

12.3 Qual o perfil do cliente típico? (família, casal, grupo de amigos, turista nacional, estrangeiro?)

12.4 Em qual faixa de renda/público você se posiciona? (popular, intermediário, premium)

12.5 Há alguma operadora com quem você tem parceria comercial para indicação mútua?

---

## 13. PRIORIDADES E PRAZO

13.1 Qual é a data-alvo para o novo site estar no ar?

13.2 Existe alguma alta temporada ou evento próximo que cria urgência?

13.3 O que você considera a funcionalidade mais crítica do novo site? (ex: booking funcionando, galeria de fotos, WhatsApp integrado)

13.4 O antigo WordPress deve ser mantido no ar durante o desenvolvimento ou pode ser desativado?

13.5 Você tem acesso aos registros de DNS do domínio `brisatours.com.br` para fazer a migração?

---

## NOTAS INTERNAS (Balaio)

> Esta seção é para uso interno — não enviar ao cliente.

**Itens que dependem das respostas acima para implementar:**
- Lógica de precificação (adulto/criança) → componente `PassengerCounter`
- Política de cancelamento → texto na página de booking e e-mail de confirmação
- Integração de pagamento → decidir entre fase 1 (só WhatsApp) ou adiantar Stripe
- Disponibilidade de embarcação → schema da tabela `acalanto_tours` (dias da semana, min/max pax)
- Fretamento privativo → tabela `acalanto_charter_requests` (separada das reservas normais)
- LGPD → modal de cookies e Política de Privacidade obrigatórios
- DPC/Marinha → disclaimers legais obrigatórios (lotação máxima, colete salva-vidas, etc.)

**Pendências de dados de acesso:**
- WhatsApp correto
- Domínio novo (se houver)
- Acesso DNS para migração
- Fotos em alta resolução
- Banco de pagamento preferido

---

*Documento gerado automaticamente pelo sistema de desenvolvimento da Balaio Digital. Versão 1.0 — 04/05/2026.*
