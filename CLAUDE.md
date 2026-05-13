# CLAUDE.md -- Acalanto Tours

---

## Migrações Supabase

Toda migration que criar uma tabela nova no schema `public` **deve** incluir grants explícitos. Sem isso o supabase-js retorna erro 42501 após outubro de 2026.

Template obrigatório:

```sql
-- Grant obrigatório: novas tabelas não são mais expostas automaticamente
grant select on public.<tabela> to anon;
grant select, insert, update, delete on public.<tabela> to authenticated;
grant all on public.<tabela> to service_role;
```

Ajuste os grants conforme necessidade (ex: tabelas internas podem não precisar de `anon`).
