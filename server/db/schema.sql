-- 研史明智 (Scholarly Archivist) - Database Schema
-- Supabase PostgreSQL

-- 1. 笔记本 (Collections)
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  source_count int default 0,
  collection_num text,
  icon text default 'auto_stories',
  is_finished boolean default false,
  last_updated text,
  created_at timestamp with time zone default now()
);

-- 2. 文思阁卡片 (Gallery Cards)
create table if not exists gallery_cards (
  id uuid primary key default gen_random_uuid(),
  category text default '历史百科',
  category_color text default 'bg-secondary-container text-on-secondary-container',
  date text,
  title text not null,
  content text default '',
  source text default '',
  icon text default 'history_edu',
  action_icon text default 'bookmark',
  image text,
  created_at timestamp with time zone default now()
);

-- 3. 研究素材 (Sources)
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid references collections(id) on delete cascade,
  type text default '文本',
  title text not null,
  date text,
  icon text default 'description',
  url text,
  content_text text,
  summary text,
  created_at timestamp with time zone default now()
);

-- 4. 对话消息 (Messages)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid references collections(id) on delete cascade,
  role text check (role in ('user', 'ai')) not null,
  content text not null,
  model_used text default 'deepseek-chat',
  time text,
  created_at timestamp with time zone default now()
);

-- 5. 智识制品 (Artifacts)
create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  type text default 'AI 洞察',
  title text not null,
  content text default '',
  tags text[] default '{}',
  color text default 'border-primary/40',
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) Configuration
alter table collections enable row level security;
alter table gallery_cards enable row level security;
alter table sources enable row level security;
alter table messages enable row level security;
alter table artifacts enable row level security;