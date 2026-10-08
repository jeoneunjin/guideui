/**
 * GuideUI 서비스 전용 토큰
 *
 * sample-guide/tokens.ts와 다르다: 이 파일은 생성 컴포넌트가 따라야 할 "Sample DS 스펙"이
 * 아니라, GuideUI 자체 화면(코드 에디터 등)에서만 쓰는 값이다. RAG 인제스트·eval 채점 대상이
 * 아니므로 sample-guide/ 밖에 둔다.
 *
 * scripts/sync-tokens.mjs가 bg/fg를 읽어 app/globals.css를 생성한다 — Tailwind 클래스로 쓰는
 * 값만 대상이고, Monaco defineTheme에 직접 전달되는 값(예: invalidFg, lineNumberFg)은 대상이 아니다.
 */

export const code = {
  bg: '#202938', // bg-code-bg : 코드 블록 배경
  fg: '#eef3fb', // text-code-fg : 코드 블록 텍스트
  invalidFg: '#ff6b6b', // Monaco 'invalid' 토큰 전용. vs-dark 기본값 #f44747은 bg 대비 4.06:1로
  // WCAG AA(4.5:1) 미달 — Monaco의 TSX 문법 강조가 JSX 텍스트를 invalid로 잘못 분류할 때(바깥
  // 텍스트 노드, 예: "로그인 상태 유지") 이 색으로 렌더링됨. CSS 변수로 안 뺌: Tailwind 클래스가
  // 아니라 editor.tsx의 monaco.editor.defineTheme rules/colors에 직접 전달되는 값이라서.
  lineNumberFg: '#969696', // Monaco 줄 번호 거터 색. vs-dark 기본값 #858585은 bg 대비 3.96:1로
  // WCAG AA 미달 — invalidFg와 같은 이유로 CSS 변수로 안 빼고 defineTheme colors에 직접 전달.
} as const

export const appTokens = { code }

export default appTokens
