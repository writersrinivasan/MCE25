-- Enable pgvector extension (run in Supabase SQL Editor)
create extension if not exists vector;

-- Add embedding column to memories (1536 dims = text-embedding-3-small)
alter table memories add column if not exists embedding vector(1536);

-- Add per-user OpenAI API key (stored server-side only, never sent to browser)
alter table profiles add column if not exists openai_api_key text;

-- HNSW index — works well on small datasets (no minimum row count like ivfflat)
create index if not exists memories_embedding_idx
  on memories using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Match memories by vector similarity
create or replace function match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_branch text default null
)
returns table (
  id uuid,
  title text,
  content text,
  branch text,
  media_type text,
  media_url text,
  created_at timestamptz,
  author json,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    m.id,
    m.title,
    m.content,
    m.branch::text,
    m.media_type,
    m.media_url,
    m.created_at,
    json_build_object(
      'full_name', p.full_name,
      'branch',    p.branch,
      'avatar_url', p.avatar_url
    ) as author,
    1 - (m.embedding <=> query_embedding) as similarity
  from memories m
  left join profiles p on p.id = m.author_id
  where
    m.embedding is not null
    and 1 - (m.embedding <=> query_embedding) > match_threshold
    and (filter_branch is null or m.branch::text = filter_branch)
  order by m.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Grant execute to authenticated users
grant execute on function match_memories to authenticated;
