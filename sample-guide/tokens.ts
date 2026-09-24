/**
 * GuideUI Sample DS — Design Tokens
 * version: 1.0.0 / updated: 2026-09-24
 *
 * tokens.md와 같은 값을 사용하는 Tailwind theme.extend 객체.
 * - GuideUI 샌드박스: public/index.html 에서 `tailwind.config = { theme: { extend: tailwindExtend } }`
 * - 일반 Tailwind(v3) 프로젝트: tailwind.config.ts 의 theme.extend 에 그대로 사용
 * 이 파일의 값을 바꾸면 tokens.md 도 반드시 같이 수정한다.
 */

export const color = {
  // Primitive — 브랜드 스케일 (직접 쓰는 건 brand-50/600/700/800 위주)
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // 주 액션 배경 (흰 글자 대비 5.17:1)
    700: '#1d4ed8', // hover, 브랜드 텍스트 (흰 배경 대비 6.7:1)
    800: '#1e40af', // active
    900: '#1e3a8a',
  },

  // Semantic — 텍스트 (text-fg-*)
  fg: {
    primary: '#111827', // 본문·제목 17.7:1
    secondary: '#4b5563', // 보조 텍스트 7.6:1
    muted: '#6b7280', // 도움말·캡션 4.8:1 (AA 통과하는 가장 연한 값)
    inverse: '#ffffff', // 진한 배경 위 텍스트
    brand: '#1d4ed8', // 링크, 활성 메뉴
    error: '#dc2626', // 에러 메시지 4.8:1
  },

  // Semantic — 배경 (bg-surface, bg-surface-subtle, bg-surface-muted)
  surface: {
    DEFAULT: '#ffffff', // 카드, 모달, 네비게이션
    subtle: '#f9fafb', // 페이지 배경, hover
    muted: '#f3f4f6', // 비활성 영역, 코드/인용 배경
  },

  // Semantic — 테두리 (border-line, border-line-input, border-line-error / ring-line-focus)
  line: {
    DEFAULT: '#e5e7eb', // 카드·구분선 (장식용)
    input: '#8b929c', // 입력 필드 경계 (비텍스트 대비 3.1:1)
    focus: '#2563eb', // 포커스 링
    error: '#dc2626', // 에러 상태 입력 필드
  },

  // Semantic — 상태/피드백 (50 = 배경, 600·700 = 텍스트/강조)
  danger: { 50: '#fef2f2', 600: '#dc2626', 700: '#b91c1c' },
  success: { 50: '#f0fdf4', 700: '#15803d' },
  warning: { 50: '#fffbeb', 700: '#b45309' },
  info: { 50: '#f0f9ff', 700: '#0369a1' },

  // 모달·드로어 뒤 가림막 (bg-overlay)
  overlay: 'rgb(17 24 39 / 0.5)',
} as const;

export const borderRadius = {
  button: '0.5rem', // 8px  → rounded-button
  input: '0.5rem', // 8px  → rounded-input
  card: '0.75rem', // 12px → rounded-card
  modal: '1rem', // 16px → rounded-modal
  // 원형(아바타·배지)은 Tailwind 기본 rounded-full 사용
} as const;

export const boxShadow = {
  card: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)', // shadow-card
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)', // shadow-dropdown
  modal: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // shadow-modal
} as const;

// 숫자 간격(1=4px, 2=8px, 4=16px …)은 Tailwind 기본 4px 스케일을 그대로 쓰고,
// 의미 기반 간격만 추가한다.
export const spacing = {
  inline: '0.5rem', // 8px  → gap-inline : 아이콘-텍스트, 버튼 묶음
  component: '1.5rem', // 24px → p-component : 카드·모달 내부 여백
  section: '3rem', // 48px → py-section : 페이지 섹션 간격
} as const;

export const fontFamily = {
  sans: ['Pretendard', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
} as const;

export const transitionDuration = {
  fast: '150ms', // duration-fast : hover, 색상 변화
  normal: '250ms', // duration-normal : 드롭다운, 토글
  slow: '400ms', // duration-slow : 모달 등장
} as const;

export const tailwindExtend = {
  colors: color,
  borderRadius,
  boxShadow,
  spacing,
  fontFamily,
  transitionDuration,
};

export default tailwindExtend;
