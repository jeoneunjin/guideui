import { describe, expect, it } from 'vitest'
import { extractPartialCode } from './extract-partial-code'

describe('extractPartialCode', () => {
  it('펜스가 아직 안 나왔으면 null을 반환한다', () => {
    const text = '요청하신 내용을 반영해 로그인 폼을 만들고 있어요'
    expect(extractPartialCode(text)).toBeNull()
  })

  it('펜스가 열렸고 아직 안 닫혔으면 지금까지의 코드를 반환한다', () => {
    const text = `설명입니다.

\`\`\`tsx
export default function GeneratedComponent() {
  return <div>안내`
    expect(extractPartialCode(text)).toBe(
      `export default function GeneratedComponent() {\n  return <div>안내`,
    )
  })

  it('펜스가 닫혔으면 닫는 펜스 마커를 제외한 안쪽 코드만 반환한다', () => {
    const text = `설명입니다.

\`\`\`tsx
export default function GeneratedComponent() {
  return <div>안내</div>;
}
\`\`\`
`
    expect(extractPartialCode(text)).toBe(
      `export default function GeneratedComponent() {\n  return <div>안내</div>;\n}\n`,
    )
  })

  it('언어 태그 없는 펜스도 처리한다', () => {
    const text = `\`\`\`
export default function GeneratedComponent() {}`
    expect(extractPartialCode(text)).toBe('export default function GeneratedComponent() {}')
  })

  it('한 글자씩 누적해도 중간에 에러 없이 안정적으로 동작하고, 최종 결과는 완성된 텍스트를 직접 넣은 것과 같다', () => {
    const full = `설명입니다.

\`\`\`tsx
export default function GeneratedComponent() {
  return <div>안내</div>;
}
\`\`\`
`
    let last: string | null = null
    for (let i = 1; i <= full.length; i++) {
      expect(() => {
        last = extractPartialCode(full.slice(0, i))
      }).not.toThrow()
    }
    expect(last).toBe(extractPartialCode(full))
  })
})
