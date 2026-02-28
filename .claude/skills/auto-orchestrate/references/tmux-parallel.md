# tmux 기반 병렬 에이전트 오케스트레이션

> **로드 시점**: `--tmux` 모드 선택 시 / tmux 기반 병렬 실행 시
> **핵심**: 각 태스크를 독립 tmux 패널의 Claude CLI 프로세스로 실행

---

## 기존 방식 vs tmux 방식

```
┌─────────────────────────────────────────────────────────────────┐
│  기존 (Task 도구 + run_in_background):                          │
│  ├── Claude Code 내부 서브에이전트로 실행                        │
│  ├── 서브에이전트 중첩 호출 불가 (1단계만)                       │
│  └── 메인 컨텍스트와 같은 프로세스 내 동작                       │
│                                                                 │
│  tmux 모드 (--tmux):                                            │
│  ├── 완전 독립 OS 프로세스로 실행                                │
│  ├── 각 에이전트가 자체 컨텍스트 윈도우 보유                     │
│  ├── 중첩 제한 없음 (독립 프로세스)                              │
│  ├── 파일 기반 통신 (/tmp/task-*.done, /tmp/task-*-result.md)   │
│  └── 하나가 죽어도 나머지 영향 없음                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 모드 선택 가이드

| 조건 | 권장 모드 | 이유 |
|------|----------|------|
| Task 30개 미만, 간단 | 기존 Task 도구 | 셋업 오버헤드 없음 |
| Task 30-200개, 무인 자동화 | `--tmux` | 독립 프로세스, 컨텍스트 격리 |
| Task 200개+, 대규모 | `--tmux --parallel 6` | 프로세스 격리로 안정적 |
| 디버깅/학습 목적 | 반자동화 | 세밀한 제어 |

---

## 실행 절차

### 1단계 — TASKS.md 분석 + 그룹화

```python
# 오케스트레이터가 수행 (Bash/Read 도구 사용)

# 1. TASKS.md 읽기
tasks = Read("docs/planning/TASKS.md")  # 또는 TASKS.md

# 2. 의존성 분석
#    - 각 태스크의 "의존" / "Depends On" 필드 추출
#    - 독립 태스크끼리 병렬 그룹으로 묶음

# 3. 실행 순서 결정
groups = [
  # Group 1: 의존성 없는 태스크 (병렬 실행)
  [{"id": "T0.1", "desc": "프로젝트 초기화", "specialist": "backend"},
   {"id": "T0.2", "desc": "DB 스키마 설계", "specialist": "database"}],

  # Group 2: Group 1 완료 후 실행 가능한 태스크
  [{"id": "T1.1", "desc": "사용자 API", "specialist": "backend"},
   {"id": "T1.2", "desc": "로그인 UI", "specialist": "frontend"}],

  # Group 3: Group 2에 의존
  [{"id": "T2.1", "desc": "통합 테스트", "specialist": "test"}]
]
```

### 2단계 — tmux 세션 생성

```bash
# tmux 세션 생성 (이미 존재하면 재사용)
tmux has-session -t vibe 2>/dev/null || tmux new-session -d -s vibe -x 200 -y 50

# 작업 디렉토리 설정
PROJECT_DIR="$(pwd)"
TASK_COUNT=0
```

### 3단계 — 서브에이전트 실행 (그룹별)

각 그룹의 태스크마다 독립 tmux 패널 생성 + Claude CLI 실행:

```bash
# 그룹 내 각 태스크에 대해:

# 1. 신호 파일 초기화
rm -f /tmp/task-${TASK_ID}.done /tmp/task-${TASK_ID}-result.md

# 2. 새 tmux 패널 생성
tmux split-window -v -t vibe

# 3. 패널 레이아웃 정리
tmux select-layout -t vibe tiled

# 4. Claude CLI 실행 (각 패널에서 독립적으로)
tmux send-keys -t vibe "claude --dangerously-skip-permissions -p '
작업 디렉터리: ${PROJECT_DIR}
담당 태스크: ${TASK_ID} - ${TASK_DESC}
참고 파일: ${RELATED_FILES}
제약 조건: ${CONSTRAINTS}

## 작업 지침
${TASK_INSTRUCTIONS}

## TDD 필수 (Phase 1+)
1. 테스트 먼저 작성 → 실패 확인 (RED)
2. 최소 구현 → 테스트 통과 (GREEN)
3. 리팩토링 (REFACTOR)

## 완료 시 필수 행동
1. 작업 결과를 /tmp/task-${TASK_ID}-result.md 에 요약 작성
2. touch /tmp/task-${TASK_ID}.done 실행하여 완료 신호 생성
3. 만약 실패했다면 result.md에 FAIL:사유 기록 후 .done 파일 생성

## 결과 기록 형식 (/tmp/task-${TASK_ID}-result.md)
---
task_id: ${TASK_ID}
status: DONE  # 또는 FAIL
specialist: ${SPECIALIST}
files_changed:
  - path/to/file1
  - path/to/file2
summary: 작업 요약 (1-3줄)
errors: null  # 또는 에러 메시지
---
' && exit" Enter
```

### 4단계 — 완료 모니터링

```bash
# 현재 그룹의 모든 태스크 완료 대기
TASK_IDS=("T0.1" "T0.2")  # 현재 그룹의 태스크 ID 목록
TIMEOUT=600  # 최대 대기 시간 (초)
ELAPSED=0

while true; do
  all_done=true
  for TASK_ID in "${TASK_IDS[@]}"; do
    if [[ ! -f "/tmp/task-${TASK_ID}.done" ]]; then
      all_done=false
      break
    fi
  done

  if $all_done; then
    echo "✅ 그룹 완료: ${TASK_IDS[*]}"
    break
  fi

  # 타임아웃 체크
  if [[ $ELAPSED -ge $TIMEOUT ]]; then
    echo "⚠️ 타임아웃! 미완료 태스크 확인 필요"
    break
  fi

  sleep 5
  ELAPSED=$((ELAPSED + 5))
done
```

### 5단계 — 결과 취합

```bash
# 각 태스크의 결과 파일 읽기
for TASK_ID in "${ALL_TASK_IDS[@]}"; do
  if [[ -f "/tmp/task-${TASK_ID}-result.md" ]]; then
    echo "=== ${TASK_ID} ==="
    cat "/tmp/task-${TASK_ID}-result.md"
    echo ""
  else
    echo "⚠️ ${TASK_ID}: 결과 파일 없음"
  fi
done
```

---

## 서브에이전트 프롬프트 템플릿

각 서브에이전트에게 전달하는 프롬프트에 **반드시** 포함할 항목:

```markdown
작업 디렉터리: [프로젝트 절대 경로]
담당 태스크: [태스크 ID] - [태스크 설명]
참고 파일: [관련 파일 목록, 쉼표 구분]
제약 조건: [건드리면 안 되는 파일/범위]
Worktree: [Phase 1+일 경우 Worktree 경로]

## 상세 작업 지침
[TASKS.md에서 추출한 상세 요구사항]

## 완료 조건
[TASKS.md에서 추출한 완료 조건]

## 완료 신호 (반드시 실행!)
완료 시: touch /tmp/task-[N].done
결과 기록: /tmp/task-[N]-result.md 에 작업 요약 작성
```

### 프롬프트 예시

```
작업 디렉터리: /Users/dev/my-project
담당 태스크: T1.3 - 사용자 인증 API 구현
참고 파일: src/api/auth.ts, src/models/user.ts, tests/api/auth.test.ts
제약 조건: src/config/ 디렉토리는 수정 금지
Worktree: worktree/phase-1-auth

## 상세 작업 지침
1. JWT 기반 인증 엔드포인트 구현
   - POST /api/auth/login
   - POST /api/auth/register
   - POST /api/auth/refresh
2. bcrypt로 비밀번호 해싱
3. Access Token (15분) + Refresh Token (7일) 전략

## TDD 필수
1. RED: tests/api/auth.test.ts 작성 → 실패 확인
2. GREEN: src/api/auth.ts 구현 → 통과
3. REFACTOR: 코드 정리

## 완료 조건
- 3개 엔드포인트 모두 동작
- 테스트 커버리지 80% 이상
- TypeScript 타입 에러 없음

## 완료 신호
touch /tmp/task-T1.3.done
결과 기록: /tmp/task-T1.3-result.md
```

---

## 결과 파일 형식 (/tmp/task-N-result.md)

### 성공 시

```markdown
---
task_id: T1.3
status: DONE
specialist: backend
elapsed_seconds: 180
files_changed:
  - src/api/auth.ts
  - src/models/user.ts
  - tests/api/auth.test.ts
tests_passed: 12
test_coverage: 85%
summary: |
  JWT 기반 인증 API 3개 엔드포인트 구현 완료.
  bcrypt 해싱, Access/Refresh 토큰 전략 적용.
errors: null
---
```

### 실패 시

```markdown
---
task_id: T1.3
status: FAIL
specialist: backend
elapsed_seconds: 300
files_changed:
  - src/api/auth.ts (부분 구현)
tests_passed: 3
test_coverage: 30%
summary: |
  login, register 엔드포인트 구현 완료.
  refresh 엔드포인트에서 Redis 연결 실패.
errors: |
  FAIL:T1.3:Redis connection refused - ECONNREFUSED 127.0.0.1:6379
---
```

---

## tmux 세션 관리

### 세션 생성

```bash
# 새 세션 생성 (detached)
tmux new-session -d -s vibe -x 200 -y 50

# 이미 존재하면 재사용
tmux has-session -t vibe 2>/dev/null || tmux new-session -d -s vibe -x 200 -y 50
```

### 패널 생성 + 에이전트 실행

```bash
# 수직 분할로 새 패널 생성
tmux split-window -v -t vibe

# 타일 레이아웃 적용 (패널이 많을 때 균등 분할)
tmux select-layout -t vibe tiled

# 패널에 명령 전송
tmux send-keys -t vibe "claude --dangerously-skip-permissions -p '...' && exit" Enter
```

### 세션 모니터링

```bash
# 현재 세션의 패널 목록 확인
tmux list-panes -t vibe

# 특정 패널 출력 확인
tmux capture-pane -t vibe -p

# 세션 접속 (실시간 모니터링)
tmux attach -t vibe
```

### 세션 정리

```bash
# 완료 후 세션 종료
tmux kill-session -t vibe

# 신호 파일 정리
rm -f /tmp/task-*.done /tmp/task-*-result.md
```

---

## 오케스트레이터 전체 실행 흐름 (의사 코드)

```python
# ============================================
# tmux 병렬 오케스트레이터 메인 루프
# ============================================

# 0. 초기화
project_dir = os.getcwd()
Bash("tmux has-session -t vibe 2>/dev/null || tmux new-session -d -s vibe -x 200 -y 50")
Bash("rm -f /tmp/task-*.done /tmp/task-*-result.md")

# 1. TASKS.md 분석
tasks = Read("TASKS.md")  # 또는 docs/planning/TASKS.md
groups = analyze_dependencies(tasks)  # 의존성 기반 그룹화

# 2. 그룹별 순차 실행 (그룹 내 병렬)
for group_idx, group in enumerate(groups):
    print(f"=== Group {group_idx + 1}/{len(groups)} 실행 중 ===")

    # 2-1. 그룹 내 태스크 병렬 실행
    for task in group:
        # 신호 파일 초기화
        Bash(f"rm -f /tmp/task-{task.id}.done /tmp/task-{task.id}-result.md")

        # tmux 패널 생성 + Claude 실행
        Bash(f"tmux split-window -v -t vibe")
        Bash(f"tmux select-layout -t vibe tiled")

        prompt = build_prompt(task, project_dir)  # 프롬프트 생성
        Bash(f"""tmux send-keys -t vibe "claude --dangerously-skip-permissions -p '{prompt}' && exit" Enter""")

    # 2-2. 그룹 완료 대기
    task_ids = [t.id for t in group]
    Bash(f"""
    ELAPSED=0
    while true; do
      all_done=true
      for id in {' '.join(task_ids)}; do
        [[ ! -f "/tmp/task-$id.done" ]] && all_done=false && break
      done
      $all_done && break
      [[ $ELAPSED -ge 600 ]] && echo "TIMEOUT" && break
      sleep 5
      ELAPSED=$((ELAPSED + 5))
    done
    """)

    # 2-3. 그룹 결과 수집
    results = []
    for task in group:
        result = Read(f"/tmp/task-{task.id}-result.md")
        results.append(result)

    # 2-4. 실패 태스크 확인
    failed = [r for r in results if "FAIL" in r]
    if failed:
        print(f"⚠️ 실패 태스크: {len(failed)}개")
        # 의존 태스크 blocked 처리

    # 2-5. Phase 전환 확인
    if is_phase_boundary(group_idx, groups):
        # Phase 병합 (테스트 → 빌드 → merge)
        Bash("cd worktree/phase-N && npm test && npm run build")
        Bash("git merge phase-N --no-ff")

# 3. 최종 보고
all_results = collect_all_results()
print_summary(all_results)

# 4. 정리
Bash("tmux kill-session -t vibe")
Bash("rm -f /tmp/task-*.done /tmp/task-*-result.md")
```

---

## 병렬 실행 제한

### 최대 동시 패널 수

| 시스템 | 권장 최대 | 이유 |
|--------|----------|------|
| 8GB RAM | 3개 | Claude CLI 프로세스당 ~1-2GB |
| 16GB RAM | 4-5개 | 여유 있는 병렬화 |
| 32GB+ RAM | 6-8개 | 최대 효율 |

### `--parallel N` 옵션

```bash
# 최대 동시 실행 수 지정
/auto-orchestrate --tmux --parallel 4

# 기본값: 3 (안전한 수준)
# 하드 리밋: 시스템 RAM에 따라 자동 조절
```

---

## 에러 처리

### 타임아웃 (서브에이전트 응답 없음)

```bash
# 600초(10분) 후에도 .done 파일 없으면:
# 1. 해당 tmux 패널 확인
tmux capture-pane -t vibe:0.{panel_id} -p | tail -20

# 2. 패널 강제 종료 + FAIL 기록
echo "---
task_id: ${TASK_ID}
status: FAIL
errors: TIMEOUT after 600s
---" > /tmp/task-${TASK_ID}-result.md
touch /tmp/task-${TASK_ID}.done
```

### Claude CLI 프로세스 크래시

```bash
# tmux 패널이 사라진 경우:
# 1. 패널 목록 확인
tmux list-panes -t vibe 2>/dev/null

# 2. .done 파일 없으면 FAIL 처리
if [[ ! -f "/tmp/task-${TASK_ID}.done" ]]; then
  echo "---
task_id: ${TASK_ID}
status: FAIL
errors: Claude CLI process crashed
---" > /tmp/task-${TASK_ID}-result.md
  touch /tmp/task-${TASK_ID}.done
fi
```

### 파일 충돌 (같은 파일 동시 수정)

```
⛔ 방지 규칙:
├── 같은 파일을 수정하는 태스크는 같은 그룹에 넣지 않음
├── TASKS.md의 "참고 파일" 필드로 충돌 사전 감지
└── 서브에이전트 프롬프트에 "제약 조건" 명시
```

---

## --tmux 모드에서의 보안 고려

### `--dangerously-skip-permissions` 플래그

```
⚠️ 이 플래그는 Claude CLI의 모든 권한 확인을 우회합니다.
├── 파일 읽기/쓰기, 명령어 실행, 네트워크 접근 모두 허용
├── 무인 자동화에서만 사용
└── 사용자가 명시적으로 --tmux 모드를 선택한 경우에만 활성화
```

### 대안: `claude -p` (print 모드)

```bash
# 권한 확인 없이 결과만 파일로 출력하는 안전한 방식
tmux send-keys -t vibe "claude -p '...' > /tmp/task-${TASK_ID}-output.txt 2>&1 && touch /tmp/task-${TASK_ID}.done && exit" Enter
```

- 파일 수정이 필요 없는 분석/리서치 태스크에 적합
- 코드 작성이 필요한 태스크에는 `--dangerously-skip-permissions` 필수

---

## 상태 파일 연동

tmux 모드에서도 기존 `orchestrate-state.json`과 연동:

```json
{
  "version": "2.0",
  "mode": "tmux",
  "tmux_session": "vibe",

  "execution": {
    "current_phase": 1,
    "current_group": 2,
    "total_groups": 5,
    "worktree": "worktree/phase-1-feature"
  },

  "tasks": {
    "pending": ["T1.5", "T1.6"],
    "in_progress": ["T1.3", "T1.4"],
    "completed": ["T0.1", "T0.2", "T1.1", "T1.2"],
    "failed": [],
    "blocked": []
  },

  "tmux_panels": {
    "T1.3": {"panel_id": "0.1", "started_at": "2026-02-20T10:00:00Z"},
    "T1.4": {"panel_id": "0.2", "started_at": "2026-02-20T10:00:00Z"}
  }
}
```

---

## 재개 (--resume)

```bash
# 중단 후 재개
/auto-orchestrate --tmux --resume

# 재개 시:
# 1. orchestrate-state.json 로드
# 2. completed 태스크 건너뛰기
# 3. in_progress 태스크를 pending으로 복귀
# 4. 다음 그룹부터 실행
```

---

## 모니터링 팁

```bash
# 1. tmux 세션에 직접 접속
tmux attach -t vibe

# 2. 패널 간 이동: Ctrl+B → 방향키

# 3. 진행 상황 실시간 확인 (별도 터미널)
watch -n 5 'ls -la /tmp/task-*.done 2>/dev/null | wc -l && echo "완료" && ls /tmp/task-*.done 2>/dev/null'

# 4. 결과 실시간 확인
watch -n 5 'for f in /tmp/task-*-result.md; do echo "=== $(basename $f) ==="; head -3 $f; echo; done'
```
