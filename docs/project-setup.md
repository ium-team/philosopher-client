# Project Setup

## 목표

- `Next.js 16` 기반 클라이언트 프론트엔드 시작점 확보
- `App Router + TypeScript + Tailwind CSS v4` 표준화
- 환경변수, 코드 스타일, 기본 메타데이터를 초기 단계에서 정리
- 이후 기능 개발 전에 아키텍처와 기술 선택 기준을 문서화

## 현재 셋업 범위

- `src/app` 기반 App Router 구조
- `TypeScript strict` 활성화
- `Tailwind CSS v4` 적용
- `ESLint 9 + eslint-config-next + eslint-config-prettier`
- `Prettier` 설정 추가
- `@/*` 절대경로 alias 적용
- `zod` 기반 클라이언트 환경변수 검증 모듈 추가
- 공용 스타일 유틸 `cn()` 추가

## 주요 명령어

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm format
```

## 환경변수

기준 파일은 `.env.example` 이다.

| Key                        | 설명                                                    | 필수 여부 |
| -------------------------- | ------------------------------------------------------- | --------- |
| `NEXT_PUBLIC_APP_NAME`     | 클라이언트 표시용 앱 이름                               | 선택      |
| `NEXT_PUBLIC_APP_ENV`      | `local`, `development`, `staging`, `production` 중 하나 | 선택      |
| `NEXT_PUBLIC_API_BASE_URL` | 브라우저에서 접근할 API base URL                        | 선택      |

## 초기 작업 원칙

1. 공통 인프라부터 먼저 안정화한다.
2. 기능 개발은 `features/*` 단위로 분리한다.
3. 전역 상태는 꼭 필요한 경우에만 도입한다.
4. 서버 데이터는 우선 `App Router` 와 fetch 기반으로 처리한다.
5. 문서와 실제 구조가 어긋나지 않도록 변경 시 같이 갱신한다.
