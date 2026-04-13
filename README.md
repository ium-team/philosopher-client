# Philosopher Client

Next.js 16 기반 프론트엔드 초기 베이스 프로젝트다.

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm format
```

## Environment

`.env.example` 를 기준으로 `.env.local` 을 구성하면 된다.

Google OAuth + Supabase 사용 시 필수 환경 변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

## Docs

- `docs/project-setup.md`
- `docs/frontend-architecture.md`
- `docs/technical-design.md`
