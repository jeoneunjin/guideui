# GuideUI — v0 화면별 프롬프트

## 사용 순서

1. **공통 블록(0번)**: v0 프로젝트 설정에 지침(instructions)을 넣는 기능이 있으면 거기에 넣는다. 없으면 모든 화면 프롬프트 맨 앞에 붙여 넣는다.
2. **앱 셸(1번)** → **워크스페이스(2번)** → **가이드 관리(3번)** → **가이드 검색(4번)** → **랜딩(5번)** 순서로 생성한다. 가장 복잡한 워크스페이스를 먼저 검증하고, 랜딩은 마지막에 기존 스타일을 재사용하게 한다.
3. 화면마다 생성한 뒤 **6번 수정 프롬프트**로 한 가지씩만 다듬는다. 한 번에 여러 가지를 고치라고 하면 레이아웃이 흔들린다.

## 참고 자료와 다르게 작성한 부분

- **토큰은 새로 만들지 않고 Sample DS(`tokens.ts`)를 그대로 쓴다.** "우리 가이드로 우리 서비스도 만들었다"는 것 자체가 면접 스토리가 된다. 참고 자료에 있던 토큰은 `text-muted #7C8799`가 흰 배경 대비 약 3.6:1로 AA 기준에 미달하고, 캡션 12px은 우리 TYP-02 규칙과 충돌해서 쓰지 않았다.
- **UI 문구는 해요체로 통일한다** (Writing 가이드 WRT-05). 참고 자료의 "확인합니다", "관리합니다" 같은 문구는 모두 바꿨다.
- **가이드 검색의 인용은 줄 번호가 아니라 헤딩 경로로 표시한다.** 우리 RAG는 헤딩 단위로 청킹하기 때문에 `[button.md:L12-L18]` 대신 `[G1] Button > Variant별 스타일` 형식을 쓴다.
- **가이드 관리 표의 규칙 수는 실제 Sample DS 값을 쓴다.** "체크 미리보기"는 "청크 미리보기"로 바로잡았다.
- **워크스페이스 목업의 위반 예시를 바꿨다.** 미리보기에는 라벨이 있는 체크박스를 보여주면서 "체크박스 라벨 누락" 위반을 띄우면 화면끼리 모순되기 때문에, 화면에 보이지 않는 "제목 단계 건너뜀" 위반으로 바꿨다.
- **코드 에디터와 미리보기는 정적 목업으로 요청한다.** Monaco와 Sandpack은 STAGE 2~3에서 직접 붙일 예정이라 v0에는 설치하지 않게 한다.

---

## 0. 공통 블록 (모든 화면에 사용)

```text
You are building screens for GuideUI, a design-system-aware UI generation tool for frontend developers.
Use this design language consistently across all screens. It is our own design system ("GuideUI Sample DS"),
so the product UI must follow it exactly.

## Tokens — define these in the Tailwind theme so the class names below work exactly as written
Brand:
- brand-50 #eff6ff, brand-600 #2563eb, brand-700 #1d4ed8, brand-800 #1e40af

Text (text-fg-*):
- fg-primary #111827 (body, headings)
- fg-secondary #4b5563 (supporting text)
- fg-muted #6b7280 (helper text, captions — the lightest allowed text color)
- fg-inverse #ffffff (on brand-600 / danger-600)
- fg-brand #1d4ed8 (links, active nav)
- fg-error #dc2626

Surfaces:
- surface #ffffff (panels, header, inputs)
- surface-subtle #f9fafb (app background, hover)
- surface-muted #f3f4f6 (disabled, inactive areas)
- overlay rgb(17 24 39 / 0.5)

Lines:
- line #e5e7eb (dividers, panel borders)
- line-input #8b929c (input borders)
- line-focus #2563eb (focus ring)
- line-error #dc2626

Feedback (50 = background, 700 = text):
- danger-50 #fef2f2 / danger-600 #dc2626 / danger-700 #b91c1c
- success-50 #f0fdf4 / success-700 #15803d
- warning-50 #fffbeb / warning-700 #b45309
- info-50 #f0f9ff / info-700 #0369a1

Code surface (only inside code viewers):
- code-bg #0f172a, code-fg #e2e8f0

Radius:
- rounded-button 8px, rounded-input 8px, rounded-card 12px, rounded-modal 16px, rounded-full for badges and avatars
- Do not use rounded-md / rounded-lg / rounded-xl.

Shadow:
- shadow-card (hover state of clickable cards only), shadow-dropdown (menus, popovers), shadow-modal (dialogs)
- Prefer 1px borders over shadows everywhere else.

Spacing:
- Tailwind 4px scale. Semantic: gap-inline 8px, p-component 24px, py-section 48px.
- No arbitrary px values like p-[13px].

Typography (font-sans: Pretendard, system-ui, sans-serif):
- Page title: h1, text-2xl font-bold
- Section title: h2, text-xl font-bold (compact panels: text-base font-bold)
- Card / dialog title: text-lg font-bold
- Body: text-base; dense tool UI: text-sm
- Helper / caption: text-sm text-fg-muted
- Label: text-sm font-medium
- text-xs is allowed only in badges
- Weights: font-normal, font-medium, font-bold only

## Components
- Adapt shadcn/ui to these tokens: primary = brand-600, destructive = danger-600, border = line, input = line-input, ring = line-focus, radius = 8px.
- Button variants: primary (bg-brand-600 text-fg-inverse hover:bg-brand-700), secondary (bg-surface border border-line-input text-fg-primary hover:bg-surface-subtle), ghost (text-fg-brand hover:bg-brand-50), danger (bg-danger-600 text-fg-inverse).
- Button sizes: md h-11 (default), sm h-9 only inside dense toolbars and tables.
- Only one primary button per area. Secondary on the left, primary on the right.
- Focus style on every interactive element: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2
- Icons: lucide-react, only when they clarify meaning. Icons next to text get aria-hidden="true". Icon-only buttons need aria-label and are at least 44x44px (h-11 w-11) outside dense toolbars.

## Visual direction
- A quiet, mature internal developer tool — not a marketing template and not an "AI demo".
- Hierarchy comes from typography, alignment and spacing, not decoration.
- Brand color only for primary actions, active states, links and focus rings.
- Flat white panels separated by 1px borders. Do not nest cards inside cards.
- Moderate information density suitable for daily use.

## Copy
- All UI copy in natural Korean, polite 해요체 (e.g. "저장했어요", "다시 시도해 주세요"). Never use ~습니다 / ~십시오 endings.
- Buttons: short verb forms ending in ~기 (저장하기, 삭제하기) or standard words (확인, 취소, 닫기, 다음, 이전, 완료, 로그인). Max 10 characters, no punctuation.
- Error messages state the cause and the fix.
- No lorem ipsum, no placeholder names like "John Doe".

## Accessibility (WCAG 2.2 AA)
- Semantic landmarks: header, nav, main, aside, section. One h1 per page, no skipped heading levels.
- Every input has a visible label connected with htmlFor/id.
- Current navigation item uses aria-current="page". Tabs use role="tablist"/"tab"/"tabpanel" with aria-selected.
- Status is never conveyed by color alone — always include text.
- Dynamic status updates use aria-live="polite"; urgent errors use role="alert".

## Implementation
- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, lucide-react.
- Mock data only; no backend calls. Keep mock data in a separate file per screen.
- Reuse components across screens; do not recreate the same button or header per page.

## Do not
- No gradients, glassmorphism, glow, neon, sparkle/robot/magic-wand icons, or decorative AI imagery.
- No random colors or hex values outside the tokens above.
- No oversized hero headings or rows of decorative stat cards.
- Do not invent pages or features that are not described in the screen prompt.
```

---

## 1. 공통 앱 셸 (헤더 + 레이아웃)

```text
Create the shared application shell for GuideUI that all in-app screens (workspace, guide management, guide search) will reuse.

Header (height 56px, bg-surface, border-b border-line, sticky top):
- Left: "GuideUI" wordmark as a link to "/" (text-base font-bold text-fg-primary).
- Next to the wordmark: a guide-set selector showing "가이드: Sample DS" with a chevron (shadcn Select or DropdownMenu, accessible label "적용할 가이드").
- Next to the selector: a switch labeled "가이드 적용" with visible state text ("켜짐" / "꺼짐"). This controls whether generation uses the design guide.
- Right: a <nav aria-label="주 메뉴"> with text links "워크스페이스", "가이드 관리", "가이드 검색". The current page uses aria-current="page" and text-fg-brand font-medium; others text-fg-secondary with hover:bg-surface-subtle. Each link is h-11 with px-3 and rounded-button.

Body:
- Background bg-surface-subtle. Main content area below the header fills the remaining viewport height.
- Export the shell as a layout component that takes the active nav item and page content.

Mobile (< 768px):
- Hide the text links and the guide selector behind a menu button (aria-label "메뉴 열기", aria-expanded, aria-controls).
- The menu opens as a right-side sheet with bg-overlay behind it, shadow-modal, closes with Esc, and traps focus.
- Keep the "가이드 적용" switch visible inside the sheet.

Provide a simple demo page that renders the shell with "워크스페이스" active so the header can be reviewed alone.
```

---

## 2. 워크스페이스 (메인 화면)

```text
Create the main workspace screen for GuideUI using the existing application shell with "워크스페이스" active.

Context:
A frontend developer types a UI request, GuideUI generates a React component that follows the team's design guide,
and the developer reviews the code, compares versions, previews the result, and fixes accessibility violations.

Primary flow on this screen:
1. Send a request in the chat panel.
2. Watch the answer and code stream in.
3. Review Code / Diff / version history.
4. Check the live preview and the accessibility result.
5. Apply "AI로 고치기" when a violation is found.

Desktop layout (≥ 1024px):
- Three resizable columns below the header, separated by draggable 1px dividers (use shadcn Resizable). Each column scrolls independently; the page itself does not scroll.
  1. Chat panel — default 300px, min 260px.
  2. Editor panel — flexible, takes the remaining width.
  3. Preview + accessibility panel — default 360px, min 320px.
- Panels are flat bg-surface areas separated by border-line. No card-in-card.

Chat panel (<aside aria-label="채팅">):
- Message list:
  - User message: "로그인 폼 만들어줘"
  - Assistant message: "가이드에 맞춰 이메일·비밀번호 입력과 로그인 유지 체크박스가 있는 로그인 폼을 만들었어요. [G1][G2]"
  - Under the assistant message, a row labeled "참고한 가이드" with source chips "[G1] Form > 필드 구조" and "[G2] Button > Variant별 스타일". Chips are buttons that open a dialog showing the source section text.
- Messages are text-focused: no avatars, no robot icons. User messages right-aligned on bg-brand-50, assistant messages left-aligned on bg-surface-subtle, both rounded-card, text-sm.
- Above the input: a horizontal row of example prompt buttons (variant ghost, size sm): "회원가입 폼", "상품 카드", "삭제 확인 모달".
- Bottom composer: a labeled textarea (visible label "요청 입력", placeholder "예: 이메일 입력이 있는 뉴스레터 구독 폼"), a primary button "보내기", and a hint "Ctrl + Enter로 보내기" in text-sm text-fg-muted.
- While streaming, the "보내기" button is replaced by a secondary button "중단하기".

Editor panel (<section aria-label="코드">):
- Top bar with tabs "코드", "Diff", "버전" (role tablist, aria-selected) on the left, and on the right a version selector "v3 · AI 수정" plus ghost actions "복사하기" and "다운로드하기" (icon + text).
- Code tab: a static code viewer (a styled <pre>, not a real editor — the real editor will be added later) with bg-code-bg text-code-fg, font-mono text-sm, line numbers, and horizontal scrolling inside the viewer only. Show this realistic code:

export default function GeneratedComponent() {
  return (
    <form className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-fg-primary">로그인</h3>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">이메일</label>
        <input id="email" type="email" autoComplete="email" placeholder="예: name@example.com" className="h-11 rounded-input border border-line-input px-3" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
        <input id="password" type="password" autoComplete="current-password" className="h-11 rounded-input border border-line-input px-3" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" />
        로그인 상태 유지
      </label>
      <button type="submit" className="h-11 rounded-button bg-brand-600 font-medium text-fg-inverse">로그인</button>
    </form>
  );
}

- Highlight line 4 (the h3) with a subtle left marker to show the violation location.
- Diff tab: a static two-column diff between v2 and v3 where line 4 changes from <h3 ...> to <h2 ...>, using success-50/danger-50 line backgrounds plus "+"/"−" markers (not color alone).
- 버전 tab: a list of versions — "v3 · AI 수정 · 접근성 100 · 방금 전", "v2 · 생성 · 접근성 92 · 2분 전", "v1 · 생성 · 접근성 78 · 5분 전" — each with a secondary sm button "되돌리기".

Preview + accessibility panel (<section aria-label="미리보기">):
- Upper part "미리보기": a bordered frame (border-line, rounded-card, bg-surface, p-component) showing the rendered login form: 이메일 label + input, 비밀번호 label + input, a checkbox with visible label "로그인 상태 유지", and a full-width primary button "로그인". All labels connected with htmlFor/id.
- Lower part "접근성 검사" (h2, text-base font-bold):
  - Summary line: "접근성 점수 92점 · 위반 1건 · 확인 필요 1건".
  - Violation list grouped by severity. One item:
    badge "심각" (bg-danger-50 text-danger-700) + "제목 단계를 건너뛰었어요 (h1 없이 h3 사용)" + a link-style button "4번째 줄 보기".
  - One "확인 필요" item: badge "확인 필요" (bg-warning-50 text-warning-700) + "입력 필드 설명이 충분한지 확인해 주세요".
  - Primary button "AI로 고치기" and a ghost button "다시 검사하기".
  - An after-fix comparison block (shown in the "fixed" state): "92점 → 100점 · 위반 1건 → 0건 · 해결: heading-order".
- Put the summary line inside aria-live="polite".

States (implement all with mock data; switch via a ?state= query param for review):
- empty: no messages yet. Chat shows a short intro "만들고 싶은 UI를 설명해 주세요. 적용 중인 가이드에 맞춰 코드를 만들어요." with the example prompt buttons. Editor and preview show calm empty messages, not illustrations.
- streaming: assistant message is being typed with a text cursor, code viewer is partially filled, preview shows "코드 생성이 끝나면 미리보기가 표시돼요", "중단하기" is visible, status text "생성 중" in aria-live.
- done: the full state described above.
- fixed: v3 selected, accessibility 100점, comparison block visible.
- error: an inline alert (role="alert", bg-danger-50 text-danger-700, rounded-card) in the chat: "응답을 받지 못했어요. 네트워크를 확인한 뒤 다시 시도해 주세요." with a secondary button "다시 시도하기".

Mobile (< 1024px):
- Replace the three columns with tabs "채팅", "코드", "미리보기" directly under the header (role tablist). The accessibility section lives inside the "미리보기" tab.
- The composer stays pinned to the bottom of the 채팅 tab. No horizontal page overflow at 360px width.
```

---

## 3. 가이드 관리

```text
Create the "가이드 관리" screen for GuideUI using the existing application shell with "가이드 관리" active.

Context:
A frontend lead uploads the team's design-guide Markdown files. GuideUI splits each file into chunks by heading,
creates embeddings, and uses them when generating components. On this screen the user checks that every file
was processed and inspects how it was chunked.

Page layout (main, max-w-6xl, centered, px-4 py-8):
- Page header:
  - h1 "가이드 관리"
  - Description (text-sm text-fg-secondary): "컴포넌트를 생성할 때 참고할 디자인 가이드 문서를 관리해요."
  - Right side: guide-set name "Sample DS · 문서 8개" and a primary button "문서 올리기".
- Upload area below the header:
  - A dashed-border drop zone (border-line-input, rounded-card, bg-surface). Text: "Markdown(.md) 파일을 끌어다 놓거나 선택해 주세요" and helper "파일당 1MB 이하 · 헤딩(#, ##) 기준으로 나눠 저장해요".
  - The zone itself is a real button that opens the file picker, and the hidden file input has an accessible label "가이드 문서 선택".
- Documents table (shadcn Table inside a bg-surface panel with border-line and rounded-card, no extra card wrapper):
  Columns: 문서, 상태, 청크, 규칙, 마지막 수정, (actions)
  Rows:
  - tokens.md · 처리 완료 · 청크 11개 · 규칙 12개 · 9월 24일 오후 2:10
  - button.md · 처리 완료 · 청크 8개 · 규칙 9개 · 9월 24일 오후 2:10
  - form.md · 처리 중 · — · — · 방금 전
  - card.md · 처리 완료 · 청크 7개 · 규칙 7개 · 9월 24일 오후 2:11
  - navigation.md · 처리 완료 · 청크 8개 · 규칙 7개 · 9월 24일 오후 2:11
  - modal.md · 처리 완료 · 청크 6개 · 규칙 7개 · 9월 24일 오후 2:11
  - accessibility.md · 실패 · — · — · 9월 24일 오후 2:12
  - writing.md · 처리 완료 · 청크 9개 · 규칙 7개 · 9월 24일 오후 2:12
  Status badges always combine icon + text:
  - 처리 완료: bg-success-50 text-success-700, check icon
  - 처리 중: bg-info-50 text-info-700, spinning loader icon (motion-reduce:animate-none), plus progress text "임베딩 생성 중 (5/9)"
  - 실패: bg-danger-50 text-danger-700, alert icon, plus a second line "파일을 읽지 못했어요. 인코딩을 UTF-8로 바꿔 다시 올려 주세요."
  Actions per row (ghost sm buttons with text): "청크 보기" for completed rows, "다시 올리기" for failed rows, and an icon-only "문서 삭제" button (aria-label "{문서명} 삭제") opening a confirmation dialog.
- Status column changes are announced in an aria-live="polite" region.

Chunk preview (opens as a right-side sheet when "청크 보기" is clicked, e.g. for button.md):
- Title "button.md 청크 8개".
- A list of chunks, each showing: heading path (e.g. "Button > Variant 선택 기준"), token count ("412 토큰"), and the first 3 lines of text in text-sm text-fg-secondary. Rule IDs found in the chunk are shown as small badges (e.g. "BTN-01").

Delete confirmation dialog:
- role="dialog", aria-modal, labelled by its title.
- Title "button.md를 삭제할까요?"
- Body "삭제하면 이 문서의 청크가 모두 지워지고, 이후 생성에 반영되지 않아요."
- Buttons: secondary "취소" (left), danger "삭제하기" (right). Close icon button with aria-label "닫기". Esc closes it.

States (switch via ?state= query param):
- empty: no documents. Show the upload area plus a short guide: "아직 올린 가이드가 없어요. 샘플 가이드로 먼저 체험해 보거나 팀 문서를 올려 주세요." with a secondary button "샘플 가이드 불러오기".
- uploading: a row at the top of the table with a progress bar (shadcn Progress, aria-label "업로드 진행률") and "업로드 중 64%".
- default: the table above.

Mobile:
- The table becomes a stacked list where each document shows name, status badge, counts, and actions. No horizontal page overflow at 360px.
```

---

## 4. 가이드 검색

```text
Create the "가이드 검색" screen for GuideUI using the existing application shell with "가이드 검색" active.

Context:
A developer asks a question about the team's design guide before generating or reviewing a component.
GuideUI searches the guide chunks, streams a short answer with numbered citations, and shows the matching chunks.
This is a documentation search interface, not a chatbot.

Page layout (main, max-w-6xl, centered, px-4 py-8):
- h1 "가이드 검색", description "팀 디자인 가이드에서 규칙을 찾아 요약해 드려요." (text-sm text-fg-secondary)
- Search form:
  - Visible label "질문" connected to a large input (h-12, rounded-input, border-line-input) with placeholder "예: 주 버튼은 어떤 색을 써야 하나요?"
  - Primary button "검색하기" to the right of the input.
  - Below: "최근 검색" with 3 ghost sm buttons: "에러 메시지 문구 규칙", "모달 닫기 버튼", "카드 그림자".
- Results area (two columns on desktop):
  - Main column (max-w-2xl): the answer.
  - Side column (w-80): related chunks.

Answer column (<section aria-labelledby="answer-title">):
- h2 "답변" (text-xl font-bold) and a text-sm text-fg-muted line "Sample DS · 청크 3개 참고".
- Answer body (text-base leading-relaxed, max line length ~70ch):
  "주 액션 버튼은 배경에 brand-600, 글자에 fg-inverse를 써요 [G1]. 한 영역에는 주 버튼을 하나만 두고, 보조 버튼은 왼쪽, 주 버튼은 오른쪽에 배치해요 [G2]. 비활성 상태는 disabled 속성과 50% 투명도로 표시해요 [G3]."
- Citation markers [G1] [G2] [G3] are keyboard-accessible links that scroll to and focus the matching chunk card on the right.
- Actions under the answer: secondary "원문 보기" and primary "이 규칙으로 생성하기" (goes to the workspace with the question prefilled).
- The answer region uses aria-live="polite" so streamed text is announced without interrupting.

Related chunks column (<aside aria-label="관련 가이드">):
- h2 "관련 가이드" (text-base font-bold).
- Three chunk items as a simple list separated by border-line (not heavy cards). Each shows:
  - Citation number badge "G1"
  - Heading path "Button > Variant별 스타일"
  - Document "button.md"
  - Similarity as text and a thin bar: "유사도 0.86" (the bar is aria-hidden; the text carries the meaning)
  - Two-line excerpt in text-sm text-fg-secondary
  - Link "원문에서 보기"
  Items:
  - G1 · Button > Variant별 스타일 · button.md · 0.86
  - G2 · Button > 배치 · button.md · 0.79
  - G3 · Button > 상태 · button.md · 0.74

States (switch via ?state= query param):
- initial: no query yet. Show 4 example questions as buttons ("입력 필드 에러는 어떻게 표시하나요?", "배지는 어떤 색 조합을 쓰나요?", "모달에 꼭 필요한 속성은?", "버튼 문구 규칙이 뭔가요?").
- loading: skeleton lines in the answer column and 3 skeleton items on the right (motion-reduce:animate-none), with aria-busy="true" on the results area.
- streaming: the answer is partially written with a cursor; chunks are already visible.
- no-result: "가이드에서 관련 내용을 찾지 못했어요. 다른 표현으로 검색하거나 문서가 올라와 있는지 확인해 주세요." with a secondary button "가이드 관리로 가기".
- error: role="alert" inline alert "검색하지 못했어요. 잠시 후 다시 시도해 주세요." with a secondary button "다시 시도하기".
- result: the full state described above.

Mobile:
- Single column: answer first, related chunks below. The search button goes under the input at full width.
```

---

## 5. 랜딩

```text
Create the landing page for GuideUI at "/". It does not use the in-app shell; it has its own minimal header.

Context:
GuideUI generates React components from natural-language requests, following the team's design guide, and checks
accessibility automatically. Visitors are frontend developers, designers, and interviewers looking at a portfolio project.
The single goal is to make the workflow clear and send people into the sample workspace.

Header (h-14, bg-surface, border-b border-line):
- Left: "GuideUI" wordmark.
- Right: text link "GitHub" (opens the repository) and a secondary sm button "바로 체험하기".

Hero (bg-surface-subtle, py-section, centered text, max-w-3xl):
- h1 (text-2xl md:text-3xl font-bold): "팀 가이드대로 UI를 만들고, 접근성까지 확인해요"
- Supporting text (text-base text-fg-secondary): "원하는 화면을 설명하면 디자인 가이드를 참고해 React 컴포넌트를 만들고, 접근성 문제를 찾아 고쳐 드려요."
- Actions: primary "바로 체험하기" (to the workspace with the sample guide), secondary "가이드 살펴보기" (to the guide search page).
- No illustrations, no 3D, no glow.

Product preview (directly under the hero, max-w-6xl):
- A wide bordered panel (border-line, rounded-card, bg-surface, shadow-card) that looks like a real screenshot of the workspace:
  three columns (chat / code / preview + accessibility) with the same login-form content as the workspace screen,
  scaled down. It is a static, non-interactive image-like component with role="img" and aria-label "GuideUI 워크스페이스 화면 예시".

How it works (py-section, max-w-5xl):
- h2 "이렇게 동작해요"
- Four steps in a horizontal row on desktop (vertical on mobile), each with a number, a title and one sentence, separated by thin dividers — not cards:
  1. "설명하기" — "만들고 싶은 화면을 문장으로 적어요."
  2. "가이드 찾기" — "관련된 디자인 규칙을 가이드 문서에서 찾아요."
  3. "생성하기" — "규칙을 반영한 코드가 실시간으로 작성돼요."
  4. "검사하고 고치기" — "접근성 위반을 찾아 AI가 고치고 다시 검사해요."

Capabilities (max-w-5xl):
- Three items in a simple 3-column grid with a small lucide icon each (aria-hidden) and text:
  - "가이드 기반 생성" — "업로드한 디자인 가이드의 토큰과 규칙을 따라 코드를 만들어요. 어떤 규칙을 참고했는지 출처도 보여 줘요."
  - "대화로 다듬기" — "'에러 상태도 추가해 줘'처럼 이어서 요청하고, 버전별 변경 내용을 비교할 수 있어요."
  - "접근성 자동 검사" — "axe-core로 WCAG 기준 위반을 찾고, AI 수정 전후 점수를 비교해요."

Footer (border-t border-line, py-8, text-sm text-fg-muted):
- "GuideUI · 프론트엔드 포트폴리오 프로젝트" on the left, "GitHub" link on the right.

Responsive:
- Mobile: hero actions stack full-width; product preview becomes a horizontally cropped view inside its own overflow-hidden frame (no page-level horizontal scroll).
```

---

## 6. 생성 후 수정 프롬프트

한 번에 하나씩 사용한다.

### 6-1. AI 느낌 줄이기

```text
Make this screen feel like a mature internal developer tool rather than an AI-generated demo.
Keep the layout, content and functionality exactly as they are.
- Remove any gradients, glow, sparkle/robot/magic icons, and decorative illustrations.
- Replace nested cards with flat bg-surface panels separated by 1px border-line.
- Keep only icons that clarify an action or status.
- Use typography, alignment and spacing to create hierarchy instead of color blocks.
- Use brand-600 only for primary actions, selected tabs, active nav, links and focus rings.
```

### 6-2. 레이아웃 안정화 (워크스페이스)

```text
Stabilize the workspace layout without redesigning it.
- Keep the 56px header fixed; the three columns below fill the remaining height and scroll independently.
- Default widths: chat 300px, preview 360px, editor takes the rest; respect the minimum widths.
- The code viewer scrolls horizontally inside itself; the page never scrolls horizontally.
- Below 1024px switch to the 채팅 / 코드 / 미리보기 tabs; keep the preview form readable at 360px.
- Do not use fixed heights for content inside panels.
```

### 6-3. 가이드 준수 감사

```text
Audit this screen against the GuideUI Sample DS rules below and fix only the violations.
Do not change layout, copy, or add new tokens. After the changes, list each rule ID and what you changed.

- TKN-01: No arbitrary color values (bg-[#...], text-[#...]).
- TKN-02: No arbitrary px spacing (p-[13px]). Exception: viewport-based values like max-h-[60vh].
- TKN-03: Radius only rounded-button / rounded-input / rounded-card / rounded-modal / rounded-full.
- TKN-04: Shadows only shadow-card / shadow-dropdown / shadow-modal.
- CLR-01: Text colors only text-fg-* (or feedback 700 tokens inside badges/alerts). No text-gray-*.
- TYP-01: Font weights only font-normal / font-medium / font-bold.
- BTN-01: Primary actions use bg-brand-600 text-fg-inverse.
- BTN-03: Only one primary button per area.
- BTN-07: Every <button> has an explicit type.
- BTN-08: Navigation uses <a>, actions use <button>. No onClick on div/span.
- FRM-01: Every input has a visible label connected with htmlFor/id.
- NAV-02: The current nav item has aria-current="page".
- NAV-07: Tabs use role tablist/tab/tabpanel with aria-selected.
- MDL-01: Dialogs use role="dialog", aria-modal="true", aria-labelledby.
- A11Y-02: Icon-only buttons have aria-label.
- A11Y-04: outline-none is always paired with focus-visible:ring-*.
- A11Y-07: Icons next to text have aria-hidden="true".
- WRT-05: UI copy uses 해요체; no ~습니다 / ~십시오 endings.
```

### 6-4. 화면 간 일관성 감사 (모든 화면 생성 후)

```text
Review the workspace, guide management, guide search and landing screens together and make them consistent.
- Same header component, height and nav styles on all in-app screens.
- Same Button variants and sizes for the same meaning (e.g. every "다시 시도하기" is secondary md).
- Same badge styles for the same status across screens.
- Same page title / description / spacing pattern on 가이드 관리 and 가이드 검색.
- Remove duplicated components and reuse the shared ones.
List the files you changed and why.
```

### 6-5. 상태 보강 (필요할 때)

```text
Add the missing states for this screen using the existing components and tokens only:
empty, loading (skeleton, with aria-busy), error (role="alert" with a cause + fix message and a "다시 시도하기" button),
and success. Keep all copy in 해요체. Make each state reachable via the ?state= query param. Do not change the default state.
```

---

## 7. 결과 확인 체크리스트

- [ ] 모든 화면의 헤더가 같은 컴포넌트, 같은 높이인가?
- [ ] 토큰에 없는 색상(hex, `text-gray-*`)이 들어가지 않았는가?
- [ ] `rounded-md`, `shadow-lg` 같은 기본 클래스가 섞이지 않았는가?
- [ ] 한 영역에 primary 버튼이 하나뿐인가?
- [ ] 문구가 전부 해요체이고, 버튼 문구가 10자 이내인가?
- [ ] 모든 input에 보이는 label이 연결되어 있는가?
- [ ] 현재 메뉴에 `aria-current`, 탭에 `aria-selected`가 있는가?
- [ ] 아이콘 전용 버튼에 `aria-label`이 있는가?
- [ ] 상태를 색상만으로 표현하지 않고 텍스트가 함께 있는가?
- [ ] 360px 너비에서 가로 스크롤이 생기지 않는가?
- [ ] `?state=` 로 empty / loading / error 상태를 모두 확인할 수 있는가?

v0 결과물을 레포에 가져온 뒤에는 **GuideUI 자체 화면에 axe를 돌려 위반 0건을 확인**해 두면 좋다. "접근성 검사 도구의 접근성"은 면접에서 자주 찔리는 부분이다.
