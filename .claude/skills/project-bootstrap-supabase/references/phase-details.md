# Phase Details — Next.js + Supabase + Vercel

> 각 Phase를 순서대로 실행한다. 이전 Phase의 검증이 통과해야 다음 Phase로 진행.

---

## Phase 1: Project Bootstrap

### 1-1. Next.js 프로젝트 생성

```bash
npx create-next-app@latest {PROJECT_NAME} \
  --typescript \
  --tailwind \
  --app \
  --use-npm \
  --no-eslint \
  --no-src-dir \
  --no-import-alias
```

> `{PROJECT_NAME}`은 사용자가 지정한 프로젝트명으로 치환.

### 1-2. Supabase 의존성 설치

```bash
cd {PROJECT_NAME}
npm install @supabase/supabase-js @supabase/ssr
```

### 1-3. Supabase 초기화

```bash
npx supabase init
```

### 1-4. 검증

```bash
# supabase/config.toml 파일 존재 확인
ls supabase/config.toml
```

- `supabase/config.toml`이 존재하면 Phase 1 통과.
- 존재하지 않으면 에러 원인 분석 후 재시도.

---

## Phase 2: Local Supabase Stack

### 2-1. Docker 데몬 확인

```bash
docker info > /dev/null 2>&1
```

- **성공 시**: Phase 2 계속 진행.
- **실패 시**: 아래 메시지를 출력하고 **중단**:

```
Docker Desktop이 실행되지 않고 있습니다.
Docker Desktop을 시작한 후 다시 시도해주세요.
```

### 2-2. Supabase 로컬 스택 시작

```bash
npx supabase start
```

> 첫 실행 시 Docker 이미지 다운로드에 수 분 소요될 수 있음.

### 2-3. 출력 파싱

`supabase start` 출력에서 다음 값을 추출:

| 키 | 환경변수명 | 출력 라벨 |
|----|-----------|----------|
| API URL | `NEXT_PUBLIC_SUPABASE_URL` | `API URL` |
| anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon key` |
| service_role key | `SUPABASE_SERVICE_ROLE_KEY` | `service_role key` |
| Studio URL | (정보 출력용) | `Studio URL` |
| DB URL | `DATABASE_URL` | `DB URL` |

### 2-4. `.env.local` 생성

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL={API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY={ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY={SERVICE_ROLE_KEY}
DATABASE_URL={DB_URL}
```

> **주의**: `.env.local`은 절대 커밋하지 않는다.

### 2-5. 검증

```bash
curl -s -o /dev/null -w "%{http_code}" {API_URL}/rest/v1/ \
  -H "apikey: {ANON_KEY}" \
  -H "Authorization: Bearer {ANON_KEY}"
```

- HTTP 200 응답 시 Phase 2 통과.
- 실패 시 `supabase status`로 상태 확인 후 재시도.

---

## Phase 3: Scaffold Boilerplate

### 3-1. `lib/supabase/client.ts` — 브라우저용 클라이언트

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 3-2. `lib/supabase/server.ts` — 서버 컴포넌트용 클라이언트

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  );
}
```

### 3-3. `middleware.ts` — Auth 세션 갱신

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 — getUser()는 항상 서버에서 auth 토큰을 검증
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 3-4. `supabase/migrations/00000000000000_init.sql` — 초기 마이그레이션 템플릿

```sql
-- Initial migration template
-- Uncomment and modify as needed

-- Example: profiles table linked to auth.users
-- create table public.profiles (
--   id uuid references auth.users on delete cascade not null primary key,
--   username text unique,
--   full_name text,
--   avatar_url text,
--   created_at timestamptz default now() not null,
--   updated_at timestamptz default now() not null
-- );

-- Enable Row Level Security
-- alter table public.profiles enable row level security;

-- RLS Policies
-- create policy "Public profiles are viewable by everyone."
--   on profiles for select
--   using (true);

-- create policy "Users can insert their own profile."
--   on profiles for insert
--   with check (auth.uid() = id);

-- create policy "Users can update their own profile."
--   on profiles for update
--   using (auth.uid() = id);
```

### 3-5. 검증

```bash
npm run build
```

- 빌드 성공 시 Phase 3 통과.
- TypeScript 에러 발생 시 수정 후 재빌드.

---

## Phase 4: CI/CD Pipeline

### 4-1. `.github/workflows/supabase-migrate.yml`

```yaml
name: Supabase Migrate

on:
  push:
    branches: [main]
    paths:
      - "supabase/migrations/**"

jobs:
  migrate:
    runs-on: ubuntu-latest
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
      SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - run: supabase link --project-ref $SUPABASE_PROJECT_ID
      - run: supabase db push
```

### 4-2. `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

### 4-3. `.gitignore` 업데이트

기존 `.gitignore`에 다음 항목이 없으면 추가:

```
.env.local
.env*.local
```

### 4-4. Git 초기화 및 첫 커밋

```bash
git init
git add -A
git commit -m "Initial commit: Next.js + Supabase project scaffold"
```

> `git init`은 `.git/` 디렉토리가 없을 때만 실행.

### 4-5. 최종 체크리스트 출력

Phase 4 완료 후 다음 체크리스트를 사용자에게 출력:

```
=== Next.js + Supabase 프로젝트 셋업 완료 ===

[자동 완료]
  - Next.js 프로젝트 생성 (TypeScript + Tailwind + App Router)
  - Supabase 로컬 스택 실행
  - 보일러플레이트 코드 생성 (client.ts, server.ts, middleware.ts)
  - CI/CD 파이프라인 생성 (GitHub Actions + vercel.json)
  - Git 초기화 및 첫 커밋

[수동 설정 필요]
  1. Supabase 프로젝트 생성: https://supabase.com/dashboard
  2. GitHub Secrets 설정:
     - SUPABASE_ACCESS_TOKEN
     - SUPABASE_DB_PASSWORD
     - SUPABASE_PROJECT_ID
  3. Vercel 프로젝트 연결: vercel link
  4. Vercel 환경변수 설정:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY

[로컬 개발]
  - Supabase Studio: http://127.0.0.1:54323
  - Next.js Dev Server: npm run dev
  - Supabase 중지: npx supabase stop
```
