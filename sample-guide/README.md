# GuideUI Sample DS

GuideUI 개발과 평가에 쓰는 샘플 디자인 시스템 문서다. 실무 디자인 시스템에서 보편적으로 쓰는 구조(Foundations → Components → Guidelines)를 따르되, **모든 규칙에 ID를 붙이고 가능한 한 코드로 자동 채점할 수 있게** 작성했다.

- version: 1.0.0
- updated: 2026-09-24
- 기준: WCAG 2.2 AA, 라이트 모드 전용 (다크 모드는 v2)

## 파일 구성

| 파일 | 분류 | 내용 |
|---|---|---|
| `tokens.ts` | 코드 | Tailwind `theme.extend` 객체. 샌드박스와 앱이 같은 값을 쓰게 하는 단일 소스 |
| `tokens.md` | Foundations | 색상, 타이포그래피, 간격, 모서리, 그림자, 모션 |
| `button.md` | Components | variant, 크기, 상태, 아이콘 버튼, 배치 |
| `form.md` | Components | 필드 구조, 라벨, 입력, 도움말, 에러 상태, 체크박스 |
| `card.md` | Components | 카드 구조·variant·클릭 가능 카드, 배지 |
| `navigation.md` | Components | 상단·모바일·사이드 메뉴, 브레드크럼, 탭 |
| `modal.md` | Components | 구조, 크기, 포커스 동작, 위험 액션 확인 |
| `accessibility.md` | Guidelines | 대비, 키보드, 포커스, 스크린리더, 터치 영역 |
| `writing.md` | Guidelines | 톤, 버튼 문구, 라벨, 에러 메시지, 빈 상태 |

## 사용 방법

- **RAG 인제스트 대상**: `tokens.md` ~ `writing.md` 8개. 이 README와 `tokens.ts`는 인제스트하지 않는다 (규칙 목록이 중복 검색되는 것을 막기 위함).
- **샌드박스**: `tokens.ts`의 `tailwindExtend`를 샌드박스 `public/index.html`의 `tailwind.config = { theme: { extend: ... } }`에 넣는다.
- **평가**: 아래 규칙 목록의 "자동: 코드" 항목을 `eval/rules.ts`에서 정규식/AST 검사 함수로 구현하고, "자동: axe" 항목은 axe-core 결과로 채점한다. "수동" 항목은 채점에서 제외한다.
- **문서 수정 시**: 값이 바뀌면 `tokens.ts`와 해당 md를 같이 고치고, 상단 version과 updated를 올린다.

## 청킹을 고려한 작성 규칙

- 모든 섹션 제목은 `## {컴포넌트} > {항목}` 형식이다. 헤딩 경로만 봐도 어떤 문서의 어떤 규칙인지 알 수 있게 하기 위함이다.
- 한 섹션은 다른 섹션을 읽지 않아도 이해되도록 필요한 클래스를 그 섹션 안에 직접 적었다.
- 규칙 표는 각 문서 마지막 `## {컴포넌트} > 규칙` 섹션에 모았다.

## 규칙 목록 (67개)

검사 방식: 자동: 코드 46개 · 자동: axe 9개 · 자동: 코드 + axe 4개 · 자동: 코드 (키워드) 1개 · 수동 7개

| ID | 문서 | 규칙 | 검사 |
|---|---|---|---|
| TKN-01 | tokens.md | 색상에 임의 값(`bg-[#2563eb]`, `text-[#333]` 등)을 쓰지 않는다. | 자동: 코드 |
| TKN-02 | tokens.md | 간격·크기에 임의 px 값(`p-[13px]`, `mt-[7px]` 등)을 쓰지 않는다. 4px 스케일 또는 semantic 간격만 쓴다. | 자동: 코드 |
| TKN-03 | tokens.md | 모서리는 `rounded-button`, `rounded-input`, `rounded-card`, `rounded-modal`, `rounded-full`만 쓴다. `rounded-md`, `rounded-lg` 같은 기본 클래스는 쓰지 않는다. | 자동: 코드 |
| TKN-04 | tokens.md | 그림자는 `shadow-card`, `shadow-dropdown`, `shadow-modal`만 쓴다. `shadow-sm`, `shadow-lg` 같은 기본 클래스는 쓰지 않는다. | 자동: 코드 |
| TKN-05 | tokens.md | 인라인 스타일(`style={{ ... }}`)을 쓰지 않는다. 모든 스타일은 Tailwind 클래스로 작성한다. | 자동: 코드 |
| CLR-01 | tokens.md | 텍스트 색상은 `text-fg-*` 토큰만 쓴다. `text-gray-500`, `text-black` 같은 기본 색상 클래스는 쓰지 않는다. | 자동: 코드 |
| CLR-02 | tokens.md | `text-fg-muted`보다 연한 색을 텍스트에 쓰지 않는다. `#9ca3af`(gray-400)는 대비 2.5:1로 AA 기준 미달이다. | 자동: axe |
| CLR-03 | tokens.md | 상태 텍스트는 반드시 700 단계를 쓴다. 밝은 초록·노랑·하늘색 텍스트는 대비 기준 미달이다. | 자동: axe |
| CLR-04 | tokens.md | 상태를 색상만으로 전달하지 않는다. 텍스트나 아이콘을 함께 표시한다. | 수동 |
| TYP-01 | tokens.md | 굵기는 `font-normal`, `font-medium`, `font-bold`만 쓴다. `font-semibold`, `font-light` 등은 쓰지 않는다. | 자동: 코드 |
| TYP-02 | tokens.md | `text-xs`는 배지에서만 쓴다. 읽어야 하는 텍스트는 최소 `text-sm`이다. | 수동 |
| TYP-03 | tokens.md | 제목은 반드시 heading 태그(`h1`~`h3`)를 쓰고, 단계를 건너뛰지 않는다. | 자동: axe |
| BTN-01 | button.md | 주 액션은 `<Button variant="primary">` 또는 `bg-brand-600 text-fg-inverse`를 쓴다. | 자동: 코드 |
| BTN-02 | button.md | 모든 버튼은 `rounded-button`을 쓴다 (`Button` 컴포넌트는 자동 적용). | 자동: 코드 |
| BTN-03 | button.md | 한 `form` 또는 한 버튼 묶음 안에 primary 버튼은 1개만 둔다. | 자동: 코드 |
| BTN-04 | button.md | 비활성 버튼은 네이티브 `disabled` 속성을 쓰고 `disabled:opacity-50 disabled:cursor-not-allowed`를 적용한다. | 자동: 코드 |
| BTN-05 | button.md | 아이콘만 있는 버튼은 `aria-label`이 있어야 한다. | 자동: axe |
| BTN-06 | button.md | 버튼 묶음에서 secondary는 왼쪽, primary는 오른쪽에 둔다. | 자동: 코드 |
| BTN-07 | button.md | `<button>`에는 `type`(`submit` 또는 `button`)을 명시한다. | 자동: 코드 |
| BTN-08 | button.md | 페이지 이동은 `<a href>`로, 동작 실행은 `<button>`으로 만든다. `div`나 `span`에 `onClick`을 달지 않는다. | 자동: 코드 |
| BTN-09 | button.md | 기본 크기는 `md`(h-11, 44px)이다. `sm`은 표·툴바에서만 쓴다. | 수동 |
| FRM-01 | form.md | 모든 입력 필드(input, select, textarea)는 `<label>`과 연결한다 (`htmlFor`-`id` 또는 라벨로 감싸기). | 자동: 코드 + axe |
| FRM-02 | form.md | placeholder로 라벨을 대신하지 않는다. placeholder는 "예: ..." 형식의 예시로만 쓴다. | 자동: 코드 |
| FRM-03 | form.md | 필수 필드는 `required` 속성을 넣고 라벨에 `*` 표시를 한다. | 자동: 코드 |
| FRM-04 | form.md | 에러 상태 필드는 `aria-invalid="true"`, `border-line-error`, `aria-describedby`로 연결된 에러 메시지를 모두 갖는다. | 자동: 코드 |
| FRM-05 | form.md | 에러 메시지는 `text-sm text-fg-error`, 도움말은 `text-sm text-fg-muted`를 쓴다. | 자동: 코드 |
| FRM-06 | form.md | 입력 필드는 `h-11 rounded-input border-line-input`을 쓴다 (`Input` 컴포넌트는 자동 적용). | 자동: 코드 |
| FRM-07 | form.md | 이메일·비밀번호·이름·전화번호 필드는 `autoComplete`를 지정한다. | 자동: 코드 |
| FRM-08 | form.md | 폼 필드 사이 간격은 `gap-4`, 필드 내부 간격은 `gap-2`를 쓴다. | 수동 |
| FRM-09 | form.md | 선택지가 여러 개인 체크박스·라디오 그룹은 `fieldset`과 `legend`로 묶는다. | 자동: 코드 |
| CRD-01 | card.md | 카드 컨테이너는 `rounded-card border border-line bg-surface`를 쓴다. | 자동: 코드 |
| CRD-02 | card.md | 카드 내부 여백은 `p-component`를 쓴다. | 자동: 코드 |
| CRD-03 | card.md | 기본 카드에는 그림자를 쓰지 않는다. 그림자는 클릭 가능한 카드의 `hover:shadow-card`에만 쓴다. | 자동: 코드 |
| CRD-04 | card.md | 클릭 가능한 카드는 `<a>` 또는 `<button>`으로 만든다. `div`·`article`에 `onClick`을 달지 않는다. | 자동: 코드 |
| CRD-05 | card.md | 카드 제목은 heading 태그(`h2` 또는 `h3`)와 `text-lg font-bold`를 쓴다. | 자동: 코드 |
| CRD-06 | card.md | 카드 이미지는 `alt`가 있어야 하고, 장식용이면 `alt=""`를 쓴다. | 자동: axe |
| CRD-07 | card.md | 배지는 `rounded-full text-xs font-medium`과 상태별 50/700 색 조합을 쓴다. | 자동: 코드 |
| NAV-01 | navigation.md | 네비게이션은 `<nav>`로 감싸고, 여러 개일 때는 `aria-label`로 구분한다. | 자동: 코드 + axe |
| NAV-02 | navigation.md | 현재 페이지 항목에는 `aria-current="page"`를 넣고 `text-fg-brand font-medium`으로 표시한다. | 자동: 코드 |
| NAV-03 | navigation.md | 메뉴 항목은 `ul`/`ol`과 `li` 목록으로 마크업한다. | 자동: 코드 |
| NAV-04 | navigation.md | 상단 네비게이션은 `bg-surface border-b border-line`을 쓴다. | 자동: 코드 |
| NAV-05 | navigation.md | 햄버거 버튼은 `aria-label`, `aria-expanded`, `aria-controls`를 모두 갖는다. | 자동: 코드 |
| NAV-06 | navigation.md | 메뉴 항목 높이는 `h-11`(44px) 이상이다. | 자동: 코드 |
| NAV-07 | navigation.md | 탭은 `role="tablist"`/`role="tab"`/`role="tabpanel"`과 `aria-selected`를 쓴다. | 자동: 코드 |
| MDL-01 | modal.md | 모달 컨테이너는 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 갖는다. | 자동: 코드 + axe |
| MDL-02 | modal.md | 모든 모달은 `aria-label="닫기"`가 있는 닫기 버튼을 제공한다. | 자동: 코드 |
| MDL-03 | modal.md | 오버레이는 `bg-overlay`, 컨테이너는 `bg-surface rounded-modal shadow-modal`을 쓴다. | 자동: 코드 |
| MDL-04 | modal.md | 모달 영역 여백은 `p-component`를 쓴다. | 자동: 코드 |
| MDL-05 | modal.md | 모달 제목은 `h2`와 `text-lg font-bold`를 쓴다. | 자동: 코드 |
| MDL-06 | modal.md | 위험 액션 확인 버튼은 `danger` variant이고 문구가 "확인"이 아니다. | 자동: 코드 |
| MDL-07 | modal.md | Esc로 닫기, 포커스 트랩, 닫힌 뒤 포커스 복귀를 지원한다. | 수동 |
| A11Y-01 | accessibility.md | 텍스트 대비는 AA 기준(일반 4.5:1, 큰 텍스트 3:1)을 통과한다. | 자동: axe |
| A11Y-02 | accessibility.md | 모든 버튼은 텍스트 콘텐츠 또는 `aria-label`을 갖는다. | 자동: axe |
| A11Y-03 | accessibility.md | 모든 `img`는 `alt` 속성을 갖는다 (장식용은 `alt=""`). | 자동: axe |
| A11Y-04 | accessibility.md | `outline-none`을 쓸 때는 반드시 `focus-visible:ring-*`을 함께 쓴다. | 자동: 코드 |
| A11Y-05 | accessibility.md | `tabIndex`에 양수 값을 쓰지 않는다. | 자동: 코드 + axe |
| A11Y-06 | accessibility.md | 제목 단계를 건너뛰지 않고, 페이지당 `h1`은 1개다. | 자동: axe |
| A11Y-07 | accessibility.md | 텍스트와 함께 쓰는 아이콘(`svg`)은 `aria-hidden="true"`를 갖는다. | 자동: 코드 |
| A11Y-08 | accessibility.md | 즉시 알려야 하는 에러 요약은 `role="alert"`를 쓴다. | 수동 |
| A11Y-09 | accessibility.md | 인터랙티브 요소의 클릭 영역은 기본 44×44px 이상이다. | 수동 |
| WRT-01 | writing.md | 버튼 문구는 공백 포함 10자 이내이고 문장 부호로 끝나지 않는다. | 자동: 코드 |
| WRT-02 | writing.md | 버튼 문구는 "~기"로 끝나는 동사형(저장하기, 보내기, 더보기) 또는 허용된 표준 문구(확인, 취소, 닫기, 다음, 이전, 완료, 로그인, 로그아웃, 회원가입) 중 하나다. 진행 중 상태는 "~ 중"(예: 저장 중)을 허용한다. | 자동: 코드 |
| WRT-03 | writing.md | 위험 액션(danger) 버튼 문구는 "확인", "예", "OK"가 아니다. | 자동: 코드 |
| WRT-04 | writing.md | placeholder는 "예:"로 시작한다. | 자동: 코드 |
| WRT-05 | writing.md | 화면 문구는 해요체로 쓰고 "~습니다", "~십시오"로 끝나지 않는다. | 자동: 코드 |
| WRT-06 | writing.md | 에러 메시지는 원인과 해결 방법("~해 주세요" 등 행동 요청)을 모두 포함한다. | 자동: 코드 (키워드) |
| WRT-07 | writing.md | 라벨은 명사형이고 "입력하세요" 같은 지시문을 포함하지 않는다. | 자동: 코드 |
