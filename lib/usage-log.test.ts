import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))
const mockCreateClient = vi.fn(() => ({ from: mockFrom }))

vi.mock('@supabase/supabase-js', () => ({ createClient: mockCreateClient }))

function request(ip?: string) {
  const headers = new Headers()
  if (ip) headers.set('x-forwarded-for', ip)
  return new Request('http://localhost/api/chat', { headers })
}

describe('logUsage', () => {
  beforeEach(() => {
    mockInsert.mockReset().mockResolvedValue({ error: null })
    mockFrom.mockClear()
    mockCreateClient.mockClear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('SUPABASE_URL·KEY가 없으면 insert를 호출하지 않는다', async () => {
    vi.doMock('@/lib/env', () => ({ env: {} }))
    const { logUsage } = await import('./usage-log')

    await logUsage({ req: request('1.2.3.4'), ttftMs: 500, tokens: 30 })

    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('설정돼 있으면 ip를 해시해서 insert한다', async () => {
    vi.doMock('@/lib/env', () => ({
      env: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-key' },
    }))
    const { logUsage } = await import('./usage-log')

    await logUsage({ req: request('1.2.3.4'), ttftMs: 500, tokens: 30 })

    expect(mockCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'service-key')
    expect(mockFrom).toHaveBeenCalledWith('usage_logs')
    expect(mockInsert).toHaveBeenCalledTimes(1)
    const payload = mockInsert.mock.calls[0][0]
    expect(payload).toMatchObject({ session_id: null, endpoint: '/api/chat', tokens: 30, ttft_ms: 500 })
    expect(payload.ip_hash).not.toBe('1.2.3.4')
    expect(payload.ip_hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('insert가 실패해도 예외를 던지지 않는다', async () => {
    vi.doMock('@/lib/env', () => ({
      env: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-key' },
    }))
    mockInsert.mockRejectedValue(new Error('network error'))
    const { logUsage } = await import('./usage-log')

    await expect(logUsage({ req: request('1.2.3.4'), ttftMs: 500, tokens: 30 })).resolves.toBeUndefined()
  })
})
