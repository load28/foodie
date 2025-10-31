# Foodie - 음식 공유 소셜 플랫폼

Foodie는 음식점 리뷰와 경험을 공유하는 소셜 플랫폼입니다.

## 프로젝트 구조

```
foodie/
├── backend/              # Rust GraphQL 서버
│   ├── src/
│   │   ├── main.rs       # 서버 진입점
│   │   ├── schema/       # GraphQL 스키마 (Query, Mutation)
│   │   ├── models/       # 데이터 모델 (User, Post, Comment)
│   │   ├── db/           # 데이터베이스 초기화
│   │   └── auth/         # JWT 인증
│   ├── schema.sql        # 데이터베이스 스키마
│   ├── Cargo.toml        # Rust 의존성
│   └── README.md         # 백엔드 문서
├── src/                  # React 프론트엔드
│   ├── components/       # UI 컴포넌트
│   └── pages/            # 페이지 컴포넌트
└── README.md             # 이 파일
```

## 기술 스택

### 백엔드 (Rust GraphQL Server)
- **Rust** - 시스템 프로그래밍 언어
- **async-graphql** - GraphQL 서버 라이브러리
- **actix-web** - 웹 서버 프레임워크
- **SQLite** - 데이터베이스
- **JWT** - 인증 시스템

### 프론트엔드
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Sass** - 스타일링
- **Storybook** - 컴포넌트 개발
- **Vite** - 빌드 도구

## 빠른 시작

### 백엔드 서버 실행

```bash
cd backend

# 환경 변수 확인 (.env 파일)
cat .env

# 서버 실행
cargo run

# 릴리스 빌드
cargo build --release
./target/release/foodie_server
```

서버가 시작되면:
- GraphQL API: http://127.0.0.1:8080/graphql
- GraphQL Playground: http://127.0.0.1:8080/playground

### 프론트엔드 실행

```bash
# Storybook 실행
pnpm storybook

# 프로덕션 빌드
pnpm build-storybook
```

## 주요 기능

### 백엔드 API

✅ **사용자 인증**
- 회원가입 (register)
- 로그인 (login)
- 로그아웃 (logout)
- JWT 토큰 기반 인증

✅ **피드 포스트**
- 피드 목록 조회 (페이지네이션)
- 카테고리별 필터링 (한식, 양식, 중식, 일식, 카페, 디저트)
- 포스트 상세 조회
- 포스트 생성
- 좋아요 토글

✅ **댓글 시스템**
- 댓글 목록 조회
- 댓글 작성
- 답글 작성 (멘션 기능)
- 댓글 삭제

✅ **사용자 프로필**
- 현재 사용자 정보 조회
- 프로필 업데이트
- 사용자 상태 (온라인, 자리비움, 오프라인)

### 프론트엔드 컴포넌트

- **FeedScreen** - 메인 피드 페이지
- **FeedCard** - 피드 아이템 카드
- **CommentSheet** - 댓글 시트 (모달)
- **LoginForm** - 로그인 폼
- **Avatar** - 사용자 아바타
- **Button** - 기본 버튼
- **TextField/TextArea** - 입력 필드
- **Navigation** - 네비게이션 메뉴

## GraphQL API 예제

### 회원가입

```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "password123"
    name: "김철수"
  }) {
    user {
      id
      name
      email
    }
    token
  }
}
```

### 피드 조회

```graphql
query {
  feedPosts(limit: 10, offset: 0, category: JAPANESE) {
    id
    title
    content
    rating
    foodImage
    author {
      name
      initial
    }
  }
}
```

### 포스트 생성

```graphql
mutation {
  createFeedPost(input: {
    title: "맛있는 일식당"
    content: "신선한 회가 일품!"
    location: "강남구 신사동"
    rating: 4.5
    category: JAPANESE
    tags: ["회", "일식"]
    foodImage: "🍣"
  }) {
    id
    title
  }
}
```

더 많은 예제는 `backend/sample_queries.graphql` 파일을 참고하세요.

## 프론트엔드 통합

프론트엔드에서 GraphQL API를 연동하는 방법은 `backend/frontend-integration.md` 문서를 참고하세요.

### Apollo Client 설치

```bash
pnpm add @apollo/client graphql
```

### 기본 설정

```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://127.0.0.1:8080/graphql',
  cache: new InMemoryCache(),
});
```

## 문서

- [백엔드 README](backend/README.md) - Rust GraphQL 서버 상세 가이드
- [샘플 쿼리](backend/sample_queries.graphql) - GraphQL 쿼리/뮤테이션 예제
- [프론트엔드 통합](backend/frontend-integration.md) - React/Apollo Client 통합 가이드

## 개발 환경

- Rust 1.75+
- Node.js 18+
- pnpm 10.12+

## 라이센스

ISC

## 기여

Issue와 Pull Request를 환영합니다!
