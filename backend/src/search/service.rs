use crate::models::post::{Category, FeedPost};
use crate::search::ElasticsearchClient;
use elasticsearch::{
    http::request::JsonBody, BulkParts, DeleteParts, IndexParts, SearchParts,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostDocument {
    pub id: String,
    pub author_id: String,
    pub title: String,
    pub content: String,
    pub location: String,
    pub rating: f64,
    pub category: String,
    pub tags: Vec<String>,
    pub likes: i64,
    pub comments_count: i64,
    pub created_at: String,
}

impl From<&FeedPost> for PostDocument {
    fn from(post: &FeedPost) -> Self {
        let tags: Vec<String> = serde_json::from_str(&post.tags).unwrap_or_default();
        let category = match post.category {
            Category::Korean => "KOREAN",
            Category::Western => "WESTERN",
            Category::Chinese => "CHINESE",
            Category::Japanese => "JAPANESE",
            Category::Cafe => "CAFE",
            Category::Dessert => "DESSERT",
        }
        .to_string();

        Self {
            id: post.id.clone(),
            author_id: post.author_id.clone(),
            title: post.title.clone(),
            content: post.content.clone(),
            location: post.location.clone(),
            rating: post.rating,
            category,
            tags,
            likes: post.likes,
            comments_count: post.comments_count,
            created_at: post.created_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub posts: Vec<PostDocument>,
    pub total: i64,
}

#[derive(Clone)]
pub struct SearchService {
    es_client: ElasticsearchClient,
}

impl SearchService {
    pub fn new(es_client: ElasticsearchClient) -> Self {
        Self { es_client }
    }

    /// 엔터프라이즈 수준의 인덱스 생성 (최적화된 설정)
    pub async fn create_index(&self) -> Result<(), Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        let body = json!({
            "settings": {
                // 프로덕션 환경: shards 3-5개, replicas 1-2개
                "number_of_shards": 3,
                "number_of_replicas": 1,
                // 성능 최적화
                "refresh_interval": "5s",
                "max_result_window": 10000,
                // 분석기 설정
                "analysis": {
                    "tokenizer": {
                        // Nori 한국어 토크나이저 (엔터프라이즈 표준)
                        "nori_user_dict": {
                            "type": "nori_tokenizer",
                            "decompound_mode": "mixed",
                            "user_dictionary_rules": [
                                "맛집",
                                "핫플레이스",
                                "푸드",
                                "맛스타그램"
                            ]
                        }
                    },
                    "filter": {
                        "korean_stop": {
                            "type": "stop",
                            "stopwords": ["_korean_"]
                        },
                        "korean_synonym": {
                            "type": "synonym",
                            "synonyms": [
                                "맛집,맛있는집,맛있는곳",
                                "맛있다,맛나다,존맛",
                                "카페,커피숍,coffee",
                                "한식,한국음식,korean"
                            ]
                        },
                        "edge_ngram_filter": {
                            "type": "edge_ngram",
                            "min_gram": 2,
                            "max_gram": 10,
                            "token_chars": ["letter", "digit"]
                        }
                    },
                    "analyzer": {
                        // Nori 기반 한국어 분석기
                        "korean": {
                            "type": "custom",
                            "tokenizer": "nori_user_dict",
                            "filter": [
                                "lowercase",
                                "korean_stop",
                                "nori_readingform",
                                "korean_synonym"
                            ]
                        },
                        // 자동완성용 분석기
                        "autocomplete": {
                            "type": "custom",
                            "tokenizer": "nori_tokenizer",
                            "filter": ["lowercase", "edge_ngram_filter"]
                        }
                    }
                }
            },
            "mappings": {
                "properties": {
                    "id": {
                        "type": "keyword"
                    },
                    "author_id": {
                        "type": "keyword",
                        // 집계(aggregation)를 위한 doc_values 활성화
                        "doc_values": true
                    },
                    "title": {
                        "type": "text",
                        "analyzer": "korean",
                        "search_analyzer": "korean",
                        "fields": {
                            "keyword": { "type": "keyword" },
                            "autocomplete": {
                                "type": "text",
                                "analyzer": "autocomplete"
                            }
                        }
                    },
                    "content": {
                        "type": "text",
                        "analyzer": "korean",
                        "search_analyzer": "korean"
                    },
                    "location": {
                        "type": "text",
                        "analyzer": "korean",
                        "fields": {
                            "keyword": { "type": "keyword" },
                            "autocomplete": {
                                "type": "text",
                                "analyzer": "autocomplete"
                            }
                        }
                    },
                    "rating": {
                        "type": "float",
                        "doc_values": true
                    },
                    "category": {
                        "type": "keyword",
                        "doc_values": true
                    },
                    "tags": {
                        "type": "keyword",
                        "doc_values": true
                    },
                    "likes": {
                        "type": "long",
                        "doc_values": true
                    },
                    "comments_count": {
                        "type": "long",
                        "doc_values": true
                    },
                    "created_at": {
                        "type": "date",
                        "format": "strict_date_optional_time||epoch_millis",
                        "doc_values": true
                    }
                }
            }
        });

        let response = client
            .indices()
            .create(elasticsearch::indices::IndicesCreateParts::Index(index_name))
            .body(body)
            .send()
            .await?;

        if response.status_code().is_success() {
            log::info!("Index {} created successfully with enterprise settings", index_name);

            // 인덱스 alias 생성
            self.create_alias().await?;
        } else {
            let text = response.text().await?;
            log::warn!("Index creation response: {}", text);
        }

        Ok(())
    }

    /// 인덱스 Alias 생성 (무중단 재인덱싱 지원)
    pub async fn create_alias(&self) -> Result<(), Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let alias_name = self.es_client.index_alias();
        let client = self.es_client.client();

        let body = json!({
            "actions": [
                {
                    "add": {
                        "index": index_name,
                        "alias": alias_name
                    }
                }
            ]
        });

        let response = client
            .indices()
            .update_aliases()
            .body(body)
            .send()
            .await?;

        if response.status_code().is_success() {
            log::info!("Alias {} created for index {}", alias_name, index_name);
        }

        Ok(())
    }

    /// Index a single post
    pub async fn index_post(&self, post: &FeedPost) -> Result<(), Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();
        let doc = PostDocument::from(post);

        let response = client
            .index(IndexParts::IndexId(index_name, &doc.id))
            .body(json!(doc))
            .send()
            .await?;

        if !response.status_code().is_success() {
            let text = response.text().await?;
            return Err(format!("Failed to index post: {}", text).into());
        }

        Ok(())
    }

    /// Delete a post from index
    pub async fn delete_post(&self, post_id: &str) -> Result<(), Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        let response = client
            .delete(DeleteParts::IndexId(index_name, post_id))
            .send()
            .await?;

        if !response.status_code().is_success() {
            let text = response.text().await?;
            log::warn!("Failed to delete post from index: {}", text);
        }

        Ok(())
    }

    /// 엔터프라이즈 벌크 인덱싱 (배치 처리 + 에러 핸들링)
    pub async fn bulk_index_posts(&self, posts: &[FeedPost]) -> Result<(), Box<dyn Error>> {
        if posts.is_empty() {
            return Ok(());
        }

        const BATCH_SIZE: usize = 500; // 엔터프라이즈 표준 배치 크기
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        // 배치로 나누어 처리
        let mut success_count = 0;
        let mut error_count = 0;

        for chunk in posts.chunks(BATCH_SIZE) {
            let mut body: Vec<JsonBody<_>> = Vec::new();
            for post in chunk {
                let doc = PostDocument::from(post);
                body.push(json!({"index": {"_id": doc.id.clone()}}).into());
                body.push(json!(doc).into());
            }

            let response = client
                .bulk(BulkParts::Index(index_name))
                .body(body)
                .send()
                .await?;

            if response.status_code().is_success() {
                // 응답 파싱하여 개별 아이템 성공/실패 확인
                let response_body: Value = response.json().await?;
                if let Some(items) = response_body["items"].as_array() {
                    for item in items {
                        if let Some(index) = item["index"].as_object() {
                            if let Some(status) = index["status"].as_i64() {
                                if status >= 200 && status < 300 {
                                    success_count += 1;
                                } else {
                                    error_count += 1;
                                    log::warn!("Failed to index item: {:?}", index);
                                }
                            }
                        }
                    }
                }
            } else {
                let text = response.text().await?;
                log::error!("Bulk index batch failed: {}", text);
                error_count += chunk.len();
            }
        }

        log::info!(
            "Bulk indexing completed: {} success, {} errors",
            success_count,
            error_count
        );

        if error_count > 0 && success_count == 0 {
            return Err("All bulk index operations failed".into());
        }

        Ok(())
    }

    /// 엔터프라이즈 검색 (최적화된 쿼리 + Highlight + Scoring)
    pub async fn search_posts(
        &self,
        query: &str,
        category: Option<String>,
        from: i64,
        size: i64,
    ) -> Result<SearchResult, Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        // Multi-match 쿼리 최적화 (필드별 가중치)
        let mut must_queries = vec![json!({
            "multi_match": {
                "query": query,
                "fields": ["title^5", "content^3", "location^2", "tags^4"],
                "type": "best_fields",
                "operator": "or",
                "fuzziness": "AUTO",
                "prefix_length": 2,
                "max_expansions": 50
            }
        })];

        if let Some(cat) = category {
            must_queries.push(json!({
                "term": {
                    "category": {
                        "value": cat,
                        "boost": 1.5
                    }
                }
            }));
        }

        let search_body = json!({
            "query": {
                "bool": {
                    "must": must_queries,
                    // 인기 게시물에 가중치 부여
                    "should": [
                        {
                            "function_score": {
                                "functions": [
                                    {
                                        "field_value_factor": {
                                            "field": "likes",
                                            "factor": 0.5,
                                            "modifier": "log1p",
                                            "missing": 0
                                        }
                                    },
                                    {
                                        "field_value_factor": {
                                            "field": "comments_count",
                                            "factor": 0.3,
                                            "modifier": "log1p",
                                            "missing": 0
                                        }
                                    }
                                ],
                                "score_mode": "sum",
                                "boost_mode": "multiply"
                            }
                        }
                    ]
                }
            },
            // Highlight 설정
            "highlight": {
                "fields": {
                    "title": {
                        "fragment_size": 150,
                        "number_of_fragments": 1,
                        "pre_tags": ["<em>"],
                        "post_tags": ["</em>"]
                    },
                    "content": {
                        "fragment_size": 200,
                        "number_of_fragments": 2,
                        "pre_tags": ["<em>"],
                        "post_tags": ["</em>"]
                    }
                }
            },
            // 정렬: 관련성 우선, 그다음 최신순
            "sort": [
                { "_score": { "order": "desc" } },
                { "created_at": { "order": "desc" } }
            ],
            "from": from,
            "size": size,
            // 트래킹 최적화
            "track_total_hits": true
        });

        let response = client
            .search(SearchParts::Index(&[index_name]))
            .body(search_body)
            .send()
            .await?;

        if !response.status_code().is_success() {
            let text = response.text().await?;
            return Err(format!("Search failed: {}", text).into());
        }

        let response_body: Value = response.json().await?;
        let hits = response_body["hits"]["hits"].as_array().unwrap_or(&vec![]);
        let total = response_body["hits"]["total"]["value"]
            .as_i64()
            .unwrap_or(0);

        let posts: Vec<PostDocument> = hits
            .iter()
            .filter_map(|hit| {
                let source = &hit["_source"];
                serde_json::from_value(source.clone()).ok()
            })
            .collect();

        Ok(SearchResult { posts, total })
    }

    /// 친구 게시물 검색 (엔터프라이즈 최적화)
    pub async fn search_friend_posts(
        &self,
        friend_ids: &[String],
        query: Option<&str>,
        from: i64,
        size: i64,
    ) -> Result<SearchResult, Box<dyn Error>> {
        if friend_ids.is_empty() {
            return Ok(SearchResult {
                posts: vec![],
                total: 0,
            });
        }

        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        // terms 쿼리 최적화 (대용량 친구 목록 대응)
        let mut must_queries = vec![json!({
            "terms": {
                "author_id": friend_ids,
                "boost": 1.0
            }
        })];

        // 검색어가 있는 경우 추가
        if let Some(q) = query {
            must_queries.push(json!({
                "multi_match": {
                    "query": q,
                    "fields": ["title^5", "content^3", "location^2", "tags^4"],
                    "type": "best_fields",
                    "operator": "or",
                    "fuzziness": "AUTO",
                    "prefix_length": 2,
                    "max_expansions": 50
                }
            }));
        }

        let search_body = json!({
            "query": {
                "bool": {
                    "must": must_queries,
                    // 인기도 기반 부스팅
                    "should": [
                        {
                            "function_score": {
                                "functions": [
                                    {
                                        "field_value_factor": {
                                            "field": "likes",
                                            "factor": 0.3,
                                            "modifier": "log1p",
                                            "missing": 0
                                        }
                                    },
                                    {
                                        "gauss": {
                                            "created_at": {
                                                "origin": "now",
                                                "scale": "7d",
                                                "decay": 0.5
                                            }
                                        }
                                    }
                                ],
                                "score_mode": "sum",
                                "boost_mode": "multiply"
                            }
                        }
                    ]
                }
            },
            // Highlight (검색어가 있는 경우)
            "highlight": query.as_ref().map(|_| json!({
                "fields": {
                    "title": {
                        "fragment_size": 150,
                        "number_of_fragments": 1
                    },
                    "content": {
                        "fragment_size": 200,
                        "number_of_fragments": 2
                    }
                }
            })).unwrap_or(json!(null)),
            // 정렬: 검색어가 있으면 관련성 우선, 없으면 최신순
            "sort": if query.is_some() {
                vec![
                    json!({ "_score": { "order": "desc" } }),
                    json!({ "created_at": { "order": "desc" } })
                ]
            } else {
                vec![json!({ "created_at": { "order": "desc" } })]
            },
            "from": from,
            "size": size,
            "track_total_hits": true
        });

        let response = client
            .search(SearchParts::Index(&[index_name]))
            .body(search_body)
            .send()
            .await?;

        if !response.status_code().is_success() {
            let text = response.text().await?;
            return Err(format!("Search friend posts failed: {}", text).into());
        }

        let response_body: Value = response.json().await?;
        let hits = response_body["hits"]["hits"].as_array().unwrap_or(&vec![]);
        let total = response_body["hits"]["total"]["value"]
            .as_i64()
            .unwrap_or(0);

        let posts: Vec<PostDocument> = hits
            .iter()
            .filter_map(|hit| {
                let source = &hit["_source"];
                serde_json::from_value(source.clone()).ok()
            })
            .collect();

        Ok(SearchResult { posts, total })
    }
}
