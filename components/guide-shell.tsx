'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type NavItem = 'workspace' | 'guides' | 'search'

type GuideShellProps = {
  activeNav: NavItem
  children: React.ReactNode
}

const navItems: Array<{ id: NavItem; label: string; href: string }> = [
  { id: 'workspace', label: '워크스페이스', href: '/' },
  { id: 'guides', label: '가이드 관리', href: '/guides' },
  { id: 'search', label: '가이드 검색', href: '/search' },
]

function GuideToggle() {
  const [enabled, setEnabled] = useState(true)

  return (
    <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-fg-primary">
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label="가이드 적용"
        className="data-checked:bg-brand-600"
      />
      <span>가이드 적용</span>
      <span className="text-fg-muted" aria-live="polite">
        {enabled ? '켜짐' : '꺼짐'}
      </span>
    </label>
  )
}

function GuideSelector() {
  return (
    <div className="flex items-center gap-2">
      <span id="guide-selector-label" className="sr-only">
        적용할 가이드
      </span>
      <Select defaultValue="sample-ds">
        <SelectTrigger
          aria-labelledby="guide-selector-label"
          className="h-11 rounded-button border-0 bg-transparent px-2.5 text-sm font-medium text-fg-primary hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-button border-line shadow-dropdown">
          <SelectItem value="sample-ds">가이드: Sample DS</SelectItem>
          <SelectItem value="product-ds">가이드: Product DS</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function Navigation({ activeNav, onNavigate }: { activeNav: NavItem; onNavigate?: () => void }) {
  return (
    <nav aria-label="주 메뉴" className="flex flex-col gap-1 md:flex-row md:items-center">
      {navItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={onNavigate}
          aria-current={activeNav === item.id ? 'page' : undefined}
          className={cn(
            'flex h-11 items-center rounded-button px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2',
            activeNav === item.id
              ? 'font-medium text-fg-brand'
              : 'text-fg-secondary hover:bg-surface-subtle'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function GuideShell({ activeNav, children }: GuideShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-subtle text-fg-primary">
      <header className="sticky top-0 z-40 h-14 border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-1">
            <Link
              href="/"
              className="shrink-0 rounded-button px-2 text-base font-bold text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2"
            >
              GuideUI
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <GuideSelector />
              <GuideToggle />
            </div>
          </div>

          <div className="hidden md:block">
            <Navigation activeNav={activeNav} />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
              aria-label="메뉴 열기"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent id="mobile-menu" side="right" className="w-[min(20rem,85vw)] bg-surface p-0 shadow-modal" showCloseButton={false}>
              <SheetHeader className="flex-row items-center justify-between border-b border-line px-5 py-4">
                <SheetTitle className="text-lg font-bold text-fg-primary">메뉴</SheetTitle>
                <SheetClose
                  render={<Button variant="ghost" size="icon" aria-label="메뉴 닫기" />}
                >
                  <X aria-hidden="true" />
                </SheetClose>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-5 py-5">
                <GuideSelector />
                <GuideToggle />
                <Navigation activeNav={activeNav} onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  )
}

export type { NavItem }

export default GuideShell
