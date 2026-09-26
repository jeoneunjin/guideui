'use client'

import { FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/features/landing/page-header'

type SearchState = 'initial' | 'loading' | 'streaming' | 'no-result' | 'error' | 'result'

type Chunk = { id: string; path: string; document: string; similarity: string; excerpt: string }

const examples = ['입력 필드 에러는 어떻게 표시하나요?', '배지는 어떤 색 조합을 쓰나요?', '모달에 꼭 필요한 속성은?', '버튼 문구 규칙이 뭔가요?']
const chunks: Chunk[] = [
  { id: 'G1', path: 'Button > Variant별 스타일', document: 'button.md', similarity: '0.86', excerpt: '주 액션은 brand-600 배경과 fg-inverse 글자를 사용해요. 보조 버튼과 시각적 우선순위를 구분해요.' },
  { id: 'G2', path: 'Button > 배치', document: 'button.md', similarity: '0.79', excerpt: '한 영역에는 주 버튼을 하나만 둬요. 보조 버튼은 왼쪽, 주 버튼은 오른쪽에 배치해요.' },
  { id: 'G3', path: 'Button > 상태', document: 'button.md', similarity: '0.74', excerpt: '비활성 상태는 disabled 속성과 50% 투명도로 표시해요. 상태는 색상만으로 전달하지 않아요.' },
]

export function SearchPage({ initialState = 'initial' }: { initialState?: string }) {
  const normalized = ['initial', 'loading', 'streaming', 'no-result', 'error', 'result'].includes(initialState) ? initialState as SearchState : 'initial'
  const [state, setState] = useState<SearchState>(normalized)
  const [question, setQuestion] = useState('')
  const chunkRefs = useRef<Record<string, HTMLElement | null>>({})
  const isResultsVisible = state !== 'initial'

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim()) return
    setState('result')
  }

  function showExample(example: string) {
    setQuestion(example)
    setState('result')
  }

  function focusChunk(id: string) {
    chunkRefs.current[id]?.focus()
  }

  return <AppShell activeNav="가이드 검색">
    <div data-state={state}
 className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <PageHeader title="가이드 검색" description="팀 디자인 가이드에서 규칙을 찾아 요약해 드려요." />
      <section aria-labelledby="question-title" className="flex flex-col gap-4"><form onSubmit={submit} className="flex flex-col gap-3 md:flex-row md:items-end"><div className="flex min-w-0 flex-1 flex-col gap-2"><label htmlFor="guide-question" className="text-sm font-medium">질문</label><Input id="guide-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="예: 주 버튼은 어떤 색을 써야 하나요?" className="h-12 rounded-input border-line-input" /></div><Button type="submit" className="h-12 bg-brand-600 text-fg-inverse hover:bg-brand-600"><Search aria-hidden="true" data-icon="inline-start" />검색하기</Button></form><div className="flex flex-wrap items-center gap-2"><span id="question-title" className="text-sm text-fg-muted">최근 검색</span>{examples.slice(0, 3).map((example) => <Button key={example} type="button" size="sm" variant="ghost" onClick={() => showExample(example)}>{example}</Button>)}</div></section>
      {!isResultsVisible && <section aria-labelledby="examples-title" className="flex flex-col gap-3 border-t border-line pt-6"><h2 id="examples-title" className="text-base font-bold">이렇게 물어보세요</h2><div className="flex flex-col items-start gap-2">{examples.map((example) => <button key={example} type="button" onClick={() => showExample(example)} className="text-left text-sm text-fg-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">{example}</button>)}</div></section>}
      {state === 'loading' ? <LoadingResults /> : <div aria-live="polite" aria-busy={state === 'loading'} className={cn('grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]', !isResultsVisible && 'hidden')}><section aria-labelledby="answer-title" className="flex max-w-2xl flex-col gap-5"><div className="flex flex-col gap-1"><h2 id="answer-title" className="text-xl font-bold">답변</h2><p className="text-sm text-fg-muted">Sample DS · 청크 3개 참고</p></div>{state === 'empty' ? <div className="flex flex-col gap-4 border border-line p-4"><p className="text-base leading-relaxed">검색어를 입력하면 가이드에서 관련 내용을 찾아드려요.</p><p className="text-sm text-fg-secondary">위 질문 입력란에 궁금한 내용을 적어보세요.</p></div> : state === 'error' ? <div role="alert" className="flex flex-col gap-4 border border-line p-4"><div className="flex flex-col gap-1"><p className="text-sm font-medium text-fg-primary">가이드 검색에 실패했어요.</p><p className="text-sm text-fg-secondary">검색 서버가 응답하지 않는 것이 원인이에요. 잠시 후 다시 시도해 주세요.</p></div><Button type="button" variant="secondary" size="default" className="w-fit" onClick={() => setState('result')}>다시 시도하기</Button></div> : state === 'no-result' ? <div className="flex flex-col gap-4 border border-line p-4"><p className="text-base leading-relaxed">가이드에서 관련 내용을 찾지 못했어요. 다른 표현으로 검색하거나 문서가 올라와 있는지 확인해 주세요.</p><Link href="/guides" className="flex h-9 w-fit items-center rounded-button border border-line-input px-3 text-sm font-medium text-fg-primary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">가이드 관리로 가기</Link></div> : <><p className="max-w-[70ch] text-base leading-relaxed">{state === 'streaming' ? <>주 액션 버튼은 배경에 brand-600, 글자에 fg-inverse를 써요 <Citation id="G1" onFocus={() => focusChunk('G1')} />. 한 영역에는 주 버튼을 하나만 두고, 보조 버튼은 왼쪽<span aria-hidden="true" className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-brand-600 motion-reduce:animate-none" /></> : <>주 액션 버튼은 배경에 brand-600, 글자에 fg-inverse를 써요 <Citation id="G1" onFocus={() => focusChunk('G1')} />. 한 영역에는 주 버튼을 하나만 두고, 보조 버튼은 왼쪽, 주 버튼은 오른쪽에 배치해요 <Citation id="G2" onFocus={() => focusChunk('G2')} />. 비활성 상태는 disabled 속성과 50% 투명도로 표시해요 <Citation id="G3" onFocus={() => focusChunk('G3')} />.</>}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline">원문 보기</Button><Link href={`/?prompt=${encodeURIComponent(question)}`} className="flex h-11 items-center rounded-button bg-brand-600 px-4 text-sm font-medium text-fg-inverse hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">이 규칙으로 만들기</Link></div></>}</section><aside aria-label="관련 가이드" className="flex flex-col gap-3"><h2 className="text-base font-bold">관련 가이드</h2><div className="flex flex-col">{chunks.map((chunk) => <article key={chunk.id} id={chunk.id} tabIndex={-1} ref={(node) => { chunkRefs.current[chunk.id] = node }} className="flex scroll-mt-20 flex-col gap-3 border-t border-line py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"><div className="flex items-start justify-between gap-3"><div className="flex flex-col gap-1"><span className="w-fit rounded-full border border-line px-2 py-0.5 text-xs font-medium">{chunk.id}</span><h3 className="text-sm font-bold">{chunk.path}</h3><span className="text-sm text-fg-muted">{chunk.document}</span></div><span className="text-sm text-fg-secondary">유사도 {chunk.similarity}</span></div><div aria-hidden="true" className="h-1 w-full bg-surface-muted"><div className="h-1 bg-brand-600" style={{ width: `${Number(chunk.similarity) * 100}%` }} /></div><p className="text-sm leading-relaxed text-fg-secondary">{chunk.excerpt}</p><a href={`#${chunk.id}`} onClick={(event) => { event.preventDefault(); focusChunk(chunk.id) }} className="w-fit text-sm text-fg-brand underline-offset-4 hover:underline">원문에서 보기</a></article>)}</div></aside></div>}
    </div>
  </AppShell>
}

function Citation({ id, onFocus }: { id: string; onFocus: () => void }) { return <a href={`#${id}`} onClick={(event) => { event.preventDefault(); onFocus() }} className="text-fg-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus" aria-label={`${id} 관련 가이드로 이동`}>[{id}]</a> }

function LoadingResults() { return <div aria-busy="true" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"><section className="flex max-w-2xl flex-col gap-5"><div className="flex flex-col gap-2"><div className="h-7 w-20 animate-pulse motion-reduce:animate-none border border-line bg-surface" /><div className="h-4 w-40 animate-pulse motion-reduce:animate-none border border-line bg-surface" /></div><div className="flex flex-col gap-3"><div className="h-5 w-full animate-pulse motion-reduce:animate-none border border-line bg-surface" /><div className="h-5 w-5/6 animate-pulse motion-reduce:animate-none border border-line bg-surface" /><div className="h-5 w-2/3 animate-pulse motion-reduce:animate-none border border-line bg-surface" /></div></section><aside aria-label="관련 가이드" className="flex flex-col gap-4"><div className="h-5 w-28 animate-pulse motion-reduce:animate-none border border-line bg-surface" />{[1, 2, 3].map((item) => <div key={item} className="flex flex-col gap-3 border-t border-line bg-surface py-4"><div className="h-4 w-32 animate-pulse motion-reduce:animate-none border border-line bg-surface" /><div className="h-4 w-full animate-pulse motion-reduce:animate-none border border-line bg-surface" /><div className="h-4 w-3/4 animate-pulse motion-reduce:animate-none border border-line bg-surface" /></div>)}</aside></div>}
