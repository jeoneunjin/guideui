import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const targets: { path: string; states: (string | null)[] }[] = [
  { path: '/', states: [null] },
  { path: '/workspace', states: ['streaming', 'done', 'fixed'] },
  { path: '/search', states: ['initial', 'loading', 'streaming', 'no-result', 'error', 'result'] },
  { path: '/guides', states: ['empty', 'uploading', 'default'] },
]

for (const { path, states } of targets) {
  for (const state of states) {
    const url = state ? `${path}?state=${state}` : path
    test(`a11y violations: ${url}`, async ({ page }) => {
      await page.goto(url)
      // react-resizable-panels sets aria-valuenow on separators after an initial layout
      // effect, not on first paint — wait for it so axe doesn't race a transient state.
      await page.waitForFunction(() => document.querySelectorAll('[role="separator"]:not([aria-valuenow])').length === 0)
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
      expect(results.violations).toEqual([])
    })
  }
}

test('a11y violations: /workspace 실제 전송 성공', async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: '버튼을 만들었어요. [G1]\n\n```tsx\nexport default function GeneratedComponent() {\n  return <button type="button">확인</button>\n}\n```',
      }),
    }),
  )
  await page.goto('/workspace')
  await page.waitForFunction(() => document.querySelectorAll('[role="separator"]:not([aria-valuenow])').length === 0)
  // 채팅 패널은 모바일 탭용/데스크톱 패널용으로 두 번 마운트돼 있어서(반응형 CSS로만 하나를 숨김)
  // getByLabel이 모호해진다 — 데스크톱(마지막에 렌더되는) 인스턴스로 범위를 좁힌다.
  const chat = page.locator('aside[aria-label="채팅"]').last()
  await chat.getByLabel('요청 입력').fill('버튼 만들어줘')
  await chat.getByRole('button', { name: '보내기' }).click()
  await expect(chat.getByText('버튼을 만들었어요.')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  expect(results.violations).toEqual([])
})

test('a11y violations: /workspace 실제 전송 실패', async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: '알 수 없는 오류가 발생했어요.' }),
    }),
  )
  await page.goto('/workspace')
  await page.waitForFunction(() => document.querySelectorAll('[role="separator"]:not([aria-valuenow])').length === 0)
  const chat = page.locator('aside[aria-label="채팅"]').last()
  await chat.getByLabel('요청 입력').fill('버튼 만들어줘')
  await chat.getByRole('button', { name: '보내기' }).click()
  await expect(chat.getByRole('alert')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  expect(results.violations).toEqual([])
})
