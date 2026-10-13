import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetAll = vi.fn(() => [])
const mockSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: mockGetAll, set: mockSet })),
}))

const mockCreateServerClient = vi.fn(() => ({}))
vi.mock('@supabase/ssr', () => ({ createServerClient: mockCreateServerClient }))

describe('createSupabaseServerClient', () => {
  beforeEach(() => {
    mockGetAll.mockReset().mockReturnValue([])
    mockSet.mockReset()
    mockCreateServerClient.mockClear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('NEXT_PUBLIC_SUPABASE_URL·KEY가 없으면 createServerClient를 호출하지 않고 null을 반환한다', async () => {
    vi.doMock('@/lib/env', () => ({ env: {} }))
    const { createSupabaseServerClient } = await import('./server')

    const client = await createSupabaseServerClient()

    expect(client).toBeNull()
    expect(mockCreateServerClient).not.toHaveBeenCalled()
  })

  it('설정돼 있으면 쿠키 어댑터와 함께 createServerClient를 호출한다', async () => {
    vi.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' },
    }))
    const { createSupabaseServerClient } = await import('./server')

    const client = await createSupabaseServerClient()

    expect(client).not.toBeNull()
    expect(mockCreateServerClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key', expect.anything())
  })

  it('Server Component 렌더링 중이라 cookieStore.set이 실패해도 예외를 던지지 않는다', async () => {
    mockSet.mockImplementation(() => {
      throw new Error('Cookies can only be modified in a Server Action or Route Handler')
    })
    vi.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' },
    }))
    const { createSupabaseServerClient } = await import('./server')

    await createSupabaseServerClient()
    const call = mockCreateServerClient.mock.calls[0] as unknown as [
      string,
      string,
      { cookies: { setAll: (cookies: { name: string; value: string; options: Record<string, unknown> }[]) => void } },
    ]
    const options = call[2]

    expect(() => options.cookies.setAll([{ name: 'sb-token', value: 'abc', options: {} }])).not.toThrow()
  })
})
