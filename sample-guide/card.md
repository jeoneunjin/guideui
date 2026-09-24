---
title: Card
version: 1.0.0
updated: 2026-09-24
---

# Card

관련된 정보를 하나의 묶음으로 보여줄 때 쓴다. 상품, 게시글, 요약 지표, 설정 그룹 등에 쓴다. 이 문서는 카드 안에서 상태를 표시하는 Badge도 함께 다룬다.

- 컴포넌트: `import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./components/ui/card";`, `import { Badge } from "./components/ui/badge";`

## Card > 구조

카드는 위에서부터 아래 영역으로 구성하며, body 외에는 선택이다.

1. media (선택): 이미지 영역
2. header (선택): 제목, 부가 정보, 배지
3. body: 본문
4. footer (선택): 액션 버튼, 메타 정보

## Card > 기본 스타일

| 영역 | 클래스 |
|---|---|
| 카드 컨테이너 | `rounded-card border border-line bg-surface` |
| 내부 여백 | `p-component` (카드 전체) 또는 영역별로 `p-component` 적용 |
| header | `flex flex-col gap-1` |
| 제목 | `h3` + `text-lg font-bold text-fg-primary` |
| 부가 설명 | `text-sm text-fg-secondary` |
| footer | `flex justify-end gap-inline border-t border-line pt-4` |
| media 이미지 | `aspect-video w-full rounded-t-card object-cover` |

```tsx
<article className="rounded-card border border-line bg-surface p-component">
  <header className="flex flex-col gap-1">
    <h3 className="text-lg font-bold text-fg-primary">이번 달 사용량</h3>
    <p className="text-sm text-fg-secondary">9월 1일 ~ 9월 24일</p>
  </header>
  <p className="mt-4 text-2xl font-bold text-fg-primary">1,284건</p>
</article>
```

카드 목록은 `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`처럼 grid로 배치한다.

## Card > Variant

| variant | 클래스 | 용도 |
|---|---|---|
| 기본 | `border border-line bg-surface` | 정보 표시 |
| 강조 | `border-2 border-brand-600 bg-brand-50` | 추천 요금제, 중요 공지 |
| 클릭 가능 | 기본 + `transition-shadow duration-fast hover:shadow-card` | 상세 페이지로 이동하는 카드 |
| 선택됨 | `border-2 border-brand-600` + `aria-pressed` 또는 `aria-checked` | 선택형 카드(요금제 선택 등) |

## Card > 클릭 가능한 카드

- 카드 전체가 한 곳으로 이동하면 카드 전체를 `<a href>`로 감싼다.
- 카드를 눌러 동작을 실행하면(선택 등) `<button type="button">`으로 만든다.
- `div`에 `onClick`을 다는 방식은 쓰지 않는다. 키보드로 접근할 수 없다.
- 포커스 스타일: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus`
- 카드 안에 별도 버튼이 있으면 카드 전체를 링크로 만들지 않는다 (중첩 인터랙션 금지). 제목만 링크로 만든다.

```tsx
<a
  href="/posts/1"
  className="block rounded-card border border-line bg-surface p-component transition-shadow duration-fast hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
>
  <h3 className="text-lg font-bold text-fg-primary">디자인 토큰 도입기</h3>
  <p className="mt-2 text-sm text-fg-secondary">토큰을 도입하며 겪은 시행착오를 정리했어요.</p>
</a>
```

## Card > 이미지

- 의미 있는 이미지는 내용을 설명하는 `alt`를 쓴다. 예: `alt="흰색 무선 이어폰 정면 사진"`
- 장식용 이미지는 `alt=""`를 쓴다.
- `alt`에 "이미지", "사진"만 쓰지 않는다.

## Card > Badge

카드나 목록 안에서 상태·분류를 짧게 표시할 때 쓴다.

- 공통 클래스: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium`
- 배지 문구는 2~6자로 짧게 쓴다.

| 종류 | 클래스 | 예시 |
|---|---|---|
| 기본 | `bg-surface-muted text-fg-secondary` | 임시 저장 |
| 브랜드 | `bg-brand-50 text-fg-brand` | 추천 |
| 성공 | `bg-success-50 text-success-700` | 완료 |
| 경고 | `bg-warning-50 text-warning-700` | 검토 중 |
| 위험 | `bg-danger-50 text-danger-700` | 실패 |
| 안내 | `bg-info-50 text-info-700` | 신규 |

## Card > 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| CRD-01 | 카드 컨테이너는 `rounded-card border border-line bg-surface`를 쓴다. | 자동: 코드 |
| CRD-02 | 카드 내부 여백은 `p-component`를 쓴다. | 자동: 코드 |
| CRD-03 | 기본 카드에는 그림자를 쓰지 않는다. 그림자는 클릭 가능한 카드의 `hover:shadow-card`에만 쓴다. | 자동: 코드 |
| CRD-04 | 클릭 가능한 카드는 `<a>` 또는 `<button>`으로 만든다. `div`·`article`에 `onClick`을 달지 않는다. | 자동: 코드 |
| CRD-05 | 카드 제목은 heading 태그(`h2` 또는 `h3`)와 `text-lg font-bold`를 쓴다. | 자동: 코드 |
| CRD-06 | 카드 이미지는 `alt`가 있어야 하고, 장식용이면 `alt=""`를 쓴다. | 자동: axe |
| CRD-07 | 배지는 `rounded-full text-xs font-medium`과 상태별 50/700 색 조합을 쓴다. | 자동: 코드 |
