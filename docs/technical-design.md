# Technical Design

## 기술 선택

### Next.js 16

- App Router 기본 사용
- 서버 렌더링, 스트리밍, 레이아웃 분리에 유리
- 향후 인증, SEO, 서버 fetch 확장에 자연스럽게 대응 가능

### React 19

- 최신 React 기능과 Next.js 최신 라인에 맞춘다
- UI는 Server Component 우선, 클라이언트 인터랙션만 선택적으로 사용

### TypeScript

- `strict` 모드 유지
- 도메인 타입을 초기에 잡아두어 API 확장 비용을 낮춘다

### Tailwind CSS v4

- 초기 속도와 일관성 확보에 유리
- 토큰은 `globals.css` 의 CSS variable 기반으로 관리

### Zod

- 환경변수와 외부 입력 검증에 사용
- 런타임 오류를 초기에 드러내기 좋다

## 렌더링 전략

- 정적 가능 페이지는 정적으로 유지
- 사용자/세션 의존 영역만 동적으로 전환
- 브라우저 상태가 필요한 경우에만 Client Component 사용

## 네이밍 규칙

- 컴포넌트: `PascalCase`
- hook: `useSomething`
- 유틸/설정 모듈: `kebab-case` 또는 의미 중심 단수 파일명
- 기능 폴더: 도메인 기준 소문자

## 코드 품질 기준

- lint, typecheck, build 통과를 최소 기준으로 삼는다
- page 파일은 조합 중심으로 유지하고 세부 구현은 분리한다
- 설정값과 환경변수 접근은 직접 `process.env` 남발 대신 전용 모듈로 제한한다

## 앞으로 추가할 후보

현재는 의도적으로 넣지 않았다.

- 테스트: `Vitest`, `Testing Library`, `Playwright`
- 서버 상태 관리: `TanStack Query`
- 폼 관리: `react-hook-form`
- API 스키마 기반 타입 생성: `orval`, `openapi-typescript`

위 항목들은 실제 요구사항이 생긴 뒤 도입하는 것이 맞다. 초기부터 모두 넣으면 빈 프로젝트 기준으로는 유지 비용이 더 크다.
