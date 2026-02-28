# UI/UX 가이드라인

**프로젝트명**: TestBridge
**버전**: v1.0
**작성일**: 2026-02-28

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [컬러 시스템](#2-컬러-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [레이아웃](#4-레이아웃)
5. [컴포넌트](#5-컴포넌트)
6. [인터랙션](#6-인터랙션)
7. [접근성](#7-접근성)

---

## 1. 디자인 원칙

### 1.1 핵심 원칙

1. **명확성 (Clarity)**: 사용자가 한눈에 이해할 수 있어야 함
2. **효율성 (Efficiency)**: 최소한의 클릭으로 목표 달성
3. **신뢰성 (Trust)**: 신뢰도 점수, 리워드 정보를 투명하게 표시
4. **반응성 (Responsiveness)**: 모바일 우선, 모든 디바이스에서 동작

### 1.2 사용자 경험 목표

- **개발자**: 테스터 모집부터 프로덕션 등록까지 5분 내 완료
- **테스터**: 앱 탐색부터 지원까지 2분 내 완료
- **관리자**: 앱 승인/반려 1분 내 처리

---

## 2. 컬러 시스템

### 2.1 브랜드 컬러

| 컬러 | Hex | 용도 |
|------|-----|------|
| Primary | `#3B82F6` | 주요 액션 버튼, 링크 |
| Primary Dark | `#2563EB` | 호버, 액티브 상태 |
| Secondary | `#10B981` | 성공, 완료 상태 |
| Accent | `#F59E0B` | HOT 태그, 강조 |
| Danger | `#EF4444` | 에러, 이탈, 경고 |
| Warning | `#F59E0B` | 주의, 보류 |
| Info | `#3B82F6` | 정보, 알림 |

### 2.2 중립 컬러

| 컬러 | Hex | 용도 |
|------|-----|------|
| Gray 50 | `#F9FAFB` | 배경 |
| Gray 100 | `#F3F4F6` | 카드 배경 |
| Gray 200 | `#E5E7EB` | 구분선 |
| Gray 400 | `#9CA3AF` | 보조 텍스트 |
| Gray 600 | `#4B5563` | 본문 텍스트 |
| Gray 900 | `#111827` | 제목 텍스트 |

### 2.3 신뢰도 배지 컬러

| 배지 | Hex | 용도 |
|------|-----|------|
| Bronze | `#CD7F32` | 0~49점 |
| Silver | `#C0C0C0` | 50~69점 |
| Gold | `#FFD700` | 70~89점 |
| Diamond | `#B9F2FF` | 90~100점 |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

```css
/* 한글 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* 영문, 숫자 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### 3.2 폰트 크기

| 용도 | 크기 | Weight | Line Height |
|------|------|--------|-------------|
| H1 (페이지 제목) | 32px | 700 | 40px |
| H2 (섹션 제목) | 24px | 600 | 32px |
| H3 (카드 제목) | 20px | 600 | 28px |
| Body (본문) | 16px | 400 | 24px |
| Small (보조) | 14px | 400 | 20px |
| Tiny (라벨) | 12px | 500 | 16px |

### 3.3 텍스트 컬러

| 용도 | 컬러 |
|------|------|
| 제목 | Gray 900 |
| 본문 | Gray 600 |
| 보조 | Gray 400 |
| 링크 | Primary |
| 에러 | Danger |

---

## 4. 레이아웃

### 4.1 반응형 브레이크포인트

```css
/* Mobile */
@media (min-width: 360px) { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

### 4.2 그리드 시스템

- **컨테이너 Max Width**: 1280px
- **좌우 패딩**: 16px (mobile), 24px (tablet), 32px (desktop)
- **컬럼**: 12 컬럼
- **간격 (Gutter)**: 16px (mobile), 24px (desktop)

### 4.3 간격 (Spacing)

```
4px (0.25rem)
8px (0.5rem)
12px (0.75rem)
16px (1rem)
24px (1.5rem)
32px (2rem)
48px (3rem)
64px (4rem)
```

---

## 5. 컴포넌트

### 5.1 버튼

**Primary Button**:
```
배경: Primary (#3B82F6)
텍스트: White
패딩: 12px 24px
Border Radius: 8px
호버: Primary Dark (#2563EB)
```

**Secondary Button**:
```
배경: Transparent
텍스트: Primary
Border: 1px solid Primary
패딩: 12px 24px
Border Radius: 8px
```

**Danger Button**:
```
배경: Danger (#EF4444)
텍스트: White
패딩: 12px 24px
Border Radius: 8px
```

### 5.2 카드

**기본 카드**:
```
배경: White
Border: 1px solid Gray 200
Border Radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
호버: Shadow 0 4px 6px rgba(0, 0, 0, 0.1)
```

**앱 카드 (T-01)**:
```
구성요소:
- 앱 아이콘 (64x64)
- 앱 이름 (H3, 20px)
- 카테고리 태그
- 리워드 금액 (강조)
- 남은 자리 표시
- 개발자 정보
```

### 5.3 입력 필드

**Text Input**:
```
배경: White
Border: 1px solid Gray 300
Border Radius: 8px
Padding: 12px 16px
Focus: Border Primary, Shadow 0 0 0 3px rgba(59, 130, 246, 0.1)
```

**Label**:
```
크기: 14px
Weight: 500
Color: Gray 700
Margin Bottom: 8px
```

### 5.4 태그 (Badge)

**HOT 태그**:
```
배경: Accent (#F59E0B)
텍스트: White
패딩: 4px 8px
Border Radius: 4px
크기: 12px
```

**카테고리 태그**:
```
배경: Gray 100
텍스트: Gray 600
패딩: 4px 8px
Border Radius: 4px
크기: 12px
```

### 5.5 프로그레스 바

**D-Day 프로그레스**:
```
높이: 8px
배경: Gray 200
진행: Primary
Border Radius: 4px
애니메이션: Smooth transition 0.3s
```

### 5.6 알림 (Toast)

**성공**:
```
배경: Secondary (#10B981)
아이콘: ✓
위치: Top Right
지속시간: 3초
```

**에러**:
```
배경: Danger (#EF4444)
아이콘: ✕
위치: Top Right
지속시간: 5초
```

---

## 6. 인터랙션

### 6.1 애니메이션

**페이드 인**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.3s ease-in;
```

**슬라이드 업**:
```css
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
animation: slideUp 0.3s ease-out;
```

### 6.2 호버 효과

**버튼 호버**:
```
배경색 변경 + Shadow 증가
Transition: 0.2s ease
```

**카드 호버**:
```
Shadow 증가
Transform: translateY(-2px)
Transition: 0.2s ease
```

### 6.3 로딩 상태

**Skeleton UI**:
- 데이터 로딩 중 회색 박스 표시
- 애니메이션: Shimmer effect

**Spinner**:
- 긴 작업 (결제, 제출) 시 사용
- Primary 컬러, 중앙 정렬

---

## 7. 접근성

### 7.1 키보드 네비게이션

- Tab 키로 모든 인터랙티브 요소 접근 가능
- Focus Indicator 명확히 표시 (Outline 3px Primary)
- Skip to Content 링크 제공

### 7.2 ARIA 레이블

```html
<!-- 버튼 -->
<button aria-label="테스트 지원하기">지원하기</button>

<!-- 링크 -->
<a href="/apps/100" aria-label="MyAwesomeApp 상세 보기">자세히</a>

<!-- 프로그레스 -->
<div role="progressbar" aria-valuenow="7" aria-valuemin="0" aria-valuemax="14">
  7/14일
</div>
```

### 7.3 컬러 대비

- WCAG AA 기준 준수
- 텍스트 대비율 최소 4.5:1
- 큰 텍스트 (18px+) 대비율 최소 3:1

### 7.4 이미지 Alt Text

```html
<img src="icon.png" alt="MyAwesomeApp 아이콘" />
<img src="screenshot.png" alt="MyAwesomeApp 메인 화면 스크린샷" />
```

---

## 8. 다크 모드 (2차)

### 8.1 컬러 (다크 모드)

| 컬러 | Light | Dark |
|------|-------|------|
| 배경 | White | `#111827` |
| 카드 | White | `#1F2937` |
| 텍스트 (제목) | `#111827` | `#F9FAFB` |
| 텍스트 (본문) | `#4B5563` | `#D1D5DB` |
| Border | `#E5E7EB` | `#374151` |

---

**작성자**: TestBridge 기획팀
**최종 업데이트**: 2026-02-28
