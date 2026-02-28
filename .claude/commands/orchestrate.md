# Orchestrate Command

## Description
TASKS.md를 분석하여 태스크를 자동 실행하는 오케스트레이터 커맨드

## Usage

```bash
/orchestrate [options]
```

## Options

- `--phase <number>`: 특정 Phase만 실행
- `--task <id>`: 특정 Task만 실행
- `--parallel`: 병렬 실행 가능한 태스크를 동시에 실행
- `--dry-run`: 실행 계획만 표시

## Examples

```bash
/orchestrate                    # 전체 Phase 순차 실행
/orchestrate --phase 1          # Phase 1만 실행
/orchestrate --task P1-R1-T1    # 특정 Task만 실행
/orchestrate --parallel         # 병렬 실행 모드
```

## How It Works

1. **TASKS.md 파싱**: Phase, Task 구조 분석
2. **의존성 해결**: blockedBy, dependsOn 확인
3. **실행 계획 생성**: 순차/병렬 실행 계획
4. **전문가 에이전트 호출**: 각 Task를 적절한 에이전트에 위임
5. **검증**: 각 Phase 완료 후 Verification 실행

## Agent Routing

| Task Type | Agent |
|-----------|-------|
| P{N}-R{M}-T{X} (Backend Resource) | backend-specialist |
| P{N}-S{M}-T{X} (Frontend Screen) | frontend-specialist |
| P{N}-DB-{X} (Database) | database-specialist |
| P{N}-S{M}-V (Verification) | test-specialist |

## Dependencies

- **Required**: TASKS.md in docs/planning/06-tasks.md
- **Optional**: .claude/agents/ directory
