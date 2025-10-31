use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use std::env;

pub async fn create_pool() -> Result<SqlitePool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:foodie.db".to_string());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    Ok(pool)
}

pub async fn init_db(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let schema = include_str!("../../schema.sql");

    // Execute each statement separately
    let statements: Vec<&str> = schema
        .split(';')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect();

    for statement in statements {
        sqlx::query(statement).execute(pool).await?;
    }

    log::info!("Database initialized successfully");
    Ok(())
}
