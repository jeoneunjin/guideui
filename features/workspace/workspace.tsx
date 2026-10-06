'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { cn } from '@/lib/utils'
import { Chat } from '@/features/workspace/chat'
import { Editor } from '@/features/workspace/editor'
import { Preview } from '@/features/workspace/preview'
import { useWorkspaceStore } from '@/features/workspace/workspace-store'

export function Workspace({ initialState = 'done' }: { initialState?: string }) {
  const state = ['streaming', 'done', 'fixed'].includes(initialState) ? initialState : 'done'
  const [tab, setTab] = useState<'코드'|'Diff'|'버전'>('코드')
  const [mobileTab, setMobileTab] = useState<'채팅'|'코드'|'미리보기'>('채팅')
  const status = useWorkspaceStore((s) => s.status)
  const fixed = state === 'fixed'
  const streaming = state === 'streaming' || status === 'streaming'
  return <AppShell activeNav="워크스페이스"><div data-state={state} className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"><div className="flex border-b border-line bg-surface lg:hidden" role="tablist" aria-label="워크스페이스 보기">{(['채팅','코드','미리보기'] as const).map((x)=><button type="button" key={x} role="tab" aria-selected={mobileTab===x} aria-controls={`mobile-panel-${x}`} onClick={()=>setMobileTab(x)} className={cn('flex-1 py-3 text-sm',mobileTab===x?'border-b-2 border-brand-600 font-medium text-fg-brand':'text-fg-secondary')}>{x}</button>)}</div><div id={`mobile-panel-${mobileTab}`} role="tabpanel" aria-label={`${mobileTab} 패널`} className="min-h-0 min-w-0 flex-1 overflow-hidden lg:hidden">{mobileTab==='채팅'?<Chat/>:mobileTab==='코드'?<Editor {...{tab,setTab,streaming}}/>:<Preview fixed={fixed} streaming={streaming}/>}</div><ResizablePanelGroup orientation="horizontal" className="hidden min-h-0 min-w-0 flex-1 overflow-hidden lg:flex"><ResizablePanel defaultSize="20.3%" minSize="20%" className="min-w-0"><Chat/></ResizablePanel><ResizableHandle/><ResizablePanel defaultSize="55.4%" minSize="42%" className="min-w-0"><Editor {...{tab,setTab,streaming}}/></ResizablePanel><ResizableHandle/><ResizablePanel defaultSize="24.3%" minSize="24%" className="min-w-0"><Preview fixed={fixed} streaming={streaming}/></ResizablePanel></ResizablePanelGroup></div></AppShell>
}
