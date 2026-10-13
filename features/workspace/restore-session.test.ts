import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLatestSession } from './restore-session'

vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn() }))

const mockCreateClient = vi.mocked(createSupabaseServerClient)

type QueryResult = { data: unknown }

function makeBuilder(listResult: QueryResult, singleResult: QueryResult) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(singleResult)),
    then: (resolve: (v: QueryResult) => void) => resolve(listResult),
  }
  return builder
}

function makeSupabase({
  user,
  session,
  messages,
  latestVersion,
}: {
  user: { id: string } | null
  session: { id: string } | null
  messages: { role: string; content: string }[]
  latestVersion: { version: number; code: string } | null
}) {
  const sessionBuilder = makeBuilder({ data: null }, { data: session })
  const messagesBuilder = makeBuilder({ data: messages }, { data: null })
  const versionBuilder = makeBuilder({ data: null }, { data: latestVersion })

  const from = vi.fn((table: string) => {
    if (table === 'sessions') return sessionBuilder
    if (table === 'messages') return messagesBuilder
    if (table === 'component_versions') return versionBuilder
    throw new Error(`unexpected table: ${table}`)
  })

  return {
    supabase: { auth: { getUser: vi.fn(async () => ({ data: { user } })) }, from },
    sessionBuilder,
    messagesBuilder,
    versionBuilder,
  }
}

describe('getLatestSession', () => {
  beforeEach(() => {
    mockCreateClient.mockReset()
  })

  it('Supabase 클라이언트가 없으면 null을 반환한다', async () => {
    mockCreateClient.mockResolvedValue(null)

    const result = await getLatestSession()

    expect(result).toBeNull()
  })

  it('로그인한 유저가 없으면 null을 반환한다', async () => {
    const { supabase } = makeSupabase({ user: null, session: null, messages: [], latestVersion: null })
    mockCreateClient.mockResolvedValue(supabase as never)

    const result = await getLatestSession()

    expect(result).toBeNull()
  })

  it('세션이 없으면 null을 반환한다', async () => {
    const { supabase } = makeSupabase({ user: { id: 'user-1' }, session: null, messages: [], latestVersion: null })
    mockCreateClient.mockResolvedValue(supabase as never)

    const result = await getLatestSession()

    expect(result).toBeNull()
  })

  it('세션·메시지·최신버전을 전부 찾으면 RestoredSession을 반환한다', async () => {
    const { supabase, versionBuilder } = makeSupabase({
      user: { id: 'user-1' },
      session: { id: 'session-1' },
      messages: [
        { role: 'user', content: '버튼 만들어줘' },
        { role: 'assistant', content: '만들었어요' },
      ],
      latestVersion: { version: 2, code: 'export default function X() {}' },
    })
    mockCreateClient.mockResolvedValue(supabase as never)

    const result = await getLatestSession()

    expect(result).toEqual({
      sessionId: 'session-1',
      messages: [
        { role: 'user', content: '버튼 만들어줘' },
        { role: 'assistant', content: '만들었어요' },
      ],
      code: 'export default function X() {}',
      latestVersion: 2,
    })
    expect(versionBuilder.order.mock.calls).toEqual([
      ['version', { ascending: false }],
      ['created_at', { ascending: false }],
    ])
  })

  it('세션은 있지만 버전이 아직 없으면 code는 null, latestVersion은 0이다', async () => {
    const { supabase } = makeSupabase({
      user: { id: 'user-1' },
      session: { id: 'session-1' },
      messages: [],
      latestVersion: null,
    })
    mockCreateClient.mockResolvedValue(supabase as never)

    const result = await getLatestSession()

    expect(result).toEqual({ sessionId: 'session-1', messages: [], code: null, latestVersion: 0 })
  })

  it('조회 중 예외가 나도 던지지 않고 null을 반환한다', async () => {
    mockCreateClient.mockRejectedValue(new Error('network error'))

    const result = await getLatestSession()

    expect(result).toBeNull()
  })
})
