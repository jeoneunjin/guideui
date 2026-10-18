import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed } from 'ai'

describe('getEmbeddingModel', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('@/lib/env')
  })

  it('mock일 때 768차원 벡터를 반환한다', async () => {
    vi.doMock('@/lib/env', () => ({ env: { LLM_PROVIDER: 'mock' } }))
    const { getEmbeddingModel } = await import('./llm')

    const { embedding } = await embed({ model: getEmbeddingModel(), value: '버튼 규칙' })

    expect(embedding).toHaveLength(768)
  })

  it('mock일 때 같은 텍스트는 같은 벡터를 반환한다(결정적)', async () => {
    vi.doMock('@/lib/env', () => ({ env: { LLM_PROVIDER: 'mock' } }))
    const { getEmbeddingModel } = await import('./llm')
    const model = getEmbeddingModel()

    const first = await embed({ model, value: '버튼 규칙' })
    const second = await embed({ model, value: '버튼 규칙' })

    expect(first.embedding).toEqual(second.embedding)
  })

  it('mock일 때 다른 텍스트는 다른 벡터를 반환한다', async () => {
    vi.doMock('@/lib/env', () => ({ env: { LLM_PROVIDER: 'mock' } }))
    const { getEmbeddingModel } = await import('./llm')
    const model = getEmbeddingModel()

    const a = await embed({ model, value: '버튼 규칙' })
    const b = await embed({ model, value: '카드 규칙' })

    expect(a.embedding).not.toEqual(b.embedding)
  })

  it('mock/gemini가 아닌 provider는 throw한다', async () => {
    vi.doMock('@/lib/env', () => ({ env: { LLM_PROVIDER: 'anthropic' } }))
    const { getEmbeddingModel } = await import('./llm')

    expect(() => getEmbeddingModel()).toThrow('아직 구현되지 않았어요')
  })
})
