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

    /// Create index with mappings
    pub async fn create_index(&self) -> Result<(), Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        let body = json!({
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "korean": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase"]
                        }
                    }
                }
            },
            "mappings": {
                "properties": {
                    "id": { "type": "keyword" },
                    "author_id": { "type": "keyword" },
                    "title": {
                        "type": "text",
                        "analyzer": "korean",
                        "fields": {
                            "keyword": { "type": "keyword" }
                        }
                    },
                    "content": {
                        "type": "text",
                        "analyzer": "korean"
                    },
                    "location": {
                        "type": "text",
                        "analyzer": "korean",
                        "fields": {
                            "keyword": { "type": "keyword" }
                        }
                    },
                    "rating": { "type": "float" },
                    "category": { "type": "keyword" },
                    "tags": { "type": "keyword" },
                    "likes": { "type": "long" },
                    "comments_count": { "type": "long" },
                    "created_at": { "type": "date" }
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
            log::info!("Index {} created successfully", index_name);
        } else {
            let text = response.text().await?;
            log::warn!("Index creation response: {}", text);
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

    /// Bulk index multiple posts
    pub async fn bulk_index_posts(&self, posts: &[FeedPost]) -> Result<(), Box<dyn Error>> {
        if posts.is_empty() {
            return Ok(());
        }

        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        let mut body: Vec<JsonBody<_>> = Vec::new();
        for post in posts {
            let doc = PostDocument::from(post);
            body.push(json!({"index": {"_id": doc.id}}).into());
            body.push(json!(doc).into());
        }

        let response = client
            .bulk(BulkParts::Index(index_name))
            .body(body)
            .send()
            .await?;

        if !response.status_code().is_success() {
            let text = response.text().await?;
            return Err(format!("Bulk index failed: {}", text).into());
        }

        Ok(())
    }

    /// Search posts by query
    pub async fn search_posts(
        &self,
        query: &str,
        category: Option<String>,
        from: i64,
        size: i64,
    ) -> Result<SearchResult, Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        let mut must_queries = vec![json!({
            "multi_match": {
                "query": query,
                "fields": ["title^3", "content^2", "location", "tags"],
                "type": "best_fields",
                "operator": "or",
                "fuzziness": "AUTO"
            }
        })];

        if let Some(cat) = category {
            must_queries.push(json!({
                "term": { "category": cat }
            }));
        }

        let search_body = json!({
            "query": {
                "bool": {
                    "must": must_queries
                }
            },
            "sort": [
                { "_score": { "order": "desc" } },
                { "created_at": { "order": "desc" } }
            ],
            "from": from,
            "size": size
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

    /// Get posts by author IDs (for friend posts)
    pub async fn search_friend_posts(
        &self,
        friend_ids: &[String],
        query: Option<&str>,
        from: i64,
        size: i64,
    ) -> Result<SearchResult, Box<dyn Error>> {
        let index_name = self.es_client.index_name();
        let client = self.es_client.client();

        let mut must_queries = vec![json!({
            "terms": { "author_id": friend_ids }
        })];

        if let Some(q) = query {
            must_queries.push(json!({
                "multi_match": {
                    "query": q,
                    "fields": ["title^3", "content^2", "location", "tags"],
                    "type": "best_fields",
                    "operator": "or",
                    "fuzziness": "AUTO"
                }
            }));
        }

        let search_body = json!({
            "query": {
                "bool": {
                    "must": must_queries
                }
            },
            "sort": [
                { "created_at": { "order": "desc" } }
            ],
            "from": from,
            "size": size
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
