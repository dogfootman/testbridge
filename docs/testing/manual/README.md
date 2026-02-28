# TestBridge 기능 테스트 매뉴얼

**프로젝트**: TestBridge - Google Play 테스터 매칭 플랫폼
**버전**: v1.0 MVP
**작성일**: 2026-03-01
**목적**: 수동 기능 테스트를 위한 단계별 가이드

---

## 📋 매뉴얼 구성

본 테스트 매뉴얼은 **4개의 섹션**으로 구성되어 있습니다:

| 번호 | 문서 | 설명 | 대상 화면 |
|------|------|------|----------|
| 01 | [공통 기능](./01-common-features.md) | 모든 사용자가 접근하는 공통 화면 | Landing, Signup, Login, Profile, Notifications |
| 02 | [개발자 기능](./02-developer-features.md) | 개발자 역할 전용 화면 | Dashboard, App Register, Apps List, App Detail |
| 03 | [테스터 기능](./03-tester-features.md) | 테스터 역할 전용 화면 | Tester Home, App Detail, Participations, Feedback |
| 04 | [통합 시나리오](./04-integration-scenarios.md) | End-to-End 전체 플로우 | 개발자 플로우, 테스터 플로우 |

---

## 🚀 빠른 시작

### 1. 환경 준비

```bash
# Backend 서버 시작
npm run dev

# Database 실행
# PostgreSQL이 실행 중이어야 함
```

### 2. 테스트 계정 생성

**개발자 계정**:
1. http://localhost:3000/auth/signup 접속
2. Google OAuth로 로그인
3. 역할: "개발자" 선택
4. 닉네임 입력 후 가입

**테스터 계정**:
1. http://localhost:3000/auth/signup 접속
2. Google OAuth로 로그인 (다른 Google 계정)
3. 역할: "테스터" 선택
4. 닉네임 입력 후 가입

### 3. 테스트 실행 순서

**권장 순서**:
1. ✅ [공통 기능](./01-common-features.md) - Landing, Signup, Login부터 시작
2. ✅ [개발자 기능](./02-developer-features.md) - 앱 등록 및 관리
3. ✅ [테스터 기능](./03-tester-features.md) - 앱 탐색 및 피드백
4. ✅ [통합 시나리오](./04-integration-scenarios.md) - 전체 플로우 검증

---

## 📊 테스트 체크리스트

### 공통 기능 (5개 화면)
- [ ] S-01: Landing Page
- [ ] S-02: Signup
- [ ] S-03: Login
- [ ] S-04: Profile
- [ ] S-05: Notifications

### 개발자 기능 (4개 화면)
- [ ] D-01: Developer Dashboard
- [ ] D-02: App Register (4단계 위저드)
- [ ] D-03: Apps List
- [ ] D-04: App Detail / Test Management

### 테스터 기능 (4개 화면)
- [ ] T-01: Tester Home / App Discovery
- [ ] T-02: App Detail (Tester View)
- [ ] T-03: My Participations
- [ ] T-04: Feedback Form

### 통합 시나리오 (2개 플로우)
- [ ] 시나리오 1: 개발자 전체 플로우 (15-20분)
- [ ] 시나리오 2: 테스터 전체 플로우 (15-20분)

---

## 🔍 테스트 방법론

### 각 매뉴얼의 구조

모든 매뉴얼은 다음과 같은 일관된 구조를 따릅니다:

```
화면명
├── 테스트 목적
├── 사전 준비사항
├── 테스트 절차 (단계별)
│   ├── 1단계: 동작 설명
│   ├── 예상 결과
│   ├── 2단계: 동작 설명
│   └── ...
├── 최종 체크리스트
└── 주의사항 / 트러블슈팅
```

### 테스트 실행 원칙

1. **단계별 진행**: 각 단계를 순서대로 실행
2. **예상 결과 확인**: 각 단계마다 예상 결과와 실제 결과 비교
3. **체크리스트 작성**: [ ] → [x]로 완료 표시
4. **이슈 기록**: 문제 발견 시 스크린샷과 함께 기록

---

## 🐛 이슈 리포팅

테스트 중 발견한 이슈는 다음 형식으로 기록하세요:

```markdown
### 이슈 #N: [제목]

**발견 위치**: [매뉴얼 번호] > [화면명] > [단계]
**심각도**: Critical / High / Medium / Low
**재현 절차**:
1. ...
2. ...

**예상 동작**: ...
**실제 동작**: ...
**스크린샷**: [첨부]
**브라우저**: Chrome 120.0
**발견일**: 2026-03-01
```

---

## 📚 관련 문서

- [FEATURES.md](../FEATURES.md) - 전체 기능 목록
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - 자동화 테스트 가이드
- [TESTING_SUMMARY.md](../TESTING_SUMMARY.md) - 테스트 결과 요약

---

## 🎯 테스트 완료 기준

### 통과 조건
- [ ] 모든 공통 기능 화면 테스트 완료 (5/5)
- [ ] 모든 개발자 기능 화면 테스트 완료 (4/4)
- [ ] 모든 테스터 기능 화면 테스트 완료 (4/4)
- [ ] 개발자 전체 플로우 시나리오 통과 (1/1)
- [ ] 테스터 전체 플로우 시나리오 통과 (1/1)
- [ ] Critical/High 이슈 0건

### 배포 가능 기준
- [ ] 모든 체크리스트 항목 통과
- [ ] Medium 이슈 3건 이하
- [ ] Low 이슈 10건 이하
- [ ] 통합 시나리오 2회 이상 성공

---

**작성자**: TestBridge QA Team
**최종 수정**: 2026-03-01
