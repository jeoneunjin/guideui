-- 가이드 청크 벡터 검색 함수. service_role 클라이언트(RLS 우회)로만 호출한다 —
-- guide_chunks는 #39에서 RLS만 켜고 정책을 안 만든 상태라 anon/authenticated는 애초에
-- guide_chunks를 직접 못 본다. 그래서 security definer가 필요 없다.
-- match_threshold는 느슨한 기본값만 두고, 정교한 튜닝은 #51에서 진행한다.
create or replace function match_guide_chunks(
  query_embedding vector(768),
  filter_guide_set_id uuid,
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  id bigint,
  document_id uuid,
  document_title text,
  heading_path text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    gc.id,
    gc.document_id,
    gd.title as document_title,
    gc.heading_path,
    gc.content,
    1 - (gc.embedding <=> query_embedding) as similarity
  from guide_chunks gc
  join guide_documents gd on gd.id = gc.document_id
  where gd.guide_set_id = filter_guide_set_id
    and gd.status = 'ready'
    and 1 - (gc.embedding <=> query_embedding) > match_threshold
  order by gc.embedding <=> query_embedding
  limit match_count;
$$;
