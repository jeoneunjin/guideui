#!/usr/bin/env python3
"""
GuideUI GitHub 저장소 초기 세팅 스크립트
- 라벨, 마일스톤(STAGE 0~11), 이슈를 한 번에 등록한다.
- 이미 있는 라벨/마일스톤/이슈(제목 기준)는 건너뛰므로 여러 번 실행해도 안전하다.

사용법 (레포 폴더 안에서):
  gh auth login                       # 최초 1회
  python3 setup_github.py --dry-run   # 무엇이 만들어질지 미리 확인
  python3 setup_github.py             # 실제 등록
"""
import json
import subprocess
import sys

DRY_RUN = "--dry-run" in sys.argv

# ---------------------------------------------------------------------------
# 라벨
# ---------------------------------------------------------------------------
LABELS = [
    # 작업 종류
    ("feat", "1f6feb", "새 기능"),
    ("chore", "8b949e", "설정, 인프라, 잡무"),
    ("refactor", "a371f7", "동작 변경 없는 구조 개선"),
    ("test", "2da44e", "테스트, 평가"),
    ("docs", "0969da", "문서, 포트폴리오 자료"),
    ("design", "d4a72c", "UI 디자인, 시안"),
    ("bug", "d1242f", "버그"),
    # 영역
    ("area:chat", "c5def5", "채팅, 스트리밍"),
    ("area:editor", "c5def5", "코드 에디터, 버전, Diff"),
    ("area:preview", "c5def5", "Sandpack 미리보기"),
    ("area:rag", "c5def5", "가이드 인제스트, 검색"),
    ("area:a11y", "c5def5", "접근성 검사, 자동 수정"),
    ("area:eval", "c5def5", "평가, 측정"),
    ("area:infra", "c5def5", "DB, 배포, 환경 설정"),
    ("area:ui", "c5def5", "공통 UI, 레이아웃"),
    # 우선순위 (계획서 3장 기능 명세 기준)
    ("P0", "b60205", "반드시 구현 (핵심 루프)"),
    ("P1", "fbca04", "완성도를 크게 올리는 기능"),
    ("P2", "e4e669", "여유가 있을 때"),
]

# ---------------------------------------------------------------------------
# 마일스톤 + 이슈
#   이슈: (제목, [라벨], [체크리스트], 이미 완료 여부)
# ---------------------------------------------------------------------------
def I(title, labels, todos=None, done=False):
    return {"title": title, "labels": labels, "todos": todos or [], "done": done}

STAGES = [
    {
        "title": "STAGE 0 · 준비·기획",
        "goal": "만들기 전에 성공 기준과 재료를 준비한다.",
        "done_when": "샘플 가이드 md, tokens.ts, prompts.json, 와이어프레임, 저장소·마일스톤이 준비되어 있다.",
        "issues": [
            I("샘플 디자인 가이드 문서 작성 (Sample DS 8종)", ["docs", "area:rag", "P0"],
              ["tokens / button / form / card / navigation / modal / accessibility / writing", "규칙 ID와 검사 방식 표기", "README 규칙 목록"], done=True),
            I("디자인 토큰 tokens.ts 작성", ["chore", "area:ui", "P0"],
              ["Tailwind theme.extend 형식", "색상 대비 검증"], done=True),
            I("평가 프롬프트 prompts.json 작성 (tuning 20 + holdout 5)", ["test", "area:eval", "P0"],
              ["그룹별 5개", "규칙 ID 태깅", "globalRuleIds, followUp"], done=True),
            I("v0로 화면 시안 제작 (앱 셸, 워크스페이스, 가이드 관리, 가이드 검색, 랜딩)", ["design", "area:ui", "P0"],
              ["화면별 ?state= 상태", "체크리스트 점검 및 수정"], done=True),
            I("저장소·라벨·마일스톤·이슈 세팅", ["chore", "area:infra", "P0"],
              ["레포 생성", "라벨/마일스톤/이슈 등록", "이슈·PR 템플릿", "브랜치 보호 규칙"]),
            I("LLM·임베딩 API 키 발급 및 예산 알림 설정", ["chore", "area:infra", "P0"],
              ["생성용 LLM 키", "임베딩용 키", "월 사용량 한도·알림"]),
        ],
    },
    {
        "title": "STAGE 1 · 프로젝트 셋업·기본 레이아웃",
        "goal": "v0 시안을 계획서 구조로 옮기고 개발 기반을 만든다.",
        "done_when": "배포 URL에서 목업 흐름이 동작하고, 레이아웃이 데스크톱·모바일에서 깨지지 않는다.",
        "issues": [
            I("v0 목업 원본 가져오기 (첫 커밋)", ["chore", "area:ui", "P0"],
              ["`chore: import v0 UI mockup` 커밋", "실행 확인"]),
            I("폴더 구조 정리 (features/*, mocks/)", ["refactor", "area:ui", "P0"],
              ["features/chat, editor, preview, a11y, guides 분리", "목업 데이터 mocks/ 분리", "안 쓰는 shadcn 컴포넌트·패키지 제거"]),
            I("디자인 토큰 단일 소스화 (tokens.ts ↔ @theme)", ["refactor", "area:ui", "P0"],
              ["tokens.ts에서 CSS 생성 스크립트 또는 값 비교 테스트", "sample-guide/ 폴더 레포 편입"]),
            I("화면 상태를 props 기반으로 정리, ?state=는 개발 전용", ["refactor", "area:ui", "P1"],
              ["화면 컴포넌트가 state prop을 받도록", "프로덕션에서 ?state= 비활성화"]),
            I("환경 변수 Zod 검증 (lib/env.ts)", ["chore", "area:infra", "P0"]),
            I("Supabase 프로젝트 생성 및 초기 마이그레이션", ["chore", "area:infra", "P0"],
              ["vector 확장", "sessions, messages, component_versions, guide_sets, guide_documents, guide_chunks, usage_logs"]),
            I("Zustand workspaceStore 뼈대와 상태 타입 정의", ["feat", "area:chat", "P0"],
              ["status 유니온 (idle/streaming/rendering/checking/fixing/done/error/aborted)", "v0 상태 이름과 매핑"]),
            I("Provider 구성 (TanStack Query 등)", ["chore", "area:infra", "P0"]),
            I("접근성 기준선 테스트 (Playwright + axe, 전 화면 × 전 상태)", ["test", "area:a11y", "P0"],
              ["위반 0건 확인", "CI에서 실행"]),
            I("디자인 기록 정리 (docs/design 스크린샷, v0 프롬프트)", ["docs", "area:ui", "P1"]),
            I("Vercel 배포 및 PR 프리뷰 배포 연결", ["chore", "area:infra", "P0"]),
        ],
    },
    {
        "title": "STAGE 2 · 생성 코어·미리보기",
        "goal": "비스트리밍으로 '프롬프트 → 코드 → 렌더'를 안정화한다.",
        "done_when": "테스트 프롬프트 대부분이 렌더 에러 없이 표시되고, 허용되지 않은 import가 렌더 전에 차단된다.",
        "issues": [
            I("/api/chat 비스트리밍 구현 + 시스템 프롬프트 v1", ["feat", "area:chat", "P0"], ["Zod 입력 검증"]),
            I("extractCode 구현 및 단위 테스트", ["feat", "area:chat", "P0"], ["펜스 있음/없음/여러 개"]),
            I("Sandpack 미리보기 구성 (Tailwind CDN + 토큰 config)", ["feat", "area:preview", "P0"],
              ["SandpackProvider + SandpackPreview", "public/index.html에 토큰 주입"]),
            I("샌드박스용 UI 컴포넌트 5종 작성 (Button, Input, Label, Card, Badge)", ["feat", "area:preview", "P0"]),
            I("import 화이트리스트 검증 + 1회 자동 재생성", ["feat", "area:preview", "P1"], ["@babel/parser"]),
            I("미리보기 컴파일·런타임 에러 UI", ["feat", "area:preview", "P0"]),
            I("Monaco 에디터 연결 + 편집 디바운스 반영", ["feat", "area:editor", "P0"]),
            I("코드 복사·다운로드", ["feat", "area:editor", "P1"]),
            I("prompts.json 수동 1차 점검 및 시스템 프롬프트 조정", ["test", "area:eval", "P0"]),
        ],
    },
    {
        "title": "STAGE 3 · 채팅 UI·스트리밍",
        "goal": "대화형 생성과 실시간 스트리밍을 구현한다.",
        "done_when": "긴 응답도 실시간 표시되고, 중단 시 즉시 멈추며, 이어서 수정 요청이 현재 코드 기준으로 동작한다.",
        "issues": [
            I("/api/chat 스트리밍 전환 + 중단 전파", ["feat", "area:chat", "P0"], ["streamText", "req.signal"]),
            I("펜스 스트림 파서 구현 및 단위 테스트", ["feat", "area:chat", "P0"],
              ["청크 경계에서 쪼개진 펜스", "펜스 없음", "닫히지 않은 펜스"]),
            I("스트리밍 상태 머신 구현", ["feat", "area:chat", "P0"]),
            I("editorCode / previewCode 분리 및 에디터 반영 스로틀", ["feat", "area:editor", "P0"]),
            I("중단·재생성", ["feat", "area:chat", "P0"]),
            I("대화형 수정 (현재 코드 컨텍스트, 최근 N턴)", ["feat", "area:chat", "P0"]),
            I("채팅 UX (마크다운, 자동 스크롤, 단축키, 예시 칩)", ["feat", "area:chat", "P1"]),
            I("TTFT·소요 시간 측정 및 usage_logs 기록", ["feat", "area:eval", "P1"]),
        ],
    },
    {
        "title": "STAGE 4 · 세션 저장·버전 히스토리",
        "goal": "작업 결과를 저장하고 버전 비교를 제공한다.",
        "done_when": "새로고침해도 대화와 버전이 복원되고, 두 버전을 diff로 비교할 수 있다.",
        "issues": [
            I("인증 방식 적용 (Supabase 익명 로그인)", ["feat", "area:infra", "P1"]),
            I("세션·메시지·버전 저장 (TanStack Query mutation)", ["feat", "area:editor", "P1"]),
            I("버전 목록 및 되돌리기", ["feat", "area:editor", "P1"]),
            I("Diff 탭 (Monaco DiffEditor)", ["feat", "area:editor", "P1"]),
            I("RLS 정책 설정", ["chore", "area:infra", "P1"]),
        ],
    },
    {
        "title": "STAGE 5 · RAG 가이드 인제스트",
        "goal": "가이드 문서를 청크와 임베딩으로 저장한다.",
        "done_when": "샘플 가이드가 청크로 저장되고, 검색 함수로 관련 섹션이 상위에 조회된다.",
        "issues": [
            I("가이드 업로드 UI 및 파일 검증", ["feat", "area:rag", "P0"]),
            I("마크다운 청킹 함수 및 단위 테스트", ["feat", "area:rag", "P0"],
              ["헤딩 기준 분할", "긴 섹션 재분할·겹침", "헤딩 경로 prefix"]),
            I("임베딩 생성·저장 및 처리 상태 관리", ["feat", "area:rag", "P0"]),
            I("문서 목록 상태 polling 및 재업로드", ["feat", "area:rag", "P1"]),
            I("청크 미리보기 시트", ["feat", "area:rag", "P1"]),
            I("샘플 가이드 시드 스크립트 (데모 가이드 세트)", ["chore", "area:rag", "P0"]),
        ],
    },
    {
        "title": "STAGE 6 · RAG 생성 연결·가이드 검색",
        "goal": "검색한 가이드를 생성에 반영하고 근거를 보여준다.",
        "done_when": "가이드 적용 on/off 비교 시 규칙 반영 차이가 보이고, 출처 칩으로 근거를 확인할 수 있다.",
        "issues": [
            I("match_guide_chunks 함수와 검색 모듈", ["feat", "area:rag", "P0"]),
            I("생성 프롬프트에 가이드 주입 + 문서 내 지시문 무시 처리", ["feat", "area:rag", "P0"]),
            I("출처 전달(응답 헤더)과 출처 칩·원문 모달", ["feat", "area:chat", "P0"]),
            I("가이드 적용 토글 연결", ["feat", "area:rag", "P1"]),
            I("가이드 검색 화면 (청크 목록 + 요약 스트리밍)", ["feat", "area:rag", "P1"]),
            I("검색 결과 없음 처리 및 유사도 임계값 튜닝", ["feat", "area:rag", "P1"]),
        ],
    },
    {
        "title": "STAGE 7 · 접근성 자동 검사",
        "goal": "생성된 컴포넌트를 렌더 직후 자동 검사한다.",
        "done_when": "위반이 심각도별로 표시되고, 클릭하면 에디터 해당 줄로 이동한다.",
        "issues": [
            I("샌드박스 a11y 러너 (axe-core) + postMessage", ["feat", "area:a11y", "P0"]),
            I("부모 창 결과 수신 + Zod 검증", ["feat", "area:a11y", "P0"]),
            I("접근성 패널 및 점수 계산", ["feat", "area:a11y", "P0"]),
            I("data-loc 주입과 위반 → 코드 줄 이동", ["feat", "area:a11y", "P1"]),
            I("확인 필요(incomplete) 항목 분리 표시", ["feat", "area:a11y", "P1"]),
        ],
    },
    {
        "title": "STAGE 8 · AI 자동 수정",
        "goal": "검사 결과로 AI가 고치고 다시 검사해 개선을 증명한다.",
        "done_when": "테스트 세트에서 자동 수정 후 위반 수가 줄고, 전후 비교와 diff로 설명할 수 있다.",
        "issues": [
            I("/api/fix 구현 + 수정 프롬프트", ["feat", "area:a11y", "P0"]),
            I("자동 재검사 및 전후 비교 카드", ["feat", "area:a11y", "P0"]),
            I("수정 반복 제한(최대 2회)과 수동 확인 안내", ["feat", "area:a11y", "P0"]),
            I("개별 위반 선택 수정", ["feat", "area:a11y", "P1"]),
            I("이미지 alt 후보 제안 (비전 모델)", ["feat", "area:a11y", "P2"]),
        ],
    },
    {
        "title": "STAGE 9 · 평가·성과 측정",
        "goal": "품질을 숫자로 증명한다.",
        "done_when": "README에 넣을 측정 결과 표(준수율, 위반 수, 성공률, TTFT)가 있다.",
        "issues": [
            I("eval/rules.ts 규칙 채점 함수 (pass/fail/na)", ["test", "area:eval", "P0"]),
            I("run-eval.ts (가이드 off/on × 3회)", ["test", "area:eval", "P0"]),
            I("Playwright + axe 위반 측정 및 수정 전후 비교", ["test", "area:eval", "P0"]),
            I("평가 결과 리포트 자동 출력 (eval/results)", ["test", "area:eval", "P1"]),
            I("개선 1사이클 후 재측정 및 holdout 최종 측정", ["test", "area:eval", "P0"]),
        ],
    },
    {
        "title": "STAGE 10 · 안정화·배포",
        "goal": "처음 온 사람도 막힘없이 체험하고, 비용과 보안이 통제된다.",
        "done_when": "처음 방문한 사람이 1분 안에 생성 → 검사 → 자동 수정까지 체험할 수 있다.",
        "issues": [
            I("호출 제한 및 비용 통제", ["feat", "area:infra", "P0"]),
            I("데모 모드 (샘플 가이드, 비로그인 체험)", ["feat", "area:ui", "P0"]),
            I("에러 UX 정리 (네트워크·타임아웃·형식·한도·서버)", ["feat", "area:ui", "P0"]),
            I("보안 점검 (키, 업로드 제한, 보안 헤더)", ["chore", "area:infra", "P0"]),
            I("GuideUI 자체 접근성 점검 (키보드, aria-live, Lighthouse)", ["test", "area:a11y", "P0"]),
            I("에러 모니터링 및 커스텀 도메인", ["chore", "area:infra", "P2"]),
        ],
    },
    {
        "title": "STAGE 11 · 포트폴리오화",
        "goal": "만든 것을 읽히는 결과물로 정리한다.",
        "done_when": "README, 데모 영상, 트러블슈팅 글, PPT, 자소서 문장이 준비되어 있다.",
        "issues": [
            I("README 작성 (아키텍처, 기술 결정, 측정 결과)", ["docs", "P0"]),
            I("데모 영상 1~2분", ["docs", "P0"]),
            I("트러블슈팅 글 3편 (스트림 파서, iframe 통신, 청킹 튜닝)", ["docs", "P1"]),
            I("포트폴리오 PPT 슬라이드 및 자소서 문장", ["docs", "P0"]),
        ],
    },
]

# ---------------------------------------------------------------------------
def run(args, capture=False):
    if DRY_RUN and not capture:
        print("  [dry-run]", " ".join(a if " " not in a else repr(a) for a in args[:6]), "...")
        return ""
    try:
        res = subprocess.run(args, capture_output=True, text=True)
    except FileNotFoundError:
        return None
    if res.returncode != 0:
        print("  ! 실패:", res.stderr.strip()[:300])
        return None
    return res.stdout

def main():
    if run(["gh", "--version"], capture=True) is None and not DRY_RUN:
        sys.exit("gh CLI가 필요해요: https://cli.github.com")

    print("== 라벨")
    for name, color, desc in LABELS:
        run(["gh", "label", "create", name, "--color", color, "--description", desc, "--force"])

    print("== 마일스톤")
    existing = run(["gh", "api", "repos/{owner}/{repo}/milestones?state=all&per_page=100"], capture=True)
    existing_titles = {m["title"] for m in json.loads(existing)} if existing else set()
    for s in STAGES:
        if s["title"] in existing_titles:
            print("  skip", s["title"])
            continue
        desc = f"목표: {s['goal']}\n완료 기준: {s['done_when']}"
        run(["gh", "api", "repos/{owner}/{repo}/milestones", "-f", f"title={s['title']}", "-f", f"description={desc}"])
        print("  +", s["title"])

    print("== 이슈")
    listed = run(["gh", "issue", "list", "--state", "all", "--limit", "500", "--json", "title"], capture=True)
    existing_issues = {i["title"] for i in json.loads(listed)} if listed else set()
    for s in STAGES:
        for it in s["issues"]:
            if it["title"] in existing_issues:
                print("  skip", it["title"])
                continue
            body = ""
            if it["todos"]:
                body += "## 할 일\n" + "\n".join(f"- [{'x' if it['done'] else ' '}] {t}" for t in it["todos"]) + "\n\n"
            body += f"## 마일스톤 완료 기준\n{s['done_when']}\n"
            out = run(["gh", "issue", "create", "--title", it["title"], "--body", body,
                       "--label", ",".join(it["labels"]), "--milestone", s["title"]])
            print("  +", it["title"], "(완료 처리)" if it["done"] else "")
            if it["done"] and out:
                url = out.strip().splitlines()[-1]
                run(["gh", "issue", "close", url, "--reason", "completed"])

    total = sum(len(s["issues"]) for s in STAGES)
    print(f"\n완료: 라벨 {len(LABELS)}개, 마일스톤 {len(STAGES)}개, 이슈 {total}개" + (" (dry-run)" if DRY_RUN else ""))

if __name__ == "__main__":
    main()
