'use client'

import { useMemo } from 'react'
import { SandpackProvider, SandpackPreview, useSandpack, useSandpackShell } from '@codesandbox/sandpack-react'
import { Button } from '@/components/ui/button'
import { buildSandboxFiles, buildSandboxOptions } from './sandbox-files'
import { useWorkspaceStore } from './workspace-store'

function PreviewContent() {
  const { sandpack } = useSandpack()
  const { restart } = useSandpackShell()
  const error = sandpack.error

  if (error) {
    const isCompileError = error.title === 'SyntaxError' || error.message.includes('SyntaxError')
    return (
      <div role="alert" className="flex h-full flex-col gap-2 overflow-y-auto border border-line bg-surface p-3 text-sm">
        <span className="w-fit rounded-full border border-line px-2 py-1 text-xs text-danger-700">
          {isCompileError ? '컴파일 에러' : '런타임 에러'}
        </span>
        <p className="text-danger-700">{error.message}</p>
        {error.path && (
          <p className="text-fg-secondary">
            {error.path}
            {error.line ? `:${error.line}` : ''}
          </p>
        )}
        <Button variant="secondary" size="sm" className="mt-2 w-fit" onClick={() => restart()}>
          다시 시도하기
        </Button>
      </div>
    )
  }

  return <SandpackPreview showOpenInCodeSandbox={false} showSandpackErrorOverlay={false} style={{ height: '100%' }} />
}

export function Preview({fixed,streaming}:{fixed:boolean;streaming:boolean}) {
  const code = useWorkspaceStore((s) => s.previewCode)
  const files = useMemo(() => buildSandboxFiles(code), [code])
  const options = useMemo(() => buildSandboxOptions(), [])
  return <section aria-label="미리보기" className="h-full min-w-0 overflow-y-auto bg-surface p-4"><h2 className="mb-3 text-base font-bold">미리보기</h2><div className="border border-line bg-surface p-4">{streaming?<p className="text-sm text-fg-secondary">코드 생성이 끝나면 미리보기가 표시돼요</p>:<SandpackProvider template="react-ts" files={files} options={options} style={{height:440}}><PreviewContent /></SandpackProvider>}</div><div className="mt-6 flex flex-col gap-3"><h2 className="text-base font-bold">접근성 검사</h2><p aria-live="polite" className="text-sm">접근성 점수 {fixed?'100':'92'}점 · 위반 {fixed?'0':'1'}건 · 확인 필요 1건</p>{!fixed&&<><div className="border border-line bg-surface p-3 text-sm"><span className="mr-2 rounded-full border border-line px-2 py-1 text-xs text-danger-700">심각</span>제목 단계를 건너뛰었어요 (h1 없이 h3 사용)<button type="button" className="ml-2 text-fg-brand underline">4번째 줄 보기</button></div><div className="border border-line bg-surface p-3 text-sm"><span className="mr-2 rounded-full border border-line px-2 py-1 text-xs text-warning-700">확인 필요</span>입력 필드 설명이 충분한지 확인해 주세요</div><Button className="bg-brand-600 text-fg-inverse hover:bg-brand-600">수정하기</Button><Button variant="ghost">다시 검사하기</Button></>}{fixed&&<div className="border border-line bg-surface p-3 text-sm">92점 → 100점 · 위반 1건 → 0건 · 해결: heading-order</div>}</div></section> }
