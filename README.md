# TestBridge - Google Play 테스터 매칭 플랫폼

Google Play 14일/14명 테스트 요건을 충족하는 테스터 매칭 플랫폼

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (Docker로 자동 설치)

### 2. Installation

```bash
# Clone repository
git clone <repository-url>
cd testers

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Start PostgreSQL with Docker
docker-compose up -d

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 3. Access

- **Frontend**: http://localhost:3000
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555

## 📁 Project Structure

```
testers/
├── .claude/
│   ├── agents/              # AI 전문가 에이전트
│   ├── commands/            # 커맨드 (orchestrate 등)
│   ├── memory/              # 세션 간 메모리
│   ├── metrics/             # 평가 메트릭
│   └── goals/               # 목표 관리
├── docs/
│   └── planning/            # 기획 문서, TASKS.md
├── specs/
│   ├── domain/              # 도메인 리소스 정의
│   ├── screens/             # 화면 명세 (YAML)
│   └── shared/              # 공통 컴포넌트, 타입
├── prisma/
│   ├── schema.prisma        # Prisma 스키마
│   └── migrations/          # 마이그레이션
├── docker-compose.yml       # PostgreSQL 컨테이너
├── .env.example             # 환경 변수 템플릿
└── README.md
```

## 🛠️ Tech Stack

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | NextAuth.js (Google, Kakao, Naver) |
| Styling | TailwindCSS |
| State | Zustand |
| Testing | Jest + React Testing Library + Playwright |

## 📋 Available Scripts

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run test         # Run tests
npm run test:e2e     # E2E tests with Playwright
npm run lint         # ESLint
npx prisma studio    # Prisma Studio GUI
npx prisma migrate dev  # Run migrations
```

## 🤖 AI Agent Team

This project uses AI agents for automated development:

- **backend-specialist**: API, Business Logic, Database
- **frontend-specialist**: UI, UX, State Management
- **database-specialist**: Schema, Migrations, Optimization
- **test-specialist**: Testing Strategy, TDD, Quality Assurance

### Run Auto-Orchestrate

```bash
/auto-orchestrate
```

This will automatically execute tasks from `docs/planning/06-tasks.md`.

## 📖 Documentation

- **기획 문서**: `docs/planning/`
  - 01-prd.md: Product Requirements Document
  - 02-use-cases.md: Use Cases
  - 03-api-spec.md: API Specification
  - 04-data-model.md: Data Model (ERD)
  - 05-ui-ux.md: UI/UX Guidelines
  - 06-screens.md: Screen Definitions
  - 06-tasks.md: Development Tasks
  - 07-coding-convention.md: Coding Convention

- **화면 명세**: `specs/screens/*.yaml`
  - 12 MVP screens with data requirements
  - Domain-Guarded architecture

- **도메인 리소스**: `specs/domain/resources.yaml`
  - 20+ resource definitions
  - Field types, relations, constraints

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Required
DATABASE_URL="postgresql://testbridge:testbridge@localhost:5432/testbridge"
NEXTAUTH_SECRET="your-random-secret-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Optional
KAKAO_CLIENT_ID=""
NAVER_CLIENT_ID=""
TOSS_CLIENT_KEY=""
```

## 🚢 Deployment

### Vercel (Frontend + API Routes)

```bash
vercel deploy
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Database Migrations

```bash
# Create migration
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (DANGER!)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📝 License

MIT

## 🤝 Contributing

This project follows the Claude Labs workflow:

1. /socrates → Planning
2. /screen-spec → Screen Specifications
3. /tasks-generator → Task Breakdown
4. /project-bootstrap → Project Setup
5. /auto-orchestrate → Automated Development

See `docs/planning/06-tasks.md` for the full task list.
