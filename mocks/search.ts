export type Chunk = { id: string; path: string; document: string; similarity: string; excerpt: string }

export const examples = ['입력 필드 에러는 어떻게 표시하나요?', '배지는 어떤 색 조합을 쓰나요?', '모달에 꼭 필요한 속성은?', '버튼 문구 규칙이 뭔가요?']

export const chunks: Chunk[] = [
  { id: 'G1', path: 'Button > Variant별 스타일', document: 'button.md', similarity: '0.86', excerpt: '주 액션은 brand-600 배경과 fg-inverse 글자를 사용해요. 보조 버튼과 시각적 우선순위를 구분해요.' },
  { id: 'G2', path: 'Button > 배치', document: 'button.md', similarity: '0.79', excerpt: '한 영역에는 주 버튼을 하나만 둬요. 보조 버튼은 왼쪽, 주 버튼은 오른쪽에 배치해요.' },
  { id: 'G3', path: 'Button > 상태', document: 'button.md', similarity: '0.74', excerpt: '비활성 상태는 disabled 속성과 50% 투명도로 표시해요. 상태는 색상만으로 전달하지 않아요.' },
]
