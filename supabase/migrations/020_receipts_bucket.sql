-- supabase/migrations/020_receipts_bucket.sql
-- Bucket privado para PDFs de comprovantes de venda PDV.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, allowed_mime_types = array['application/pdf'];

-- Policies para o bucket `receipts`:
-- Apenas service_role (que é usado pelo `createAdminClient`) consegue ler/escrever.
-- Acesso anônimo direto à storage URL é bloqueado pela ausência de policies SELECT/INSERT para anon.
-- (Existem default policies do Supabase pra service_role — não é preciso criar policy explícita.)

-- Se houver RLS explícito necessário, descomentar:
-- drop policy if exists "receipts_service_role_all" on storage.objects;
-- create policy "receipts_service_role_all" on storage.objects
--   for all to service_role using (bucket_id = 'receipts') with check (bucket_id = 'receipts');
