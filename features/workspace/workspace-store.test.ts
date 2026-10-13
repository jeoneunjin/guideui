import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkspaceStore } from './workspace-store'

const INITIAL_CODE = useWorkspaceStore.getState().editorCode

describe('workspace-store 세션/버전 상태', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().reset()
  })

  it('hydrateSession은 복원된 세션으로 id/메시지/코드/버전을 채운다', () => {
    useWorkspaceStore.getState().hydrateSession({
      sessionId: 'session-1',
      messages: [{ role: 'user', content: '버튼 만들어줘' }],
      code: 'export default function X() {}',
      latestVersion: 2,
    })

    const state = useWorkspaceStore.getState()
    expect(state.sessionId).toBe('session-1')
    expect(state.messages).toEqual([{ role: 'user', content: '버튼 만들어줘' }])
    expect(state.editorCode).toBe('export default function X() {}')
    expect(state.previewCode).toBe('export default function X() {}')
    expect(state.latestVersion).toBe(2)
  })

  it('hydrateSession에 null을 넘기면 기존 초기 상태를 그대로 유지한다', () => {
    useWorkspaceStore.getState().hydrateSession(null)

    const state = useWorkspaceStore.getState()
    expect(state.sessionId).toBeNull()
    expect(state.messages).toEqual([])
    expect(state.editorCode).toBe(INITIAL_CODE)
    expect(state.latestVersion).toBe(0)
  })

  it('복원된 세션에 버전이 없으면(code: null) 기본 코드를 유지한다', () => {
    useWorkspaceStore.getState().hydrateSession({
      sessionId: 'session-1',
      messages: [],
      code: null,
      latestVersion: 0,
    })

    expect(useWorkspaceStore.getState().editorCode).toBe(INITIAL_CODE)
  })

  it('incrementVersion은 1부터 순차적으로 증가하고 그 값을 반환한다', () => {
    expect(useWorkspaceStore.getState().incrementVersion()).toBe(1)
    expect(useWorkspaceStore.getState().incrementVersion()).toBe(2)
    expect(useWorkspaceStore.getState().latestVersion).toBe(2)
  })

  it('incrementVersion은 복원된 latestVersion 이후부터 이어서 증가한다', () => {
    useWorkspaceStore.getState().hydrateSession({
      sessionId: 'session-1',
      messages: [],
      code: null,
      latestVersion: 4,
    })

    expect(useWorkspaceStore.getState().incrementVersion()).toBe(5)
  })

  it('reset()은 sessionId와 latestVersion도 초기값으로 되돌린다', () => {
    useWorkspaceStore.getState().setSessionId('session-1')
    useWorkspaceStore.getState().incrementVersion()

    useWorkspaceStore.getState().reset()

    const state = useWorkspaceStore.getState()
    expect(state.sessionId).toBeNull()
    expect(state.latestVersion).toBe(0)
  })
})
