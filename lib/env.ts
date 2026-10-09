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
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('환경 변수 검증 실패:', parsed.error.flatten().fieldErrors)
  throw new Error('환경 변수가 올바르지 않아요. .env.example을 참고해서 .env.local을 확인해 주세요.')
}

export const env = parsed.data
