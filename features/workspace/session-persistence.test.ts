import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { createSession, saveMessage, saveVersion } from './session-persistence'

vi.mock('@/lib/supabase/client', () => ({ createSupabaseBrowserClient: vi.fn() }))

const mockCreateClient = vi.mocked(createSupabaseBrowserClient)

function makeInsertBuilder({ data, error }: { data?: unknown; error?: unknown } = {}) {
  const singleResult = { data, error: error ?? null }
  const voidResult = { error: error ?? null }
  return {
    select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve(singleResult)) })),
    then: (resolve: (v: unknown) => void) => resolve(voidResult),
  }
}

function makeSupabase({
  user,
  insertResult,
}: {
  user: { id: string } | null
  insertResult?: { data?: unknown; error?: unknown }
}) {
  const insert = vi.fn(() => makeInsertBuilder(insertResult))
  const from = vi.fn(() => ({ insert }))
  return { supabase: { auth: { getUser: vi.fn(async () => ({ data: { user } })) }, from }, insert, from }
}

describe('session-persistence', () => {
  beforeEach(() => {
    mockCreateClient.mockReset()
  })

  describe('createSession', () => {
    it('Supabase 클라이언트가 없으면 null을 반환한다', async () => {
      mockCreateClient.mockReturnValue(null)

      expect(await createSession()).toBeNull()
    })

    it('로그인한 유저가 없으면 null을 반환한다', async () => {
      const { supabase } = makeSupabase({ user: null })
      mockCreateClient.mockReturnValue(supabase as never)

      expect(await createSession()).toBeNull()
    })

    it('user_id를 명시적으로 채워서 insert하고 새 id를 반환한다', async () => {
      const { supabase, insert, from } = makeSupabase({
        user: { id: 'user-1' },
        insertResult: { data: { id: 'session-1' } },
      })
      mockCreateClient.mockReturnValue(supabase as never)

      const id = await createSession()

      expect(id).toBe('session-1')
      expect(from).toHaveBeenCalledWith('sessions')
      expect(insert).toHaveBeenCalledWith({ user_id: 'user-1' })
    })

    it('insert가 에러를 반환하면 throw한다', async () => {
      const { supabase } = makeSupabase({
        user: { id: 'user-1' },
        insertResult: { error: { message: 'insert failed' } },
      })
      mockCreateClient.mockReturnValue(supabase as never)

      await expect(createSession()).rejects.toEqual({ message: 'insert failed' })
    })
  })

  describe('saveMessage', () => {
    it('Supabase 클라이언트가 없으면 null을 반환한다', async () => {
      mockCreateClient.mockReturnValue(null)

      expect(await saveMessage({ sessionId: 'session-1', role: 'user', content: '안녕' })).toBeNull()
    })

    it('메시지를 insert하고 새 id를 반환한다', async () => {
      const { supabase, insert, from } = makeSupabase({
        user: { id: 'user-1' },
        insertResult: { data: { id: 'message-1' } },
      })
      mockCreateClient.mockReturnValue(supabase as never)

      const id = await saveMessage({ sessionId: 'session-1', role: 'assistant', content: '만들었어요' })

      expect(id).toBe('message-1')
      expect(from).toHaveBeenCalledWith('messages')
      expect(insert).toHaveBeenCalledWith({ session_id: 'session-1', role: 'assistant', content: '만들었어요' })
    })
  })

  describe('saveVersion', () => {
    it('Supabase 클라이언트가 없으면 아무것도 안 한다', async () => {
      mockCreateClient.mockReturnValue(null)

      await expect(
        saveVersion({ sessionId: 'session-1', version: 1, code: 'x', kind: 'generate', sourceMessageId: null }),
      ).resolves.toBeUndefined()
    })

    it('버전을 insert한다', async () => {
      const { supabase, insert, from } = makeSupabase({ user: { id: 'user-1' }, insertResult: {} })
      mockCreateClient.mockReturnValue(supabase as never)

      await saveVersion({
        sessionId: 'session-1',
        version: 1,
        code: 'export default function X() {}',
        kind: 'generate',
        sourceMessageId: 'message-1',
      })

      expect(from).toHaveBeenCalledWith('component_versions')
      expect(insert).toHaveBeenCalledWith({
        session_id: 'session-1',
        version: 1,
        code: 'export default function X() {}',
        kind: 'generate',
        source_message_id: 'message-1',
      })
    })

    it('insert가 에러를 반환하면 throw한다', async () => {
      const { supabase } = makeSupabase({ user: { id: 'user-1' }, insertResult: { error: { message: 'fail' } } })
      mockCreateClient.mockReturnValue(supabase as never)

      await expect(
        saveVersion({ sessionId: 'session-1', version: 1, code: 'x', kind: 'generate', sourceMessageId: null }),
      ).rejects.toEqual({ message: 'fail' })
    })
  })
})
