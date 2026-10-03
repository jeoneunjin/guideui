import { describe, expect, it, vi } from 'vitest'
import { generateText } from 'ai'
import { POST } from './route'

vi.mock('ai', () => ({ generateText: vi.fn() }))

const mockGenerateText = vi.mocked(generateText)

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
  it('1차 응답이 화이트리스트를 지키면 재생성 없이 그대로 반환한다', async () => {
    mockGenerateText.mockReset().mockResolvedValueOnce({ text: VALID_CODE } as never)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ text: VALID_CODE })
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  it('1차는 위반, 2차는 통과하면 한 번만 재생성하고 2차 응답을 반환한다', async () => {
    mockGenerateText
      .mockReset()
      .mockResolvedValueOnce({ text: INVALID_CODE } as never)
      .mockResolvedValueOnce({ text: VALID_CODE } as never)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ text: VALID_CODE })
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })

  it('1차·2차 모두 위반하면 422와 사유를 반환한다', async () => {
    mockGenerateText.mockReset().mockResolvedValue({ text: INVALID_CODE } as never)

    const res = await POST(request({ messages: [{ role: 'user', content: '버튼 만들어줘' }] }))

    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({
      error: '허용되지 않은 코드가 반복 생성됐어요. 다시 시도해 주세요.',
      reason: 'disallowed-import',
    })
    expect(mockGenerateText).toHaveBeenCalledTimes(2)
  })
})
