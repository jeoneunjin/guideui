import { MockEmbeddingModelV3, MockLanguageModelV3 } from 'ai/test'
import type { EmbeddingModel, LanguageModel } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { env } from '@/lib/env'

const MOCK_RESPONSE = `요청하신 내용을 반영해 기본 카드 UI를 만들었어요.

\`\`\`tsx
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

export default function GeneratedComponent() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-fg-primary">안내</h2>
      <p className="mt-2 text-sm text-fg-secondary">예시 콘텐츠예요.</p>
      <Button className="mt-4">확인</Button>
    </Card>
  );
}
\`\`\`
`

const MOCK_FINISH_REASON = { unified: 'stop', raw: undefined } as const
const MOCK_USAGE = {
  inputTokens: { total: undefined, noCache: undefined, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: undefined, text: undefined, reasoning: undefined },
} as const

function createMockModel(): LanguageModel {
  return new MockLanguageModelV3({
    doGenerate: async () => ({
      finishReason: MOCK_FINISH_REASON,
      usage: MOCK_USAGE,
      content: [{ type: 'text', text: MOCK_RESPONSE }],
      warnings: [],
    }),
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({ type: 'stream-start', warnings: [] })
          controller.enqueue({ type: 'text-start', id: '1' })
          controller.enqueue({ type: 'text-delta', id: '1', delta: MOCK_RESPONSE })
          controller.enqueue({ type: 'text-end', id: '1' })
          controller.enqueue({ type: 'finish', finishReason: MOCK_FINISH_REASON, usage: MOCK_USAGE })
          controller.close()
        },
      }),
    }),
  })
}

function createGeminiModel(): LanguageModel {
  const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY! })
  return google('gemini-3.1-flash-lite')
}

export function getGenerationModel(): LanguageModel {
  if (env.LLM_PROVIDER === 'mock') return createMockModel()
  if (env.LLM_PROVIDER === 'gemini') return createGeminiModel()
  throw new Error(`LLM_PROVIDER=${env.LLM_PROVIDER}는 아직 구현되지 않았어요 (STAGE 4에서 연결 예정).`)
}

// guide_chunks.embedding과 동일한 차원. gemini-embedding-001의 기본 출력은 3072차원이라
// providerOptions로 768까지 줄여서 받는다(outputDimensionality, 아래 참고).
const EMBEDDING_DIMENSIONS = 768

// 텍스트를 시드로 쓰는 간단한 LCG(linear congruential generator) — 외부 API 호출 없이
// 같은 입력엔 항상 같은 벡터를 돌려줘서(결정적) mock 경로에서도 실제 차원 수 그대로
// guide_chunks에 끝까지 저장해볼 수 있게 한다. 실제 임베딩 품질과는 무관.
function deterministicFakeVector(text: string, dimensions: number): number[] {
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0
  const values: number[] = []
  for (let i = 0; i < dimensions; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0
    values.push((seed / 0xffffffff) * 2 - 1)
  }
  return values
}

function createMockEmbeddingModel(): EmbeddingModel {
  return new MockEmbeddingModelV3({
    doEmbed: async ({ values }) => ({
      embeddings: values.map((v) => deterministicFakeVector(v, EMBEDDING_DIMENSIONS)),
      warnings: [],
    }),
  })
}

function createGeminiEmbeddingModel(): EmbeddingModel {
  const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY! })
  // text-embedding-004는 단종됐음(라이브 확인, STAGE 5 계획 중 발견) — 지금 쓸 수 있는 건
  // gemini-embedding-001/2/2-preview뿐이라 001을 씀.
  return google.embeddingModel('gemini-embedding-001')
}

export function getEmbeddingModel(): EmbeddingModel {
  if (env.LLM_PROVIDER === 'mock') return createMockEmbeddingModel()
  if (env.LLM_PROVIDER === 'gemini') return createGeminiEmbeddingModel()
  throw new Error(`LLM_PROVIDER=${env.LLM_PROVIDER}는 아직 구현되지 않았어요 (STAGE 5에서 연결 예정).`)
}

// gemini-embedding-001의 기본 출력 차원(3072)을 guide_chunks.embedding(768)에 맞추고,
// 문서 저장용 청크 임베딩이라는 걸 명시(검색 질의는 추후 RETRIEVAL_QUERY를 씀, STAGE 6).
// .embeddingModel(modelId)는 모델 생성 시점에 이 옵션을 못 받고 embed/embedMany 호출
// 시점의 providerOptions로만 줄 수 있어서(라이브 확인) 호출부가 재사용하도록 export한다.
// mock 모델에선 그냥 무시되므로 분기 없이 항상 넘겨도 안전하다.
export const GUIDE_EMBEDDING_PROVIDER_OPTIONS = {
  google: { outputDimensionality: EMBEDDING_DIMENSIONS, taskType: 'RETRIEVAL_DOCUMENT' as const },
}
