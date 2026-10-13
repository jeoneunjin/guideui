import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './format-relative-time'

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime()

function minutesAgo(min: number) {
  return new Date(NOW - min * 60000).toISOString()
}

describe('formatRelativeTime', () => {
  it('1분 미만이면 방금 전', () => {
    expect(formatRelativeTime(minutesAgo(0), NOW)).toBe('방금 전')
  })

  it('59분이면 분 단위로 표시한다', () => {
    expect(formatRelativeTime(minutesAgo(1), NOW)).toBe('1분 전')
    expect(formatRelativeTime(minutesAgo(59), NOW)).toBe('59분 전')
  })

  it('60분이 되는 순간 시간 단위로 넘어간다', () => {
    expect(formatRelativeTime(minutesAgo(60), NOW)).toBe('1시간 전')
    expect(formatRelativeTime(minutesAgo(60 * 23), NOW)).toBe('23시간 전')
  })

  it('24시간이 되는 순간 일 단위로 넘어간다', () => {
    expect(formatRelativeTime(minutesAgo(60 * 24), NOW)).toBe('1일 전')
    expect(formatRelativeTime(minutesAgo(60 * 24 * 3), NOW)).toBe('3일 전')
  })
})
