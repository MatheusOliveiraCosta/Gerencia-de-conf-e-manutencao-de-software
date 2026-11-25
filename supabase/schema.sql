-- DietLife — Schema e Row Level Security (RLS)
-- Script idempotente: pode ser executado mais de uma vez com segurança no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  calories numeric(7, 2) not null,
  period text not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meals_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint meals_calories_range check (calories >= 0 and calories <= 10000),
  constraint meals_period_valid check (period in ('breakfast', 'lunch', 'snack', 'dinner'))
);

create index if not exists idx_meals_user_date
  on public.meals (user_id, date, created_at);

create or replace function public.set_meals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_meals_updated_at on public.meals;
create trigger trg_meals_updated_at
  before update on public.meals
  for each row
  execute function public.set_meals_updated_at();

alter table public.meals enable row level security;

-- Privilégios mínimos: apenas usuários autenticados acessam a tabela, filtrados por RLS.
revoke all on table public.meals from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.meals to authenticated;

drop policy if exists meals_select_own on public.meals;
create policy meals_select_own
  on public.meals
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists meals_insert_own on public.meals;
create policy meals_insert_own
  on public.meals
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists meals_update_own on public.meals;
create policy meals_update_own
  on public.meals
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists meals_delete_own on public.meals;
create policy meals_delete_own
  on public.meals
  for delete
  to authenticated
  using (auth.uid() = user_id);