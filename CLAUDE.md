@AGENTS.md
# GuideUI — 프로젝트 맥락 (Claude Code용)

## 대화 방식
- 한국어, 편한 반말로 대화한다.
- 사용자는 git/터미널 흐름에 아직 익숙하지 않다. 이슈를 시작하거나 커밋·PR을 만들 때는 실행할 명령과 각 명령이 하는 일을 짧게 설명한다.
- 파일을 크게 바꾸기 전에는 계획을 먼저 보여주고 확인을 받는다.

## 서비스 요약
GuideUI는 팀 디자인 가이드 문서를 RAG로 검색해, 채팅으로 요청한 UI를 그 가이드에 맞는 React 컴포넌트로 생성하고,
결과물의 접근성을 axe-core로 검사한 뒤 AI로 자동 수정하는 서비스다. 프론트엔드 취업 포트폴리오 프로젝트.
핵심 루프: 가이드 검색 → 생성(스트리밍) → 접근성 검사 → 자동 수정.

## 주요 문서 위치
- `docs/GuideUI_기획_및_구현계획서.pdf` — 전체 기획, 아키텍처, STAGE 0~11 구현 계획 (기준 문서)
- `docs/v0-prompts.md` — v0 화면 생성 프롬프트와 수정 이력
- `sample-guide/` — 샘플 디자인 가이드 8종 + `tokens.ts`. 규칙마다 ID(TKN-01, BTN-03 …)가 있고 README에 전체 목록이 있다.
- `eval/prompts.json` — 평가용 프롬프트 25개 (tuning 20 + holdout 5). holdout은 튜닝에 쓰지 않는다.
- GitHub 이슈/마일스톤 — STAGE별 할 일. `gh issue list --milestone "..."`로 확인.

## 기술 스택
Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Zustand(UI 상태) · TanStack Query(서버 상태) · Zod ·
Vercel AI SDK · Supabase(Postgres + pgvector) · Sandpack(미리보기) · Monaco(에디터) · axe-core · Vitest · Playwright.
패키지 매니저는 npm (package-lock.json). 배포는 Vercel, PR마다 프리뷰 배포.

## LLM 비용 결정
- 유료 API는 쓰지 않는다. `LLM_PROVIDER=mock | gemini | anthropic` 환경 변수로 제공자를 바꿀 수 있게 설계한다.
- 기본값은 여전히 `mock`. STAGE 2(#26)에서 `lib/llm.ts`에 Gemini **생성** 분기만 예외적으로 먼저 연결함
  (튜닝 프롬프트를 실제로 돌려봐야 했던 이슈라 사용자와 상의 후 최소로 당겨옴) — `@ai-sdk/google`,
  모델은 `gemini-3.1-flash-lite`(무료 티어, 응답 3~5초대; `gemini-3.8-flash`는 이 글 작성 시점엔 수요
  폭주로 60~100초씩 걸려서 실사용에 안 맞았음 — 모델 가용성은 계속 바뀌니 막히면 다시 확인). 임베딩
  연결은 아직 없음, STAGE 5(#42)에서.
- 키는 `.env.local`의 `GOOGLE_GENERATIVE_AI_API_KEY`.
- pgvector 컬럼 차원은 실제 임베딩 모델 차원에 맞춘다. HNSW 인덱스는 2000차원 이하여야 한다.

## 코드 규칙
- 서비스 UI도 Sample DS를 따른다: 토큰 클래스만 사용(`text-fg-*`, `bg-surface`, `rounded-button` 등),
  임의 hex/px 값 금지, `rounded-md`/`shadow-lg` 같은 기본 클래스 금지.
- UI 문구는 해요체. 버튼 문구는 공백 포함 10자 이내.
- 접근성: 모든 input은 보이는 label 연결, 아이콘 전용 버튼은 aria-label, outline-none 쓰면 focus-visible:ring 필수.
- 폴더 구조:
  - `app/` 라우트만 (page.tsx는 searchParams 읽고 feature 조립)
  - `components/ui/` shadcn 기본 컴포넌트 (경로 변경 금지)
  - `components/layout/` 여러 화면이 공유하는 틀 (app-shell 등)
  - `features/{landing,workspace,a11y,guides}/` (chat/editor/preview는 `features/workspace/` 하위 파일)
  - `mocks/` 화면별 목업 데이터
  - `lib/` 공통 유틸
- 디자인 토큰 소스는 `sample-guide/tokens.ts`(Sample DS 스펙, RAG·eval 채점 기준)와
  `lib/app-tokens.ts`(GuideUI 서비스 전용, 예: code-bg/fg) 두 개다. 값을 바꾸면
  `npm run tokens:sync`로 `app/globals.css`를 재생성하고, 커밋 전 `npm run tokens:check`로
  어긋남이 없는지 확인한다. `globals.css`의 `AUTO-GENERATED` 블록은 직접 손으로 고치지 않는다.

## 작업 흐름 (이슈 1개 = 브랜치 1개 = PR 1개)
요약만 적는다. 실제로 브랜치 만들기/PR 올리기/머지하기를 진행할 때는 `.claude/skills/ship/SKILL.md`
절차(잔실수 방지 포함: next-env.d.ts 되돌리기, squash 머지 후 `git branch -D` 등)를 따른다.
1. `git switch main && git pull` → `git switch -c 종류/이슈번호-설명` (종류: feat, refactor, chore, test, docs, fix)
2. 작업 → 커밋 → `git push -u origin 브랜치` → `gh pr create` (`Closes #번호` 또는 부분 완료면 `Refs #번호`)
3. Vercel 프리뷰를 사용자가 확인할 때까지 머지하지 않는다 → 확인되면 `gh pr merge --squash --delete-branch` → 로컬 정리
- 한 PR에서 파일 이동과 코드 수정을 섞지 않는다.
- 커밋 전 `npx tsc --noEmit`, `npm run build` 확인.

## 현재 상태 (여기부터 이어서)
- STAGE 0·STAGE 1 완료. STAGE 1 마일스톤 닫힘 (이슈 13개 전부: #7, #8, #9, #10, #11, #12, #13, #14, #15, #16, #17, #80, #82).
- 완료(간단 요약, 자세한 배경은 git log/PR 참고):
  - #7 v0 목업 가져오기, #8 폴더 구조 정리(features/*, mocks/), #17 Vercel 배포 연결 — 이미 돼 있던 걸 확인만 하고 닫음.
  - #80 v0 원본 타입 에러 5개 수정 + `next.config`의 `ignoreBuildErrors` 제거.
  - #9 디자인 토큰 단일 소스화 — `sample-guide/tokens.ts`/`lib/app-tokens.ts`가 소스,
    `npm run tokens:sync`가 `globals.css` 생성. shadcn 변수를 Sample DS 토큰에 연결,
    다크 모드 자동전환 블록 제거(라이트 전용 고정). Pretendard 폰트 실제 로딩은 후속 이슈 #82로 분리.
  - #10 화면 상태 props화 — `lib/dev-state.ts`의 `resolveDevState()`로 `?state=`가
    `next dev`에서만 동작하고 빌드된 환경(Vercel 포함)에서는 무시됨.
  - #13 Zustand `workspaceStore` 뼈대 — `features/workspace/workspace-store.ts`,
    status 유니온(idle/streaming/rendering/checking/fixing/done/error/aborted) 정의.
    기존 화면의 로컬 state는 아직 안 건드림(실제 로직 붙을 때 연결 예정).
  - #14 Provider 구성 — `components/layout/providers.tsx`에 TanStack Query
    `QueryClientProvider`, `app/layout.tsx`에 연결. devtools는 실제 쿼리 생기면 추가.
  - #11 env Zod 검증 — `lib/env.ts`가 `LLM_PROVIDER`(mock/gemini/anthropic, 기본값 mock)와
    `GOOGLE_GENERATIVE_AI_API_KEY`(gemini일 때만 필수) 검증. `.env.example` 추가.
    anthropic용 키는 아직 안 씀(변수명도 안 정해짐)이라 검증 대상 아님. 아직 이 값을 실제로
    쓰는 코드가 없어서 어디서도 import 안 함 — STAGE 4 생성 로직 붙을 때 연결.
  - #12 Supabase 프로젝트 생성 및 초기 마이그레이션 — `supabase` CLI를 devDependency로 추가,
    `supabase/migrations/`에 기획서 5.4절 스키마(vector 확장 + 7개 테이블: sessions, messages,
    component_versions, guide_sets, guide_documents, guide_chunks, usage_logs)를 작성해 실제
    Supabase 프로젝트(project ref `gbjxtcyvsuxorrykzwhc`)에 `supabase db push`로 적용함.
    `guide_chunks.embedding`은 `vector(768)`(Gemini `text-embedding-004` 기준, 모델 바뀌면 전체
    재임베딩 필요). `lib/supabase/client.ts`나 `lib/env.ts`의 Supabase 키 검증, RLS 정책,
    `match_guide_chunks` 함수는 아직 안 만듦 — 실제로 이 DB를 쓰는 코드가 생기는 STAGE 4/5에서
    같이 연결 예정.
  - #15 접근성 기준선 테스트 — `playwright.config.ts` + `e2e/a11y.spec.ts`가 랜딩·워크스페이스(5개 상태)·
    검색(6개 상태)·가이드 관리(3개 상태) 총 15개 화면×상태 조합을 WCAG 2.2 AA 태그로만 axe 검사(위반 0건).
    `?state=`가 `next dev`에서만 동작해서 Playwright의 `webServer`도 `next dev`를 띄움 — 빌드된
    환경 대상 테스트가 아님. `.github/workflows/a11y.yml`이 PR·main 푸시마다 실행. 검사 중 실제
    위반 5건(코드 패널 대비, 스위치 접근 가능한 이름, 리사이즈 핸들 aria-valuenow, 인용 링크 구분 수단)을
    찾아 같이 고침. 데스크톱 뷰포트만, 클릭으로 여는 다이얼로그는 범위 밖(후속 과제로 남김).
  - #16 디자인 기록 정리 — `docs/design/`에 랜딩·워크스페이스(done)·가이드 검색(result)·
    가이드 관리(default) 4개 화면 스크린샷, `scripts/capture-design-screenshots.mjs` +
    `npm run design:screenshots`로 재생성 가능. `docs/v0-prompts.md`는 그대로 둠(이미 있던 문서).
  - #82 Pretendard·JetBrains Mono 웹폰트 실제 로딩 — `lib/fonts.ts`에서 `next/font/local`(pretendard
    npm 패키지) + `next/font/google`(JetBrains Mono)로 셀프호스팅, `<html>`에 CSS 변수로 주입.
    `app/globals.css`의 `AUTO-GENERATED` 블록은 그대로 두고 그 아래에 `--font-sans`/`--font-mono`를
    재선언해서 next/font 변수를 우선 사용하게 함(같은 `@theme` 규칙 안에서 나중 선언이 이기는 특성 이용).
    `tokens.ts`/`sync-tokens.mjs`는 안 건드림.
- 후속 과제로 남은 것(별도 이슈로 만들 것): 모바일 뷰포트 접근성 검사, 클릭으로 여는 다이얼로그
  (참고한 가이드/삭제 확인) 접근성 검사 — #15에서 의도적으로 범위 밖으로 뺐음. "참고한 가이드" 다이얼로그
  자체는 #102에서 UI까지 제거했으니(아래 참고) 이 항목은 실질적으로 삭제 확인 모달류만 남음.
- 알아두면 좋은 것: `app/layout.tsx`의 `viewport.colorScheme`/`themeColor`가 여전히
  라이트/다크 둘 다 선언돼 있어서(#9에서 CSS만 라이트로 고정함) 브라우저 UI 색상 힌트가
  실제 화면과 안 맞을 수 있음 — 아직 안 고쳐짐, 필요해지면 별도 이슈로.

### STAGE 2 · 생성 코어·미리보기 완료 (이슈 10개: #18~#26, #102)
비스트리밍으로 "프롬프트 → 코드 → 렌더" 전체 루프가 실제로 동작한다(목업 아님). 완료 기준
(렌더 에러 없음, 허용 안 된 import 차단)을 실제 Gemini 모델로 검증 완료(#26).
- #18 `/api/chat` 비스트리밍 — `generateText` + `lib/generate-prompt.ts`의 시스템 프롬프트.
  `<guidelines></guidelines>`는 아직 빈 블록(RAG 주입은 #47).
- #19 `extractCode` — 응답에서 첫 번째 \`\`\`tsx 펜스만 추출(`lib/code/extract-code.ts`).
- #20·#21 Sandpack 미리보기 — `features/workspace/sandbox-files.ts`(Tailwind CDN + 토큰 config 주입),
  `features/workspace/sandbox-components.ts`(Button/Input/Label/Card/Badge 5종 가상 파일, 샌드박스
  안에선 외부 npm 패키지 못 씀). dev 모드에서만 React StrictMode 이중 마운트 때문에 Sandpack이 멈춰
  보이는 알려진 제약 있음(프로덕션 빌드·Vercel은 영향 없음) — Sandpack 관련 확인은 `npm run build &&
  npm start`로 하는 습관 들일 것.
- #22 import 화이트리스트 검증 — `lib/code/validate-imports.ts`(@babel/parser로 AST 파싱) + `/api/chat`에서
  위반 시 1회 자동 재생성, 그래도 안 되면 422.
  화이트리스트는 `lib/code/allowed-imports.ts`에 상수로 분리(시스템 프롬프트 문구와 같은 소스 공유).
- #23 미리보기 에러 UI — `useSandpack()`으로 컴파일/런타임 에러 직접 감지해서 커스텀 UI(Sandpack 기본
  오버레이 끔). Sandpack이 일부 JSX 문법 오류를 TypeError로 한 번 더 감싸서 내보내는 경우가 있어
  `error.title==='SyntaxError'`만으론 부족, `error.message` 포함 여부도 같이 봄.
- #24 Monaco 에디터 연결 — `features/workspace/editor.tsx`. `language="typescript"` + `path`를 `.tsx`로
  줘야 구문 강조와 JSX 파싱이 둘 다 됨(`language="typescriptreact"`는 Monarch 문법 자체가 없어서 구문
  강조가 깨짐 — 한 번 겪은 실수). Sandpack `files` prop은 `code`에 반응하게 둬야 함 —
  `sandpack.updateFile()`로 최적화하려 했다가 provider가 `status==='idle'`로 떨어진 뒤엔 그 호출이
  조용히 무시되는 버그를 만들었음(실사용자가 "미리보기 반영 안 됨"으로 리포트해서 발견, #102 때 되돌림).
- #25 코드 복사·다운로드 — `navigator.clipboard.writeText` + `Blob`+`<a download>`. 자동화 브라우저
  환경에선 클립보드 쓰기 권한이 막혀서 복사 기능은 사람이 직접 확인해야 했음(표준 API라 실브라우저는 문제없음).
- #26 Gemini 최소 연결 + 20개 프롬프트 실점검 — 위 "LLM 비용 결정" 참고. 결과: 20/20 출력 형식·import
  화이트리스트 준수, `generate-prompt.ts` 변경 불필요. 단, 가이드 규칙이 아직 주입 안 돼서 생성 결과에
  `bg-gray-50` 같은 임의 Tailwind 색상이 섞여 나옴 — RAG 붙는 #47에서 재확인 예정(메모리에 기록해둠).
- #102(계획 중 발견한 공백, #24에서 분리) chat.tsx → `/api/chat` 실제 연결 — `workspace-store.ts`에
  `messages`/`addMessage` 추가(모바일/데스크톱 두 `<Chat/>` 인스턴스가 항상 동시에 마운트돼 있어서 로컬
  state로는 안 됨, 전부 store로). "참고한 가이드" 인용 칩/다이얼로그는 제거(실제 RAG 인용 데이터 없어서
  가짜로 안 만듦, RAG 붙으면 다시 만들 것). `chat.tsx`의 textarea `id`가 두 인스턴스에 하드코딩 중복돼
  있던 실제 a11y 버그를 발견해서 `useId()`로 고침.
### STAGE 3 · 채팅 UI·스트리밍 완료 (이슈 8개: #27~#34)
- #27 `/api/chat` 스트리밍 전환 — `generateText` → `streamText` + `abortSignal: req.signal`.
  단, 모델 토큰을 그대로 클라이언트에 중계하진 않음: #22의 import 화이트리스트 검증이 완성된
  텍스트가 있어야 판단 가능해서, 서버가 `streamText`를 끝까지 소비해 검증까지 마친 "최종 확정
  텍스트"를 서버가 직접 청크로 잘라 지연을 주며 흘려보내는 합성 스트림으로 응답함(모델 토큰
  실시간 중계는 아니지만 클라이언트는 타이핑되듯 점진적으로 봄). `chat.tsx`는 `AbortController` +
  `res.body.getReader()`로 교체, "중단하기" 버튼이 이제 실제로 동작함.
- #28 `extractPartialCode`(`lib/code/extract-partial-code.ts`) — 스트림이 아직 안 끝난 상태에서
  "지금까지 나온 코드"를 안전하게 뽑아내는 순수 함수. `extractCode`(#19, 완성된 응답 전용, 펜스
  없으면 전체 텍스트를 코드로 간주하는 폴백 있음)와 역할 분리 — 스트림 중간엔 "아직 설명 문장을
  쓰는 중"일 수도 있어서 그 폴백 가정이 틀림. 이 PR에서는 순수 함수 + 단위 테스트만, 실제 UI
  연결은 #30에서.
- #29 스트리밍 상태 머신 — `features/workspace/workspace-status.ts`에 `WorkspaceStatus`/
  `WorkspaceEvent` 타입과 전환표 `nextWorkspaceStatus(current, event)`. 지금 실제로 동작하는
  흐름만 전환표에 넣음: `idle --start--> streaming --{finish,fail,abort}--> {done,error,aborted}
  --start--> streaming`. `rendering`/`checking`/`fixing`은 아직 어떤 코드도 전이시키지 않아서
  전환 규칙 추측해서 안 만듦(STAGE 7·8에서 해당 기능 붙을 때 추가 예정). `workspace-store.ts`의
  `setStatus(status)` raw setter를 `dispatch(event)`로 교체, `chat.tsx`도 전부 `dispatch` 사용.
- #30 editorCode/previewCode 분리 + 에디터 반영 스로틀 — `workspace-store.ts`의 단일 `code`
  필드를 `editorCode`(스트리밍 중 실시간 반영 전용, `setEditorCode`)/`previewCode`(수동 편집·
  스트림 완료·중단 시에만 `setCode`로 함께 갱신)로 분리. `chat.tsx`가 스트리밍 루프에서 매 청크마다
  `extractPartialCode`로 100ms 스로틀(`EDITOR_THROTTLE_MS`) 반영해 에디터가 응답 완료 전에도
  점진적으로 채워짐. 프리뷰는 Sandpack 재마운트 비용과 미완성 코드 컴파일 에러 깜빡임을 피하려고
  스트리밍 중엔 그대로 placeholder 유지, 완료 시점에만 갱신(타이밍 변경 없음). 중단/에러 시엔
  요청 시작 시점 스냅샷(`codeBeforeStream`)으로 복귀.
  **실제 버그 발견·수정**: `@monaco-editor/react`의 `onChange`가 `streaming` 중 `setEditorCode`로
  인한 프로그래밍 방식 `value` 변경에도 호출됨(`onChange={streaming?undefined:handleChange}`
  조건만으론 안 걸러짐) — `editor.tsx`의 수동 편집 디바운스(300ms)가 이 phantom 호출로 계속
  리셋되다가, 스트림이 끝나 올바른 최종 코드가 반영된 지 ~300ms 뒤에 마지막 디바운스 타이머가
  뒤늦게 발동해서 스트리밍 도중의 미완성 코드로 최종 코드를 덮어쓰는 레이스였음. `handleChange`
  맨 위에 `streamingRef`(매 렌더 직접 동기화되는 ref) 가드를 추가해 해결(자세한 내용은 메모리
  `project_monaco_onchange_fires_on_programmatic_value` 참고). 머지 전 자체 체크리스트 검증
  중에 발견 — 프리뷰 확인 전에 먼저 잡아서 고친 뒤 보고함.
- #31 중단·재생성 — 중단 시 "생성을 중단했어요." 배너 + "다시 생성하기" 버튼 추가(v0 디자인에도
  이 상태는 애초에 없었음). `requestError`를 `chat.tsx` 로컬 상태에서 스토어로 이동(모바일/
  데스크톱 두 `<Chat/>` 인스턴스가 항상 동시에 마운트되는 구조라 로컬 상태로는 한쪽에서만
  보였음). 테스트 중 Monaco 색상 대비 버그 2건도 같이 발견해 고침(기존 글 참고).
- #32 대화형 수정 — "현재 코드 컨텍스트"는 #18에서 이미 돼 있었음(시스템 프롬프트의
  `CURRENT CODE` 블록). "최근 N턴"이 비어 있던 부분이라, `/api/chat`에서 모델 호출 직전에만
  `messages.slice(-10)`으로 자름(화면에 보이는 대화 기록은 안 자름 — 모델 호출 비용 문제와
  UI 표시는 분리된 문제).
- #33 채팅 UX — 어시스턴트 말풍선 `react-markdown` 렌더링, 메시지 자동 스크롤(사용자가 위로
  스크롤 중이면 안 끌어내림), 스트리밍 중 Esc로 중단, 예시 칩 로딩 중 비활성화. 테스트 중
  **실제 레이아웃 버그**도 발견해 고침: `components/layout/app-shell.tsx`의 최상위 wrapper가
  `min-h-screen`이라 메시지가 많이 쌓이면 채팅 패널이 콘텐츠 크기만큼 계속 늘어나며 내부
  스크롤이 아예 발동 안 하고 입력창이 화면 밖으로 밀려났음 — `h-screen` + `main`에
  `overflow-y-auto`로 수정.
- #34 TTFT·usage_logs 기록 — `usage_logs` 테이블(#12에서 생성, 지금까지 미사용)에 처음으로
  실제 연결. `lib/usage-log.ts`가 Supabase에 기록하는데 `SUPABASE_URL`/
  `SUPABASE_SERVICE_ROLE_KEY`가 없으면 조용히 스킵(`LLM_PROVIDER=mock` 기본값과 같은 원칙).
  `/api/chat`의 `callModel`을 `streamText(...).text` 한 번에 기다리던 방식에서 `textStream`
  순회로 바꿔 TTFT(모델이 첫 토큰을 내기까지 걸린 시간, 서버 내부 관점)를 실제로 측정.
  응답 블로킹 없이 기록하려고 Next.js 16의 `after()`(`next/server`) 사용. 로컬에서 실제
  Supabase 프로젝트(`gbjxtcyvsuxorrykzwhc`)에 연결해서 행이 정상 insert되는 것까지 확인함
  (`ip_hash`가 해시로 들어가는 것도 확인). **후속 과제**: Vercel에는 아직 이 두 환경변수가
  안 등록돼 있어서 배포된 사이트(프리뷰·프로덕션)에서는 여전히 스킵됨 — STAGE 10(안정화·배포)
  때, 또는 더 빨리 STAGE 9(평가·성과 측정)에서 `eval/prompts.json` 돌릴 때 실제 데이터를
  쌓고 싶으면 그때 Vercel 프로젝트 Settings → Environment Variables에 추가할 것.
- STAGE 3 마일스톤 이슈 8개(#27~#34) 전부 완료. 다음은 STAGE 4(세션 저장·버전 히스토리).
- **보안 규칙 — 해제됨(#39에서 RLS 적용 완료)**: `sessions`/`messages`/`component_versions`에
  RLS가 전혀 없던 동안(#36 계획 중 발견) `NEXT_PUBLIC_SUPABASE_URL`/
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 Vercel에 등록하지 않는다는 규칙을 뒀었는데, #39에서
  실제 소유권 기반 RLS 정책을 적용하고 다른 유저 데이터가 막히는 것까지 직접 검증해서 이제
  해제됨. **다만 `NEXT_PUBLIC_SUPABASE_*`를 Vercel에 실제로 등록하는 건 이 메모가 "허용"이지
  "완료"가 아니다** — 등록 자체는 별도 배포 단계에서 할 것(STAGE 10, 또는 더 일찍 데모가
  필요해지면 그때). 등록 전에 `guide_sets`/`guide_documents`/`guide_chunks`/`usage_logs`는
  RLS는 켜져 있지만 정책이 비어있어서(#39에서 의도적으로 미룸, "guide_* 테이블 범위" 참고)
  anon key로는 전부 차단된 상태라는 것도 같이 알아둘 것(STAGE 5/6에서 정책 추가 전까지는
  그 테이블들 관련 기능이 실제로 안 열림). (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`는
  서버 전용·RLS 무관, #34 노트 참고.)

### STAGE 4 · 세션 저장·버전 히스토리 완료 (이슈 5개: #35~#39)
- #35 인증 방식 적용(Supabase 익명 로그인) — Next.js 16의 `proxy.ts`(옛 `middleware.ts`) +
  `lib/supabase/middleware.ts`의 `updateAnonymousSession()`이 요청마다 세션을 확인하고
  없으면 `signInAnonymously()`로 익명 유저를 발급, 쿠키(`sb-<ref>-auth-token`)로 세션을
  유지한다. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` 미설정 시 조용히
  스킵. `lib/supabase/client.ts`(브라우저 클라이언트 팩토리)도 같이 만들었지만 이 PR에서는
  호출부 없음(#36에서 연결). 실제 Supabase 프로젝트로 로컬 검증: 쿠키 생성, `is_anonymous:
  true` 유저 생성, 같은 쿠키 재요청 시 세션 재사용(새 유저 안 생김), 쿠키 없는 새 요청 시
  별도 유저 생성까지 전부 확인. 검증 중 `signInAnonymously()`가 실패해도 throw 안 하고
  `{ error }`만 반환하는 걸 놓쳐서 에러가 조용히 삼켜지던 버그를 발견해 같이 고침.
- #36 세션·메시지·버전 저장(TanStack Query mutation) — 채팅 메시지와 생성된 코드를
  `sessions`/`messages`/`component_versions`에 저장, 새로고침 시 유저의 가장 최근 세션을
  복원한다. 복원은 Server Component(`app/workspace/page.tsx` → `features/workspace/
  restore-session.ts`의 `getLatestSession()`)에서, 저장은 클라이언트 TanStack Query
  mutation(`features/workspace/session-persistence.ts` + `use-session-mutations.ts`)에서
  브라우저가 `lib/supabase/client.ts`로 직접 insert — 새 API 라우트 없이 PostgREST를 그대로
  씀(#35에서 깔아둔 인프라가 처음 실사용됨). 세션 모델은 "유저당 가장 최근 세션 1개"로
  단순화(세션 목록/전환 UI, `/workspace/[id]` 동적 라우트는 STAGE 4 어느 이슈에도 없어서
  범위 밖). 버전 번호는 DB 자동증가가 아니라 `workspace-store.latestVersion`이 클라이언트
  에서 추적(`component_versions`에 `(session_id, version)` unique 제약이 없어서 복원 쿼리는
  `version desc`+`created_at desc` 2차 정렬로 동률을 깸). 수동 Monaco 편집은 버전으로
  저장 안 함(디바운스 자동저장은 범위 밖, 새로고침하면 마지막 AI 생성본으로 돌아감 — 알려진
  제약으로 남겨둠). 실제 발견한 함정: `sessions.user_id`가 디폴트로 안 채워져서
  `createSession`에서 `auth.getUser()`로 받은 id를 명시적으로 넣어야 함(안 그러면 복원
  쿼리가 조용히 빈 결과 반환). anon/publishable key로 insert·select 자체는 추가 GRANT 없이
  Supabase 기본 권한으로 전부 됨(실제 검증함). 실제 Supabase로 브라우저 E2E 검증: 메시지
  전송 → DB row 생성 → 새로고침 → 메시지+코드 복원 → 메시지 추가 → 버전 2로 복원 → env
  미설정 시 복원 없이 기본 목업으로 스킵, 채팅은 정상 동작까지 전부 확인. 머지 전 CI에서
  기존 e2e 중단 테스트(#31에서 만든 것)가 CI 전용 환경(워커 2개, 느린 CPU)에서만 실패하는
  걸 발견 — 300ms 고정 지연 뒤 응답을 한 번에 fulfill하는 구조라 "중단하기" 버튼이 활성화된
  시간이 딱 300ms뿐이었던 레이스였음, 응답을 테스트가 중단 버튼을 누를 때까지 영원히 멈춰
  두는 방식으로 고쳐서 레이스 자체를 제거함(#36 범위 밖이지만 머지 전제조건이라 같이 고침).
- #37 버전 목록 및 되돌리기 — `editor.tsx`의 "버전" 탭 하드코딩 더미 리스트를 실제
  `component_versions` 데이터로 교체. `features/workspace/version-list.ts`(순수 쿼리 함수)
  + `use-version-list.ts`(TanStack Query `useQuery` 래퍼 — 이 저장소 첫 `useQuery`
  사용례, #36까지는 mutation만 있었음)로 조회. "되돌리기"는 옛 버전 코드를
  `kind: 'manual'`로 새 버전에 append하는 방식(히스토리를 덮어쓰지 않음, git revert와
  같은 원칙) — `saveVersion`(#36에서 만든 mutation)을 그대로 재사용해서 새 persistence
  함수가 따로 필요 없었음. 현재 버전(목록 맨 위)엔 되돌리기 버튼을 안 보여주고, 스트리밍·
  저장 중엔 비활성화. 헤더의 "v3 · AI 수정" 하드코딩은 `v{latestVersion}`로 단순화(각
  행에 이미 kind가 표시되니 헤더까지 정확히 맞추려고 별도 상태 추가하는 건 과설계로 판단).
  상대 시간 포맷 유틸(`lib/format-relative-time.ts`, "N분/시간/일 전")도 이 PR에서 신규.
  실제 Supabase로 검증하던 중 버그 2개 발견해 같이 고침: (1) `chat.tsx`가 채팅으로 새
  버전을 저장한 뒤 버전 목록 쿼리 캐시를 무효화 안 해서, 새로고침 전까진 "버전" 탭에
  새 버전이 안 보이던 문제 — `queryClient.invalidateQueries` 추가. (2)
  `playwright.config.ts`의 `test:a11y` `webServer`가 로컬 `.env.local`의 실제 Supabase
  키를 그대로 상속해서, 로컬에서 접근성 테스트를 돌릴 때마다 운영 DB에 빈 테스트 세션이
  계속 쌓이고 있었음(CI는 해당 env var 자체가 없어서 영향 없었음, 로컬 전용 문제) —
  `env -u`로 지워도 Next.js가 `.env.local`에서 다시 채워 넣어서 안 먹히는 걸 확인하고,
  존재하지 않는 주소로 덮어써서 테스트 중엔 항상 네트워크 실패로 조용히 스킵되게 고침.
  이 버그로 그동안 쌓인 빈 테스트 세션 10개(메시지·버전 0개)는 실제 데이터(메시지 있는
  세션 4개)만 남기고 직접 정리해서 지움.
- #38 Diff 탭(Monaco DiffEditor) — `editor.tsx`의 "Diff" 탭 하드코딩 더미를 실제
  `DiffEditor`로 교체. 두 개의 버전 선택 드롭다운("이전 버전"/"이후 버전")으로 임의의
  두 버전을 비교, 기본값은 최신 버전과 그 바로 전 버전(`getDefaultDiffVersions`,
  `version-list.ts`). `#37`의 `useVersionList`가 이미 각 버전의 `code`까지 가져오고
  있어서 새 쿼리 없이 재사용.
  **Monaco 콘솔 에러를 세 번의 시도 끝에 구조적으로 해결함(과정을 기록해둠 — 비슷한 류의
  버그를 또 만나면 참고)**: Diff 탭을 열 때 `Could not find source file:
  'inmemory://model/N'`(Uncaught in promise, 기능엔 영향 없음) 에러 발견.
  1차: 모델 재사용 옵션/고정 경로 — 효과 없음.
  2차: Diff 탭 진입/이탈 시에만 TS 진단을 껐다 켜는 `useEffect` — 진입 시 에러는 막았지만
  복원 시점이 모델 dispose와 같은 커밋 주기에 걸려서 "코드" 탭으로 돌아올 때 같은 에러가
  다시 남(증상을 옮기기만 함, 실제 재현 테스트로 발견).
  3차(최종): 탭 패널 구조를 "하나의 div가 내용을 swap"에서 "세 개의 상시 존재하는 패널
  div, `hidden` 속성으로 토글"로 재설계해서 `DiffEditor`가 탭 전환으로 더 이상
  언마운트되지 않게 함(부수적으로 비활성 탭의 `aria-controls`가 DOM에 없는 대상을
  가리키던 기존 버그도 같이 고쳐짐). 그런데도 세션당 최초 1~2회는 에러가 남아서(모델
  최초 생성-TS 워커 등록 사이에도 같은 레이스가 있었음), `getTypeScriptWorker()` 대기 +
  추가 지연 같은 타이밍 기반 우회도 검토했지만 이 프로젝트가 이미 두 번(#31, #36) 겪은
  "고정 지연으로 레이스를 땜질했다가 느린 환경에서 다시 깨진" 패턴을 반복하는 거라 기각,
  `handleBeforeMount`에서 TS 진단(`noSemanticValidation` 등)을 아예 꺼서 진단 요청 자체가
  안 나가게 함 — 타이밍과 무관하게 결정적으로 막힘. 생성된 코드의 컴파일 에러는 Sandpack이
  별도로 보여주고 있어서 Monaco 자체 타입 체크(빨간 밑줄)를 잃는 손해는 작다고 판단.
  코드→Diff→버전→Diff→코드 8번 전환(10초 대기 포함)으로 에러 0건 확인.
- #39 RLS 정책 설정 — `sessions`(`user_id not null` + `auth.users` FK 추가, 본인만
  `auth.uid() = user_id`로 CRUD), `messages`/`component_versions`(자체 소유자 컬럼이
  없어서 `sessions` 소유권을 `exists` 서브쿼리로 경유 — #36/#37이 쓰는 "본인 세션"
  조건과 동일해서 코드 변경 없이 그대로 호환)에 실제 RLS 정책 적용. `guide_sets`/
  `guide_documents`/`guide_chunks`/`usage_logs`는 **RLS만 켜고 정책은 안 만듦**(정책
  0개 = anon/authenticated 전부 차단, service_role은 영향 없음) — STAGE 5/6 전까지
  쓰는 코드가 없어서(실제 0건 확인) `is_demo`/`owner_id` 기반 정책을 추측해서 미리
  설계하지 않기로 결정(사용자와 상의 후, 과설계 방지). `supabase db push`로 실제
  프로젝트에 적용 후 Node 스크립트로 검증: 유저 A가 만든 세션을 유저 B(별도 익명
  로그인)가 조회하면 빈 결과, insert 시도는 `42501`(RLS 위반)로 차단됨 확인(#36 때
  "다른 유저 세션이 그대로 읽힌다"고 확인했던 것과 정반대 결과). 유저 A 자신의 접근과
  service role 접근은 영향 없음도 확인. `/workspace`에서 #36~#38 기능(세션 복원, 메시지
  저장, 버전 목록, 되돌리기, Diff 비교) 전부 RLS 적용 후에도 회귀 없이 동작 확인.
- **STAGE 4 마일스톤 이슈 5개(#35~#39) 전부 완료.**

### STAGE 5 · RAG 가이드 인제스트 (이슈 6개: #40~#45, 진행 중)
- #41 마크다운 청킹 함수 및 단위 테스트 — `lib/rag/chunk.ts`의 `chunkMarkdown(markdown)`이
  마크다운을 `{ headingPath, content, tokenCount }[]`로 변환. DB·API 의존 없는 순수 함수라
  이 이슈 하나로 완결, 후속 이슈(#42 임베딩 생성)가 이 출력을 그대로 `guide_chunks`에 저장하면
  되는 형태로 설계. 파이프라인: frontmatter 제거 → 헤딩(`#`/`##`/`###`, 코드 펜스 안은 제외)
  기준 1차 분할 → 80토큰 미만 섹션은 다음 섹션과 병합 → 800토큰 초과 섹션은 문단 단위로
  650토큰 근처까지 그리디 패킹 + 75토큰 겹침으로 재분할. 헤딩 경로는 레벨별 스택을 `' > '`로
  join하되 **뒤 헤딩이 앞 헤딩으로 이미 시작하면 앞 걸 버리는 dedup 규칙**을 넣음 —
  `sample-guide/*.md`가 전부 "## {컴포넌트} > {항목}" 식으로 헤딩 자체에 상위 이름을 반복해서
  적는 컨벤션이라(`button.md`: H1 `Button` 밑에 H2 `Button > Variant 선택 기준`), 이 규칙 없이
  단순 join하면 `Button > Button > Variant 선택 기준`처럼 중복됨. 이 dedup은 "뒤가 앞으로
  시작하는" 경우에만 동작해서, H1·H2 이름이 다르게 축약된 경우(`tokens.md`: H1
  `Design Tokens` vs H2 `Tokens > 토큰 사용 원칙`)는 중복 제거가 안 되고
  `Design Tokens > Tokens > 토큰 사용 원칙 > 규칙`처럼 그대로 합쳐짐 — 틀린 게 아니라 두
  헤딩 문자열이 진짜 다르므로 분간 불가능한 경우라 의도적으로 허용(과설계 방지, 테스트에도
  이 동작 그대로 기대값으로 박아둠). 토큰 수는 Gemini 토크나이저 의존성을 새로 추가하지 않고
  한글 글자 `/1.5` + 기타 문자 `/4` 근사치(`estimateTokenCount`)로 계산 — 기획서도 500~800을
  "약"이라고 명시해서 근사치로 충분하다고 판단. 이슈 체크리스트엔 "병합"이 없었지만 기획서
  7.5절 같은 항목(청킹 전략)에 포함돼 있어서 같이 구현(안 하면 `tokens.md`의 짧은
  `### 규칙` 서브섹션이 의미 없는 1~2줄 청크로 단독 저장됨). 테스트 8개(`lib/rag/chunk.test.ts`):
  헤딩 없는 문서, 코드 블록 혼합, 긴 섹션 재분할+겹침, H1→H2 dedup, H2→H3 중첩, 짧은 섹션
  병합, frontmatter 제거, 실제 `sample-guide/button.md` 통합 테스트.
- #40 가이드 업로드 UI 및 파일 검증 — `/guides`의 장식용 업로드 영역(드래그앤드롭 핸들러
  없음, `onChange`만 있던 상태)을 실제로 연결. `lib/schemas/guide-upload.ts`의
  `guideFileSchema`(`.md` 확장자·빈 파일 아님·1MB 이하)를 클라이언트(`guides-page.tsx`의
  `handleFiles`, 실패 시 네트워크 요청 자체를 안 보냄)와 서버(`app/api/guides/upload/route.ts`,
  신뢰 경계이므로 반드시 재검증)가 같은 소스로 import. `.md`만 허용하는 이유: `chunkMarkdown`
  (#41)이 마크다운 헤딩 문법에 의존하는 구조라 PDF·docx는 "검증 조건 추가"가 아니라 "별도
  파서 신설"이 되는 다른 크기의 작업 — 기획서 STAGE 5 범위에도 `.md`만 명시돼 있었음.
  **설계상 중요한 전제**: `guide_sets`/`guide_documents`는 #39에서 RLS만 켜고 정책을 안
  만들어서 anon key로 select/insert가 전부 막혀있음 — STAGE 4가 썼던 "브라우저가 직접
  Supabase insert" 패턴을 못 씀. 그래서 서버 API 라우트가 `lib/supabase/admin.ts`(신규,
  `lib/usage-log.ts`가 쓰던 인라인 service-role 클라이언트 생성을 뽑아서 공유화)로 Storage
  업로드와 DB insert를 전담 — RLS 정책을 전혀 새로 설계할 필요가 없어짐(storage.objects도
  같은 이유로 정책 없이 버킷만 비공개로 생성, `supabase/migrations/
  20261017095751_guide_storage_bucket.sql`). 업로드 라우트는 데모 guide_set을
  find-or-create로 처리해서 #45(시드 스크립트)가 아직 없어도 이 이슈 혼자 테스트 가능하게
  설계. 이 이슈는 "업로드 → Storage 저장 → `status: processing` 행 생성"까지만 — 청킹 실행·
  임베딩·`status: ready/failed` 전환은 #42, 문서 목록 실제 조회·polling·재업로드는 #43
  범위라 `docList`는 여전히 mock 8개로 시작하고 업로드 성공 시에만 로컬에 추가(세션 저장 때
  #36=쓰기 먼저, #37=읽기 나중이었던 것과 같은 분리). 실제 Supabase로 검증: 정상 업로드 →
  목록에 "처리 중" 즉시 추가, `.txt`/1MB 초과 파일 거부 확인, `guide_documents` 행·Storage
  객체 실제 생성 확인(검증 후 정리). Vercel 프리뷰(Supabase 키 미등록 상태)에서는 업로드 시도
  시 "가이드 저장소가 설정돼 있지 않아요"로 크래시 없이 처리되는 것까지 확인.
- 다음은 #42(임베딩 생성·저장 및 처리 상태 관리). `NEXT_PUBLIC_SUPABASE_URL`/
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 Vercel에 등록하는 건 이제 안전하지만(위 "보안 규칙"
  참고) 여전히 별도 배포 단계 — 지금 등록 안 함.