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
- STAGE 1~3: mock 모델(AI SDK 테스트용 모델 + 스트림 시뮬레이션)로 개발.
- STAGE 4 이후: Gemini 무료 티어(생성 + 임베딩). 키는 `.env.local`의 `GOOGLE_GENERATIVE_AI_API_KEY`.
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
  - `features/{landing,workspace,chat,editor,preview,a11y,guides}/`
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
- STAGE 0 완료. STAGE 1 진행 중 (마일스톤 이슈 13개 중 9개 닫힘: #7, #8, #9, #10, #11, #13, #14, #17, #80).
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
- 아직 시작 안 함: #12 Supabase 프로젝트·초기 마이그레이션,
  #15 Playwright + axe 접근성 기준선 테스트, #16 디자인 기록 정리(`docs/v0-prompts.md`는
  이미 있음, `docs/design` 스크린샷은 아직).
- 후속으로 미뤄둔 것: #82 Pretendard 웹폰트 실제 로딩(next/font) — STAGE 1 필수는 아님.
- 알아두면 좋은 것: `app/layout.tsx`의 `viewport.colorScheme`/`themeColor`가 여전히
  라이트/다크 둘 다 선언돼 있어서(#9에서 CSS만 라이트로 고정함) 브라우저 UI 색상 힌트가
  실제 화면과 안 맞을 수 있음 — 디자인 기록(#16) 정리할 때 같이 보면 됨.
- CLAUDE.md 폴더 구조 목록의 `features/{...,chat,editor,preview,...}`는 실제로는
  `features/workspace/{chat,editor,preview}.tsx`로 workspace 하위에 있음(#79에서 그렇게
  정리함) — 이 문서 표기가 약간 stale함, 다음 문서 정리 때 고칠 것.

## STAGE 1 남은 순서
~~폴더 구조 정리~~ → ~~타입 에러 수정~~ → ~~디자인 토큰 단일 소스화~~ → ~~화면 상태 props화~~ →
~~Provider + Zustand 스토어 뼈대~~ → ~~env Zod 검증~~ → #12 Supabase 초기 마이그레이션 →
#15 Playwright + axe 기준선 테스트 → #16 디자인 기록