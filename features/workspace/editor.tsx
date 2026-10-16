'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Monaco } from '@monaco-editor/react'
import MonacoEditor, { DiffEditor } from '@monaco-editor/react'
import { Copy, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { appTokens } from '@/lib/app-tokens'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { useWorkspaceStore } from './workspace-store'
import { useVersionList, versionListQueryKey } from './use-version-list'
import { useSaveVersion } from './use-session-mutations'
import { getDefaultDiffVersions, type VersionListItem } from './version-list'

const MONACO_THEME = 'guideui-dark'
const KIND_LABELS: Record<VersionListItem['kind'], string> = {
  generate: '생성',
  fix: '수정',
  manual: '수동 편집',
}

function handleBeforeMount(monaco: Monaco) {
  monaco.editor.defineTheme(MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: 'invalid', foreground: appTokens.code.invalidFg.slice(1) }],
    colors: {
      'editor.background': appTokens.code.bg,
      'editor.foreground': appTokens.code.fg,
      'editorLineNumber.foreground': appTokens.code.lineNumberFg,
    },
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
  const sessionId = useWorkspaceStore((s) => s.sessionId)
  const latestVersion = useWorkspaceStore((s) => s.latestVersion)
  const incrementVersion = useWorkspaceStore((s) => s.incrementVersion)
  const versionsQuery = useVersionList(sessionId)
  const versions = versionsQuery.data ?? []
  const saveVersion = useSaveVersion()
  const queryClient = useQueryClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingValueRef = useRef<string | null>(null)
  const streamingRef = useRef(streaming)
  streamingRef.current = streaming
  const monacoRef = useRef<Monaco | null>(null)
  const [copied, setCopied] = useState(false)
  const [diffBase, setDiffBase] = useState<number | null>(null)
  const [diffTarget, setDiffTarget] = useState<number | null>(null)
  const diffDefaults = getDefaultDiffVersions(versions)
  const effectiveDiffBase = diffBase ?? diffDefaults.base
  const effectiveDiffTarget = diffTarget ?? diffDefaults.target

  async function handleRevert(item: VersionListItem) {
    if (!sessionId) return
    setCode(item.code)
    try {
      await saveVersion.mutateAsync({
        sessionId,
        version: incrementVersion(),
        code: item.code,
        kind: 'manual',
        sourceMessageId: null,
      })
      queryClient.invalidateQueries({ queryKey: versionListQueryKey(sessionId) })
    } catch (error) {
      console.error('되돌리기 저장 실패:', error)
    }
  }

  function renderVersionTab() {
    if (!sessionId) return <p className="text-sm text-fg-muted">아직 저장된 버전이 없어요.</p>
    if (versionsQuery.isLoading) return <p className="text-sm text-fg-muted">불러오는 중이에요.</p>
    if (versionsQuery.isError) return <p className="text-sm text-fg-muted">버전을 불러오지 못했어요.</p>
    if (versions.length === 0) return <p className="text-sm text-fg-muted">아직 저장된 버전이 없어요.</p>
    return (
      <div className="flex flex-col gap-3 text-sm">
        {versions.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-2 border-b border-line pb-3">
            <span>
              v{v.version} · {KIND_LABELS[v.kind]}
              {v.a11yScore !== null ? ` · 접근성 ${v.a11yScore}점` : ''} · {formatRelativeTime(v.createdAt)}
            </span>
            {v.version !== latestVersion && (
              <Button
                variant="secondary"
                size="sm"
                disabled={streaming || saveVersion.isPending}
                onClick={() => handleRevert(v)}
              >
                <RotateCcw aria-hidden="true" data-icon="inline-start" />
                되돌리기
              </Button>
            )}
          </div>
        ))}
      </div>
    )
  }

  function renderDiffTab() {
    if (!sessionId) return <p className="text-sm text-fg-muted">아직 저장된 버전이 없어요.</p>
    if (versionsQuery.isLoading) return <p className="text-sm text-fg-muted">불러오는 중이에요.</p>
    if (versionsQuery.isError) return <p className="text-sm text-fg-muted">버전을 불러오지 못했어요.</p>
    if (versions.length < 2) return <p className="text-sm text-fg-muted">비교할 버전이 2개 이상 있어야 해요.</p>
    const originalCode = versions.find((v) => v.version === effectiveDiffBase)?.code ?? ''
    const modifiedCode = versions.find((v) => v.version === effectiveDiffTarget)?.code ?? ''
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-2 text-sm">
          <label htmlFor="diff-base" className="flex items-center gap-2">
            이전 버전
            <select
              id="diff-base"
              value={effectiveDiffBase ?? ''}
              onChange={(e) => setDiffBase(Number(e.target.value))}
              className="rounded-input border border-line-input bg-surface px-2 py-1"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} · {KIND_LABELS[v.kind]}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="diff-target" className="flex items-center gap-2">
            이후 버전
            <select
              id="diff-target"
              value={effectiveDiffTarget ?? ''}
              onChange={(e) => setDiffTarget(Number(e.target.value))}
              className="rounded-input border border-line-input bg-surface px-2 py-1"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} · {KIND_LABELS[v.kind]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="min-h-0 flex-1">
          <DiffEditor
            height="100%"
            language="typescript"
            theme={MONACO_THEME}
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            original={originalCode}
            modified={modifiedCode}
            originalModelPath="inmemory://diff-original.tsx"
            modifiedModelPath="inmemory://diff-modified.tsx"
            keepCurrentOriginalModel
            keepCurrentModifiedModel
            options={{ ...MONACO_OPTIONS, ariaLabel: '버전 비교', readOnly: true, renderSideBySide: true }}
          />
        </div>
      </div>
    )
  }

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

  function handleEditorMount(_editor: unknown, monaco: Monaco) {
    monacoRef.current = monaco
  }

  // Diff 탭이 마운트될 때마다 DiffEditor가 새 임시 모델(inmemory://model/N)을 만드는데,
  // 그 직후 TS 진단 워커가 이미 dispose된 모델을 찾다가 "Could not find source file" 콘솔
  // 에러를 던지는 Monaco 내부 레이스가 있다(기능엔 영향 없음, 모델을 고정 경로로 지정해도
  // 그대로 재현됨을 확인함). Diff 탭에 있는 동안만 TS 진단을 꺼서 그 요청 자체가 안 나가게
  // 막고, 탭을 벗어나면 "코드" 탭의 타입 체크가 그대로 동작하도록 원래 설정을 복원한다.
  useEffect(() => {
    const monaco = monacoRef.current
    if (tab !== 'Diff' || !monaco) return
    const tsDefaults = monaco.languages.typescript.typescriptDefaults
    const previous = tsDefaults.getDiagnosticsOptions()
    tsDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    })
    return () => {
      tsDefaults.setDiagnosticsOptions(previous)
    }
  }, [tab])

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

  return <section aria-label="코드" className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-surface"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2"><div role="tablist" aria-label="코드 보기" className="flex gap-1">{(['코드','Diff','버전'] as const).map(x=><button type="button" key={x} role="tab" aria-selected={tab===x} aria-controls={`editor-panel-${x}`} onClick={()=>setTab(x)} className={cn('rounded-button px-3 py-2 text-sm',tab===x?'border-b-2 border-brand-600 font-medium text-fg-brand':'text-fg-secondary')}>{x}</button>)}</div><div className="flex items-center gap-2 text-xs text-fg-secondary"><span>v{latestVersion}</span><Button variant="ghost" size="sm" aria-live="polite" onClick={handleCopy}><Copy aria-hidden="true" data-icon="inline-start"/>{copied?'복사됨':'복사하기'}</Button><Button variant="ghost" size="sm" onClick={handleDownload}><Download aria-hidden="true" data-icon="inline-start"/>다운로드하기</Button></div></div><div id={`editor-panel-${tab}`} role="tabpanel" aria-label={`${tab} 패널`} className={cn('min-h-0 flex-1',streaming||tab==='코드'||tab==='Diff'?'overflow-hidden':'overflow-y-auto p-4')}>{streaming||tab==='코드'?<MonacoEditor height="100%" language="typescript" path="GeneratedComponent.tsx" theme={MONACO_THEME} beforeMount={handleBeforeMount} onMount={handleEditorMount} value={code} onChange={streaming?undefined:handleChange} options={{...MONACO_OPTIONS,readOnly:streaming}} />:tab==='Diff'?renderDiffTab():renderVersionTab()}</div></section>
}
