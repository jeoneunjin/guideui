import { Accessibility, Braces, MessageSquareText } from 'lucide-react'

export const steps = [
  ['01', '설명하기', '만들고 싶은 화면을 문장으로 적어요.'],
  ['02', '가이드 찾기', '관련된 디자인 규칙을 가이드 문서에서 찾아요.'],
  ['03', '생성하기', '규칙을 반영한 코드가 실시간으로 작성돼요.'],
  ['04', '검사하고 고치기', '접근성 위반을 찾아 AI가 고치고 다시 검사해요.'],
]

export const capabilities = [
  { icon: Braces, title: '가이드 기반 생성', body: '업로드한 디자인 가이드의 토큰과 규칙을 따라 코드를 만들어요. 어떤 규칙을 참고했는지 출처도 보여 줘요.' },
  { icon: MessageSquareText, title: '대화로 다듬기', body: "'에러 상태도 추가해 줘'처럼 이어서 요청하고, 버전별 변경 내용을 비교할 수 있어요." },
  { icon: Accessibility, title: '접근성 자동 검사', body: 'axe-core로 WCAG 기준 위반을 찾고, AI 수정 전후 점수를 비교해요.' },
]
