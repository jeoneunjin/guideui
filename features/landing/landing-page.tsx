'use client'

import Link from 'next/link'
import { Accessibility, ArrowRight, Braces, MessageSquareText, Search } from 'lucide-react'

const steps = [
  ['01', '설명하기', '만들고 싶은 화면을 문장으로 적어요.'],
  ['02', '가이드 찾기', '관련된 디자인 규칙을 가이드 문서에서 찾아요.'],
  ['03', '생성하기', '규칙을 반영한 코드가 실시간으로 작성돼요.'],
  ['04', '검사하고 고치기', '접근성 위반을 찾아 AI가 고치고 다시 검사해요.'],
]

const capabilities = [
  { icon: Braces, title: '가이드 기반 생성', body: '업로드한 디자인 가이드의 토큰과 규칙을 따라 코드를 만들어요. 어떤 규칙을 참고했는지 출처도 보여 줘요.' },
  { icon: MessageSquareText, title: '대화로 다듬기', body: "'에러 상태도 추가해 줘'처럼 이어서 요청하고, 버전별 변경 내용을 비교할 수 있어요." },
  { icon: Accessibility, title: '접근성 자동 검사', body: 'axe-core로 WCAG 기준 위반을 찾고, AI 수정 전후 점수를 비교해요.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-fg-primary">
      <header className="h-14 border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-base font-bold text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">GuideUI</Link>
          <nav aria-label="외부 및 체험 메뉴" className="flex items-center gap-4">
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-sm text-fg-secondary hover:text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">GitHub</a>
            <Link href="/?prompt=로그인%20폼%20만들어줘" className="flex h-9 items-center rounded-button border border-line-input px-3 text-sm font-medium text-fg-primary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">바로 체험하기</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-surface-subtle px-4 py-12 md:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-fg-primary md:text-3xl">팀 가이드대로 UI를 만들고, 접근성까지 확인해요</h1>
            <p className="max-w-2xl text-pretty text-base leading-7 text-fg-secondary">원하는 화면을 설명하면 디자인 가이드를 참고해 React 컴포넌트를 만들고, 접근성 문제를 찾아 고쳐 드려요.</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/?prompt=로그인%20폼%20만들어줘" className="flex h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-button bg-brand-600 px-4 text-sm font-medium text-fg-inverse hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 sm:w-auto">바로 체험하기<ArrowRight aria-hidden="true" /></Link>
              <Link href="/search" className="flex h-11 w-full items-center justify-center rounded-button border border-line-input px-4 text-sm font-medium text-fg-primary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 sm:w-auto">가이드 살펴보기</Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden px-4 pt-8 pb-section md:pt-section" aria-label="제품 미리보기">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <div role="img" aria-label="GuideUI 워크스페이스 화면 예시" className="min-w-[920px]">
              <div className="flex h-9 items-center border-b border-line px-4 text-xs text-fg-muted">GuideUI / 워크스페이스 <span className="ml-auto">가이드 적용 켜짐</span></div>
              <div className="grid grid-cols-[24%_42%_34%] divide-x divide-line">
                <div className="flex min-h-[300px] flex-col gap-4 p-4 text-sm">
                  <p className="font-medium text-fg-primary">채팅</p><p className="ml-auto border border-line p-3">로그인 폼 만들어줘</p><p className="border border-line p-3 text-fg-secondary">가이드에 맞춰 로그인 폼을 만들었어요.</p><p className="mt-auto border-t border-line pt-3 text-fg-muted">요청 입력</p>
                </div>
                <div className="min-h-[300px] bg-code-bg p-4"><div className="mb-4 flex gap-4 border-b border-line pb-2 text-sm"><span className="border-b-2 border-brand-600 pb-2 font-medium text-fg-brand">코드</span><span className="text-fg-secondary">Diff</span><span className="text-fg-secondary">버전</span></div><pre className="font-mono text-xs leading-6 text-code-fg">{`export default function Login() {\n  return (\n    <form className="flex flex-col gap-4">\n      <h3>로그인</h3>\n      <label>이메일</label>\n      <input type="email" />\n      <button>로그인</button>\n    </form>\n  )\n}`}</pre></div>
                <div className="min-h-[300px] p-4"><p className="mb-4 font-medium">미리보기</p><div className="border border-line p-4"><div className="flex flex-col gap-3 text-sm"><span>이메일</span><div className="h-9 border border-line-input" /><span>비밀번호</span><div className="h-9 border border-line-input" /><div className="h-9 bg-brand-600 text-center py-2 text-sm font-medium text-fg-inverse">로그인</div></div></div><div className="mt-5 border-t border-line pt-4 text-sm"><p className="font-medium">접근성 검사</p><p className="mt-2 text-fg-secondary">접근성 점수 92점 · 위반 1건</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-section"><div className="mx-auto max-w-5xl"><h2 className="mb-8 text-xl font-bold">이렇게 동작해요</h2><div className="grid gap-0 md:grid-cols-4">{steps.map(([number, title, body], index) => <div key={number} className={`flex flex-col gap-3 border-line py-4 md:px-5 md:py-0 ${index > 0 ? 'border-t md:border-l md:border-t-0' : ''}`}><span className="text-sm font-bold text-fg-muted">{number}</span><h3 className="text-base font-bold">{title}</h3><p className="text-sm leading-6 text-fg-secondary">{body}</p></div>)}</div></div></section>

        <section className="bg-surface-subtle px-4 py-12 md:py-16"><div className="mx-auto max-w-5xl"><h2 className="mb-8 text-xl font-bold">주요 기능</h2><div className="grid gap-8 md:grid-cols-3">{capabilities.map(({ icon: Icon, title, body }) => <div key={title} className="flex flex-col gap-3"><Icon aria-hidden="true" className="text-fg-brand" /><h3 className="text-base font-bold">{title}</h3><p className="text-sm leading-6 text-fg-secondary">{body}</p></div>)}</div></div></section>
      </main>

      <footer className="border-t border-line py-8"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-fg-muted md:px-6"><span>GuideUI · 프론트엔드 포트폴리오 프로젝트</span><a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-fg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2">GitHub</a></div></footer>
    </div>
  )
}
