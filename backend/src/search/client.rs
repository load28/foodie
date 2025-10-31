use elasticsearch::{
    http::transport::{SingleNodeConnectionPool, TransportBuilder},
    Elasticsearch,
};
use std::error::Error;

#[derive(Clone)]
pub struct ElasticsearchClient {
    client: Elasticsearch,
    index_name: String,
}

impl ElasticsearchClient {
    pub fn new(url: &str, index_name: &str) -> Result<Self, Box<dyn Error>> {
        let url = url.parse()?;
        let conn_pool = SingleNodeConnectionPool::new(url);
        let transport = TransportBuilder::new(conn_pool).disable_proxy().build()?;
        let client = Elasticsearch::new(transport);

        Ok(Self {
            client,
            index_name: index_name.to_string(),
        })
    }

    pub fn client(&self) -> &Elasticsearch {
        &self.client
    }

    pub fn index_name(&self) -> &str {
        &self.index_name
    }
}
