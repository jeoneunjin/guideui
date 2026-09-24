---
title: Modal
version: 1.0.0
updated: 2026-09-24
---

# Modal

현재 흐름을 잠시 멈추고 사용자의 확인이나 짧은 입력이 필요할 때 쓴다. 긴 내용이나 복잡한 폼은 모달 대신 별도 페이지로 만든다.

- 쓰는 경우: 삭제 확인, 짧은 정보 입력(이름 변경 등), 중요한 안내
- 쓰지 않는 경우: 단순 알림(토스트 사용), 긴 약관(페이지 사용), 여러 단계의 입력

## Modal > 구조

1. Overlay: 화면 전체를 덮는 가림막
2. Container: 모달 본체
3. Header: 제목 + 닫기 버튼
4. Body: 내용 (길면 body 내부만 스크롤)
5. Footer: 액션 버튼 (취소 / 확인)

## Modal > 스타일

| 영역 | 클래스 |
|---|---|
| Overlay | `fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4` |
| Container | `w-full max-w-md rounded-modal bg-surface shadow-modal` |
| Header | `flex items-start justify-between gap-4 p-component pb-0` |
| 제목 | `h2` + `text-lg font-bold text-fg-primary` |
| Body | `max-h-[60vh] overflow-y-auto p-component text-base text-fg-secondary` |
| Footer | `flex justify-end gap-inline p-component pt-0` |

`max-h-[60vh]`는 화면 비율 기반 값이라 TKN-02(임의 px 금지)의 예외로 허용한다.

## Modal > 크기

| size | 클래스 | 용도 |
|---|---|---|
| sm | `max-w-sm` | 확인·경고 (문장 1~2개) |
| md (기본) | `max-w-md` | 짧은 입력 폼 |
| lg | `max-w-lg` | 목록 선택, 미리보기 |

모바일에서는 모든 크기가 `w-full`로 화면 폭을 채운다 (Overlay의 `p-4`로 가장자리 여백 확보).

## Modal > 접근성과 동작

- Container에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{제목 id}"`를 넣는다. 설명 문구가 있으면 `aria-describedby`도 연결한다.
- 닫기 버튼은 아이콘 버튼이므로 `aria-label="닫기"`를 넣는다.
- 열릴 때: 모달 안의 첫 번째 인터랙티브 요소(또는 제목)로 포커스를 옮긴다.
- 열려 있는 동안: Tab 이동이 모달 밖으로 나가지 않도록 포커스를 가둔다(포커스 트랩). 배경 스크롤을 막는다.
- 닫힐 때: 모달을 열었던 버튼으로 포커스를 돌려준다.
- `Esc` 키로 닫을 수 있어야 한다.
- 오버레이 클릭으로 닫기: 확인·경고 모달은 허용, 입력 폼 모달은 입력 손실 방지를 위해 허용하지 않는다.

## Modal > 확인 모달과 위험 액션

- Footer 버튼은 왼쪽 secondary(취소), 오른쪽 primary(확인)로 둔다.
- 되돌릴 수 없는 액션(삭제 등)은 확인 버튼을 `danger` variant로 바꾸고, 버튼 문구에 동작을 명확히 쓴다. "확인" 대신 "삭제하기"
- 제목에는 무엇을 하는지 쓰고, 본문에는 결과를 쓴다.

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-title"
    aria-describedby="delete-desc"
    className="w-full max-w-sm rounded-modal bg-surface shadow-modal"
  >
    <div className="flex items-start justify-between gap-4 p-component pb-0">
      <h2 id="delete-title" className="text-lg font-bold text-fg-primary">프로젝트를 삭제할까요?</h2>
      <button type="button" aria-label="닫기" className="inline-flex h-11 w-11 items-center justify-center rounded-button text-fg-secondary hover:bg-surface-subtle">
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">…</svg>
      </button>
    </div>
    <p id="delete-desc" className="p-component text-base text-fg-secondary">
      삭제하면 프로젝트와 모든 버전이 사라지고 되돌릴 수 없어요.
    </p>
    <div className="flex justify-end gap-inline p-component pt-0">
      <Button variant="secondary" type="button">취소</Button>
      <Button variant="danger" type="button">삭제하기</Button>
    </div>
  </div>
</div>
```

## Modal > 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| MDL-01 | 모달 컨테이너는 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 갖는다. | 자동: 코드 + axe |
| MDL-02 | 모든 모달은 `aria-label="닫기"`가 있는 닫기 버튼을 제공한다. | 자동: 코드 |
| MDL-03 | 오버레이는 `bg-overlay`, 컨테이너는 `bg-surface rounded-modal shadow-modal`을 쓴다. | 자동: 코드 |
| MDL-04 | 모달 영역 여백은 `p-component`를 쓴다. | 자동: 코드 |
| MDL-05 | 모달 제목은 `h2`와 `text-lg font-bold`를 쓴다. | 자동: 코드 |
| MDL-06 | 위험 액션 확인 버튼은 `danger` variant이고 문구가 "확인"이 아니다. | 자동: 코드 |
| MDL-07 | Esc로 닫기, 포커스 트랩, 닫힌 뒤 포커스 복귀를 지원한다. | 수동 |
