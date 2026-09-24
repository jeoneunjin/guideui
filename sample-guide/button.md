---
title: Button
version: 1.0.0
updated: 2026-09-24
---

# Button

사용자가 액션(제출, 저장, 취소, 삭제 등)을 실행할 때 쓴다. 다른 페이지로 이동하는 것은 버튼이 아니라 링크(`<a>`)를 쓴다.

- 컴포넌트: `import { Button } from "./components/ui/button";`
- 기본 사용: `<Button variant="primary">저장하기</Button>`

## Button > Variant 선택 기준

| variant | 언제 쓰나 | 예시 |
|---|---|---|
| `primary` | 화면이나 영역에서 가장 중요한 액션 1개 | 저장하기, 로그인, 다음 |
| `secondary` | primary와 함께 놓이는 보조 액션 | 취소, 이전, 임시 저장하기 |
| `ghost` | 덜 중요하거나 반복되는 액션, 툴바 | 더보기, 편집하기, 필터 초기화하기 |
| `danger` | 되돌릴 수 없는 파괴적 액션 | 삭제하기, 계정 탈퇴하기 |

## Button > Variant별 스타일

컴포넌트를 쓰지 않고 직접 작성해야 할 때는 아래 클래스를 그대로 쓴다.

공통 클래스:

```
inline-flex items-center justify-center gap-inline rounded-button font-medium
transition-colors duration-fast
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2
disabled:opacity-50 disabled:cursor-not-allowed
```

| variant | 추가 클래스 |
|---|---|
| primary | `bg-brand-600 text-fg-inverse hover:bg-brand-700 active:bg-brand-800` |
| secondary | `bg-surface text-fg-primary border border-line-input hover:bg-surface-subtle` |
| ghost | `bg-transparent text-fg-brand hover:bg-brand-50` |
| danger | `bg-danger-600 text-fg-inverse hover:bg-danger-700` |

## Button > 크기

| size | 클래스 | 높이 | 용도 |
|---|---|---|---|
| `sm` | `h-9 px-3 text-sm` | 36px | 표 안, 툴바처럼 공간이 좁은 곳 |
| `md` (기본) | `h-11 px-4 text-base` | 44px | 대부분의 경우 |
| `lg` | `h-12 px-6 text-lg` | 48px | 랜딩 페이지 CTA, 모바일 하단 고정 버튼 |

- 폼 제출 버튼과 모달 버튼은 `md`를 쓴다.
- 모바일에서 화면 폭 전체를 쓰는 버튼은 `w-full`을 추가한다.

## Button > 상태

| 상태 | 표현 |
|---|---|
| default | variant 기본 스타일 |
| hover | variant의 `hover:` 클래스 |
| active | primary는 `active:bg-brand-800` |
| focus | `focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2` |
| disabled | 네이티브 `disabled` 속성 + `disabled:opacity-50 disabled:cursor-not-allowed` |
| loading | `disabled` + `aria-busy="true"`, 스피너 + 문구 유지 |

로딩 상태 예시:

```tsx
<Button variant="primary" disabled aria-busy="true">
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-fg-inverse border-t-transparent" aria-hidden="true" />
  저장 중
</Button>
```

## Button > 아이콘 버튼

- 아이콘 + 텍스트: 아이콘에 `aria-hidden="true"`를 붙이고 텍스트는 그대로 둔다.
- 아이콘만 있는 버튼: 반드시 `aria-label`로 무슨 동작인지 적는다. 크기는 `h-11 w-11`(44px) 정사각형.

```tsx
<button
  type="button"
  aria-label="닫기"
  className="inline-flex h-11 w-11 items-center justify-center rounded-button text-fg-secondary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
>
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">…</svg>
</button>
```

## Button > 배치

- 한 영역(폼, 모달 하단, 카드 하단)에 primary 버튼은 1개만 둔다.
- 버튼 묶음은 `flex gap-inline`으로 배치하고, 보조 버튼을 왼쪽, 주 버튼을 오른쪽에 둔다.
- 버튼 묶음은 오른쪽 정렬(`justify-end`)이 기본이다. 모바일 폼은 `w-full` 세로 배치도 허용한다.

```tsx
<div className="flex justify-end gap-inline">
  <Button variant="secondary">취소</Button>
  <Button variant="primary" type="submit">저장하기</Button>
</div>
```

## Button > 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| BTN-01 | 주 액션은 `<Button variant="primary">` 또는 `bg-brand-600 text-fg-inverse`를 쓴다. | 자동: 코드 |
| BTN-02 | 모든 버튼은 `rounded-button`을 쓴다 (`Button` 컴포넌트는 자동 적용). | 자동: 코드 |
| BTN-03 | 한 `form` 또는 한 버튼 묶음 안에 primary 버튼은 1개만 둔다. | 자동: 코드 |
| BTN-04 | 비활성 버튼은 네이티브 `disabled` 속성을 쓰고 `disabled:opacity-50 disabled:cursor-not-allowed`를 적용한다. | 자동: 코드 |
| BTN-05 | 아이콘만 있는 버튼은 `aria-label`이 있어야 한다. | 자동: axe |
| BTN-06 | 버튼 묶음에서 secondary는 왼쪽, primary는 오른쪽에 둔다. | 자동: 코드 |
| BTN-07 | `<button>`에는 `type`(`submit` 또는 `button`)을 명시한다. | 자동: 코드 |
| BTN-08 | 페이지 이동은 `<a href>`로, 동작 실행은 `<button>`으로 만든다. `div`나 `span`에 `onClick`을 달지 않는다. | 자동: 코드 |
| BTN-09 | 기본 크기는 `md`(h-11, 44px)이다. `sm`은 표·툴바에서만 쓴다. | 수동 |
