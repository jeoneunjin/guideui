'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type NavItem = '워크스페이스' | '가이드 관리' | '가이드 검색'

export function AppShell({ activeNav = '워크스페이스', children }: { activeNav?: NavItem; children: React.ReactNode }) {
  const [guideEnabled, setGuideEnabled] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems: { label: NavItem; href: string }[] = [
    { label: '워크스페이스', href: '/' },
    { label: '가이드 관리', href: '/guides' },
    { label: '가이드 검색', href: '/search' },
  ]
  const GuideControls = () => <div className="flex items-center gap-3">
    <Select defaultValue="sample">
      <SelectTrigger aria-label="적용할 가이드" className="h-9 w-[164px] border-line bg-surface text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent><SelectItem value="sample">가이드: Sample DS</SelectItem></SelectContent>
    </Select>
    <label className="flex items-center gap-2 text-sm text-fg-secondary"><Switch aria-label="가이드 적용" checked={guideEnabled} onCheckedChange={setGuideEnabled} /><span>가이드 적용</span><span className="text-fg-muted">{guideEnabled ? '켜짐' : '꺼짐'}</span></label>
  </div>
  return <div className="flex min-h-screen flex-col bg-surface-subtle text-fg-primary">
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-5"><Link href="/" className="text-base font-bold">GuideUI</Link><div className="hidden md:block"><GuideControls /></div></div>
      <nav aria-label="주 메뉴" className="hidden items-center gap-1 md:flex">{navItems.map((item) => <Link key={item.label} href={item.href} aria-current={activeNav === item.label ? 'page' : undefined} className={cn('flex h-11 items-center rounded-button px-3 text-sm', activeNav === item.label ? 'font-medium text-fg-brand' : 'text-fg-secondary hover:bg-surface-subtle')}>{item.label}</Link>)}</nav>
      <button type="button" aria-label="메뉴 열기" aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen(true)} className="rounded-button p-2 text-fg-secondary hover:bg-surface-subtle md:hidden"><Menu aria-hidden="true" /></button>
    </header>
    <main className="min-h-0 flex-1">{children}</main>
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent id="mobile-menu" side="right" className="bg-surface"><SheetHeader><SheetTitle>GuideUI 메뉴</SheetTitle></SheetHeader><div className="flex flex-col gap-5 p-4"><GuideControls /><nav aria-label="주 메뉴" className="flex flex-col gap-1">{navItems.map((item) => <Link key={item.label} onClick={() => setMobileOpen(false)} href={item.href} aria-current={activeNav === item.label ? 'page' : undefined} className={cn('rounded-button px-3 py-3 text-sm', activeNav === item.label ? 'font-medium text-fg-brand' : 'text-fg-secondary hover:bg-surface-subtle')}>{item.label}</Link>)}</nav></div></SheetContent></Sheet>
  </div>
}

export type { NavItem }

function _UnusedClose() { return <X aria-hidden="true" /> }
