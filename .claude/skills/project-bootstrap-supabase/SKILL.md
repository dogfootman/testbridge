---
name: project-bootstrap-supabase
description: Next.js + Supabase + Vercel CI/CD 풀스택 프로젝트를 원커맨드로 셋업. "Supabase 프로젝트 만들어줘", "Next.js Supabase 셋업", "Supabase로 프로젝트 시작" 등 프로젝트 생성 의도가 명확한 요청에만 반응. 단순 Supabase 사용법 질문이나 기존 프로젝트 수정 요청에는 반응하지 않음. /project-bootstrap에서 Next.js + Supabase 조합 선택 시 자동 위임됨.
---

# Project Bootstrap Supabase Skill

이 스킬은 다음 경우에 발동된다:

1. **직접 호출**: 사용자가 `/project-bootstrap-supabase` 입력
2. **자연어 매칭**: "Supabase 프로젝트 만들어줘", "Next.js Supabase 셋업" 등 **프로젝트 생성 의도가 명확한** 요청
3. **자동 위임**: `/project-bootstrap`에서 프론트엔드=Next.js, DB=Supabase 조합 선택 시 자동 전환

> **주의**: "Supabase 연결 방법", "Supabase RLS 설정" 등 단순 질문에는 반응하지 않는다.

## 필수 실행 규칙

**중요: 이 스킬은 반드시 아래 단계를 순서대로 실행해야 한다. 단계를 건너뛰지 말 것.**

---

## 워크플로우 개요

| Phase | 설명 | 주요 작업 |
|-------|------|----------|
| **Phase 1** | Project Bootstrap | `create-next-app` + `supabase init` |
| **Phase 2** | Local Supabase Stack | Docker 체크 + `supabase start` + `.env.local` 생성 |
| **Phase 3** | Scaffold Boilerplate | client.ts, server.ts, middleware.ts, init.sql |
| **Phase 4** | CI/CD Pipeline | GitHub Actions + vercel.json + git init |

> **상세 내용**: `references/phase-details.md` 참조

---

## 사전 요구사항

| 요구사항 | 최소 버전 | 확인 명령 |
|----------|----------|----------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Docker Desktop | 실행 중 | `docker info` |

**Phase 2 실행 전 Docker Desktop이 반드시 실행 중이어야 한다.** 미실행 시 사용자에게 안내 후 중단.

---

## 제약 조건

1. **크로스 플랫폼**: Mac/Linux/Windows 모두 지원하는 명령어 사용
2. **순차 실행**: Phase 1 → 2 → 3 → 4 순서 엄수. 이전 Phase 실패 시 다음 Phase 진행 금지
3. **`.env.local` 커밋 금지**: `.gitignore`에 반드시 추가
4. **사용자 확인**: 프로젝트명은 AskUserQuestion으로 확인 (기본값: `my-supabase-app`)
5. **Verification Discipline**: 각 Phase 완료 시 검증 명령 실행 후 증거 제시

---

## 실행 흐름

### 1. 프로젝트명 확인

```json
{
  "questions": [{
    "question": "프로젝트 이름을 입력해주세요:",
    "header": "프로젝트명",
    "options": [
      {"label": "my-supabase-app (기본값)", "description": "기본 프로젝트명 사용"},
      {"label": "직접 입력", "description": "원하는 프로젝트명을 입력"}
    ],
    "multiSelect": false
  }]
}
```

### 2. Phase 1~4 순차 실행

`references/phase-details.md`의 각 Phase를 순서대로 실행한다.

### 3. 최종 체크리스트 출력

Phase 4 완료 후 수동 설정이 필요한 항목을 체크리스트로 출력한다.

---

## 참조 파일

| 파일 | 설명 |
|------|------|
| [phase-details.md](./references/phase-details.md) | 4단계 상세 실행 가이드 + 보일러플레이트 코드 |

---

## 다음 단계 (CRITICAL)

> **이 섹션은 스킬 완료 후 반드시 실행합니다.**

**프로젝트 셋업 완료 후 AskUserQuestion 실행:**

```json
{
  "questions": [{
    "question": "Next.js + Supabase 프로젝트 셋업이 완료되었습니다!\n\n다음 단계를 선택해주세요:",
    "header": "다음 단계",
    "options": [
      {"label": "/auto-orchestrate 실행 (권장)", "description": "TASKS.md 기반 자동 개발"},
      {"label": "/socrates로 기획 시작", "description": "소크라테스식 기획 컨설팅"},
      {"label": "수동으로 진행", "description": "직접 개발 진행"}
    ],
    "multiSelect": false
  }]
}
```

**CRITICAL: 사용자가 스킬을 선택하면 반드시 `Skill` 도구로 즉시 실행!**

```
사용자 선택: "/auto-orchestrate 실행"
    ↓
Skill({ skill: "auto-orchestrate" })  ← 반드시 Skill 도구 호출!

사용자 선택: "/socrates로 기획 시작"
    ↓
Skill({ skill: "socrates" })  ← 반드시 Skill 도구 호출!

사용자 선택: "수동으로 진행"
    ↓
종료 메시지 출력
```

> **AskUserQuestion 결과를 텍스트로만 출력하지 말고,**
> **반드시 `Skill` 도구를 호출하여 다음 스킬을 실제 실행하세요.**

**권장 워크플로우:**
```
/socrates → /screen-spec → /tasks-generator → /project-bootstrap-supabase → /auto-orchestrate
```
