---
title: Navigation
version: 1.0.0
updated: 2026-09-24
---

# Navigation

사용자가 서비스 안에서 위치를 파악하고 이동하도록 돕는다. 상단 네비게이션, 사이드 네비게이션, 브레드크럼, 탭 네 가지를 다룬다.

## Navigation > 공통 원칙

- 모든 네비게이션은 `<nav>`로 감싸고, 페이지에 `nav`가 2개 이상이면 `aria-label`로 구분한다. 예: `aria-label="주 메뉴"`, `aria-label="사이드 메뉴"`
- 메뉴 항목은 `<ul>`/`<li>` 목록으로 마크업한다.
- 페이지 이동은 `<a href>`, 메뉴 열기/닫기 같은 동작은 `<button type="button">`을 쓴다.
- 현재 페이지 항목에는 `aria-current="page"`를 넣는다.

## Navigation > 메뉴 항목 상태

| 상태 | 클래스 |
|---|---|
| default | `text-fg-secondary` |
| hover | `hover:text-fg-primary hover:bg-surface-subtle` |
| active (현재 페이지) | `text-fg-brand font-medium` (사이드 메뉴는 `bg-brand-50` 추가) + `aria-current="page"` |
| focus | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus` |
| disabled | 링크 대신 `<span aria-disabled="true" className="text-fg-muted cursor-not-allowed">` |

메뉴 항목 기본 클래스: `inline-flex h-11 items-center rounded-button px-3 text-sm transition-colors duration-fast`

## Navigation > Top Navigation (상단 네비게이션)

서비스 전체에서 공통으로 쓰는 최상단 바.

- 컨테이너: `<header className="sticky top-0 z-40 border-b border-line bg-surface">`
- 내부: `mx-auto flex h-16 max-w-6xl items-center justify-between px-4`
- 구성: 왼쪽 로고 → 가운데 또는 왼쪽 메뉴 → 오른쪽 검색·알림·프로필
- 로고는 홈으로 가는 링크이며, 이미지 로고는 `alt="{서비스명} 홈"`을 쓴다.

```tsx
<header className="sticky top-0 z-40 border-b border-line bg-surface">
  <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
    <a href="/" className="text-lg font-bold text-fg-primary">Sample</a>
    <nav aria-label="주 메뉴">
      <ul className="flex items-center gap-1">
        <li>
          <a href="/dashboard" aria-current="page" className="inline-flex h-11 items-center rounded-button px-3 text-sm font-medium text-fg-brand">대시보드</a>
        </li>
        <li>
          <a href="/reports" className="inline-flex h-11 items-center rounded-button px-3 text-sm text-fg-secondary hover:bg-surface-subtle hover:text-fg-primary">리포트</a>
        </li>
      </ul>
    </nav>
  </div>
</header>
```

## Navigation > 모바일 메뉴 (햄버거 + 드로어)

- 화면 폭 `md` 미만에서는 메뉴를 숨기고 햄버거 버튼을 보여준다.
- 햄버거 버튼은 아이콘 버튼 규칙을 따른다: `aria-label="메뉴 열기"`, `aria-expanded`, `aria-controls="{드로어 id}"`
- 드로어는 Modal 문서의 오버레이·포커스 규칙을 따른다 (`bg-overlay`, `shadow-modal`, Esc로 닫기).

```tsx
<button
  type="button"
  aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
  aria-expanded={open}
  aria-controls="mobile-menu"
  className="inline-flex h-11 w-11 items-center justify-center rounded-button text-fg-secondary hover:bg-surface-subtle md:hidden"
>
  …
</button>
```

## Navigation > Side Navigation (사이드 메뉴)

대시보드, 관리자 화면처럼 메뉴가 많을 때 쓴다.

- 컨테이너: `<aside className="w-64 shrink-0 border-r border-line bg-surface">` 안에 `<nav aria-label="사이드 메뉴">`
- 메뉴 목록: `flex flex-col gap-1 p-4`
- 현재 항목: `bg-brand-50 text-fg-brand font-medium` + `aria-current="page"`
- 메뉴 그룹 제목: `px-3 text-sm font-medium text-fg-muted`

## Navigation > Breadcrumb (브레드크럼)

현재 페이지의 상위 경로를 보여준다. 3단계 이상 깊은 페이지에서 쓴다.

- `<nav aria-label="현재 위치">` 안에 `<ol>`
- 구분자는 `aria-hidden="true"`로 스크린리더에서 숨긴다.
- 마지막 항목(현재 페이지)은 링크가 아니며 `aria-current="page"`를 넣는다.

```tsx
<nav aria-label="현재 위치">
  <ol className="flex items-center gap-2 text-sm text-fg-secondary">
    <li><a href="/" className="hover:text-fg-primary">홈</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/settings" className="hover:text-fg-primary">설정</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page" className="font-medium text-fg-primary">알림</li>
  </ol>
</nav>
```

## Navigation > Tabs (탭)

같은 페이지 안에서 콘텐츠를 전환할 때 쓴다. 페이지 이동이면 탭이 아니라 링크 메뉴를 쓴다.

- 탭 목록: `role="tablist"`, 각 탭: `<button type="button" role="tab" aria-selected aria-controls>`
- 패널: `role="tabpanel" aria-labelledby="{탭 id}"`
- 선택된 탭: `border-b-2 border-brand-600 text-fg-brand font-medium`
- 선택 안 된 탭: `border-b-2 border-transparent text-fg-secondary hover:text-fg-primary`
- 좌우 방향키로 탭 이동을 지원한다.

## Navigation > 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| NAV-01 | 네비게이션은 `<nav>`로 감싸고, 여러 개일 때는 `aria-label`로 구분한다. | 자동: 코드 + axe |
| NAV-02 | 현재 페이지 항목에는 `aria-current="page"`를 넣고 `text-fg-brand font-medium`으로 표시한다. | 자동: 코드 |
| NAV-03 | 메뉴 항목은 `ul`/`ol`과 `li` 목록으로 마크업한다. | 자동: 코드 |
| NAV-04 | 상단 네비게이션은 `bg-surface border-b border-line`을 쓴다. | 자동: 코드 |
| NAV-05 | 햄버거 버튼은 `aria-label`, `aria-expanded`, `aria-controls`를 모두 갖는다. | 자동: 코드 |
| NAV-06 | 메뉴 항목 높이는 `h-11`(44px) 이상이다. | 자동: 코드 |
| NAV-07 | 탭은 `role="tablist"`/`role="tab"`/`role="tabpanel"`과 `aria-selected`를 쓴다. | 자동: 코드 |
