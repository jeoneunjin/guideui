import { beforeEach, describe, expect, it, vi } from 'vitest'
import { streamText } from 'ai'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { findDemoGuideSetId } from '@/lib/rag/demo-guide-set'
import { searchGuideChunks } from '@/lib/rag/search'
import { POST } from './route'

vi.mock('ai', () => ({ streamText: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn() }))
vi.mock('@/lib/rag/demo-guide-set', () => ({ findDemoGuideSetId: vi.fn() }))
vi.mock('@/lib/rag/search', () => ({ searchGuideChunks: vi.fn() }))

const mockStreamText = vi.mocked(streamText)
const mockCreateSupabaseAdminClient = vi.mocked(createSupabaseAdminClient)
const mockFindDemoGuideSetId = vi.mocked(findDemoGuideSetId)
const mockSearchGuideChunks = vi.mocked(searchGuideChunks)

function request(body: unknown) {
  return new Request('http://localhost/api/guides/search', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const RESULT = [
  {
    id: 1,
    documentId: 'doc-1',
    documentTitle: 'button.md',
    headingPath: 'Button > 배치',
    content: '한 영역에는 주 버튼을 하나만 둬요.',
    similarity: 0.82,
  },
]

describe('POST /api/guides/search', () => {
  beforeEach(() => {
    mockStreamText.mockReset()
    mockCreateSupabaseAdminClient.mockReset()
    mockFindDemoGuideSetId.mockReset()
    mockSearchGuideChunks.mockReset()
  })

  it('Supabase 클라이언트가 없으면 500을 반환하고 검색을 시도하지 않는다', async () => {
    mockCreateSupabaseAdminClient.mockReturnValue(null)

    const res = await POST(request({ question: '버튼 색상이 뭐예요?' }))

    expect(res.status).toBe(500)
    expect(mockSearchGuideChunks).not.toHaveBeenCalled()
  })

  it('검색 결과가 0개면 noResult를 반환하고 모델을 호출하지 않는다', async () => {
    mockCreateSupabaseAdminClient.mockReturnValue({} as never)
    mockFindDemoGuideSetId.mockResolvedValue('guide-set-1')
    mockSearchGuideChunks.mockResolvedValue([])

    const res = await POST(request({ question: '환불 정책이 뭐예요?' }))

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/json')
    expect(await res.json()).toEqual({ noResult: true })
    expect(mockStreamText).not.toHaveBeenCalled()
  })

  it('검색 결과가 있으면 출처 헤더와 스트리밍 답변을 반환한다', async () => {
    mockCreateSupabaseAdminClient.mockReturnValue({} as never)
    mockFindDemoGuideSetId.mockResolvedValue('guide-set-1')
    mockSearchGuideChunks.mockResolvedValue(RESULT)
    mockStreamText.mockReturnValue({
      textStream: new ReadableStream<string>({
        start(controller) {
          controller.enqueue('주 버튼은 ')
          controller.enqueue('하나만 둬요 [G1].')
          controller.close()
        },
      }),
    } as never)

    const res = await POST(request({ question: '버튼 배치 규칙이 뭐예요?' }))

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    const header = res.headers.get('X-Guideline-Sources')
    expect(header).toBeTruthy()
    const sources = JSON.parse(Buffer.from(header!, 'base64').toString('utf-8'))
    expect(sources).toEqual([
      { id: 'G1', documentTitle: 'button.md', headingPath: 'Button > 배치', excerpt: '한 영역에는 주 버튼을 하나만 둬요.', similarity: 0.82 },
    ])
    expect(await res.text()).toBe('주 버튼은 하나만 둬요 [G1].')
  })
})
