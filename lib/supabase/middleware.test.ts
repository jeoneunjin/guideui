import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()
const mockSignInAnonymously = vi.fn()
const mockCreateServerClient = vi.fn(() => ({
  auth: { getUser: mockGetUser, signInAnonymously: mockSignInAnonymously },
}))

vi.mock('@supabase/ssr', () => ({ createServerClient: mockCreateServerClient }))

function request() {
  return new NextRequest('http://localhost/workspace')
}

describe('updateAnonymousSession', () => {
  beforeEach(() => {
    mockGetUser.mockReset().mockResolvedValue({ data: { user: null } })
    mockSignInAnonymously.mockReset().mockResolvedValue({ data: {}, error: null })
    mockCreateServerClient.mockClear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('NEXT_PUBLIC_SUPABASE_URL·KEY가 없으면 Supabase를 호출하지 않는다', async () => {
    vi.doMock('@/lib/env', () => ({ env: {} }))
    const { updateAnonymousSession } = await import('./middleware')

    await updateAnonymousSession(request())

    expect(mockCreateServerClient).not.toHaveBeenCalled()
  })

  it('설정돼 있고 유저가 없으면 signInAnonymously를 호출한다', async () => {
    vi.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' },
    }))
    const { updateAnonymousSession } = await import('./middleware')

    await updateAnonymousSession(request())

    expect(mockCreateServerClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key', expect.anything())
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1)
  })

  it('이미 유저가 있으면 signInAnonymously를 호출하지 않는다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'existing-user' } } })
    vi.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' },
    }))
    const { updateAnonymousSession } = await import('./middleware')

    await updateAnonymousSession(request())

    expect(mockSignInAnonymously).not.toHaveBeenCalled()
  })

  it('signInAnonymously가 예외를 던져도 응답을 반환한다', async () => {
    mockSignInAnonymously.mockRejectedValue(new Error('network error'))
    vi.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' },
    }))
    const { updateAnonymousSession } = await import('./middleware')

    const response = await updateAnonymousSession(request())

    expect(response).toBeInstanceOf(Response)
  })

  it('signInAnonymously가 { error }를 반환해도(throw 없이) 응답을 반환한다', async () => {
    mockSignInAnonymously.mockResolvedValue({ data: {}, error: { message: 'Anonymous sign-ins are disabled' } })
    vi.doMock('@/lib/env', () => ({
      env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key' },
    }))
    const { updateAnonymousSession } = await import('./middleware')

    const response = await updateAnonymousSession(request())

    expect(response).toBeInstanceOf(Response)
  })
})
