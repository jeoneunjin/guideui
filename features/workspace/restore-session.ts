import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ChatMessage } from './workspace-store'

export type RestoredSession = {
  sessionId: string
  messages: ChatMessage[]
  code: string | null
  latestVersion: number
}

export async function getLatestSession(): Promise<RestoredSession | null> {
  try {
    const supabase = await createSupabaseServerClient()
    if (!supabase) return null

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!session) return null

    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })

    // component_versions.version엔 unique 제약이 없어서 created_at을 2차 정렬로 둬서 동률을 깬다.
    const { data: latest } = await supabase
      .from('component_versions')
      .select('version, code')
      .eq('session_id', session.id)
      .order('version', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return {
      sessionId: session.id,
      messages: (messages ?? []) as ChatMessage[],
      code: latest?.code ?? null,
      latestVersion: latest?.version ?? 0,
    }
  } catch (error) {
    console.error('세션 복원 실패:', error)
    return null
  }
}
