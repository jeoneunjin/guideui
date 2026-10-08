'use client'

import { useEffect, useRef, useState } from 'react'
import type { Monaco } from '@monaco-editor/react'
import MonacoEditor from '@monaco-editor/react'
import { Copy, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { appTokens } from '@/lib/app-tokens'
import { useWorkspaceStore } from './workspace-store'

const MONACO_THEME = 'guideui-dark'

function handleBeforeMount(monaco: Monaco) {
  monaco.editor.defineTheme(MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': appTokens.code.bg, 'editor.foreground': appTokens.code.fg },
  })
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.Preserve,
  })
}

const MONACO_OPTIONS = {
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  ariaLabel: '생성된 코드 편집기',
}

const DEBOUNCE_MS = 300

export function Editor({tab,setTab,streaming}:{tab:'코드'|'Diff'|'버전';setTab:(x:'코드'|'Diff'|'버전')=>void;streaming:boolean}) {
  const code = useWorkspaceStore((s) => s.editorCode)
  const setCode = useWorkspaceStore((s) => s.setCode)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingValueRef = useRef<string | null>(null)
  const streamingRef = useRef(streaming)
  streamingRef.current = streaming
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 권한이 없는 환경 — 조용히 무시
    }
  }

  function handleDownload() {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GeneratedComponent.tsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      if (pendingValueRef.current !== null) setCode(pendingValueRef.current)
    }
  }, [setCode])

  function handleChange(value: string | undefined) {
    // Monaco는 streaming 중 코드가 setEditorCode로 프로그래밍 방식으로 바뀔 때도 onChange를
    // 호출한다(onChange={streaming?undefined:handleChange}만으로는 안 걸러짐) — 걸러내지 않으면
    // 스트림 종료 직후 이 디바운스가 스트리밍 도중의 부분 코드로 최종 코드를 덮어써버린다.
    if (streamingRef.current) return
    pendingValueRef.current = value ?? ''
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setCode(pendingValueRef.current ?? '')
      pendingValueRef.current = null
    }, DEBOUNCE_MS)
  }

  return <section aria-label="코드" className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-surface"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2"><div role="tablist" aria-label="코드 보기" className="flex gap-1">{(['코드','Diff','버전'] as const).map(x=><button type="button" key={x} role="tab" aria-selected={tab===x} aria-controls={`editor-panel-${x}`} onClick={()=>setTab(x)} className={cn('rounded-button px-3 py-2 text-sm',tab===x?'border-b-2 border-brand-600 font-medium text-fg-brand':'text-fg-secondary')}>{x}</button>)}</div><div className="flex items-center gap-2 text-xs text-fg-secondary"><span>v3 · AI 수정</span><Button variant="ghost" size="sm" aria-live="polite" onClick={handleCopy}><Copy aria-hidden="true" data-icon="inline-start"/>{copied?'복사됨':'복사하기'}</Button><Button variant="ghost" size="sm" onClick={handleDownload}><Download aria-hidden="true" data-icon="inline-start"/>다운로드하기</Button></div></div><div id={`editor-panel-${tab}`} role="tabpanel" aria-label={`${tab} 패널`} className={cn('min-h-0 flex-1',streaming||tab==='코드'?'overflow-hidden':'overflow-y-auto p-4')}>{streaming||tab==='코드'?<MonacoEditor height="100%" language="typescript" path="GeneratedComponent.tsx" theme={MONACO_THEME} beforeMount={handleBeforeMount} value={code} onChange={streaming?undefined:handleChange} options={{...MONACO_OPTIONS,readOnly:streaming}} />:tab==='Diff'?<div className="font-mono text-sm"><div className="border border-line p-2 text-fg-secondary">− &lt;h3 className=&quot;text-lg font-bold&quot;&gt;로그인&lt;/h3&gt;</div><div className="border border-line p-2 text-fg-secondary">+ &lt;h2 className=&quot;text-lg font-bold&quot;&gt;로그인&lt;/h2&gt;</div></div>:<div className="flex flex-col gap-3 text-sm">{['v3 · AI 수정 · 접근성 100 · 방금 전','v2 · 생성 · 접근성 92 · 2분 전','v1 · 생성 · 접근성 78 · 5분 전'].map(x=><div key={x} className="flex items-center justify-between gap-2 border-b border-line pb-3"><span>{x}</span><Button variant="secondary" size="sm"><RotateCcw aria-hidden="true" data-icon="inline-start"/>되돌리기</Button></div>)}</div>}</div></section>
}
