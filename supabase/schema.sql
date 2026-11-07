create extension if not exists pgcrypto;

-- Registration code sequence
create sequence if not exists team_reg_seq start 1;

create type team_status as enum
  ('submitted','under_review','shortlisted','selected','not_selected','withdrawn');

create table public.teams (
  id               uuid primary key default gen_random_uuid(),
  reg_code         text unique not null,
  submission_key   text unique,                     -- idempotency
  team_name        text not null,
  track_key        text not null,
  idea_title       text not null,
  problem          text not null,
  solution         text not null,
  uniqueness       text not null,
  impact           text not null,
  reference_link   text,
  status           team_status not null default 'submitted',
  score            numeric(5,2),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index teams_name_uq on public.teams (lower(team_name));

create table public.members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  position    smallint not null check (position between 1 and 3), -- 1 = Team Leader
  role_key    text not null,                                       -- business|innovation|technical
  name        text not null,
  usn         text not null,
  email       text not null,
  phone       text not null,
  programme   text,
  year        text,
  department  text,
  unique (team_id, position),
  unique (team_id, role_key)
);
create unique index members_usn_uq   on public.members (upper(usn));
create unique index members_email_uq on public.members (lower(email));

create table public.site_content (
  section     text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
create trigger teams_touch before update on public.teams
  for each row execute function public.touch_updated_at();

-- Security: lock everything; the app uses the service role on the server only.
alter table public.teams        enable row level security;
alter table public.members      enable row level security;
alter table public.site_content enable row level security;
-- (No public policies on purpose. Never expose these tables to the anon key.)

-- Atomic registration. Called ONLY from the server (service role).
create or replace function public.register_team(payload jsonb, p_submission_key text, p_prefix text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_team_id uuid; v_code text; m jsonb; i int := 0;
begin
  -- idempotent retry
  select reg_code into v_code from teams where submission_key = p_submission_key;
  if v_code is not null then return v_code; end if;

  v_code := p_prefix || '-' || lpad(nextval('team_reg_seq')::text, 4, '0');

  insert into teams (reg_code, submission_key, team_name, track_key, idea_title,
                     problem, solution, uniqueness, impact, reference_link)
  values (v_code, p_submission_key, payload->>'team_name', payload->>'track_key',
          payload->>'idea_title', payload->>'problem', payload->>'solution',
          payload->>'uniqueness', payload->>'impact', nullif(payload->>'reference_link',''))
  returning id into v_team_id;

  for m in select * from jsonb_array_elements(payload->'members') loop
    i := i + 1;
    insert into members (team_id, position, role_key, name, usn, email, phone,
                         programme, year, department)
    values (v_team_id, i, m->>'role_key', m->>'name', upper(m->>'usn'),
            lower(m->>'email'), m->>'phone', m->>'programme', m->>'year', m->>'department');
  end loop;
  return v_code;
end $$;
revoke all on function public.register_team(jsonb,text,text) from public, anon, authenticated;

-- Storage bucket for uploads (public read)
insert into storage.buckets (id, name, public) values ('media','media',true)
on conflict (id) do nothing;
