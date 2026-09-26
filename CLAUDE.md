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

## 작업 흐름 (이슈 1개 = 브랜치 1개 = PR 1개)
1. `git switch main && git pull`
2. `git switch -c 종류/이슈번호-설명` (종류: feat, refactor, chore, test, docs, fix)
3. 작업 → `git add -A` → `git commit -m "종류: 설명"`
4. `git push -u origin 브랜치` → `gh pr create --title "..." --body "Closes #번호"`
   - 이슈 작업의 일부만 끝낸 PR은 `Refs #번호`, 마지막 PR에서 `Closes #번호`
5. Vercel 프리뷰 확인 → `gh pr merge --squash --delete-branch` → `git switch main && git pull`
- 한 PR에서 파일 이동과 코드 수정을 섞지 않는다.
- 커밋 전 `npx tsc --noEmit`, `npm run build` 확인.

## 현재 상태 (여기부터 이어서)
- STAGE 0 완료. STAGE 1 진행 중. Vercel 배포 연결 완료.
- 폴더 구조 정리 이슈(#8) 관련 PR 4개:
  - PR #77 (화면 파일을 features/*로, app-shell을 components/layout으로 이동) — 머지 완료.
  - PR #78 (머지 후 발견된 버그 수정: app/*.tsx가 옮기기 전 경로 `@/components/*-page`를 계속 import하던 것을 `features/*`로 수정) — 머지 완료.
  - PR #79 (workspace.tsx를 Chat/Editor/Preview로 분리, mocks/ 디렉토리 도입해 화면별 목업 데이터 이동) — 생성됨, `Closes #8`, 머지 대기 중.
    - "안 쓰는 shadcn 컴포넌트·패키지 제거" 항목은 확인 결과 해당 없음: `components/ui/*` 9개 컴포넌트, `cn` 패키지(주의: `lib/utils.ts`의 자체 `cn()` 함수와는 별개로 shadcn 컴포넌트들이 npm 패키지 `cn`을 `from "cn"`으로 직접 import함) 전부 실제 사용 중.
  - PR #79 머지되면 이슈 #8은 닫힘. 다음은 아래 타입 에러 5개 수정.
- `npx tsc --noEmit`에서 타입 에러 5개. 이동 때문이 아니라 v0 원본 코드에 있던 문제다
  (next.config에 ignoreBuildErrors 설정이 있어서 빌드가 통과했을 가능성 확인 필요):
  1. `features/guides/guides-page.tsx` — 하위 컴포넌트에서 `fileRef` 참조 (스코프 밖, 2건)
  2. `features/guides/search-page.tsx` — state 타입에 없는 `'loading'`, `'empty'` 비교 (2건)
  3. `features/workspace/workspace.tsx` — `ResizablePanelGroup`에 `direction` prop 타입 오류
     (react-resizable-panels 버전과 shadcn resizable 컴포넌트 API 불일치 가능성)
  → 별도 이슈/브랜치(`fix/…-type-errors`)에서 고치고, 고친 뒤 ignoreBuildErrors를 끈다.

## STAGE 1 남은 순서
폴더 구조 정리 → 타입 에러 수정 → 디자인 토큰 단일 소스화(tokens.ts ↔ globals.css @theme) →
화면 state props화 + `?state=` 개발 전용 → Provider + Zustand 스토어 뼈대 → env Zod 검증 →
Supabase 초기 마이그레이션 → Playwright + axe 기준선 테스트 → 디자인 기록