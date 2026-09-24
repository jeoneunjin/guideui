---
title: Accessibility
version: 1.0.0
updated: 2026-09-24
---

# Accessibility

팀이 지키는 접근성 기준이다. 기준은 WCAG 2.2 AA이며, 모든 컴포넌트와 화면에 적용된다. 컴포넌트별 세부 접근성 규칙은 각 컴포넌트 문서에 있고, 이 문서는 공통 원칙을 다룬다.

## Accessibility > 색상 대비

- 일반 텍스트: 배경 대비 4.5:1 이상
- 큰 텍스트(24px 이상, 또는 18.66px 이상 bold): 3:1 이상
- 입력 필드 경계, 아이콘 등 의미 있는 비텍스트 요소: 3:1 이상
- Tokens 문서의 `fg-*`, 상태 700 단계, `line-input`은 모두 흰 배경에서 이 기준을 통과한다. 토큰 외의 색을 쓰지 않으면 대비 문제는 대부분 생기지 않는다.
- 진한 배경(`bg-brand-600`, `bg-danger-600`) 위에는 `text-fg-inverse`만 쓴다.
- 비활성(disabled) 요소는 대비 기준에서 예외지만, 비활성 사실을 텍스트나 속성으로도 알 수 있어야 한다.

## Accessibility > 키보드 사용

- 마우스로 할 수 있는 모든 동작은 키보드로도 할 수 있어야 한다.
- 인터랙티브 요소는 네이티브 요소(`button`, `a`, `input`, `select`)로 만든다. `div`·`span`에 `onClick`을 달지 않는다.
- `tabIndex`에 양수 값을 쓰지 않는다. 포커스 순서는 DOM 순서를 따른다.
- 포커스 순서가 화면에 보이는 순서와 일치해야 한다.

## Accessibility > 포커스 표시

- 모든 인터랙티브 요소는 키보드 포커스가 눈에 보여야 한다.
- 표준 포커스 스타일: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2`
- `outline-none`(또는 `focus:outline-none`, `focus-visible:outline-none`)을 쓸 때는 반드시 `focus-visible:ring-*`을 함께 쓴다. 포커스 표시를 없애기만 하는 것은 금지다.

## Accessibility > 스크린리더

- 이미지: 의미 있는 이미지는 내용을 설명하는 `alt`, 장식용은 `alt=""`
- 아이콘: 텍스트와 함께 쓰는 아이콘은 `aria-hidden="true"`, 아이콘만 있는 버튼은 `aria-label`
- 제목 구조: 페이지당 `h1`은 1개, `h1 → h2 → h3` 순서로 건너뛰지 않는다.
- 랜드마크: `header`, `nav`, `main`, `footer`로 영역을 구분한다. 화면 주 콘텐츠는 `main`으로 감싼다.
- 화면에 보이지 않지만 읽어야 하는 텍스트는 `sr-only` 클래스를 쓴다.

## Accessibility > 상태 변화 알림

- 폼 제출 에러 요약, 저장 실패처럼 즉시 알려야 하는 메시지는 `role="alert"`를 쓴다.
- 저장 완료, 검색 결과 개수처럼 급하지 않은 변화는 `aria-live="polite"` 영역으로 알린다.
- 로딩 중인 영역은 `aria-busy="true"`를 넣는다.
- 상태를 색상만으로 전달하지 않는다. 에러는 빨간 테두리 + 에러 문구, 성공은 초록색 + "완료" 텍스트처럼 함께 표시한다.

## Accessibility > 터치 영역

- 버튼, 링크 메뉴, 아이콘 버튼의 클릭 영역은 44×44px(`h-11`, `w-11`) 이상을 기본으로 한다.
- 표나 툴바처럼 공간이 좁은 곳의 작은 버튼(`h-9`)도 최소 24×24px 이상이어야 하며, 인접 요소와 간격을 둔다.
- 체크박스·라디오는 라벨 전체를 클릭 영역으로 만든다.

## Accessibility > 오버레이 UI

- 모달, 드로어, 전체 화면 메뉴는 포커스 트랩, Esc 닫기, 닫힌 뒤 포커스 복귀를 지원한다. 자세한 내용은 Modal 문서를 따른다.
- 드롭다운과 팝오버는 Esc로 닫히고, 열고 닫는 버튼에 `aria-expanded`를 넣는다.

## Accessibility > 모션

- 큰 움직임이 있는 애니메이션에는 `motion-reduce:transition-none` 또는 `motion-reduce:animate-none`을 함께 쓴다.
- 자동으로 움직이는 콘텐츠(캐러셀 등)는 멈춤 버튼을 제공한다.

## Accessibility > 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| A11Y-01 | 텍스트 대비는 AA 기준(일반 4.5:1, 큰 텍스트 3:1)을 통과한다. | 자동: axe |
| A11Y-02 | 모든 버튼은 텍스트 콘텐츠 또는 `aria-label`을 갖는다. | 자동: axe |
| A11Y-03 | 모든 `img`는 `alt` 속성을 갖는다 (장식용은 `alt=""`). | 자동: axe |
| A11Y-04 | `outline-none`을 쓸 때는 반드시 `focus-visible:ring-*`을 함께 쓴다. | 자동: 코드 |
| A11Y-05 | `tabIndex`에 양수 값을 쓰지 않는다. | 자동: 코드 + axe |
| A11Y-06 | 제목 단계를 건너뛰지 않고, 페이지당 `h1`은 1개다. | 자동: axe |
| A11Y-07 | 텍스트와 함께 쓰는 아이콘(`svg`)은 `aria-hidden="true"`를 갖는다. | 자동: 코드 |
| A11Y-08 | 즉시 알려야 하는 에러 요약은 `role="alert"`를 쓴다. | 수동 |
| A11Y-09 | 인터랙티브 요소의 클릭 영역은 기본 44×44px 이상이다. | 수동 |
