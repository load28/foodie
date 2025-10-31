# Elasticsearch 검색 및 친구 관계 기능 구현

## 구현 개요

이번 업데이트에서는 친구 관계 기능과 Elasticsearch를 활용한 고급 검색 기능을 구현했습니다.

## 주요 기능

### 1. 친구 관계 시스템 (Friendship System)

#### 백엔드
- **데이터베이스 스키마**: `friendships` 테이블 추가 (양방향 관계)
- **GraphQL API**:
  - `addFriend(friendId)`: 친구 추가
  - `removeFriend(friendId)`: 친구 삭제
  - `friends`: 친구 목록 조회
  - `isFriend(userId)`: 친구 여부 확인
  - `friendPosts`: 친구 게시물 조회

#### 프론트엔드
- **친구 목록 페이지** (`/src/pages/FriendsPage`)
  - 친구 목록 표시
  - 친구 추가/삭제 기능
  - 온라인 상태 표시
  - 실시간 검색 필터

### 2. Elasticsearch 검색 시스템

#### 인프라
- **Docker Compose 설정**: Elasticsearch + Kibana + Redis
- **환경 변수**:
  - `ELASTICSEARCH_URL`: Elasticsearch 서버 주소
  - `ELASTICSEARCH_INDEX`: 인덱스 이름 (기본: `foodie_posts`)

#### 백엔드
- **검색 모듈** (`/backend/src/search`)
  - `ElasticsearchClient`: Elasticsearch 클라이언트 래퍼
  - `SearchService`: 검색 비즈니스 로직

- **자동 인덱싱**:
  - 게시물 생성 시 자동으로 Elasticsearch에 인덱싱

- **GraphQL API**:
  - `searchPosts(query, category, from, size)`: 전체 게시물 검색
  - `searchFriendPosts(query, from, size)`: 친구 게시물 검색

#### 검색 기능
- **멀티 필드 검색**: 제목, 내용, 위치, 태그 검색
- **가중치 검색**: 제목(3배), 내용(2배), 위치/태그(1배)
- **퍼지 매칭**: 오타 허용 검색 (AUTO 모드)
- **카테고리 필터링**: 음식 카테고리별 필터
- **정렬**: 관련도 + 생성일시 기준

#### 프론트엔드
- **검색 페이지** (`/src/pages/SearchPage`)
  - 전체 게시물 검색
  - 친구 게시물 검색
  - 카테고리 필터
  - 검색 결과 그리드 표시

## 파일 구조

### 백엔드
```
backend/
├── src/
│   ├── search/
│   │   ├── mod.rs           # 검색 모듈 exports
│   │   ├── client.rs        # Elasticsearch 클라이언트
│   │   └── service.rs       # 검색 서비스 로직
│   ├── models/
│   │   └── friendship.rs    # 친구 관계 모델
│   ├── schema/
│   │   ├── query.rs         # 검색/친구 쿼리 추가
│   │   └── mutation.rs      # 친구 관계 mutation 추가
│   └── main.rs              # Elasticsearch 초기화
├── schema.sql               # friendships 테이블 추가
└── Cargo.toml               # elasticsearch crate 추가
```

### 프론트엔드
```
src/
├── pages/
│   ├── FriendsPage/         # 친구 목록 페이지
│   │   ├── FriendsPage.tsx
│   │   └── FriendsPage.scss
│   └── SearchPage/          # 검색 페이지
│       ├── SearchPage.tsx
│       └── SearchPage.scss
├── lib/graphql/
│   ├── queries.ts           # 친구/검색 쿼리 추가
│   └── mutations.ts         # 친구 관계 mutation 추가
└── main.tsx                 # 라우팅에 검색/친구 페이지 추가
```

### 인프라
```
docker-compose.yml           # Elasticsearch + Kibana + Redis
```

## 설치 및 실행

### 1. Elasticsearch 실행
```bash
docker-compose up -d
```

### 2. 백엔드 실행
```bash
cd backend
cargo run
```

### 3. 프론트엔드 실행
```bash
pnpm install
pnpm dev
```

## 환경 변수

### 백엔드 (.env)
```env
ELASTICSEARCH_URL=http://127.0.0.1:9200
ELASTICSEARCH_INDEX=foodie_posts
```

## API 사용 예시

### 친구 추가
```graphql
mutation {
  addFriend(friendId: "user-id-here")
}
```

### 친구 목록 조회
```graphql
query {
  friends {
    id
    name
    email
    status
  }
}
```

### 게시물 검색
```graphql
query {
  searchPosts(
    query: "맛있는 파스타"
    category: "WESTERN"
    from: 0
    size: 20
  ) {
    posts {
      id
      title
      content
      location
    }
    total
  }
}
```

### 친구 게시물 검색
```graphql
query {
  searchFriendPosts(
    query: "피자"
    from: 0
    size: 20
  ) {
    posts {
      id
      title
      author {
        name
      }
    }
    total
  }
}
```

## 기술 스택

### 백엔드
- Rust 1.70+
- Actix-web 4.9
- async-graphql 7.0
- Elasticsearch 8.15
- SQLite + sqlx 0.8

### 프론트엔드
- React 19
- TypeScript
- Apollo Client 4.0
- Vite 7.1
- SCSS

### 인프라
- Docker + Docker Compose
- Elasticsearch 8.11
- Kibana 8.11
- Redis 7

## 주요 개선사항

1. **검색 성능**: Elasticsearch를 통한 고속 전문 검색
2. **사용자 경험**: 친구 관계 기능으로 소셜 기능 강화
3. **확장성**: 마이크로서비스 아키텍처에 적합한 구조
4. **유지보수성**: 모듈화된 코드 구조

## 향후 개선 방향

- [ ] 친구 요청/수락 시스템 (현재는 즉시 친구 추가)
- [ ] 친구 추천 알고리즘
- [ ] 검색 자동완성 기능
- [ ] 검색 히스토리 및 인기 검색어
- [ ] 지도 기반 위치 검색
- [ ] 게시물 수정/삭제 시 Elasticsearch 동기화
