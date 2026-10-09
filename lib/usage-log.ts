import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { env } from '@/lib/env'

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex')
}

export async function logUsage({ req, ttftMs, tokens }: { req: Request; ttftMs: number; tokens: number }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
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
