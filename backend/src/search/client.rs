use elasticsearch::{
    auth::Credentials,
    http::transport::{CloudConnectionPool, SingleNodeConnectionPool, TransportBuilder},
    Elasticsearch,
};
use std::error::Error;
use std::time::Duration;

#[derive(Clone)]
pub struct ElasticsearchClient {
    client: Elasticsearch,
    index_name: String,
    index_alias: String,
}

impl ElasticsearchClient {
    /// 엔터프라이즈 설정으로 클라이언트 생성
    pub fn new(url: &str, index_name: &str) -> Result<Self, Box<dyn Error>> {
        Self::new_with_options(url, index_name, None, false)
    }

    /// 고급 옵션으로 클라이언트 생성
    /// - urls: 쉼표로 구분된 여러 노드 URL (멀티 노드 지원)
    /// - credentials: 인증 정보 (username:password)
    /// - cloud: Elastic Cloud 사용 여부
    pub fn new_with_options(
        urls: &str,
        index_name: &str,
        credentials: Option<&str>,
        cloud: bool,
    ) -> Result<Self, Box<dyn Error>> {
        let url_list: Vec<&str> = urls.split(',').map(|s| s.trim()).collect();
        let index_alias = format!("{}_alias", index_name);

        let transport = if url_list.len() > 1 {
            // 멀티 노드 지원
            log::info!("Connecting to multiple Elasticsearch nodes: {:?}", url_list);
            let urls: Vec<_> = url_list
                .iter()
                .map(|u| u.parse())
                .collect::<Result<Vec<_>, _>>()?;

            let conn_pool = if cloud {
                // Elastic Cloud 연결
                CloudConnectionPool::new(urls)?
            } else {
                // 온프레미스 멀티 노드
                CloudConnectionPool::new(urls)?
            };

            let mut builder = TransportBuilder::new(conn_pool)
                .timeout(Duration::from_secs(30))
                .disable_proxy();

            // 인증 정보 설정
            if let Some(creds) = credentials {
                let parts: Vec<&str> = creds.split(':').collect();
                if parts.len() == 2 {
                    builder = builder.auth(Credentials::Basic(
                        parts[0].to_string(),
                        parts[1].to_string(),
                    ));
                }
            }

            builder.build()?
        } else {
            // 단일 노드 (개발/테스트 환경)
            log::info!("Connecting to single Elasticsearch node: {}", urls);
            let url = urls.parse()?;
            let conn_pool = SingleNodeConnectionPool::new(url);

            let mut builder = TransportBuilder::new(conn_pool)
                .timeout(Duration::from_secs(30))
                .disable_proxy();

            if let Some(creds) = credentials {
                let parts: Vec<&str> = creds.split(':').collect();
                if parts.len() == 2 {
                    builder = builder.auth(Credentials::Basic(
                        parts[0].to_string(),
                        parts[1].to_string(),
                    ));
                }
            }

            builder.build()?
        };

        let client = Elasticsearch::new(transport);

        Ok(Self {
            client,
            index_name: index_name.to_string(),
            index_alias,
        })
    }

    pub fn client(&self) -> &Elasticsearch {
        &self.client
    }

    pub fn index_name(&self) -> &str {
        &self.index_name
    }

    pub fn index_alias(&self) -> &str {
        &self.index_alias
    }

    /// 클러스터 헬스 체크
    pub async fn health_check(&self) -> Result<(), Box<dyn Error>> {
        let response = self.client.cluster().health().send().await?;
        let status = response.status_code();

        if status.is_success() {
            log::info!("Elasticsearch cluster is healthy");
            Ok(())
        } else {
            Err(format!("Elasticsearch cluster health check failed: {}", status).into())
        }
    }
}
