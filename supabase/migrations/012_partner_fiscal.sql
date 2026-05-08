-- supabase/migrations/012_partner_fiscal.sql

alter table partners
  add column if not exists cpf_cnpj         text,
  add column if not exists birth_date       text,
  add column if not exists mobile_phone     text,
  add column if not exists address          text,
  add column if not exists address_number   text,
  add column if not exists province         text,
  add column if not exists postal_code      text,
  add column if not exists asaas_account_id text;
