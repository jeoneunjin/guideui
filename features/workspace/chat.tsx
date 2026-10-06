'use client'

import { useId, useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { extractCode } from '@/lib/code/extract-code'
import { useWorkspaceStore, type ChatMessage } from './workspace-store'

const QUICK_PROMPTS = ['회원가입 폼', '상품 카드', '삭제 확인 모달']

export function Chat() {
  const requestId = useId()
  const messages = useWorkspaceStore((s) => s.messages)
  const addMessage = useWorkspaceStore((s) => s.addMessage)
  const code = useWorkspaceStore((s) => s.code)
  const setCode = useWorkspaceStore((s) => s.setCode)
  const status = useWorkspaceStore((s) => s.status)
  const dispatch = useWorkspaceStore((s) => s.dispatch)
  const [requestText, setRequestText] = useState('')
  const [requestError, setRequestError] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoading = status === 'streaming'

  async function performRequest(messagesToSend: ChatMessage[]) {
    setRequestError(null)
    dispatch('start')
    setStreamingText('')
    const controller = new AbortController()
    abortControllerRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend, currentCode: code }),
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
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        const fenceIndex = fullText.indexOf('```')
        setStreamingText(fenceIndex === -1 ? fullText : fullText.slice(0, fenceIndex))
      }
      const fenceIndex = fullText.indexOf('```')
      const explanation = (fenceIndex === -1 ? fullText : fullText.slice(0, fenceIndex)).trim()
      addMessage({ role: 'assistant', content: explanation || fullText })
      setCode(extractCode(fullText))
      dispatch('finish')
    } catch {
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

  return <aside aria-label="채팅" className="flex h-full min-h-0 flex-col bg-surface p-4"><div className="min-h-0 flex-1 overflow-y-auto"><div className="flex flex-col gap-4 text-sm">{messages.length===0?<p className="text-fg-muted">만들고 싶은 UI를 설명해 주세요. 적용 중인 가이드에 맞춰 코드를 만들어요.</p>:messages.map((m,i)=><div key={i} className={cn('max-w-[90%] border border-line bg-surface p-3',m.role==='user'?'ml-auto':'max-w-[95%]')}>{m.content}</div>)}{isLoading&&<div className="max-w-[95%] border border-line bg-surface p-3">{streamingText||'코드를 생성하고 있어요.'}<span className="ml-1 animate-pulse">▍</span></div>}{requestError&&<div role="alert" className="border border-line bg-surface p-3 text-danger-700">{requestError}<Button variant="secondary" size="sm" className="mt-2" onClick={handleRetry}>다시 시도하기</Button></div>}</div></div><div className="flex flex-wrap gap-2 py-3">{QUICK_PROMPTS.map(x=><Button key={x} variant="ghost" size="sm" onClick={()=>handleSend(`${x} 만들어줘`)}>{x}</Button>)}</div><form onSubmit={(e)=>{e.preventDefault();handleSend(requestText)}} className="border-t border-line pt-3"><label htmlFor={requestId} className="mb-2 block text-sm font-medium">요청 입력</label><textarea id={requestId} value={requestText} onChange={(e)=>setRequestText(e.target.value)} onKeyDown={(e)=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();handleSend(requestText)}}} placeholder="예: 이메일 입력이 있는 뉴스레터 구독 폼" className="min-h-20 w-full resize-none rounded-input border border-line-input bg-surface px-3 py-2 text-sm" /><div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-fg-muted">Ctrl + Enter로 보내기</span><Button type={isLoading?'button':'submit'} onClick={isLoading?handleAbort:undefined} disabled={!isLoading&&!requestText.trim()}>{isLoading?<><Square data-icon="inline-start"/>중단하기</>:<><Send data-icon="inline-start"/>보내기</>}</Button></div></form></aside>
}
