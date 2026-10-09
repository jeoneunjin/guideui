'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { extractCode } from '@/lib/code/extract-code'
import { extractPartialCode } from '@/lib/code/extract-partial-code'
import { useWorkspaceStore, type ChatMessage } from './workspace-store'

const QUICK_PROMPTS = ['회원가입 폼', '상품 카드', '삭제 확인 모달']
const EDITOR_THROTTLE_MS = 100
const MESSAGES_SCROLL_BOTTOM_THRESHOLD_PX = 32

const MARKDOWN_COMPONENTS: Components = {
  ul: (props) => <ul className="list-disc pl-5" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5" {...props} />,
  a: (props) => <a className="text-fg-brand underline underline-offset-4" target="_blank" rel="noopener noreferrer" {...props} />,
  code: (props) => <code className="bg-surface-muted px-1 font-mono text-xs" {...props} />,
}

export function Chat() {
  const requestId = useId()
  const messages = useWorkspaceStore((s) => s.messages)
  const addMessage = useWorkspaceStore((s) => s.addMessage)
  const editorCode = useWorkspaceStore((s) => s.editorCode)
  const setCode = useWorkspaceStore((s) => s.setCode)
  const setEditorCode = useWorkspaceStore((s) => s.setEditorCode)
  const status = useWorkspaceStore((s) => s.status)
  const dispatch = useWorkspaceStore((s) => s.dispatch)
  const requestError = useWorkspaceStore((s) => s.requestError)
  const setRequestError = useWorkspaceStore((s) => s.setRequestError)
  const [requestText, setRequestText] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isPinnedToBottomRef = useRef(true)
  const isLoading = status === 'streaming'

  function handleMessagesScroll() {
    const el = messagesContainerRef.current
    if (!el) return
    isPinnedToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < MESSAGES_SCROLL_BOTTOM_THRESHOLD_PX
  }

  useEffect(() => {
    const el = messagesContainerRef.current
    if (el && isPinnedToBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, streamingText])

  useEffect(() => {
    if (!isLoading) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleAbort()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoading])

  async function performRequest(messagesToSend: ChatMessage[]) {
    setRequestError(null)
    const codeBeforeStream = editorCode
    dispatch('start')
    setStreamingText('')
    const controller = new AbortController()
    abortControllerRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend, currentCode: codeBeforeStream }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const data = await res.json()
        setRequestError(typeof data.error === 'string' ? data.error : '요청을 처리하지 못했어요.')
        dispatch('fail')
        return
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let lastEditorUpdate = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        const fenceIndex = fullText.indexOf('```')
        setStreamingText(fenceIndex === -1 ? fullText : fullText.slice(0, fenceIndex))
        const partialCode = extractPartialCode(fullText)
        if (partialCode !== null) {
          const now = Date.now()
          if (now - lastEditorUpdate >= EDITOR_THROTTLE_MS) {
            setEditorCode(partialCode)
            lastEditorUpdate = now
          }
        }
      }
      const fenceIndex = fullText.indexOf('```')
      const explanation = (fenceIndex === -1 ? fullText : fullText.slice(0, fenceIndex)).trim()
      addMessage({ role: 'assistant', content: explanation || fullText })
      setCode(extractCode(fullText))
      dispatch('finish')
    } catch {
      setCode(codeBeforeStream)
      if (controller.signal.aborted) {
        dispatch('abort')
      } else {
        setRequestError('응답을 받지 못했어요. 네트워크를 확인한 뒤 다시 시도해 주세요.')
        dispatch('fail')
      }
    } finally {
      setStreamingText('')
      abortControllerRef.current = null
    }
  }

  function handleSend(content: string) {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return
    setRequestText('')
    const next = [...messages, { role: 'user' as const, content: trimmed }]
    addMessage({ role: 'user', content: trimmed })
    performRequest(next)
  }

  function handleRetry() {
    performRequest(messages)
  }

  function handleAbort() {
    abortControllerRef.current?.abort()
  }

  return <aside aria-label="채팅" className="flex h-full min-h-0 flex-col bg-surface p-4"><div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="min-h-0 flex-1 overflow-y-auto"><div className="flex flex-col gap-4 text-sm">{messages.length===0?<p className="text-fg-muted">만들고 싶은 UI를 설명해 주세요. 적용 중인 가이드에 맞춰 코드를 만들어요.</p>:messages.map((m,i)=><div key={i} className={cn('max-w-[90%] border border-line bg-surface p-3',m.role==='user'?'ml-auto':'max-w-[95%]')}>{m.role==='assistant'?<ReactMarkdown components={MARKDOWN_COMPONENTS}>{m.content}</ReactMarkdown>:m.content}</div>)}{isLoading&&<div className="max-w-[95%] border border-line bg-surface p-3"><ReactMarkdown components={MARKDOWN_COMPONENTS}>{streamingText||'코드를 생성하고 있어요.'}</ReactMarkdown><span className="ml-1 animate-pulse">▍</span></div>}{requestError&&<div role="alert" className="border border-line bg-surface p-3 text-danger-700">{requestError}<Button variant="secondary" size="sm" className="mt-2" onClick={handleRetry}>다시 시도하기</Button></div>}{status==='aborted'&&<div aria-live="polite" className="max-w-[95%] border border-line bg-surface p-3">생성을 중단했어요.<Button variant="secondary" size="sm" className="mt-2" onClick={handleRetry}>다시 생성하기</Button></div>}</div></div><div className="flex flex-wrap gap-2 py-3">{QUICK_PROMPTS.map(x=><Button key={x} variant="ghost" size="sm" disabled={isLoading} onClick={()=>handleSend(`${x} 만들어줘`)}>{x}</Button>)}</div><form onSubmit={(e)=>{e.preventDefault();handleSend(requestText)}} className="border-t border-line pt-3"><label htmlFor={requestId} className="mb-2 block text-sm font-medium">요청 입력</label><textarea id={requestId} value={requestText} onChange={(e)=>setRequestText(e.target.value)} onKeyDown={(e)=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();handleSend(requestText)}}} placeholder="예: 이메일 입력이 있는 뉴스레터 구독 폼" className="min-h-20 w-full resize-none rounded-input border border-line-input bg-surface px-3 py-2 text-sm" /><div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-fg-muted">{isLoading?'Esc로 중단하기':'Ctrl + Enter로 보내기'}</span><Button type={isLoading?'button':'submit'} onClick={isLoading?handleAbort:undefined} disabled={!isLoading&&!requestText.trim()}>{isLoading?<><Square data-icon="inline-start"/>중단하기</>:<><Send data-icon="inline-start"/>보내기</>}</Button></div></form></aside>
}
