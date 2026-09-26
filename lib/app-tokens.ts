/**
 * GuideUI 서비스 전용 토큰
 *
 * sample-guide/tokens.ts와 다르다: 이 파일은 생성 컴포넌트가 따라야 할 "Sample DS 스펙"이
 * 아니라, GuideUI 자체 화면(코드 에디터 등)에서만 쓰는 값이다. RAG 인제스트·eval 채점 대상이
 * 아니므로 sample-guide/ 밖에 둔다.
 *
 * scripts/sync-tokens.mjs가 이 값을 읽어 app/globals.css를 생성한다.
 */

export const code = {
  bg: '#202938', // bg-code-bg : 코드 블록 배경
  fg: '#eef3fb', // text-code-fg : 코드 블록 텍스트
} as const

export const appTokens = { code }

export default appTokens
