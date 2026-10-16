import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { getDefaultDiffVersions, getVersionList, type VersionListItem } from './version-list'

vi.mock('@/lib/supabase/client', () => ({ createSupabaseBrowserClient: vi.fn() }))

const mockCreateClient = vi.mocked(createSupabaseBrowserClient)

function makeSupabase(result: { data?: unknown; error?: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (resolve: (v: unknown) => void) => resolve({ data: result.data ?? null, error: result.error ?? null }),
  }
  const from = vi.fn(() => builder)
  return { supabase: { from }, builder, from }
}

describe('getVersionList', () => {
  beforeEach(() => {
    mockCreateClient.mockReset()
  })

  it('Supabase 클라이언트가 없으면 빈 배열을 반환한다', async () => {
    mockCreateClient.mockReturnValue(null)

    expect(await getVersionList('session-1')).toEqual([])
  })

  it('session_id로 필터하고 version·created_at 내림차순 2차 정렬로 조회한다', async () => {
    const { supabase, builder, from } = makeSupabase({ data: [] })
    mockCreateClient.mockReturnValue(supabase as never)

    await getVersionList('session-1')

    expect(from).toHaveBeenCalledWith('component_versions')
    expect(builder.eq).toHaveBeenCalledWith('session_id', 'session-1')
    expect(builder.order.mock.calls).toEqual([
      ['version', { ascending: false }],
      ['created_at', { ascending: false }],
    ])
  })

  it('a11y_score를 a11yScore로 매핑해서 반환한다', async () => {
    const { supabase } = makeSupabase({
      data: [
        {
          id: 'v2',
          version: 2,
          kind: 'manual',
          code: 'code-2',
          a11y_score: null,
          created_at: '2026-01-02T00:00:00Z',
        },
        {
          id: 'v1',
          version: 1,
          kind: 'generate',
          code: 'code-1',
          a11y_score: 92,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    })
    mockCreateClient.mockReturnValue(supabase as never)

    const result = await getVersionList('session-1')

    expect(result).toEqual([
      { id: 'v2', version: 2, kind: 'manual', code: 'code-2', a11yScore: null, createdAt: '2026-01-02T00:00:00Z' },
      { id: 'v1', version: 1, kind: 'generate', code: 'code-1', a11yScore: 92, createdAt: '2026-01-01T00:00:00Z' },
    ])
  })

  it('조회 중 에러가 나면 throw한다', async () => {
    const { supabase } = makeSupabase({ error: { message: 'select failed' } })
    mockCreateClient.mockReturnValue(supabase as never)

    await expect(getVersionList('session-1')).rejects.toEqual({ message: 'select failed' })
  })
})

function item(version: number): VersionListItem {
  return { id: `v${version}`, version, kind: 'generate', code: `code-${version}`, a11yScore: null, createdAt: '' }
}

describe('getDefaultDiffVersions', () => {
  it('버전이 없으면 둘 다 null', () => {
    expect(getDefaultDiffVersions([])).toEqual({ base: null, target: null })
  })

  it('버전이 1개면 base·target 둘 다 그 버전', () => {
    expect(getDefaultDiffVersions([item(1)])).toEqual({ base: 1, target: 1 })
  })

  it('버전이 여러 개면(version desc 정렬 가정) 최신이 target, 그 전이 base', () => {
    expect(getDefaultDiffVersions([item(3), item(2), item(1)])).toEqual({ base: 2, target: 3 })
  })
})
