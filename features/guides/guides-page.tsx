'use client'

import { useMemo, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronRight, FileText, Loader2, Trash2, Upload, X } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/features/landing/page-header'
import { chunkRows, documents, type Doc, type DocStatus } from '@/mocks/guides'

function StatusBadge({ status }: { status: DocStatus }) {
  if (status === 'done') return <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-1 text-sm text-success-700"><Check aria-hidden="true" className="size-4" />처리 완료</span>
  if (status === 'processing') return <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-1 text-sm text-fg-secondary"><Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />처리 중</span>
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-1 text-sm text-danger-700"><AlertCircle aria-hidden="true" className="size-4" />실패</span>
}

export function GuidesPage({ state: requestedState }: { state?: string }) {
  const state = ['empty', 'uploading', 'default'].includes(requestedState ?? '') ? requestedState : 'default'
  const [selectedChunk, setSelectedChunk] = useState<Doc | null>(null)
  const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null)
  const [liveMessage, setLiveMessage] = useState('')
  const [docList, setDocList] = useState(documents)
  const fileRef = useRef<HTMLInputElement>(null)
  const activeDocs = useMemo(() => state === 'empty' ? [] : docList, [docList, state])
  const uploading = state === 'uploading'

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setLiveMessage(`${files.length}개 문서를 업로드하기 시작했어요.`)
  }

  return <AppShell activeNav="가이드 관리">
    <div data-state={state}
 className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <PageHeader title="가이드 관리" description="컴포넌트를 생성할 때 참고할 디자인 가이드 문서를 관리해요." actions={<><span className="text-sm text-fg-secondary">Sample DS · 문서 {activeDocs.length}개</span><Button type="button" className="bg-brand-600 text-fg-inverse hover:bg-brand-600/90" onClick={() => fileRef.current?.click()}><Upload aria-hidden="true" data-icon="inline-start" />문서 올리기</Button></>} />

      <section aria-labelledby="upload-title" className="flex flex-col gap-3"><h2 id="upload-title" className="sr-only">가이드 문서 올리기</h2><label htmlFor="guide-file" className="group flex min-h-36 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-input bg-surface px-4 text-center focus-within:ring-2 focus-within:ring-line-focus focus-within:ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-line-focus peer-focus-visible:ring-offset-2"><FileText aria-hidden="true" className="size-6 text-fg-muted" /><span className="text-base font-medium">Markdown(.md) 파일을 끌어다 놓거나 선택해 주세요</span><span className="text-sm text-fg-muted">파일당 1MB 이하 · 헤딩(#, ##) 기준으로 나눠 저장해요</span><input ref={fileRef} id="guide-file" type="file" accept=".md,text/markdown" multiple className="peer sr-only" onChange={(event) => handleFiles(event.target.files)} /></label></section>

      {state === 'empty' && <section className="flex flex-col gap-3 border border-line bg-surface p-6" aria-labelledby="empty-title"><h2 id="empty-title" className="text-base font-bold">아직 올린 가이드가 없어요.</h2><p className="text-sm text-fg-secondary">샘플 가이드로 먼저 체험해 보거나 팀 문서를 올려 주세요.</p><Button type="button" variant="outline" className="w-fit">샘플 불러오기</Button></section>}

      {activeDocs.length > 0 && <section className="overflow-hidden rounded-card border border-line bg-surface" aria-labelledby="documents-title"><div className="flex items-center justify-between border-b border-line px-4 py-4"><h2 id="documents-title" className="text-base font-bold">문서 {activeDocs.length}개</h2><div aria-live="polite" className="text-sm text-fg-secondary">{liveMessage}</div></div>{uploading && <div className="flex items-center gap-3 border-b border-line px-4 py-3"><Progress aria-label="업로드 진행률" value={64} className="max-w-xs" /><span className="text-sm text-fg-secondary">업로드 중 64%</span></div>}
        <Table className="hidden md:table"><TableHeader><TableRow><TableHead>문서</TableHead><TableHead>상태</TableHead><TableHead>청크</TableHead><TableHead>규칙</TableHead><TableHead>마지막 수정</TableHead><TableHead><span className="sr-only">작업</span></TableHead></TableRow></TableHeader><TableBody>{activeDocs.map((doc) => <DocumentRow key={doc.name} doc={doc} onChunk={() => setSelectedChunk(doc)} onRetry={() => fileRef.current?.click()} onDelete={() => setDeleteDoc(doc)} />)}</TableBody></Table>
        <div className="flex flex-col divide-y divide-line md:hidden">{activeDocs.map((doc) => <DocumentCard key={doc.name} doc={doc} onChunk={() => setSelectedChunk(doc)} onRetry={() => fileRef.current?.click()} onDelete={() => setDeleteDoc(doc)} />)}</div>
      </section>}
    </div>
    <div aria-live="polite" className="sr-only">{activeDocs.find((doc) => doc.status === 'processing') ? 'form.md 임베딩 생성 중 (5/9)' : ''}</div>

    <Sheet open={Boolean(selectedChunk)} onOpenChange={(open) => !open && setSelectedChunk(null)}><SheetContent side="right" className="w-full overflow-y-auto bg-surface sm:max-w-lg"><SheetHeader><SheetTitle>{selectedChunk?.name} 청크 {selectedChunk?.chunks}개</SheetTitle></SheetHeader><div className="flex flex-col gap-4 p-4">{chunkRows.map((chunk) => <article key={chunk.path} className="flex flex-col gap-3 border border-line p-4"><div className="flex items-start justify-between gap-4"><h3 className="text-sm font-bold">{chunk.path}</h3><span className="shrink-0 text-sm text-fg-muted">{chunk.tokens} 토큰</span></div><div className="flex flex-wrap gap-1">{chunk.rules.map((rule) => <span key={rule} className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-fg-secondary">{rule}</span>)}</div><p className="text-sm text-fg-secondary">{chunk.text.map((line) => <span key={line} className="block">{line}</span>)}</p></article>)}</div></SheetContent></Sheet>
    <Dialog open={Boolean(deleteDoc)} onOpenChange={(open) => !open && setDeleteDoc(null)}><DialogContent role="dialog" aria-modal="true" aria-labelledby="delete-title"><DialogHeader><DialogTitle id="delete-title">{deleteDoc?.name}를 삭제할까요?</DialogTitle><DialogDescription>삭제하면 이 문서의 청크가 모두 지워지고, 이후 생성에 반영되지 않아요.</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setDeleteDoc(null)}>취소</Button><Button type="button" variant="destructive" onClick={() => { if (deleteDoc) { setDocList((current) => current.filter((doc) => doc.name !== deleteDoc.name)); setLiveMessage(`${deleteDoc.name}을 삭제했어요.`) }; setDeleteDoc(null) }}>삭제하기</Button></DialogFooter><button type="button" aria-label="닫기" onClick={() => setDeleteDoc(null)} className="absolute right-4 top-4 rounded-button p-2 text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"><X aria-hidden="true" /></button></DialogContent></Dialog>
  </AppShell>
}

function DocumentRow({ doc, onChunk, onRetry, onDelete }: { doc: Doc; onChunk: () => void; onRetry: () => void; onDelete: () => void }) {
  return <TableRow><TableCell className="font-medium">{doc.name}</TableCell><TableCell><div className="flex flex-col gap-1"><StatusBadge status={doc.status} />{doc.status === 'processing' && <span className="text-sm text-fg-muted">임베딩 생성 중 (5/9)</span>}{doc.status === 'failed' && <span className="max-w-xs text-sm text-danger-700">파일을 읽지 못했어요. 인코딩을 UTF-8로 바꿔 다시 올려 주세요.</span>}</div></TableCell><TableCell>{doc.chunks ? `청크 ${doc.chunks}개` : '—'}</TableCell><TableCell>{doc.rules ? `규칙 ${doc.rules}개` : '—'}</TableCell><TableCell className="text-sm text-fg-secondary">{doc.modified}</TableCell><TableCell><RowActions doc={doc} onChunk={onChunk} onRetry={() => fileRef.current?.click()} onDelete={onDelete} /></TableCell></TableRow>
}
function DocumentCard({ doc, onChunk, onRetry, onDelete }: { doc: Doc; onChunk: () => void; onRetry: () => void; onDelete: () => void }) { return <article className="flex flex-col gap-4 p-4"><div className="flex items-start justify-between gap-3"><div className="flex flex-col gap-2"><h3 className="font-medium">{doc.name}</h3><StatusBadge status={doc.status} /></div><span className="text-sm text-fg-secondary">{doc.modified}</span></div><div className="flex gap-4 text-sm text-fg-secondary"><span>{doc.chunks ? `청크 ${doc.chunks}개` : '청크 —'}</span><span>{doc.rules ? `규칙 ${doc.rules}개` : '규칙 —'}</span></div>{doc.status === 'processing' && <p className="text-sm text-fg-muted">임베딩 생성 중 (5/9)</p>}{doc.status === 'failed' && <p className="text-sm text-danger-700">파일을 읽지 못했어요. 인코딩을 UTF-8로 바꿔 다시 올려 주세요.</p>}<RowActions doc={doc} onChunk={onChunk} onRetry={() => fileRef.current?.click()} onDelete={onDelete} /></article> }
function RowActions({ doc, onChunk, onRetry, onDelete }: { doc: Doc; onChunk: () => void; onRetry: () => void; onDelete: () => void }) { return <div className="flex items-center gap-2"><Button type="button" size={doc.status === 'failed' ? 'default' : 'sm'} variant={doc.status === 'failed' ? 'secondary' : 'ghost'} disabled={doc.status === 'processing'} onClick={doc.status === 'failed' ? onRetry : onChunk}>{doc.status === 'failed' ? '다시 올리기' : '청크 보기'}</Button><Button type="button" size="sm" variant="ghost" aria-label={`${doc.name} 삭제`} onClick={onDelete}><Trash2 aria-hidden="true" data-icon="inline-start" /></Button></div> }

export type { Doc }

