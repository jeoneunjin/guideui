// 서버 전용 모듈: NEXT_PUBLIC_* 값도 여기 있지만, 이 파일 자체를 클라이언트 번들에서
// import하면 안 됨(process.env 전체를 통째로 넘기는 패턴이라 브라우저에서 인라이닝 안 됨 —
// 브라우저에서 쓸 값은 lib/supabase/client.ts처럼 process.env.NEXT_PUBLIC_*를 그 자리에서
// 직접 리터럴로 읽어야 함).
import { z } from 'zod'

const envSchema = z
  .object({
    LLM_PROVIDER: z.enum(['mock', 'gemini', 'anthropic']).default('mock'),
    GOOGLE_GENERATIVE_AI_API_KEY: z
      .string()
      .transform((v) => v.trim())
      .pipe(z.string().min(1))
      .optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.LLM_PROVIDER === 'gemini' && !val.GOOGLE_GENERATIVE_AI_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['GOOGLE_GENERATIVE_AI_API_KEY'],
        message: 'LLM_PROVIDER=gemini일 때는 GOOGLE_GENERATIVE_AI_API_KEY가 필요해요.',
      })
    }
    if (!!val.SUPABASE_URL !== !!val.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['SUPABASE_URL'],
        message: 'SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY는 둘 다 설정하거나 둘 다 비워야 해요.',
      })
    }
    if (!!val.NEXT_PUBLIC_SUPABASE_URL !== !!val.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['NEXT_PUBLIC_SUPABASE_URL'],
        message: 'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY는 둘 다 설정하거나 둘 다 비워야 해요.',
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('환경 변수 검증 실패:', parsed.error.flatten().fieldErrors)
  throw new Error('환경 변수가 올바르지 않아요. .env.example을 참고해서 .env.local을 확인해 주세요.')
}

export const env = parsed.data
