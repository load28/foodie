# Foodie GraphQL Server

Rust로 구현된 Foodie 음식 공유 소셜 플랫폼의 GraphQL 백엔드 서버입니다.

## 기술 스택

- **Rust** - 시스템 프로그래밍 언어
- **async-graphql** - GraphQL 서버 라이브러리
- **actix-web** - 웹 서버 프레임워크
- **SQLite** - 데이터베이스
- **Redis** - 세션 관리 및 캐싱
- **JWT** - 인증 시스템 (하위 호환성)

## 프로젝트 구조

```
backend/
├── src/
│   ├── main.rs              # 서버 진입점 및 설정
│   ├── schema/              # GraphQL 스키마
│   │   ├── mod.rs           # 스키마 통합
│   │   ├── query.rs         # Query 리졸버
│   │   └── mutation.rs      # Mutation 리졸버
│   ├── models/              # 데이터 모델
│   │   ├── mod.rs
│   │   ├── user.rs          # User 모델
│   │   ├── post.rs          # FeedPost 모델
│   │   └── comment.rs       # Comment 모델
│   ├── db/                  # 데이터베이스
│   │   └── mod.rs           # DB 연결 및 초기화
│   ├── session/             # 세션 관리
│   │   ├── mod.rs           # 세션 모듈
│   │   ├── redis_store.rs   # Redis 세션 스토어
│   │   └── middleware.rs    # 세션 미들웨어
│   └── auth/                # 인증
│       ├── mod.rs           # 비밀번호 해싱
│       └── jwt.rs           # JWT 토큰 처리
├── schema.sql               # 데이터베이스 스키마
├── .env                     # 환경 변수
├── .env.example             # 환경 변수 예제
├── Cargo.toml               # 의존성 설정
└── README.md                # 이 파일
```

## 설치 및 실행

### 1. 사전 준비

이 서버는 **Redis**가 필요합니다. 로컬에 Redis를 설치하거나 Docker를 사용하세요:

#### Redis 설치 (선택사항)
```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 설정을 변경하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
# Server Configuration
SERVER_HOST=127.0.0.1
SERVER_PORT=8080

# Database Configuration
DATABASE_URL=sqlite:./data/foodie.db

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
SESSION_TTL=86400  # Session Time To Live in seconds (24 hours)

# Logging
RUST_LOG=info
```

### 3. 빌드 및 실행

```bash
# 개발 모드로 실행
cargo run

# 릴리스 빌드
cargo build --release

# 릴리스 실행
./target/release/foodie_server
```

서버가 시작되면 다음 주소에서 접근할 수 있습니다:

- **GraphQL Endpoint**: http://127.0.0.1:8080/graphql
- **GraphQL Playground**: http://127.0.0.1:8080/playground

## GraphQL API 사용법

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
      email
      name
      initial
    }
    token
  }
}
```

### 로그인

```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    user {
      id
      email
      name
      status
    }
    token
  }
}
```

### 피드 포스트 생성

**Header에 JWT 토큰 추가 필요:**
```
Authorization: Bearer <your-token>
```

```graphql
mutation {
  createFeedPost(input: {
    title: "맛있는 횟집"
    content: "신선한 회가 정말 일품입니다!"
    location: "서울 강남구 신사동"
    rating: 4.5
    category: JAPANESE
    tags: ["회", "일식", "신선한"]
    foodImage: "🍣"
  }) {
    id
    title
    content
    rating
    category
    tags
    author {
      name
      initial
    }
    createdAt
  }
}
```

### 피드 목록 조회

```graphql
query {
  feedPosts(limit: 10, offset: 0) {
    id
    title
    content
    location
    rating
    foodImage
    category
    tags
    likes
    comments
    createdAt
    author {
      name
      initial
      status
    }
    isLikedByCurrentUser
  }
}
```

### 카테고리 필터링

```graphql
query {
  feedPosts(limit: 10, offset: 0, category: JAPANESE) {
    id
    title
    category
  }
}
```

카테고리 옵션:
- `KOREAN` - 한식
- `WESTERN` - 양식
- `CHINESE` - 중식
- `JAPANESE` - 일식
- `CAFE` - 카페
- `DESSERT` - 디저트

### 포스트 좋아요 토글

```graphql
mutation {
  togglePostLike(postId: "post-id-here")
}
```

### 댓글 작성

```graphql
mutation {
  createComment(input: {
    postId: "post-id-here"
    content: "정말 맛있어 보이네요!"
    parentCommentId: null
    mentions: null
  }) {
    id
    content
    createdAt
    author {
      name
      initial
    }
  }
}
```

### 답글 작성 (멘션 포함)

```graphql
mutation {
  createComment(input: {
    postId: "post-id-here"
    content: "@김철수 저도 다음주에 가볼게요!"
    parentCommentId: "parent-comment-id"
    mentions: ["user-id-to-mention"]
  }) {
    id
    content
    isReply
    mentions {
      name
    }
  }
}
```

### 댓글 조회

```graphql
query {
  comments(postId: "post-id-here", limit: 50, offset: 0) {
    id
    content
    createdAt
    isReply
    author {
      name
      initial
    }
    parentComment {
      id
      author {
        name
      }
    }
    mentions {
      name
    }
  }
}
```

### 현재 사용자 정보

```graphql
query {
  currentUser {
    id
    email
    name
    initial
    profileImage
    status
  }
}
```

### 프로필 업데이트

```graphql
mutation {
  updateUserProfile(
    name: "김영희"
    profileImage: "https://example.com/avatar.jpg"
  ) {
    id
    name
    initial
    profileImage
  }
}
```

## 인증 및 세션 관리

### Redis 세션 시스템

이 서버는 **Redis 기반 세션 관리 시스템**을 사용합니다. 로그인 또는 회원가입 시 세션 ID가 발급되며, 이를 HTTP Header에 포함하여 인증합니다.

#### 세션 동작 방식

1. **로그인/회원가입**: 세션 ID가 생성되어 `token` 필드로 반환됩니다.
2. **API 요청**: Authorization 헤더에 세션 ID를 포함합니다.
3. **자동 갱신**: 요청마다 세션 TTL이 자동으로 갱신됩니다 (기본 24시간).
4. **로그아웃**: 세션이 Redis에서 삭제됩니다.

### 인증 헤더 추가

대부분의 Mutation과 일부 Query는 인증이 필요합니다. 로그인 또는 회원가입 후 받은 세션 ID를 HTTP Header에 추가하세요:

```
Authorization: Bearer <session-id>
```

GraphQL Playground에서는 하단의 "HTTP HEADERS" 섹션에 추가할 수 있습니다:

```json
{
  "Authorization": "Bearer a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
}
```

### 하위 호환성

기존 JWT 토큰도 계속 지원됩니다. 세션 ID를 찾지 못하면 자동으로 JWT 검증을 시도합니다.

### 세션 관리 기능

- **세션 생성**: 로그인/회원가입 시 자동 생성
- **세션 검증**: 모든 인증 요청에서 자동 검증
- **세션 갱신**: 요청 시 TTL 자동 갱신
- **세션 삭제**: 로그아웃 시 특정 세션 또는 사용자의 모든 세션 삭제
- **세션 만료**: TTL 경과 시 자동 만료 (기본 24시간)

### Redis 설정

환경 변수로 Redis 연결 및 세션 TTL을 설정할 수 있습니다:

```env
REDIS_URL=redis://127.0.0.1:6379  # Redis 연결 URL
SESSION_TTL=86400                 # 세션 만료 시간 (초 단위, 기본: 24시간)
```

## 데이터베이스 스키마

### Users 테이블
- 사용자 정보 (이메일, 비밀번호, 이름, 초성, 프로필 이미지, 상태)

### FeedPosts 테이블
- 피드 포스트 (제목, 내용, 위치, 평점, 카테고리, 태그, 이미지)

### Comments 테이블
- 댓글 및 답글

### CommentMentions 테이블
- 댓글 멘션 (Many-to-Many)

### PostLikes 테이블
- 포스트 좋아요 (Many-to-Many)

## 프론트엔드 통합

프론트엔드에서 이 GraphQL API를 사용하려면:

1. **GraphQL 클라이언트 설치**
   ```bash
   pnpm add @apollo/client graphql
   # 또는
   pnpm add urql graphql
   ```

2. **Apollo Client 설정** (예시)
   ```typescript
   import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
   import { setContext } from '@apollo/client/link/context';

   const httpLink = createHttpLink({
     uri: 'http://127.0.0.1:8080/graphql',
   });

   const authLink = setContext((_, { headers }) => {
     const token = localStorage.getItem('token');
     return {
       headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
       }
     }
   });

   const client = new ApolloClient({
     link: authLink.concat(httpLink),
     cache: new InMemoryCache()
   });
   ```

3. **TypeScript 타입 자동 생성**
   ```bash
   pnpm add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations
   ```

## 개발 팁

### GraphQL Playground 사용

서버 실행 후 http://127.0.0.1:8080/playground 에 접속하면 대화형 GraphQL IDE를 사용할 수 있습니다.

### 로그 레벨 조정

`.env` 파일에서 `RUST_LOG` 변수를 변경:
- `error` - 에러만
- `warn` - 경고 이상
- `info` - 정보 이상 (기본값)
- `debug` - 디버그 정보 포함
- `trace` - 모든 로그

### 데이터베이스 초기화

데이터베이스를 초기화하려면 `foodie.db` 파일을 삭제하고 서버를 재시작하세요:

```bash
rm foodie.db
cargo run
```

## 라이센스

ISC

## 문의

문제가 발생하면 Issue를 등록해주세요.
