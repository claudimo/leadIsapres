-- ══════════════════════════════════════════════════════════
-- Isapre Inteligente — Row Level Security para `leads` y `profiles`
--
-- Corre esto una vez en Supabase Dashboard → SQL Editor.
-- Es idempotente (usa DROP POLICY IF EXISTS), así que se puede
-- volver a ejecutar sin duplicar nada si necesitas ajustarlo.
--
-- Contexto: el anonKey de Supabase es público por diseño (vive en
-- public/js/config.js, visible para cualquier visitante). Las
-- políticas de abajo son la única barrera real entre ese key y
-- los datos de leads/profiles — sin esto, cualquiera con el anonKey
-- puede leer la tabla completa vía la API REST de Supabase.
-- ══════════════════════════════════════════════════════════

-- ── Helper: rol del usuario autenticado actual (null si está desactivado) ──
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles
  where id = auth.uid() and active = true;
$$;

-- ══════════════════════════════════════════════════════════
-- profiles
-- ══════════════════════════════════════════════════════════
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (
  id = auth.uid() or public.current_role() = 'admin'
);

-- INSERT: cubre tanto el trigger automático (ver más abajo, corre como
-- superusuario y no pasa por RLS) como el upsert de respaldo que hace
-- el admin desde el panel al crear un usuario.
drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
on public.profiles for insert
to authenticated
with check (
  id = auth.uid() or public.current_role() = 'admin'
);

-- UPDATE: cualquiera edita su propia fila, admin edita cualquiera.
-- El trigger de abajo evita que un agente se auto-asigne role='admin'
-- o active=true aunque esta política se lo permita a nivel de fila.
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.current_role() = 'admin')
with check (id = auth.uid() or public.current_role() = 'admin');

-- Sin política de DELETE → denegado por defecto para todos.

-- ── Trigger: bloquea auto-escalada de privilegios ──
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() is distinct from 'admin' then
    if new.role is distinct from old.role or new.active is distinct from old.active then
      raise exception 'No autorizado para cambiar role/active de un perfil';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_profile_privilege_escalation on public.profiles;
create trigger trg_prevent_profile_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

-- ── Trigger: crea el profile automáticamente al registrar un usuario ──
-- (evita depender del upsert de respaldo del panel; corre como
-- superusuario, no requiere permisos de RLS)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'agent'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
after insert on auth.users
for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════
-- leads
-- ══════════════════════════════════════════════════════════
alter table public.leads enable row level security;

-- INSERT: el formulario público inserta sin sesión (rol anon de Supabase)
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
on public.leads for insert
to anon, authenticated
with check (true);

-- SELECT: admin ve todo, agente solo lo asignado a él
drop policy if exists "leads_select_admin_or_assigned" on public.leads;
create policy "leads_select_admin_or_assigned"
on public.leads for select
to authenticated
using (
  public.current_role() = 'admin' or assigned_to = auth.uid()
);

-- UPDATE: solo admin (asignar leads es la única escritura que hace el panel)
drop policy if exists "leads_update_admin_only" on public.leads;
create policy "leads_update_admin_only"
on public.leads for update
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- Sin política de SELECT/UPDATE para "anon" → un visitante anónimo con
-- el mismo anonKey puede insertar un lead, pero no puede leer ni editar
-- ningún lead existente.
-- Sin política de DELETE → denegado por defecto para todos.
