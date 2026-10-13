import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export async function createSession(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // user_id는 디폴트로 안 채워져서 명시적으로 넣어야 함(안 넣으면 복원 쿼리가 조용히 빈 결과를 반환함).
  const { data, error } = await supabase.from('sessions').insert({ user_id: user.id }).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function saveMessage(input: {
  sessionId: string
  role: 'user' | 'assistant'
  content: string
}): Promise<string | null> {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: input.sessionId, role: input.role, content: input.content })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function saveVersion(input: {
  sessionId: string
  version: number
  code: string
  kind: 'generate' | 'fix' | 'manual'
  sourceMessageId: string | null
}): Promise<void> {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) return

  const { error } = await supabase.from('component_versions').insert({
    session_id: input.sessionId,
    version: input.version,
    code: input.code,
    kind: input.kind,
    source_message_id: input.sourceMessageId,
  })
  if (error) throw error
}
