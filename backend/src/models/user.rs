use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq, Enum, Copy, sqlx::Type)]
#[sqlx(rename_all = "UPPERCASE")]
pub enum UserStatus {
    #[graphql(name = "ONLINE")]
    Online,
    #[graphql(name = "AWAY")]
    Away,
    #[graphql(name = "OFFLINE")]
    Offline,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow, SimpleObject)]
#[graphql(complex)]
pub struct User {
    pub id: String,
    #[graphql(skip)]
    pub password_hash: String,
    pub email: String,
    pub name: String,
    pub initial: String,
    pub profile_image: Option<String>,
    pub status: UserStatus,
    #[graphql(skip)]
    pub created_at: DateTime<Utc>,
    #[graphql(skip)]
    pub updated_at: DateTime<Utc>,
}

#[ComplexObject]
impl User {
    async fn created_at(&self) -> String {
        self.created_at.to_rfc3339()
    }

    async fn updated_at(&self) -> String {
        self.updated_at.to_rfc3339()
    }
}

#[derive(Debug, InputObject)]
pub struct CreateUserInput {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Debug, InputObject)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

#[derive(Debug, SimpleObject)]
pub struct AuthPayload {
    pub user: User,
    pub token: String,
}
