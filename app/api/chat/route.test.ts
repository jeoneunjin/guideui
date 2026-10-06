import { describe, expect, it, vi } from 'vitest'
import { streamText } from 'ai'
import { POST } from './route'

vi.mock('ai', () => ({ streamText: vi.fn() }))

const mockStreamText = vi.mocked(streamText)

function mockResponseOnce(text: string) {
  mockStreamText.mockReturnValueOnce({ text: Promise.resolve(text) } as never)
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
  it('1차 응답이 화이트리스트를 지키면 재생성 없이 그대로 스트리밍 반환한다', async () => {
    mockStreamText.mockReset()
    mockResponseOnce(VALID_CODE)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    expect(await res.text()).toBe(VALID_CODE)
    expect(mockStreamText).toHaveBeenCalledTimes(1)
  })

  it('1차는 위반, 2차는 통과하면 한 번만 재생성하고 2차 응답을 스트리밍 반환한다', async () => {
    mockStreamText.mockReset()
    mockResponseOnce(INVALID_CODE)
    mockResponseOnce(VALID_CODE)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(200)
    expect(await res.text()).toBe(VALID_CODE)
    expect(mockStreamText).toHaveBeenCalledTimes(2)
  })

  it('1차·2차 모두 위반하면 422와 사유를 반환한다', async () => {
    mockStreamText.mockReset()
    mockResponseOnce(INVALID_CODE)
    mockResponseOnce(INVALID_CODE)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({
      error: '허용되지 않은 코드가 반복 생성됐어요. 다시 시도해 주세요.',
      reason: 'disallowed-import',
    })
    expect(mockStreamText).toHaveBeenCalledTimes(2)
  })
})
