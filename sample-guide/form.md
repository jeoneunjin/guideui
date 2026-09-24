---
title: Form
version: 1.0.0
updated: 2026-09-24
---

# Form

사용자에게 정보를 입력받는 화면(로그인, 회원가입, 설정, 검색 등)에 쓴다. 입력 필드, 라벨, 도움말, 에러 메시지로 구성된다.

- 컴포넌트: `import { Input } from "./components/ui/input";`, `import { Label } from "./components/ui/label";`

## Form > 필드 구조

하나의 필드는 항상 아래 순서로 구성한다.

1. 라벨 (`<label htmlFor>`)
2. 입력 필드 (`<input id>`)
3. 도움말 또는 에러 메시지 (둘 중 하나만 표시)

```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="email">
    이메일 <span className="text-fg-error" aria-hidden="true">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    autoComplete="email"
    required
    placeholder="예: name@example.com"
    aria-describedby="email-help"
  />
  <p id="email-help" className="text-sm text-fg-muted">로그인에 사용할 이메일을 입력해 주세요.</p>
</div>
```

## Form > 폼 레이아웃

- 폼 전체: `<form className="flex flex-col gap-4">`
- 필드 내부(라벨-입력-도움말): `flex flex-col gap-2`
- 필드는 한 줄에 하나씩 세로로 쌓는다. 짧은 필드(시/군/구, 우편번호)만 `grid grid-cols-2 gap-4`로 나란히 둔다.
- 제출 버튼은 폼 마지막에 둔다. 버튼 규칙은 Button 문서를 따른다.
- 카드 안에 폼을 넣을 때는 Card 문서의 `p-component` 여백을 따른다.

## Form > Label

- 클래스: `text-sm font-medium text-fg-primary`
- 모든 입력 필드는 보이는 라벨이 있어야 한다. placeholder로 라벨을 대신하지 않는다.
- 라벨 텍스트는 명사형으로 짧게 쓴다. 예: 이메일, 비밀번호, 휴대폰 번호
- 필수 필드는 라벨 뒤에 `*`를 붙이고(`text-fg-error`, `aria-hidden="true"`), 입력 필드에 `required`를 넣는다. 폼 상단에 "* 표시는 필수 항목이에요" 안내를 둔다.

## Form > Input

| 항목 | 클래스 / 속성 |
|---|---|
| 기본 | `h-11 w-full rounded-input border border-line-input bg-surface px-3 text-base text-fg-primary placeholder:text-fg-muted` |
| focus | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:border-line-focus` |
| disabled | `disabled` 속성 + `disabled:bg-surface-muted disabled:cursor-not-allowed` |
| error | `border-line-error` + `aria-invalid="true"` |

지원 타입: `text`, `email`, `password`, `number`, `search`, `tel`

자동완성 속성은 필드 성격에 맞게 넣는다.

| 필드 | type | autoComplete |
|---|---|---|
| 이메일 | `email` | `email` |
| 로그인 비밀번호 | `password` | `current-password` |
| 새 비밀번호 | `password` | `new-password` |
| 이름 | `text` | `name` |
| 휴대폰 번호 | `tel` | `tel` |

## Form > 도움말 (Helper Text)

- 클래스: `text-sm text-fg-muted`
- 입력 규칙을 미리 알려줄 때 쓴다. 예: "영문, 숫자 포함 8자 이상"
- 도움말에 `id`를 주고 입력 필드의 `aria-describedby`로 연결한다.
- 에러가 표시되면 도움말은 숨기고 에러 메시지로 교체한다.

## Form > 에러 상태

에러는 색상만으로 표시하지 않는다. 테두리 색 + 에러 문구를 함께 보여준다.

- 입력 필드: `border-line-error`, `aria-invalid="true"`, `aria-describedby="{필드id}-error"`
- 에러 메시지: `<p id="{필드id}-error" className="text-sm text-fg-error">`
- 에러 문구는 원인과 해결 방법을 함께 쓴다 (Writing 문서 참고).
- 제출 시 에러가 여러 개면 폼 상단에 요약을 `role="alert"`로 보여주고, 첫 번째 에러 필드로 포커스를 옮긴다.

```tsx
<div className="flex flex-col gap-2">
  <Label htmlFor="password">비밀번호</Label>
  <Input
    id="password"
    type="password"
    autoComplete="current-password"
    aria-invalid="true"
    aria-describedby="password-error"
    className="border-line-error"
  />
  <p id="password-error" className="text-sm text-fg-error">
    비밀번호가 8자보다 짧아요. 영문과 숫자를 포함해 8자 이상 입력해 주세요.
  </p>
</div>
```

## Form > 체크박스와 라디오

- 체크박스·라디오도 반드시 `<label>`과 연결한다. 라벨로 감싸는 방식을 권장한다.
- 클릭 영역을 넓히기 위해 라벨 전체를 클릭 가능하게 만든다.
- 여러 개의 선택지는 `<fieldset>`과 `<legend>`로 묶는다.

```tsx
<label className="flex items-center gap-2 text-sm text-fg-primary">
  <input type="checkbox" name="remember" className="h-4 w-4 accent-brand-600" />
  로그인 상태 유지
</label>
```

## Form > 규칙

| ID | 규칙 | 검사 |
|---|---|---|
| FRM-01 | 모든 입력 필드(input, select, textarea)는 `<label>`과 연결한다 (`htmlFor`-`id` 또는 라벨로 감싸기). | 자동: 코드 + axe |
| FRM-02 | placeholder로 라벨을 대신하지 않는다. placeholder는 "예: ..." 형식의 예시로만 쓴다. | 자동: 코드 |
| FRM-03 | 필수 필드는 `required` 속성을 넣고 라벨에 `*` 표시를 한다. | 자동: 코드 |
| FRM-04 | 에러 상태 필드는 `aria-invalid="true"`, `border-line-error`, `aria-describedby`로 연결된 에러 메시지를 모두 갖는다. | 자동: 코드 |
| FRM-05 | 에러 메시지는 `text-sm text-fg-error`, 도움말은 `text-sm text-fg-muted`를 쓴다. | 자동: 코드 |
| FRM-06 | 입력 필드는 `h-11 rounded-input border-line-input`을 쓴다 (`Input` 컴포넌트는 자동 적용). | 자동: 코드 |
| FRM-07 | 이메일·비밀번호·이름·전화번호 필드는 `autoComplete`를 지정한다. | 자동: 코드 |
| FRM-08 | 폼 필드 사이 간격은 `gap-4`, 필드 내부 간격은 `gap-2`를 쓴다. | 수동 |
| FRM-09 | 선택지가 여러 개인 체크박스·라디오 그룹은 `fieldset`과 `legend`로 묶는다. | 자동: 코드 |
