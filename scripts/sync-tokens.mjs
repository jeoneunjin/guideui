#!/usr/bin/env node
/**
 * sample-guide/tokens.ts(생성 컴포넌트용 Sample DS 스펙)와 lib/app-tokens.ts(GuideUI 서비스 전용 토큰)를
 * 읽어서 app/globals.css의 AUTO-GENERATED 블록 3곳을 채운다.
 *
 * npm run tokens:sync  — globals.css를 다시 씀
 * npm run tokens:check — 생성 결과와 globals.css가 다르면 실패 (CI/커밋 전 검증용)
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSS_PATH = path.join(ROOT, 'app/globals.css')

// shadcn 기본 변수 → Sample DS/앱 토큰. 값이 아니라 변수 참조라서 tokens.ts가 바뀌면 자동으로 같이 바뀐다.
const SHADCN_MAP = {
  background: 'surface-subtle',
  foreground: 'fg-primary',
  primary: 'brand-600',
  'primary-foreground': 'fg-inverse',
  secondary: 'surface-muted',
  'secondary-foreground': 'fg-primary',
  destructive: 'danger-600',
  muted: 'surface-muted',
  'muted-foreground': 'fg-muted',
  accent: 'brand-50',
  'accent-foreground': 'fg-primary',
  popover: 'surface',
  'popover-foreground': 'fg-primary',
  border: 'line',
  input: 'line-input',
  ring: 'line-focus',
}

function flattenColors(colors) {
  // { brand: {50: '#..', ...}, surface: {DEFAULT: '#..', subtle: '#..'}, overlay: '#..' }
  // -> [['brand-50', '#..'], ['surface', '#..'], ['surface-subtle', '#..'], ['overlay', '#..']]
  const entries = []
  for (const [group, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      entries.push([group, value])
      continue
    }
    for (const [key, val] of Object.entries(value)) {
      entries.push([key === 'DEFAULT' ? group : `${group}-${key}`, val])
    }
  }
  return entries
}

function quoteFontName(name) {
  return name.includes(' ') ? `"${name}"` : name
}

async function buildBlocks() {
  const [{ default: sampleTokens }, { default: appTokens }] = await Promise.all([
    import(path.join(ROOT, 'sample-guide/tokens.ts')),
    import(path.join(ROOT, 'lib/app-tokens.ts')),
  ])

  const colorEntries = [
    ...flattenColors(sampleTokens.colors),
    ['code-bg', appTokens.code.bg],
    ['code-fg', appTokens.code.fg],
  ]

  const rootTokenLines = colorEntries.map(([name, value]) => `  --${name}: ${value};`)

  const themeTokenLines = [
    ...colorEntries.map(([name]) => `  --color-${name}: var(--${name});`),
    ...Object.entries(sampleTokens.borderRadius).map(([key, value]) => `  --radius-${key}: ${value};`),
    ...Object.entries(sampleTokens.boxShadow).map(([key, value]) => `  --shadow-${key}: ${value};`),
    ...Object.entries(sampleTokens.spacing).map(([key, value]) => `  --spacing-${key}: ${value};`),
    ...Object.entries(sampleTokens.fontFamily).map(
      ([key, fonts]) => `  --font-${key}: ${fonts.map(quoteFontName).join(', ')};`
    ),
    ...Object.entries(sampleTokens.transitionDuration).map(([key, value]) => `  --duration-${key}: ${value};`),
  ]

  const rootShadcnLines = Object.entries(SHADCN_MAP).map(
    ([shadcnVar, ourVar]) => `  --${shadcnVar}: var(--${ourVar});`
  )

  return {
    'theme-tokens': themeTokenLines.join('\n'),
    'root-tokens': rootTokenLines.join('\n'),
    'root-shadcn-map': rootShadcnLines.join('\n'),
  }
}

function replaceBlock(css, id, content) {
  const begin = `/* AUTO-GENERATED:${id} — run \`npm run tokens:sync\`. DO NOT EDIT BELOW BY HAND. */`
  const end = `/* END AUTO-GENERATED:${id} */`
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`${escape(begin)}[\\s\\S]*?${escape(end)}`)
  if (!pattern.test(css)) {
    throw new Error(`app/globals.css에서 "${id}" 블록 마커를 못 찾았어요. AUTO-GENERATED:${id} 주석이 지워졌는지 확인해 주세요.`)
  }
  return css.replace(pattern, `${begin}\n${content}\n  ${end}`)
}

async function main() {
  const check = process.argv.includes('--check')
  const blocks = await buildBlocks()
  const original = await readFile(CSS_PATH, 'utf8')
  let next = original
  for (const [id, content] of Object.entries(blocks)) {
    next = replaceBlock(next, id, content)
  }

  if (check) {
    if (next !== original) {
      console.error('✗ app/globals.css가 sample-guide/tokens.ts / lib/app-tokens.ts와 어긋나 있어요.')
      console.error('  npm run tokens:sync 로 다시 생성해 주세요.')
      process.exit(1)
    }
    console.log('✓ app/globals.css가 토큰 소스와 일치해요.')
    return
  }

  if (next === original) {
    console.log('변경 없음 — 이미 최신 상태예요.')
    return
  }
  await writeFile(CSS_PATH, next)
  console.log('✓ app/globals.css를 sample-guide/tokens.ts / lib/app-tokens.ts 기준으로 갱신했어요.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
