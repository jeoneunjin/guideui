import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { chunkMarkdown } from './chunk'

// MIN_CHUNK_TOKENS(80)보다 확실히 크게 만들어서, 경로 계산을 테스트할 때 병합 로직이
// 끼어들지 않게 하기 위한 헬퍼.
function longText(label: string): string {
  return `${label} ` + '본문 내용입니다 '.repeat(20)
}

describe('chunkMarkdown', () => {
  it('헤딩이 없는 문서는 청크 1개, headingPath는 빈 문자열이다', () => {
    const result = chunkMarkdown('그냥 텍스트입니다. 헤딩이 전혀 없어요.')

    expect(result).toHaveLength(1)
    expect(result[0].headingPath).toBe('')
    expect(result[0].content).toContain('헤딩이 전혀 없어요')
  })

  it('코드 펜스 안의 #은 헤딩으로 분할되지 않는다', () => {
    const md = [
      '# Title',
      '',
      'Intro text.',
      '',
      '```',
      '# comment inside fence',
      'code line',
      '```',
      '',
      'After fence text.',
    ].join('\n')

    const result = chunkMarkdown(md)

    expect(result).toHaveLength(1)
    expect(result[0].headingPath).toBe('Title')
    expect(result[0].content).toContain('# comment inside fence')
  })

  it('너무 긴 섹션은 겹침을 두고 여러 청크로 재분할된다', () => {
    const paragraphs = Array.from(
      { length: 8 },
      (_, i) => `Paragraph ${i}: ` + 'lorem '.repeat(150),
    )
    const md = `## Long Section\n\n${paragraphs.join('\n\n')}`

    const result = chunkMarkdown(md)

    expect(result.length).toBeGreaterThan(1)
    for (const chunk of result) {
      expect(chunk.headingPath).toBe('Long Section')
      expect(chunk.tokenCount).toBeLessThanOrEqual(800)
    }

    // 겹침 확인: 다음 청크의 첫 문단이 이전 청크의 마지막 문단과 같아야 한다.
    const firstParas = result[0].content.split('\n\n')
    const secondParas = result[1].content.split('\n\n')
    expect(secondParas[0]).toBe(firstParas[firstParas.length - 1])
  })

  it('H1 뒤 H2가 이미 같은 이름을 포함하면 중복되지 않는다 (Button > Button > ... 방지)', () => {
    const md = `# Button\n\n${longText('소개')}\n\n## Button > Variant 선택 기준\n\n${longText('내용')}`

    const result = chunkMarkdown(md)

    expect(result.map((c) => c.headingPath)).toContain('Button > Variant 선택 기준')
    expect(result.some((c) => c.headingPath.includes('Button > Button'))).toBe(false)
  })

  it('H2 아래 중첩된 H3는 조상 경로를 포함한다', () => {
    const md = [
      '# Design Tokens',
      '',
      longText('토큰 소개'),
      '',
      '## Tokens > 토큰 사용 원칙',
      '',
      longText('사용 원칙 설명'),
      '',
      '### 규칙',
      '',
      longText('규칙 설명'),
    ].join('\n')

    const result = chunkMarkdown(md)

    // H1("Design Tokens")과 H2 접두사("Tokens")가 문자열로 정확히 일치하지 않아 dedup되지
    // 않는다 — 중복 제거는 뒤 헤딩이 앞 헤딩으로 "그대로 시작"할 때만 적용된다.
    expect(result.map((c) => c.headingPath)).toContain('Design Tokens > Tokens > 토큰 사용 원칙 > 규칙')
  })

  it('너무 짧은 섹션은 단독 청크로 남지 않고 다음 섹션과 병합된다', () => {
    const md = `## 짧음\n\n한 줄.\n\n## 충분히 긴 섹션\n\n${longText('본문')}`

    const result = chunkMarkdown(md)

    expect(result).toHaveLength(1)
    expect(result[0].content).toContain('한 줄.')
    expect(result[0].headingPath).toBe('충분히 긴 섹션')
  })

  it('frontmatter는 제거되고 본문 청크에 섞이지 않는다', () => {
    const md = ['---', 'title: 테스트 문서', 'version: 1.0.0', '---', '', '# Heading', '', longText('본문')].join(
      '\n',
    )

    const result = chunkMarkdown(md)

    expect(result.every((c) => !c.content.includes('title: 테스트 문서'))).toBe(true)
  })

  it('실제 sample-guide/button.md를 예외 없이 청크로 쪼갠다', () => {
    const buttonMd = readFileSync(join(process.cwd(), 'sample-guide/button.md'), 'utf-8')

    const result = chunkMarkdown(buttonMd)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((c) => c.content.trim().length > 0)).toBe(true)
    expect(result.every((c) => c.tokenCount > 0)).toBe(true)
    expect(result.some((c) => c.headingPath.includes('Variant'))).toBe(true)
  })
})
