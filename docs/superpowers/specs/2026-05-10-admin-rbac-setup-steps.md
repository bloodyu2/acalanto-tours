# Setup pós-deploy — Admin RBAC + PDV (2026-05-10)

Implementação concluída. Para ativar 100% dos roles, aplicar os passos abaixo no Supabase Dashboard do projeto `hnsbstmzbidfehvycptl`.

## 1. Aplicar migration 017_admin_users.sql

No Supabase Dashboard → SQL Editor → New query → colar e executar:

```sql
-- Cria tabela admin_users (não-super_admin)
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','pdv','tripulacao','fotografo')),
  display_name text,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read" on public.admin_users
  for select using (id = auth.uid());

create index if not exists admin_users_role_idx on public.admin_users(role);
```

## 2. Criar usuários de teste no Authentication → Users

No Dashboard → Authentication → Users → "Add user" (Invite):

| Email                               | Senha sugerida | Role             |
|-------------------------------------|----------------|------------------|
| pdv-teste@acalanto.com              | Teste@123      | pdv              |
| tripulacao-teste@acalanto.com       | Teste@123      | tripulacao       |
| fotografo-teste@acalanto.com        | Teste@123      | fotografo        |

Depois de criar, copie os UUIDs (Authentication → Users → coluna ID) e rode no SQL Editor:

```sql
-- Substituir os UUIDs reais
insert into public.admin_users (id, role, display_name) values
  ('<uuid-pdv>',        'pdv',        'Vendedor Teste'),
  ('<uuid-tripulacao>', 'tripulacao', 'Tripulação Teste'),
  ('<uuid-fotografo>',  'fotografo',  'Fotógrafo Teste')
on conflict (id) do update set role = excluded.role, display_name = excluded.display_name;
```

## 3. (Opcional) Definir SUPER_ADMIN_EMAILS no Vercel

Para travar acesso super_admin a emails específicos (e bloquear novos cadastros), no Vercel Project → Settings → Environment Variables, adicionar:

```
SUPER_ADMIN_EMAILS=gustavo@acalanto.com,seu-email@dominio.com
```

Sem essa variável, qualquer usuário autenticado no /admin é tratado como super_admin (preserva comportamento atual).

## 4. Inserção de teste

Já feita via REST com service_role. Booking de teste criado:

- ID: `6b2aee93-db15-4a12-939d-90c84e71adcc`
- Cliente: João Teste PDV
- Status: confirmed / payment_status: confirmed

Aparece em /admin/reservas. Use para validar o botão de olhinho (modal), sync com ASAAS e o cálculo de split.
