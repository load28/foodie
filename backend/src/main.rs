mod auth;
mod cache;
mod db;
mod models;
mod schema;
mod search;
mod session;

use actix_cors::Cors;
use actix_web::{guard, web, App, HttpRequest, HttpResponse, HttpServer, Result};
use async_graphql::http::{playground_source, GraphQLPlaygroundConfig};
use async_graphql_actix_web::{GraphQLRequest, GraphQLResponse};
use dotenv::dotenv;
use std::env;

use crate::auth::jwt::verify_jwt;
use crate::cache::FriendCache;
use crate::db::{create_pool, init_db};
use crate::schema::{create_schema, AppSchema};
use crate::search::{ElasticsearchClient, SearchService};
use crate::session::{middleware, RedisSessionStore};

async fn graphql_playground() -> Result<HttpResponse> {
    let source = playground_source(GraphQLPlaygroundConfig::new("/graphql"));
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(source))
}

async fn graphql_handler(
    schema: web::Data<AppSchema>,
    session_store: web::Data<RedisSessionStore>,
    req: HttpRequest,
    gql_request: GraphQLRequest,
) -> GraphQLResponse {
    let mut request = gql_request.into_inner();

    // 세션 기반 인증 (우선 순위)
    if let Some(session_id) = middleware::extract_session_id(&req) {
        if let Ok(user_id) = middleware::verify_session(&session_store, &session_id).await {
            request = request.data(user_id);
        }
    }
    // JWT 토큰 폴백 (하위 호환성)
    else if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                if let Ok(claims) = verify_jwt(token) {
                    request = request.data(claims.sub);
                }
            }
        }
    }

    schema.execute(request).await.into()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 환경 변수 로드
    dotenv().ok();
    env_logger::init();

    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT must be a valid port number");

    log::info!("Starting Foodie GraphQL Server...");

    // 데이터베이스 연결 및 초기화
    let pool = create_pool()
        .await
        .expect("Failed to create database pool");

    init_db(&pool)
        .await
        .expect("Failed to initialize database");

    log::info!("Database initialized successfully");

    // Redis 세션 스토어 초기화
    let session_store = RedisSessionStore::new()
        .await
        .expect("Failed to create Redis session store");

    // Redis 연결 테스트
    session_store
        .ping()
        .await
        .expect("Failed to connect to Redis");

    log::info!("Redis session store initialized successfully");

    // Friend Cache 초기화 (Redis 기반)
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let friend_cache = FriendCache::new(&redis_url)
        .expect("Failed to create friend cache");

    log::info!("Friend cache initialized successfully");

    // Elasticsearch 초기화
    let es_url = env::var("ELASTICSEARCH_URL").unwrap_or_else(|_| "http://127.0.0.1:9200".to_string());
    let es_index = env::var("ELASTICSEARCH_INDEX").unwrap_or_else(|_| "foodie_posts".to_string());

    let es_client = ElasticsearchClient::new(&es_url, &es_index)
        .expect("Failed to create Elasticsearch client");

    let search_service = SearchService::new(es_client);

    // Elasticsearch 인덱스 생성 (이미 존재하면 무시됨)
    if let Err(e) = search_service.create_index().await {
        log::warn!("Failed to create Elasticsearch index (may already exist): {}", e);
    } else {
        log::info!("Elasticsearch index initialized successfully");
    }

    // GraphQL 스키마 생성
    let schema = create_schema();

    log::info!("GraphQL Server running at http://{}:{}", host, port);
    log::info!("GraphQL Playground: http://{}:{}/playground", host, port);

    // HTTP 서버 시작
    HttpServer::new(move || {
        // CORS 설정
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(schema.clone()))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(session_store.clone()))
            .app_data(web::Data::new(search_service.clone()))
            .app_data(web::Data::new(friend_cache.clone()))
            .service(
                web::resource("/graphql")
                    .guard(guard::Post())
                    .to(graphql_handler),
            )
            .service(web::resource("/playground").guard(guard::Get()).to(graphql_playground))
    })
    .bind((host, port))?
    .run()
    .await
}
