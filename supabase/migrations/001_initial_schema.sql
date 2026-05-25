-- =============================================
-- KERYX — Schema inicial
-- =============================================

-- Extensões
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  role         text default 'user' check (role in ('user', 'admin')),
  plan         text default 'free' check (plan in ('free', 'basic', 'pro', 'seminary')),
  stripe_customer_id   text,
  stripe_subscription_id text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- PROJECTS
-- =============================================
create table public.projects (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  book              text not null,
  passage_ref       text not null,
  testament         text not null check (testament in ('AT', 'NT')),
  original_language text not null check (original_language in ('hebraico', 'grego')),
  bible_version     text default 'NAA',
  status            text default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Users can manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);

-- =============================================
-- SECTIONS
-- Cada section = uma etapa do workflow (1.1, 1.2, ..., §4, etc.)
-- =============================================
create table public.sections (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  slug       text not null,   -- e.g. "contexto_historico", "analise_morfossintatica"
  module     text not null check (module in ('inventio', 'dispositio', 'elocutio', 'memoria', 'pronuntiatio')),
  title      text not null,
  content    jsonb default '{}',   -- Tiptap JSON
  ai_output  text,                 -- last AI response
  status     text default 'empty' check (status in ('empty', 'draft', 'reviewed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (project_id, slug)
);

alter table public.sections enable row level security;

create policy "Users can manage own sections"
  on public.sections for all
  using (auth.uid() = user_id);

-- =============================================
-- FOOTNOTES
-- =============================================
create table public.footnotes (
  id         uuid primary key default uuid_generate_v4(),
  section_id uuid not null references public.sections(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  number     integer not null,
  content    text not null,
  created_at timestamptz default now()
);

alter table public.footnotes enable row level security;

create policy "Users can manage own footnotes"
  on public.footnotes for all
  using (auth.uid() = user_id);

-- =============================================
-- BIBLIOGRAPHY
-- =============================================
create table public.bibliography (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  ref_type   text default 'book' check (ref_type in ('book', 'article', 'commentary', 'lexicon', 'dictionary', 'online')),
  citation   text not null,   -- formatted citation string
  meta       jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.bibliography enable row level security;

create policy "Users can manage own bibliography"
  on public.bibliography for all
  using (auth.uid() = user_id);

-- =============================================
-- STRUCTURE EVALUATIONS
-- =============================================
create table public.structure_evaluations (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  input_text   text not null,
  ai_output    text not null,
  score        numeric(3,1),
  created_at   timestamptz default now()
);

alter table public.structure_evaluations enable row level security;

create policy "Users can manage own evaluations"
  on public.structure_evaluations for all
  using (auth.uid() = user_id);

-- =============================================
-- AI INTERACTIONS (log for cost tracking)
-- =============================================
create table public.ai_interactions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  section_slug    text,
  mode            text,   -- e.g. "exegese", "corretor_estrutura", "homiletica"
  input_tokens    integer default 0,
  output_tokens   integer default 0,
  cached_tokens   integer default 0,
  model           text,
  created_at      timestamptz default now()
);

alter table public.ai_interactions enable row level security;

create policy "Users can view own interactions"
  on public.ai_interactions for select
  using (auth.uid() = user_id);

create policy "Service can insert interactions"
  on public.ai_interactions for insert
  with check (auth.uid() = user_id);

-- =============================================
-- EXPORTS
-- =============================================
create table public.exports (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  format       text not null check (format in ('pdf', 'docx', 'slides', 'outline')),
  storage_path text,
  created_at   timestamptz default now()
);

alter table public.exports enable row level security;

create policy "Users can manage own exports"
  on public.exports for all
  using (auth.uid() = user_id);

-- =============================================
-- updated_at trigger (shared)
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_projects
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_sections
  before update on public.sections
  for each row execute procedure public.set_updated_at();

-- =============================================
-- Indexes
-- =============================================
create index idx_projects_user_id on public.projects(user_id);
create index idx_sections_project_id on public.sections(project_id);
create index idx_sections_user_id on public.sections(user_id);
create index idx_ai_interactions_user_id on public.ai_interactions(user_id);
create index idx_ai_interactions_project_id on public.ai_interactions(project_id);
