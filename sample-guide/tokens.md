---
title: Design Tokens
version: 1.0.0
updated: 2026-09-24
---

# Design Tokens

GuideUI Sample DS의 모든 색상, 타이포그래피, 간격, 모서리, 그림자, 모션 값을 정의한다. 컴포넌트와 화면은 여기 정의된 토큰 클래스만 사용한다. 실제 값은 `tokens.ts`와 항상 동일하다.

- 적용 범위: 모든 컴포넌트와 화면
- 테마: v1은 라이트 모드만 지원한다. 다크 모드는 v2에서 semantic 토큰 재매핑으로 추가한다.
- 네이밍 원칙: 값이 아니라 의도로 이름 짓는다. `gray-600` 대신 `fg-secondary`처럼 쓴다.

## Tokens > 토큰 사용 원칙

토큰은 두 단계로 나뉜다.

- Primitive 토큰: 원시 색상 스케일. 예: `brand-50` ~ `brand-900`
- Semantic 토큰: 용도가 정해진 토큰. 예: `fg-primary`, `surface`, `line-error`

화면을 만들 때는 semantic 토큰을 우선 사용한다. Primitive는 semantic 토큰으로 표현할 수 없는 경우(브랜드 강조 배경 `bg-brand-50` 등)에만 쓴다.

### 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| TKN-01 | 색상에 임의 값(`bg-[#2563eb]`, `text-[#333]` 등)을 쓰지 않는다. | 자동: 코드 |
| TKN-02 | 간격·크기에 임의 px 값(`p-[13px]`, `mt-[7px]` 등)을 쓰지 않는다. 4px 스케일 또는 semantic 간격만 쓴다. | 자동: 코드 |
| TKN-03 | 모서리는 `rounded-button`, `rounded-input`, `rounded-card`, `rounded-modal`, `rounded-full`만 쓴다. `rounded-md`, `rounded-lg` 같은 기본 클래스는 쓰지 않는다. | 자동: 코드 |
| TKN-04 | 그림자는 `shadow-card`, `shadow-dropdown`, `shadow-modal`만 쓴다. `shadow-sm`, `shadow-lg` 같은 기본 클래스는 쓰지 않는다. | 자동: 코드 |
| TKN-05 | 인라인 스타일(`style={{ ... }}`)을 쓰지 않는다. 모든 스타일은 Tailwind 클래스로 작성한다. | 자동: 코드 |

## Tokens > Color > 텍스트 색상

모든 텍스트 색상은 `text-fg-*` 클래스를 사용한다. 대비는 흰 배경(`surface`) 기준이다.

| 토큰 | 클래스 | 값 | 대비 | 용도 |
|---|---|---|---|---|
| fg.primary | `text-fg-primary` | #111827 | 17.7:1 | 본문, 제목 |
| fg.secondary | `text-fg-secondary` | #4b5563 | 7.6:1 | 보조 설명, 메타 정보 |
| fg.muted | `text-fg-muted` | #6b7280 | 4.8:1 | 도움말, 캡션, placeholder |
| fg.inverse | `text-fg-inverse` | #ffffff | - | 진한 배경(brand-600, danger-600) 위 텍스트 |
| fg.brand | `text-fg-brand` | #1d4ed8 | 6.7:1 | 링크, 활성 메뉴 |
| fg.error | `text-fg-error` | #dc2626 | 4.8:1 | 에러 메시지, 필수 표시 |

### 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| CLR-01 | 텍스트 색상은 `text-fg-*` 토큰만 쓴다. `text-gray-500`, `text-black` 같은 기본 색상 클래스는 쓰지 않는다. | 자동: 코드 |
| CLR-02 | `text-fg-muted`보다 연한 색을 텍스트에 쓰지 않는다. `#9ca3af`(gray-400)는 대비 2.5:1로 AA 기준 미달이다. | 자동: axe |

## Tokens > Color > 배경과 테두리 색상

| 토큰 | 클래스 | 값 | 용도 |
|---|---|---|---|
| surface | `bg-surface` | #ffffff | 카드, 모달, 네비게이션, 입력 필드 |
| surface.subtle | `bg-surface-subtle` | #f9fafb | 페이지 배경, 행 hover |
| surface.muted | `bg-surface-muted` | #f3f4f6 | 비활성 영역, 코드 배경 |
| overlay | `bg-overlay` | rgb(17 24 39 / 0.5) | 모달·드로어 뒤 가림막 |
| line | `border-line` | #e5e7eb | 카드 테두리, 구분선 (장식용) |
| line.input | `border-line-input` | #8b929c | 입력 필드 경계 (대비 3.1:1) |
| line.focus | `ring-line-focus` | #2563eb | 포커스 링 |
| line.error | `border-line-error` | #dc2626 | 에러 상태 입력 필드 |

입력 필드처럼 사용자가 조작해야 하는 요소의 경계는 배경 대비 3:1 이상이어야 하므로 `border-line`이 아니라 `border-line-input`을 쓴다.

## Tokens > Color > 브랜드 색상

| 클래스 | 값 | 용도 |
|---|---|---|
| `bg-brand-600` | #2563eb | 주 버튼 배경 (흰 글자 대비 5.2:1) |
| `bg-brand-700` | #1d4ed8 | 주 버튼 hover |
| `bg-brand-800` | #1e40af | 주 버튼 active |
| `bg-brand-50` | #eff6ff | 선택된 항목, 활성 메뉴 배경, 강조 카드 배경 |
| `border-brand-600` | #2563eb | 강조 카드, 선택된 카드 테두리 |

`brand-100` ~ `brand-500`은 텍스트나 버튼 배경에 쓰지 않는다. 흰 배경·흰 글자 모두와 대비가 부족하다.

## Tokens > Color > 상태 색상 (피드백)

상태 색상은 50(배경)과 600·700(텍스트·강조) 조합으로만 쓴다.

| 상태 | 배경 | 텍스트 | 용도 |
|---|---|---|---|
| danger | `bg-danger-50` | `text-danger-700` | 삭제 경고, 실패 알림 |
| danger (버튼) | `bg-danger-600` | `text-fg-inverse` | 위험 액션 버튼 |
| success | `bg-success-50` | `text-success-700` | 완료, 성공 알림 |
| warning | `bg-warning-50` | `text-warning-700` | 주의 알림 |
| info | `bg-info-50` | `text-info-700` | 안내 알림 |

### 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| CLR-03 | 상태 텍스트는 반드시 700 단계를 쓴다. 밝은 초록·노랑·하늘색 텍스트는 대비 기준 미달이다. | 자동: axe |
| CLR-04 | 상태를 색상만으로 전달하지 않는다. 텍스트나 아이콘을 함께 표시한다. | 수동 |

## Tokens > Typography > 글꼴과 크기

- 글꼴: `font-sans` (Pretendard → 시스템 글꼴 순으로 대체)
- 크기와 굵기는 Tailwind 기본 스케일을 쓰되, 아래 용도 규칙을 따른다.

| 용도 | 태그 | 클래스 |
|---|---|---|
| 페이지 제목 | `h1` | `text-2xl font-bold text-fg-primary` |
| 섹션 제목 | `h2` | `text-xl font-bold text-fg-primary` |
| 카드·모달 제목 | `h2` 또는 `h3` | `text-lg font-bold text-fg-primary` |
| 본문 | `p` | `text-base text-fg-primary` |
| 보조 설명 | `p` | `text-sm text-fg-secondary` |
| 도움말·캡션 | `p`, `span` | `text-sm text-fg-muted` |
| 라벨 | `label` | `text-sm font-medium text-fg-primary` |
| 배지 | `span` | `text-xs font-medium` |

- 굵기: `font-normal`(400), `font-medium`(500), `font-bold`(700)만 쓴다.
- 줄 간격: 본문은 `leading-normal`, 긴 설명문은 `leading-relaxed`, 제목은 `leading-tight`.

### 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| TYP-01 | 굵기는 `font-normal`, `font-medium`, `font-bold`만 쓴다. `font-semibold`, `font-light` 등은 쓰지 않는다. | 자동: 코드 |
| TYP-02 | `text-xs`는 배지에서만 쓴다. 읽어야 하는 텍스트는 최소 `text-sm`이다. | 수동 |
| TYP-03 | 제목은 반드시 heading 태그(`h1`~`h3`)를 쓰고, 단계를 건너뛰지 않는다. | 자동: axe |

## Tokens > Spacing > 간격

기본 간격은 Tailwind 4px 스케일(`1`=4px, `2`=8px, `3`=12px, `4`=16px, `6`=24px, `8`=32px …)을 그대로 쓴다. 자주 쓰는 의미 기반 간격은 semantic 토큰으로 정의한다.

| 토큰 | 클래스 예시 | 값 | 용도 |
|---|---|---|---|
| spacing.inline | `gap-inline` | 8px | 아이콘-텍스트 간격, 나란히 놓인 버튼 간격 |
| spacing.component | `p-component` | 24px | 카드·모달 내부 여백 |
| spacing.section | `py-section` | 48px | 페이지 섹션 사이 간격 |

자주 쓰는 조합:

- 폼 필드 사이: `gap-4` (16px)
- 라벨과 입력 필드 사이: `gap-2` (8px)
- 제목과 본문 사이: `gap-2` 또는 `mt-2`
- 카드 목록 사이: `gap-4` 또는 `gap-6`

## Tokens > Radius > 모서리

| 토큰 | 클래스 | 값 | 용도 |
|---|---|---|---|
| radius.button | `rounded-button` | 8px | 모든 버튼 |
| radius.input | `rounded-input` | 8px | 입력 필드, 셀렉트, 텍스트영역 |
| radius.card | `rounded-card` | 12px | 카드, 알림 박스 |
| radius.modal | `rounded-modal` | 16px | 모달, 드로어 |
| (기본) | `rounded-full` | 9999px | 배지, 아바타, 원형 아이콘 버튼 |

## Tokens > Shadow > 그림자

| 토큰 | 클래스 | 용도 |
|---|---|---|
| shadow.card | `shadow-card` | 클릭 가능한 카드의 hover 상태 |
| shadow.dropdown | `shadow-dropdown` | 드롭다운, 팝오버, 툴팁 |
| shadow.modal | `shadow-modal` | 모달, 드로어 |

기본 상태의 카드는 그림자 없이 `border border-line`으로 구분한다.

## Tokens > Motion > 모션

| 토큰 | 클래스 | 값 | 용도 |
|---|---|---|---|
| duration.fast | `duration-fast` | 150ms | hover, 색상 변화 |
| duration.normal | `duration-normal` | 250ms | 드롭다운, 토글 |
| duration.slow | `duration-slow` | 400ms | 모달 등장 |

- 색상 전환은 `transition-colors duration-fast`를 기본으로 쓴다.
- 움직임이 큰 애니메이션은 `motion-reduce:transition-none`을 함께 적는다.
