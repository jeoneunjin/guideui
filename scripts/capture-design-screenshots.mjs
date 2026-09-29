import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = fileURLToPath(new URL('../docs/design/', import.meta.url))

const targets = [
  { file: '01-landing.png', url: '/' },
  { file: '02-workspace.png', url: '/workspace?state=done' },
  { file: '03-search.png', url: '/search?state=result' },
  { file: '04-guides.png', url: '/guides?state=default' },
]

await mkdir(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

for (const { file, url } of targets) {
  await page.goto(`${BASE_URL}${url}`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(OUT_DIR, file), fullPage: true })
  console.log(`saved ${file}`)
}

await browser.close()
