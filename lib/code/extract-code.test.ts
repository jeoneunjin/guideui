import { describe, expect, it } from 'vitest'
import { extractCode } from './extract-code'

describe('extractCode', () => {
  it('펜스가 있으면 코드 블록 안쪽만 추출한다', () => {
    const response = `요청하신 내용을 반영해 기본 카드 UI를 만들었어요.

\`\`\`tsx
export default function GeneratedComponent() {
  return <div>안내</div>;
}
\`\`\`
`
    expect(extractCode(response)).toBe(
      `export default function GeneratedComponent() {\n  return <div>안내</div>;\n}`,
    )
  })

  it('펜스가 없으면 전체 텍스트를 코드로 간주한다', () => {
    const response = `export default function GeneratedComponent() {
  return <div>안내</div>;
}`
    expect(extractCode(response)).toBe(response)
  })

  it('펜스가 여러 개면 첫 번째 블록만 반환한다', () => {
    const response = `\`\`\`tsx
export default function First() {}
\`\`\`

\`\`\`tsx
export default function Second() {}
\`\`\`
`
    expect(extractCode(response)).toBe('export default function First() {}')
  })

  it('언어 태그 없는 펜스도 추출한다', () => {
    const response = `\`\`\`
export default function GeneratedComponent() {}
\`\`\`
`
    expect(extractCode(response)).toBe('export default function GeneratedComponent() {}')
  })
})
