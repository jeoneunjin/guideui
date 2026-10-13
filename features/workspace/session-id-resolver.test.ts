import { describe, expect, it, vi } from 'vitest'
import { createSessionIdResolver } from './session-id-resolver'

function makeDeps(overrides: { sessionId?: string | null; createSession?: () => Promise<string | null> } = {}) {
  let sessionId = overrides.sessionId ?? null
  const setSessionId = vi.fn((id: string) => {
    sessionId = id
  })
  const createSession = vi.fn(overrides.createSession ?? (async () => 'session-1'))
  return {
    getSessionId: () => sessionId,
    setSessionId,
    createSession,
  }
}

describe('createSessionIdResolver', () => {
  it('이미 sessionId가 있으면 createSession을 안 부르고 그대로 반환한다', async () => {
    const deps = makeDeps({ sessionId: 'existing-session' })
    const resolver = createSessionIdResolver(deps)

    const id = await resolver.ensureSessionId()

    expect(id).toBe('existing-session')
    expect(deps.createSession).not.toHaveBeenCalled()
  })

  it('sessionId가 없으면 createSession을 호출하고 setSessionId로 반영한다', async () => {
    const deps = makeDeps()
    const resolver = createSessionIdResolver(deps)

    const id = await resolver.ensureSessionId()

    expect(id).toBe('session-1')
    expect(deps.createSession).toHaveBeenCalledTimes(1)
    expect(deps.setSessionId).toHaveBeenCalledWith('session-1')
  })

  it('동시에 호출해도 createSession은 한 번만 실행된다', async () => {
    const deps = makeDeps()
    const resolver = createSessionIdResolver(deps)

    const [id1, id2] = await Promise.all([resolver.ensureSessionId(), resolver.ensureSessionId()])

    expect(id1).toBe('session-1')
    expect(id2).toBe('session-1')
    expect(deps.createSession).toHaveBeenCalledTimes(1)
  })

  it('createSession이 실패해도 throw하지 않고 null을 반환한다', async () => {
    const deps = makeDeps({ createSession: async () => Promise.reject(new Error('network error')) })
    const resolver = createSessionIdResolver(deps)

    const id = await resolver.ensureSessionId()

    expect(id).toBeNull()
    expect(deps.setSessionId).not.toHaveBeenCalled()
  })

  it('실패한 뒤 다음 호출에서는 다시 시도한다', async () => {
    let attempt = 0
    const deps = makeDeps({
      createSession: async () => {
        attempt += 1
        if (attempt === 1) throw new Error('first attempt fails')
        return 'session-2'
      },
    })
    const resolver = createSessionIdResolver(deps)

    const first = await resolver.ensureSessionId()
    const second = await resolver.ensureSessionId()

    expect(first).toBeNull()
    expect(second).toBe('session-2')
    expect(deps.createSession).toHaveBeenCalledTimes(2)
  })
})
