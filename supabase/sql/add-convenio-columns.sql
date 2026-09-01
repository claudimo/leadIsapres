-- ══════════════════════════════════════════════════════════
-- Isapre Inteligente — Agrega el pago del convenio actual a `leads`
--
-- Corre esto una vez en Supabase Dashboard → SQL Editor.
-- Es idempotente (add column if not exists), se puede volver a correr.
--
-- Campos:
--   convenio_moneda → 'UF' | '$'  (en qué unidad paga hoy el lead)
--   convenio_monto  → numeric      (cuánto paga, en esa unidad)
--
-- No requiere cambios de RLS: la política `leads_insert_public`
-- ya permite INSERT con `with check (true)`, y admin/agente leen
-- todas las columnas de las filas que ya pueden ver.
-- ══════════════════════════════════════════════════════════

alter table public.leads
  add column if not exists convenio_moneda text
    check (convenio_moneda in ('UF', '$')),
  add column if not exists convenio_monto numeric
    check (convenio_monto is null or convenio_monto >= 0);
