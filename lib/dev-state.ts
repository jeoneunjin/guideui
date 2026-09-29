/**
 * ?state=, ?initialState= 로 화면 상태를 강제하는 건 개발 전용 디버그 기능이다.
 * next dev에서만 통과시키고, 빌드된 환경(Vercel Preview/Production 포함)에서는 무시한다.
 */
export function resolveDevState(value?: string) {
  return process.env.NODE_ENV === 'development' ? value : undefined
}
