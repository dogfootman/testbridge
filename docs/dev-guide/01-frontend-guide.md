# Frontend Development Guide

**프로젝트**: TestBridge - Google Play 테스터 매칭 플랫폼
**버전**: v1.0
**작성일**: 2026-03-01
**대상**: 프론트엔드 개발자

---

## 목차

1. [환경 설정 및 시작](#1-환경-설정-및-시작)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [페이지 개발 (App Router)](#3-페이지-개발-app-router)
4. [컴포넌트 개발](#4-컴포넌트-개발)
5. [상태 관리](#5-상태-관리)
6. [API 연동](#6-api-연동)
7. [스타일링 (Tailwind CSS)](#7-스타일링-tailwind-css)
8. [인증 처리 (NextAuth)](#8-인증-처리-nextauth)
9. [베스트 프랙티스](#9-베스트-프랙티스)
10. [트러블슈팅](#10-트러블슈팅)

---

## 1. 환경 설정 및 시작

### 1.1 필수 요구사항

| 도구 | 버전 | 확인 방법 |
|------|------|----------|
| Node.js | 18.x 이상 | `node --version` |
| npm | 9.x 이상 | `npm --version` |
| Git | 최신 | `git --version` |

### 1.2 프로젝트 설치

```bash
# 저장소 클론
git clone <repository-url>
cd testbridge

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값 입력
```

### 1.3 환경 변수 설정

`.env.local` 파일에 다음 변수를 설정합니다:

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/testbridge"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 1.4 개발 서버 실행

```bash
# 개발 서버 시작 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

### 1.5 유용한 명령어

```bash
# 타입 체크
npx tsc --noEmit

# 린트 실행
npm run lint

# 테스트 실행
npm test

# 테스트 (watch 모드)
npm run test:watch

# E2E 테스트
npm run test:e2e
```

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
testbridge/
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── (auth)/              # 인증 그룹 (공통 레이아웃)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── developer/           # 개발자 페이지
│   │   │   ├── page.tsx         # 대시보드
│   │   │   └── apps/
│   │   │       ├── page.tsx     # 앱 목록
│   │   │       ├── new/         # 앱 등록
│   │   │       └── [id]/        # 앱 상세 (동적 라우트)
│   │   ├── tester/              # 테스터 페이지
│   │   │   ├── page.tsx         # 앱 탐색
│   │   │   ├── apps/[id]/       # 앱 상세
│   │   │   └── participations/  # 내 테스트 현황
│   │   ├── api/                 # API Routes
│   │   │   ├── apps/
│   │   │   ├── users/
│   │   │   └── auth/
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 랜딩 페이지 (/)
│   │   └── globals.css          # 글로벌 스타일
│   ├── components/              # 재사용 컴포넌트
│   │   ├── landing/             # 랜딩 페이지 컴포넌트
│   │   ├── layout/              # 레이아웃 컴포넌트 (Header, Footer)
│   │   └── dashboard/           # 대시보드 컴포넌트
│   ├── lib/                     # 유틸리티 & 헬퍼
│   │   ├── prisma.ts            # Prisma 클라이언트
│   │   ├── auth.ts              # NextAuth 설정
│   │   └── validators/          # Zod 스키마
│   ├── types/                   # TypeScript 타입 정의
│   │   ├── app.types.ts
│   │   └── api.types.ts
│   └── middleware.ts            # Next.js 미들웨어
├── prisma/
│   └── schema.prisma            # Prisma 스키마
├── public/                      # 정적 파일 (이미지, 아이콘)
└── package.json
```

### 2.2 파일 네이밍 규칙

| 파일 유형 | 규칙 | 예시 |
|----------|------|------|
| 컴포넌트 | PascalCase | `Button.tsx`, `AppCard.tsx` |
| 페이지 | `page.tsx` | `app/developer/page.tsx` |
| 레이아웃 | `layout.tsx` | `app/layout.tsx` |
| API 라우트 | `route.ts` | `app/api/apps/route.ts` |
| 유틸리티 | camelCase | `formatDate.ts`, `utils.ts` |
| 타입 정의 | camelCase + `.types.ts` | `app.types.ts` |
| 커스텀 훅 | camelCase + `use-` 접두사 | `useApps.ts` |

---

## 3. 페이지 개발 (App Router)

### 3.1 기본 페이지 구조

Next.js 14 App Router에서는 **파일 시스템 기반 라우팅**을 사용합니다.

```tsx
// app/developer/page.tsx

export default function DeveloperDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">개발자 대시보드</h1>
      {/* 컨텐츠 */}
    </div>
  )
}
```

### 3.2 Layout과 Template

#### 루트 레이아웃 (Root Layout)

모든 페이지에 공통 적용되는 레이아웃:

```tsx
// app/layout.tsx

import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'TestBridge - Google Play 테스터 매칭 플랫폼',
  description: 'Google Play 14일/14명 테스트 요건을 충족하는 테스터 매칭 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
```

#### 중첩 레이아웃 (Nested Layout)

특정 경로에만 적용되는 레이아웃:

```tsx
// app/developer/layout.tsx

import { Sidebar } from '@/components/layout/Sidebar'

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar role="developer" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```

### 3.3 동적 라우트 (Dynamic Routes)

URL 파라미터를 사용하는 페이지:

```tsx
// app/developer/apps/[id]/page.tsx

interface Props {
  params: {
    id: string
  }
}

export default async function AppDetailPage({ params }: Props) {
  const appId = parseInt(params.id)

  // 서버 컴포넌트에서 직접 데이터 페칭
  const res = await fetch(`http://localhost:3000/api/apps/${appId}`)
  const app = await res.json()

  return (
    <div>
      <h1>{app.appName}</h1>
      <p>{app.description}</p>
    </div>
  )
}
```

### 3.4 그룹 라우트 (Route Groups)

URL에 영향을 주지 않고 레이아웃을 공유:

```
app/
├── (auth)/               # 괄호 → URL에 포함되지 않음
│   ├── layout.tsx        # 인증 페이지 공통 레이아웃
│   ├── login/
│   │   └── page.tsx      # URL: /login
│   └── signup/
│       └── page.tsx      # URL: /signup
```

```tsx
// app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        {children}
      </div>
    </div>
  )
}
```

### 3.5 메타데이터 (Metadata)

SEO를 위한 메타데이터 설정:

```tsx
// app/developer/apps/[id]/page.tsx

import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetch(`http://localhost:3000/api/apps/${params.id}`)
  const app = await res.json()

  return {
    title: `${app.appName} - TestBridge`,
    description: app.description,
  }
}

export default function AppDetailPage({ params }: Props) {
  // ...
}
```

---

## 4. 컴포넌트 개발

### 4.1 서버 컴포넌트 vs 클라이언트 컴포넌트

| 유형 | 언제 사용? | 특징 |
|------|----------|------|
| **서버 컴포넌트** (기본) | 데이터 페칭, 정적 UI | JavaScript 번들에 포함 안 됨 |
| **클라이언트 컴포넌트** | 인터랙션, 상태 관리 | `'use client'` 필수 |

#### ✅ Good: 서버 컴포넌트 (데이터 페칭)

```tsx
// app/developer/apps/page.tsx

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppCard } from '@/components/AppCard'

export default async function AppsPage() {
  const session = await getSession()
  const apps = await prisma.app.findMany({
    where: { developerId: session.user.id },
  })

  return (
    <div>
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
```

#### ✅ Good: 클라이언트 컴포넌트 (인터랙션)

```tsx
// components/AppCard.tsx

'use client'

import { useState } from 'react'
import { App } from '@/types/app.types'

interface Props {
  app: App
}

export function AppCard({ app }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-xl font-bold">{app.appName}</h3>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:underline"
      >
        {isExpanded ? '접기' : '더 보기'}
      </button>
      {isExpanded && <p className="mt-2">{app.description}</p>}
    </div>
  )
}
```

### 4.2 Props 타입 정의

**항상 TypeScript 인터페이스로 Props를 정의합니다.**

```tsx
// ✅ Good: Interface 사용
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  const baseClass = 'px-4 py-2 rounded-lg font-semibold transition-all'
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  }[variant]

  return (
    <button
      className={`${baseClass} ${variantClass}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

```tsx
// ❌ Bad: 타입 없이 사용
export function Button({ variant, onClick, children }) {
  // 타입 안전성 없음
}
```

### 4.3 재사용 가능한 컴포넌트 예제

#### Card 컴포넌트

```tsx
// components/ui/Card.tsx

interface CardProps {
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Card({ title, children, footer, className = '' }: CardProps) {
  return (
    <div className={`bg-white border rounded-lg shadow ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t bg-gray-50">{footer}</div>
      )}
    </div>
  )
}
```

#### Modal 컴포넌트

```tsx
// components/ui/Modal.tsx

'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
```

---

## 5. 상태 관리

### 5.1 로컬 상태 (useState)

컴포넌트 내부에서만 사용되는 상태:

```tsx
'use client'

import { useState } from 'react'

export function AppRegisterForm() {
  const [appName, setAppName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검증
    const newErrors: Record<string, string> = {}
    if (!appName.trim()) {
      newErrors.appName = '앱 이름을 입력하세요'
    }
    if (description.length < 10) {
      newErrors.description = '설명은 최소 10자 이상이어야 합니다'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // API 호출
    // ...
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">앱 이름</label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {errors.appName && (
          <p className="text-red-600 text-sm mt-1">{errors.appName}</p>
        )}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
        등록
      </button>
    </form>
  )
}
```

### 5.2 부모-자식 간 상태 공유

```tsx
// ✅ Good: Props로 상태 전달
interface ParentProps {}

export function Parent() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null)

  return (
    <div>
      <AppList onSelect={setSelectedApp} />
      {selectedApp && <AppDetail app={selectedApp} />}
    </div>
  )
}

interface AppListProps {
  onSelect: (app: App) => void
}

function AppList({ onSelect }: AppListProps) {
  const apps = [/* ... */]

  return (
    <div>
      {apps.map((app) => (
        <button key={app.id} onClick={() => onSelect(app)}>
          {app.appName}
        </button>
      ))}
    </div>
  )
}
```

### 5.3 전역 상태 관리 (Zustand)

여러 컴포넌트에서 공유하는 상태:

```tsx
// lib/store/useAuthStore.ts

import { create } from 'zustand'

interface User {
  id: number
  nickname: string
  role: 'DEVELOPER' | 'TESTER' | 'BOTH'
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

```tsx
// components/Header.tsx

'use client'

import { useAuthStore } from '@/lib/store/useAuthStore'

export function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header>
      {user ? (
        <div>
          <span>{user.nickname}</span>
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <a href="/auth/login">로그인</a>
      )}
    </header>
  )
}
```

### 5.4 Form 상태 관리

#### 기본 폼 (Controlled Components)

```tsx
'use client'

import { useState } from 'react'

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // API 호출
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">로그인</button>
    </form>
  )
}
```

---

## 6. API 연동

### 6.1 Fetch API 사용

#### GET 요청

```tsx
'use client'

import { useEffect, useState } from 'react'

interface App {
  id: number
  appName: string
  status: string
}

export function AppsList() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/apps?status=RECRUITING')

        if (!res.ok) {
          throw new Error('Failed to fetch apps')
        }

        const data = await res.json()
        setApps(data.apps)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [])

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>

  return (
    <div>
      {apps.map((app) => (
        <div key={app.id}>{app.appName}</div>
      ))}
    </div>
  )
}
```

#### POST 요청 (앱 등록)

```tsx
'use client'

import { useState } from 'react'

export function AppRegisterForm() {
  const [appName, setAppName] = useState('')
  const [packageName, setPackageName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName,
          packageName,
          categoryId: 1,
          description: 'Sample description',
          testType: 'PAID_REWARD',
          targetTesters: 20,
          testLink: 'https://play.google.com/...',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error)
      }

      const app = await res.json()
      alert('앱 등록 완료!')
      // 페이지 이동
      window.location.href = `/developer/apps/${app.id}`
    } catch (err) {
      alert(err instanceof Error ? err.message : '등록 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
        placeholder="앱 이름"
      />
      <input
        value={packageName}
        onChange={(e) => setPackageName(e.target.value)}
        placeholder="패키지명 (com.example.app)"
      />
      <button type="submit" disabled={loading}>
        {loading ? '등록 중...' : '등록'}
      </button>
    </form>
  )
}
```

### 6.2 에러 처리 패턴

```tsx
// ✅ Good: 에러 타입별 처리

async function fetchApp(id: number) {
  try {
    const res = await fetch(`/api/apps/${id}`)

    if (res.status === 401) {
      // 인증 오류 → 로그인 페이지로
      window.location.href = '/auth/login'
      return
    }

    if (res.status === 404) {
      throw new Error('앱을 찾을 수 없습니다')
    }

    if (!res.ok) {
      throw new Error('서버 오류가 발생했습니다')
    }

    const app = await res.json()
    return app
  } catch (err) {
    console.error('fetchApp error:', err)
    throw err
  }
}
```

### 6.3 로딩 상태 관리

```tsx
'use client'

import { useState, useEffect } from 'react'

export function AppDetail({ id }: { id: number }) {
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchApp = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/apps/${id}`)
        const data = await res.json()

        if (isMounted) {
          setApp(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchApp()

    // Cleanup: 컴포넌트 언마운트 시 플래그 설정
    return () => {
      isMounted = false
    }
  }, [id])

  // 로딩 UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // 에러 UI
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  // 데이터 UI
  return <div>{app.appName}</div>
}
```

---

## 7. 스타일링 (Tailwind CSS)

### 7.1 기본 사용법

Tailwind CSS는 유틸리티 우선 CSS 프레임워크입니다.

```tsx
// ✅ Good: Tailwind 유틸리티 클래스 사용
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
      {children}
    </button>
  )
}
```

```tsx
// ❌ Bad: 인라인 스타일 (Tailwind 무시)
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button style={{ backgroundColor: 'blue', color: 'white' }}>
      {children}
    </button>
  )
}
```

### 7.2 반응형 디자인

Tailwind의 반응형 접두사:

| 접두사 | 최소 너비 | 디바이스 |
|--------|----------|---------|
| `sm:` | 640px | 모바일 가로 |
| `md:` | 768px | 태블릿 |
| `lg:` | 1024px | 데스크톱 |
| `xl:` | 1280px | 대형 데스크톱 |

```tsx
// ✅ Good: 모바일 우선 반응형 디자인
export function Hero() {
  return (
    <section className="
      py-12 md:py-20 lg:py-32
      px-4 sm:px-6 lg:px-8
    ">
      <h1 className="
        text-3xl sm:text-4xl md:text-5xl lg:text-6xl
        font-bold text-center
      ">
        Google Play 테스트 요건, 더 이상 고민하지 마세요
      </h1>
    </section>
  )
}
```

### 7.3 조건부 스타일링

```tsx
// ✅ Good: 템플릿 리터럴 + 조건
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
}

export function Button({ variant, size }: ButtonProps) {
  const baseClass = 'rounded-lg font-semibold transition-colors'

  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  }[variant]

  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }[size]

  return (
    <button className={`${baseClass} ${variantClass} ${sizeClass}`}>
      버튼
    </button>
  )
}
```

### 7.4 커스텀 색상 (tailwind.config.js)

```js
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
}
```

```tsx
// 사용 예시
<button className="bg-primary-600 hover:bg-primary-700">
  버튼
</button>
```

---

## 8. 인증 처리 (NextAuth)

### 8.1 NextAuth 설정

```tsx
// lib/auth.ts

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
  return await getServerSession(authOptions)
}
```

### 8.2 보호된 페이지 구현

#### 서버 컴포넌트에서 인증 확인

```tsx
// app/developer/page.tsx

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function DeveloperDashboard() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // 인증된 사용자만 접근 가능
  return (
    <div>
      <h1>환영합니다, {session.user.name}님!</h1>
    </div>
  )
}
```

#### 클라이언트 컴포넌트에서 인증 확인

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ProtectedComponent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        window.location.href = '/auth/login'
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) return <div>로딩 중...</div>

  return <div>환영합니다, {user.name}님!</div>
}
```

### 8.3 로그인/로그아웃 플로우

```tsx
// components/Header.tsx

'use client'

import { signOut, useSession } from 'next-auth/react'

export function Header() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return <div>로딩 중...</div>
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1>TestBridge</h1>

        {session ? (
          <div className="flex items-center gap-4">
            <span>{session.user.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <a href="/auth/login" className="text-blue-600 hover:underline">
            로그인
          </a>
        )}
      </div>
    </header>
  )
}
```

---

## 9. 베스트 프랙티스

### 9.1 성능 최적화

#### 이미지 최적화 (Next.js Image)

```tsx
// ✅ Good: Next.js Image 컴포넌트 사용
import Image from 'next/image'

export function AppCard({ app }) {
  return (
    <div>
      <Image
        src={app.iconUrl}
        alt={app.appName}
        width={64}
        height={64}
        className="rounded"
      />
    </div>
  )
}
```

```tsx
// ❌ Bad: 일반 img 태그
export function AppCard({ app }) {
  return (
    <div>
      <img src={app.iconUrl} alt={app.appName} />
    </div>
  )
}
```

#### 코드 스플리팅 (동적 임포트)

```tsx
// ✅ Good: 큰 컴포넌트는 동적 임포트
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>차트 로딩 중...</div>,
  ssr: false, // 서버 렌더링 비활성화
})

export function Dashboard() {
  return (
    <div>
      <h1>대시보드</h1>
      <HeavyChart />
    </div>
  )
}
```

### 9.2 접근성 (a11y)

```tsx
// ✅ Good: 시맨틱 HTML + ARIA
export function Modal({ isOpen, onClose, title, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={isOpen ? 'block' : 'hidden'}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="모달 닫기">
        ✕
      </button>
    </div>
  )
}
```

```tsx
// ✅ Good: 폼 레이블 연결
export function LoginForm() {
  return (
    <form>
      <label htmlFor="email">이메일</label>
      <input id="email" type="email" />

      <label htmlFor="password">비밀번호</label>
      <input id="password" type="password" />
    </form>
  )
}
```

### 9.3 SEO 고려사항

```tsx
// app/developer/apps/[id]/page.tsx

import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const app = await fetchApp(params.id)

  return {
    title: `${app.appName} - TestBridge`,
    description: app.description,
    openGraph: {
      title: app.appName,
      description: app.description,
      images: [app.iconUrl],
    },
  }
}
```

### 9.4 에러 바운더리

```tsx
// app/developer/error.tsx

'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        오류가 발생했습니다
      </h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        다시 시도
      </button>
    </div>
  )
}
```

---

## 10. 트러블슈팅

### 10.1 자주 발생하는 오류

#### "Hydration failed" 오류

**원인**: 서버에서 렌더링한 HTML과 클라이언트에서 렌더링한 HTML이 다름

```tsx
// ❌ Bad: 서버/클라이언트 불일치
export function TimeDisplay() {
  return <div>{new Date().toLocaleString()}</div>
}
```

```tsx
// ✅ Good: 클라이언트 전용 렌더링
'use client'

import { useEffect, useState } from 'react'

export function TimeDisplay() {
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])

  return <div>{time || '로딩 중...'}</div>
}
```

#### "Module not found" 오류

**원인**: 경로 별칭 설정 누락

```json
// tsconfig.json

{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 10.2 디버깅 팁

#### 서버 컴포넌트 디버깅

```tsx
// ✅ Good: console.log는 터미널에 출력됨
export default async function Page() {
  const apps = await fetchApps()
  console.log('Apps:', apps) // 터미널에서 확인

  return <div>{apps.length}개의 앱</div>
}
```

#### 클라이언트 컴포넌트 디버깅

```tsx
'use client'

export function Component() {
  console.log('브라우저 콘솔에 출력됨')

  // React DevTools 사용
  useEffect(() => {
    console.log('마운트됨')
  }, [])

  return <div>...</div>
}
```

### 10.3 성능 모니터링

```bash
# Lighthouse 분석
npm run build
npm start
# Chrome DevTools → Lighthouse 탭 실행

# 번들 크기 분석
npm install --save-dev @next/bundle-analyzer
```

---

## 부록: 유용한 리소스

### 공식 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [NextAuth.js 공식 문서](https://next-auth.js.org)

### 내부 문서
- [코딩 컨벤션](../planning/07-coding-convention.md)
- [기능 목록](../FEATURES.md)
- [Backend API 개발 가이드](./02-backend-guide.md)

---

**문서 작성일**: 2026-03-01
**작성자**: TestBridge 기획팀
**최종 업데이트**: 2026-03-01
