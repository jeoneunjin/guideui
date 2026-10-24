import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extractRuleIds } from './rule-ids'

describe('extractRuleIds', () => {
  it('매치가 없으면 빈 배열을 반환한다', () => {
    expect(extractRuleIds('규칙 ID가 전혀 없는 텍스트입니다.')).toEqual([])
  })

  it('중복된 ID는 하나로 합친다', () => {
    const result = extractRuleIds('BTN-01을 쓴다. 나중에 또 BTN-01을 언급한다.')
    expect(result).toEqual(['BTN-01'])
  })

  it('접두사에 숫자가 섞인 ID(A11Y-09)도 인식한다', () => {
    expect(extractRuleIds('즉시 알림은 A11Y-08, 클릭 영역은 A11Y-09를 따른다.')).toEqual(
      expect.arrayContaining(['A11Y-08', 'A11Y-09']),
    )
  })

  it('실제 button.md에서 BTN 규칙 9개를 추출한다', () => {
    const text = readFileSync(join(process.cwd(), 'sample-guide/button.md'), 'utf-8')
    expect(extractRuleIds(text)).toHaveLength(9)
  })

  it('실제 accessibility.md에서 A11Y 규칙 9개를 추출한다', () => {
    const text = readFileSync(join(process.cwd(), 'sample-guide/accessibility.md'), 'utf-8')
    expect(extractRuleIds(text)).toHaveLength(9)
  })
})
