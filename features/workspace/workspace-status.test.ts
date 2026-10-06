import { describe, expect, it } from 'vitest'
import { nextWorkspaceStatus } from './workspace-status'

describe('nextWorkspaceStatus', () => {
  it('idle에서 start 이벤트면 streaming으로 전환된다', () => {
    expect(nextWorkspaceStatus('idle', 'start')).toBe('streaming')
  })

  it('streaming에서 finish 이벤트면 done으로 전환된다', () => {
    expect(nextWorkspaceStatus('streaming', 'finish')).toBe('done')
  })

  it('streaming에서 fail 이벤트면 error로 전환된다', () => {
    expect(nextWorkspaceStatus('streaming', 'fail')).toBe('error')
  })

  it('streaming에서 abort 이벤트면 aborted로 전환된다', () => {
    expect(nextWorkspaceStatus('streaming', 'abort')).toBe('aborted')
  })

  it('done·error·aborted에서 start 이벤트면 다시 streaming으로 전환된다', () => {
    expect(nextWorkspaceStatus('done', 'start')).toBe('streaming')
    expect(nextWorkspaceStatus('error', 'start')).toBe('streaming')
    expect(nextWorkspaceStatus('aborted', 'start')).toBe('streaming')
  })

  it('정의되지 않은 전환이면 현재 상태를 그대로 유지한다', () => {
    expect(nextWorkspaceStatus('idle', 'finish')).toBe('idle')
    expect(nextWorkspaceStatus('streaming', 'start')).toBe('streaming')
    expect(nextWorkspaceStatus('done', 'abort')).toBe('done')
  })
})
