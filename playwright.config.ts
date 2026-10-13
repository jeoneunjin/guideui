import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // 로컬 .env.local에 실제 Supabase 키가 있으면 그대로 상속돼서, 테스트 중 보낸
    // 채팅 메시지가 실제 운영 DB에 빈 테스트 세션으로 쌓인다. env -u로 지워도 Next.js가
    // .env.local에서 다시 채워 넣어서 안 먹힌다(이미 설정된 값만 안 덮어쓰는 방식이라
    // 비우면 오히려 새로 로드됨) — 대신 존재하지 않는 주소로 덮어쓴다. zod 검증(URL
    // 형식)은 통과하지만 실제 네트워크 호출은 전부 실패하고, 그건 이미 전부
    // try/catch로 삼키게 설계돼 있어서(proxy.ts, session-persistence.ts) 조용히
    // 스킵된 것과 동일하게 동작한다.
    command:
      'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:1/disabled-for-e2e NEXT_PUBLIC_SUPABASE_ANON_KEY=disabled-for-e2e npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
