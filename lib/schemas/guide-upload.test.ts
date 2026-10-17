import { describe, expect, it } from 'vitest'
import { GUIDE_FILE_MAX_BYTES, guideFileSchema } from './guide-upload'

function makeFile(name: string, size: number): File {
  const content = size > 0 ? new Uint8Array(size) : new Uint8Array(0)
  return new File([content], name, { type: 'text/markdown' })
}

describe('guideFileSchema', () => {
  it('정상 크기의 .md 파일은 통과한다', () => {
    const result = guideFileSchema.safeParse(makeFile('button.md', 1024))
    expect(result.success).toBe(true)
  })

  it('.md가 아닌 확장자는 거부한다', () => {
    const result = guideFileSchema.safeParse(makeFile('button.txt', 1024))
    expect(result.success).toBe(false)
  })

  it('빈 파일은 거부한다', () => {
    const result = guideFileSchema.safeParse(makeFile('empty.md', 0))
    expect(result.success).toBe(false)
  })

  it('1MB를 넘는 파일은 거부한다', () => {
    const result = guideFileSchema.safeParse(makeFile('huge.md', GUIDE_FILE_MAX_BYTES + 1))
    expect(result.success).toBe(false)
  })

  it('정확히 1MB인 파일은 통과한다', () => {
    const result = guideFileSchema.safeParse(makeFile('exact.md', GUIDE_FILE_MAX_BYTES))
    expect(result.success).toBe(true)
  })
})
