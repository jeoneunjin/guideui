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
- STAGE 0 완료. STAGE 1 진행 중 (마일스톤 이슈 11개 중 5개 닫힘: #7, #8, #9, #17, #80).
- 완료:
  - #7 v0 목업 원본 가져오기 — 첫 커밋(91470dd)으로 이미 들어와 있었고 계속 잘 동작해서 닫음.
  - #8 폴더 구조 정리 — 화면 파일 features/*로, app-shell을 components/layout으로 이동(PR #77),
    이동 후 깨진 import 경로 수정(PR #78), workspace.tsx를 Chat/Editor/Preview로 분리 +
    mocks/ 디렉토리 도입(PR #79). "안 쓰는 shadcn 컴포넌트·패키지 제거" 항목은 확인 결과
    해당 없음(전부 실사용 중)으로 완료 처리.
  - #80 v0 원본 타입 에러 5개 수정(PR #81) — guides-page의 `fileRef` 스코프 버그,
    search-page의 존재하지 않는 state 값 비교, workspace의 `react-resizable-panels` v4
    `direction`→`orientation` 이름 변경 + 패널 사이즈 px/% 이슈. `next.config`의
    `ignoreBuildErrors`도 제거해서 이제 `npm run build`가 타입 에러도 잡는다.
  - #9 디자인 토큰 단일 소스화(PR #83) — `sample-guide/tokens.ts`/`lib/app-tokens.ts`를
    소스로 `npm run tokens:sync`가 `globals.css`를 생성. shadcn 기본 변수 16개를
    Sample DS 토큰에 연결(`--primary: var(--brand-600)` 등). OS 다크 모드에 따라
    shadcn 변수만 자동으로 깨지던 `@media (prefers-color-scheme: dark)` 블록 제거,
    라이트 전용으로 고정. Pretendard 웹폰트 실제 로딩은 후속 이슈 #82로 분리.
  - #17 Vercel 배포 및 PR 프리뷰 배포 연결 — GitHub 연동으로 Production/Preview 둘 다
    이미 자동 연결돼 있어서 닫음.
- 진행 중(부분 완료): #10 화면 상태를 props 기반으로 정리 — `app/workspace`, `app/guides`,
  `app/search` 라우트가 `searchParams`의 `state`를 읽어 각 feature 컴포넌트에 prop으로
  넘기는 구조는 이미 돼 있음. 남은 건 프로덕션 빌드에서 `?state=` 쿼리를 무시하게 막는 것.
- 아직 시작 안 함: #11 env Zod 검증(`lib/env.ts`), #12 Supabase 프로젝트·초기 마이그레이션,
  #13 Zustand `workspaceStore` 뼈대, #14 Provider 구성(TanStack Query), #15 Playwright + axe
  접근성 기준선 테스트, #16 디자인 기록 정리(`docs/v0-prompts.md`는 이미 있음, `docs/design`
  스크린샷은 아직).
- 후속으로 미뤄둔 것: #82 Pretendard 웹폰트 실제 로딩(next/font) — STAGE 1 필수는 아님.

## STAGE 1 남은 순서
~~폴더 구조 정리~~ → ~~타입 에러 수정~~ → ~~디자인 토큰 단일 소스화~~ →
#10 마무리(`?state=` 프로덕션 비활성화) → #13/#14 Provider + Zustand 스토어 뼈대 →
#11 env Zod 검증 → #12 Supabase 초기 마이그레이션 → #15 Playwright + axe 기준선 테스트 → #16 디자인 기록