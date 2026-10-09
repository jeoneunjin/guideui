import { beforeEach, describe, expect, it, vi } from 'vitest'
import { streamText } from 'ai'
import { after } from 'next/server'
import { logUsage } from '@/lib/usage-log'
import { POST } from './route'

vi.mock('ai', () => ({ streamText: vi.fn() }))
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: vi.fn((cb: () => void) => cb()) }
})
vi.mock('@/lib/usage-log', () => ({ logUsage: vi.fn() }))

const mockStreamText = vi.mocked(streamText)
const mockAfter = vi.mocked(after)
const mockLogUsage = vi.mocked(logUsage)

function mockResponseOnce(text: string) {
  mockStreamText.mockReturnValueOnce({
    textStream: (async function* () {
      yield text
    })(),
    usage: Promise.resolve({ inputTokens: 10, outputTokens: 20 }),
  } as never)
}

function request(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const VALID_CODE = `\`\`\`tsx
import { Button } from './components/ui/button'

export default function GeneratedComponent() {
  return <Button>확인</Button>
}
\`\`\``

const INVALID_CODE = `\`\`\`tsx
import { Icon } from 'lucide-react'

export default function GeneratedComponent() {
  return <Icon />
}
\`\`\``

describe('POST /api/chat', () => {
  beforeEach(() => {
    mockStreamText.mockReset()
    mockAfter.mockClear()
    mockLogUsage.mockClear()
  })

  it('1차 응답이 화이트리스트를 지키면 재생성 없이 그대로 스트리밍 반환한다', async () => {
    mockResponseOnce(VALID_CODE)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    expect(await res.text()).toBe(VALID_CODE)
    expect(mockStreamText).toHaveBeenCalledTimes(1)
    expect(mockAfter).toHaveBeenCalledTimes(1)
    expect(mockLogUsage).toHaveBeenCalledWith(expect.objectContaining({ tokens: 30 }))
  })

  it('1차는 위반, 2차는 통과하면 한 번만 재생성하고 2차 응답을 스트리밍 반환한다', async () => {
    mockResponseOnce(INVALID_CODE)
    mockResponseOnce(VALID_CODE)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe(VALID_CODE)
    expect(mockStreamText).toHaveBeenCalledTimes(2)
    // 1차·2차 모두 실제 토큰을 쓰므로 합산돼야 함(30 + 30)
    expect(mockLogUsage).toHaveBeenCalledWith(expect.objectContaining({ tokens: 60 }))
  })

  it('1차·2차 모두 위반하면 422와 사유를 반환한다', async () => {
    mockResponseOnce(INVALID_CODE)
    mockResponseOnce(INVALID_CODE)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({
      error: '허용되지 않은 코드가 반복 생성됐어요. 다시 시도해 주세요.',
      reason: 'disallowed-import',
    })
    expect(mockStreamText).toHaveBeenCalledTimes(2)
    expect(mockLogUsage).toHaveBeenCalledWith(expect.objectContaining({ tokens: 60 }))
  })

  it('메시지가 10개보다 많으면 최근 10개만 모델에 보낸다', async () => {
    mockResponseOnce(VALID_CODE)

    const messages = Array.from({ length: 14 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `메시지 ${i}`,
    }))

    await POST(request({ messages }))

    const sentMessages = mockStreamText.mock.calls[0][0].messages
    expect(sentMessages).toHaveLength(10)
    expect(sentMessages).toEqual(messages.slice(-10))
  })
})
