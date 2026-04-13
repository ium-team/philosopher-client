# Frontend Architecture

## 아키텍처 원칙

- 라우팅과 화면 조합은 `src/app` 에 둔다.
- 재사용 UI는 `src/components` 로 올린다.
- 도메인 기능은 `src/features` 단위로 확장한다.
- 설정과 실행 환경은 `src/config` 에서 관리한다.
- 범용 함수와 유틸은 `src/lib` 에 둔다.
- 외부 API 연동은 기능 단위로 캡슐화하고 화면에서 직접 퍼지지 않게 한다.

## 권장 폴더 구조

```text
src
├─ app
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ globals.css
├─ components
│  ├─ layout
│  └─ ui
├─ config
│  ├─ env.ts
│  └─ site.ts
├─ features
│  └─ <domain>/
│     ├─ api
│     ├─ components
│     ├─ hooks
│     ├─ types
│     └─ utils
└─ lib
   └─ utils.ts
```

## 레이어 역할

### `app`

- route segment
- layout
- page composition
- metadata

비즈니스 로직을 직접 크게 담지 않고, 기능 모듈을 조합하는 진입점 역할에 집중한다.

### `components`

- 여러 기능에서 재사용 가능한 프레젠테이션 컴포넌트
- 디자인 시스템 성격의 기본 UI
- 앱 전체 레이아웃

### `features`

- 도메인별 기능 단위
- 한 기능이 필요한 API, UI, hook, 타입을 함께 보관
- 예: `features/auth`, `features/feed`, `features/profile`

### `config`

- 런타임 환경
- 사이트 메타데이터
- 배포 환경별 상수

### `lib`

- 프레임워크 비종속 범용 유틸
- className merge 같은 얇은 헬퍼

## 상태 관리 기준

- 기본값은 React state 와 Server Component 조합
- URL 상태는 search params 우선
- 여러 화면에서 공유되는 클라이언트 상태가 명확할 때만 별도 전역 상태 도입
- 전역 상태 라이브러리는 실제 복잡도가 생긴 뒤 채택한다

## 데이터 패칭 기준

- 초기 기준은 `App Router` 의 서버 실행 컨텍스트 활용
- 클라이언트 인터랙션이 강한 화면만 Client Component 로 내린다
- API 호출 로직은 page 파일에 직접 분산하지 않고 기능 모듈에 모은다

## 확장 가이드

- 공용화 필요가 확인되기 전까지는 성급하게 추상화하지 않는다
- 공통 컴포넌트는 최소 두 곳 이상에서 반복될 때 승격한다
- 기능이 커지면 `features/<domain>` 내부에서만 먼저 구조화하고, 전역 공통화는 나중에 판단한다
