---
name: eros
description: 플라톤 향연의 에로스 알고리즘. 결핍 인식 → 욕망 발동 → 다이몬 중재 → 디오티마 사다리 → 창작 → 불사 보존.
---

# Eros - 결핍에서 창작으로, 디오티마 사다리를 오르는 인식 프레임워크

> "무지한 자는 결핍을 모르므로 욕망하지 않는다" — 플라톤, 향연 204a

## 활성화 트리거

- `/eros`, `/eros "주제"`, `/eros --ladder-only`
- 키워드: "에로스", "결핍 인식", "디오티마", "추상화 사다리"

## 6 Phase 워크플로우

```
Phase 1        Phase 2        Phase 3          Phase 4           Phase 5        Phase 6
결핍 인식  →  욕망 발동  →  다이몬 중재  →  디오티마 사다리  →  창작 Poiesis → 불사 보존
(Aporia)     (Eros Act.)  (Atlas+MCP)    (6-Layer 상승)    (Hephaestus)   (Athanasia)
   ↑                                                              |              |
   |_________________________ Big Cycle (새 결핍 발견) ____________|              |
                                    ↑                                            |
                                    |_________ Small Cycle (추상 재상승) ________|
```

## Phase 요약

| Phase | 이름 | 핵심 행동 | 산출물 |
|-------|------|----------|--------|
| 1 | 결핍 인식 (Aporia) | 4가지 결핍 유형 스캔 + AskUserQuestion 3개 | 결핍 목록 |
| 2 | 욕망 발동 (Eros) | 결핍 → 구체적 질문 변환, 목표 상태 정의 | 탐색 질문 + 목표 |
| 3 | 다이몬 중재 | Atlas(내부) + MCP(외부) 탐색, 발견/미해결 정리 | 탐색 결과 |
| 4 | 디오티마 사다리 | Layer 0→5 순차 상승, 각 단계 AskUserQuestion | 추상화 계층 문서 |
| 5 | 창작 Poiesis | 추상 원리를 구체 산출물로 변환 + 검증 | 코드/문서/패턴 |
| 6 | 불사 보존 | eros-analysis.md 생성, memory 업데이트 | 분석 문서 + 학습 |

## 참조 라우팅

| Phase | Reference | 로드 시점 |
|-------|-----------|----------|
| 1-2 | references/deficiency-recognition.md | 결핍 인식 + 욕망 발동 진입 시 |
| 3 | references/daimon-mediation.md | 다이몬 중재 진입 시 |
| 4 | references/diotima-ladder.md | 디오티마 사다리 진입 시 (핵심) |
| 5 | references/poiesis-creation.md | 창작 진입 시 |
| 6 | references/output-template.md | 불사 보존 + 산출물 생성 시 |

## 모드

```bash
/eros                    # 전체 6 Phase 실행
/eros "주제"             # 주제를 Phase 1 입력으로 사용
/eros --ladder-only      # Phase 4 디오티마 사다리만 실행
```

## 제약 조건

### MUST DO
- Phase 1에서 반드시 AskUserQuestion 3개로 결핍 드러내기
- Phase 4 디오티마 사다리는 Layer 0→5 순차 상승 (건너뛰기 절대 금지)
- 각 Layer 상승 전 AskUserQuestion으로 사용자 확인
- Phase 5 산출물에 Verification Discipline 적용 (증거 필수)
- Phase 6에서 eros-analysis.md + memory 업데이트
- `/common-ground` 결과가 있으면 Phase 1 입력으로 활용

### MUST NOT DO
- Layer 0 없이 Layer 2 이상 진입 금지
- "아마 작동할 것" 같은 추측 완료 금지
- Big/Small Cycle 피드백 루프 무시 금지
- 사다리 상승 중 사용자 동의 없이 Layer 건너뛰기 금지

## 스킬 간 연동

| 연동 스킬 | 역할 |
|----------|------|
| `/common-ground` | Phase 1 입력 (가정 목록 → 결핍 후보) |
| `/the-fool` | Phase 4 각 Layer에서 가정 검증 (Mode 1) |
| `/socrates` | Phase 6 → `/socrates` (목표 상태를 기획 입력으로) |
| `/socrates` → `/eros` | 기획 완료 후 숨은 가정/결핍 검증 |
| `/systematic-debugging` | 3회 실패 시 `/eros`로 전환 추천 |

## 빠른 시작

```bash
# 1. 전체 플로우
/eros "왜 이 API가 느린지 모르겠다"

# 2. 사다리만 실행
/eros --ladder-only

# 3. common-ground 연동
/common-ground --check   # 가정 목록 생성
/eros                    # 가정 목록을 결핍 후보로 활용
```

## 다음 단계 (CRITICAL)

Phase 6 완료 후 반드시 AskUserQuestion:

```json
{
  "questions": [{
    "question": "에로스 분석 완료! 다음 단계를 선택해주세요:",
    "header": "다음 단계",
    "options": [
      {"label": "Big Cycle 재시작", "description": "새 결핍이 발견되었으므로 Phase 1로 복귀"},
      {"label": "/socrates 기획 시작 (권장)", "description": "목표 상태를 기반으로 소크라테스 기획 진행"},
      {"label": "/auto-orchestrate 실행", "description": "분석 결과를 바탕으로 자동 구현"},
      {"label": "/the-fool 검증", "description": "분석 결과의 가정을 비판적으로 검증"},
      {"label": "여기서 마무리", "description": "eros-analysis.md 저장 후 종료"}
    ],
    "multiSelect": false
  }]
}
```

선택에 따라 `Skill` 도구로 즉시 실행.
