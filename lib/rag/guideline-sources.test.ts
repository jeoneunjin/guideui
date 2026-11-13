import { describe, expect, it } from 'vitest'
import { decodeGuidelineSources, toGuidelineSources } from './guideline-sources'
import type { GuideSearchResult } from './search'

function makeResult(overrides: Partial<GuideSearchResult> = {}): GuideSearchResult {
  return {
    id: 1,
    documentId: 'doc-1',
    documentTitle: 'button.md',
    headingPath: 'Button > Variant별 스타일',
    content: '본문 내용',
    similarity: 0.8,
    ...overrides,
  }
}

describe('toGuidelineSources', () => {
  it('결과 순서대로 G1, G2...로 번호를 매긴다', () => {
    const sources = toGuidelineSources([makeResult(), makeResult(), makeResult()])
    expect(sources.map((s) => s.id)).toEqual(['G1', 'G2', 'G3'])
  })

  it('headingPath가 빈 문자열이면 "본문"으로 대체한다', () => {
    const [source] = toGuidelineSources([makeResult({ headingPath: '' })])
    expect(source.headingPath).toBe('본문')
  })

  it('240자 이하 본문은 그대로 둔다', () => {
    const content = '가'.repeat(240)
    const [source] = toGuidelineSources([makeResult({ content })])
    expect(source.excerpt).toBe(content)
  })

  it('240자를 넘는 본문은 잘라내고 말줄임표를 붙인다', () => {
    const content = '가'.repeat(241)
    const [source] = toGuidelineSources([makeResult({ content })])
    expect(source.excerpt).toBe(`${'가'.repeat(240)}…`)
  })
})

describe('decodeGuidelineSources', () => {
  it('toGuidelineSources + base64 인코딩을 왕복 복원한다', () => {
    const original = toGuidelineSources([makeResult({ content: '한글과 english가 섞인 내용' })])
    const encoded = Buffer.from(JSON.stringify(original), 'utf-8').toString('base64')
    expect(decodeGuidelineSources(encoded)).toEqual(original)
  })

  it('null이면 빈 배열을 반환한다', () => {
    expect(decodeGuidelineSources(null)).toEqual([])
  })

  it('깨진 base64 값이면 빈 배열을 반환한다', () => {
    expect(decodeGuidelineSources('not-valid-base64!!')).toEqual([])
  })
})
