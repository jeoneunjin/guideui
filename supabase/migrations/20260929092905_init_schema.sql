create extension if not exists vector;
create extension if not exists pgcrypto; -- gen_random_uuid()

create table guide_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  guide_set_id uuid references guide_sets(id),
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamptz not null default now()
);

create table component_versions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  version int not null,
  code text not null,
  source_message_id uuid references messages(id),
  a11y_violations jsonb,
  a11y_score numeric,
  kind text not null check (kind in ('generate', 'fix', 'manual')),
  created_at timestamptz not null default now()
);

create table guide_documents (
  id uuid primary key default gen_random_uuid(),
  guide_set_id uuid not null references guide_sets(id) on delete cascade,
  title text not null,
  storage_path text,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

create table guide_chunks (
  id bigserial primary key,
  document_id uuid references guide_documents(id) on delete cascade,
  heading_path text,
  content text not null,
  token_count int,
  embedding vector(768) -- Gemini text-embedding-004 기준. 모델을 바꾸면 전체 재임베딩 필요.
);
create index on guide_chunks using hnsw (embedding vector_cosine_ops);

create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id),
  ip_hash text,
  endpoint text,
  tokens int,
  ttft_ms int,
  created_at timestamptz not null default now()
);
