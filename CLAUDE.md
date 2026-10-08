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
### STAGE 3 · 채팅 UI·스트리밍 진행 중 (8개 중 #27~#30 완료, #31~#34 남음)
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
- 다음: #31(중단·재생성). `handleRetry`는 이미 있지만 지금은 그냥 마지막 메시지들로 재요청하는
  수준 — 이슈 제목대로면 중단된 요청의 재생성 흐름을 더 다듬는 작업으로 보임. #109(PR #30)에
  남겨둔 "알려진 제약"(자동화 브라우저 환경에서 중단 시점 캡처가 안 됐던 것, 앱 버그 아님)도
  참고. 그다음은 #32(대화형 수정), #33(채팅 UX), #34(TTFT 측정).