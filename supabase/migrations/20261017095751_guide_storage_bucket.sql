insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guide-documents', 'guide-documents', false, 1048576, array['text/markdown', 'text/plain'])
on conflict (id) do nothing;

-- storage.objects에 RLS 정책을 추가하지 않는다: 이 버킷은 서버(service role)만 접근하고
-- service role은 storage RLS도 우회하므로, anon/authenticated용 정책은 지금 필요 없다.
