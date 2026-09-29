import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const targets: { path: string; states: (string | null)[] }[] = [
  { path: '/', states: [null] },
  { path: '/workspace', states: ['empty', 'streaming', 'done', 'fixed', 'error'] },
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
