import { MockLanguageModelV3 } from 'ai/test'
import type { LanguageModel } from 'ai'
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
