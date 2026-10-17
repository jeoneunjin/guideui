import { createHash } from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex')
}

export async function logUsage({ req, ttftMs, tokens }: { req: Request; ttftMs: number; tokens: number }) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  try {
    await supabase.from('usage_logs').insert({
      session_id: null,
      ip_hash: ip ? hashIp(ip) : null,
      endpoint: '/api/chat',
      tokens,
      ttft_ms: ttftMs,
    })
  } catch (error) {
    console.error('usage_logs 기록 실패:', error)
  }
}
