-- sessions: user_id를 실제 소유권 기준으로 강제
alter table sessions alter column user_id set not null;
alter table sessions
  add constraint sessions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
alter table sessions enable row level security;
create policy "sessions_owner_all" on sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- messages / component_versions: 자체 소유자 컬럼이 없어서 sessions 소유권을 경유해서 판단
alter table messages enable row level security;
create policy "messages_via_session" on messages
  for all using (
    exists (select 1 from sessions where sessions.id = messages.session_id and sessions.user_id = auth.uid())
  ) with check (
    exists (select 1 from sessions where sessions.id = messages.session_id and sessions.user_id = auth.uid())
  );

alter table component_versions enable row level security;
create policy "component_versions_via_session" on component_versions
  for all using (
    exists (select 1 from sessions where sessions.id = component_versions.session_id and sessions.user_id = auth.uid())
  ) with check (
    exists (select 1 from sessions where sessions.id = component_versions.session_id and sessions.user_id = auth.uid())
  );

-- guide_sets / guide_documents / guide_chunks / usage_logs: 아직 쓰는 코드가 없어서
-- (STAGE 5/6에서 연결 예정) 소유권 정책을 추측해서 미리 설계하지 않는다. RLS만 켜서
-- 정책 0개 = anon/authenticated 전부 차단 상태로 만든다(service_role은 RLS를 우회하므로
-- lib/usage-log.ts 등 기존 서버 전용 접근은 그대로 동작).
alter table guide_sets enable row level security;
alter table guide_documents enable row level security;
alter table guide_chunks enable row level security;
alter table usage_logs enable row level security;
