export type DocStatus = 'done' | 'processing' | 'failed'
export type Doc = { name: string; status: DocStatus; chunks?: number; rules?: number; modified: string }

export const documents: Doc[] = [
  { name: 'tokens.md', status: 'done', chunks: 11, rules: 12, modified: '9월 24일 오후 2:10' },
  { name: 'button.md', status: 'done', chunks: 8, rules: 9, modified: '9월 24일 오후 2:10' },
  { name: 'form.md', status: 'processing', modified: '방금 전' },
  { name: 'card.md', status: 'done', chunks: 7, rules: 7, modified: '9월 24일 오후 2:11' },
  { name: 'navigation.md', status: 'done', chunks: 8, rules: 7, modified: '9월 24일 오후 2:11' },
  { name: 'modal.md', status: 'done', chunks: 6, rules: 7, modified: '9월 24일 오후 2:11' },
  { name: 'accessibility.md', status: 'failed', modified: '9월 24일 오후 2:12' },
  { name: 'writing.md', status: 'done', chunks: 9, rules: 7, modified: '9월 24일 오후 2:12' },
]

export const chunkRows = [
  { path: 'Button > Variant 선택 기준', tokens: 412, text: ['Primary는 주요 작업에 사용해요.', 'Secondary는 보조 작업에 사용해요.', '한 영역에 Primary 버튼은 하나만 둬요.'], rules: ['BTN-01', 'BTN-03'] },
  { path: 'Button > Size', tokens: 288, text: ['기본 버튼 높이는 44px이에요.', '밀도 높은 도구 모음에서는 작은 크기를 사용해요.', '아이콘만 있는 버튼에는 레이블을 제공해요.'], rules: ['BTN-07'] },
  { path: 'Button > Accessibility', tokens: 196, text: ['모든 버튼에는 명시적인 type이 있어야 해요.', '포커스 링은 키보드 사용자에게 보여야 해요.', '아이콘 옆 텍스트는 중복되지 않게 해요.'], rules: ['A11Y-02', 'A11Y-04'] },
]
