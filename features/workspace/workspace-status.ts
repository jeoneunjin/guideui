/**
 * 워크스페이스 생성 파이프라인의 진행 상태.
 * 가이드 검색 → 생성 → 접근성 검사 → 자동 수정 루프를 표현한다.
 *
 * v0 목업의 임시 상태 이름과 매핑:
 *   empty              → idle      (요청 전)
 *   streaming          → streaming (코드 생성 중)
 *   done, fixed        → done      (생성/수정 완료 — 접근성 점수 차이는 status가 아니라 별도 데이터로 표현)
 *   error              → error
 * 목업에는 없고 이번에 새로 추가된 상태:
 *   rendering — Sandpack이 생성된 코드를 렌더링하는 중 (STAGE 7에서 실제로 쓰기 시작함, 전환표 아직 없음)
 *   checking  — axe-core로 접근성 검사하는 중 (STAGE 7, 전환표 아직 없음)
 *   fixing    — AI가 위반 사항을 자동 수정하는 중 (STAGE 8, 전환표 아직 없음)
 *   aborted   — 스트리밍 중 사용자가 중단함
 */
export type WorkspaceStatus =
  | 'idle'
  | 'streaming'
  | 'rendering'
  | 'checking'
  | 'fixing'
  | 'done'
  | 'error'
  | 'aborted'

export type WorkspaceEvent = 'start' | 'finish' | 'fail' | 'abort'

const TRANSITIONS: Partial<Record<WorkspaceStatus, Partial<Record<WorkspaceEvent, WorkspaceStatus>>>> = {
  idle: { start: 'streaming' },
  streaming: { finish: 'done', fail: 'error', abort: 'aborted' },
  done: { start: 'streaming' },
  error: { start: 'streaming' },
  aborted: { start: 'streaming' },
}

export function nextWorkspaceStatus(current: WorkspaceStatus, event: WorkspaceEvent): WorkspaceStatus {
  return TRANSITIONS[current]?.[event] ?? current
}
