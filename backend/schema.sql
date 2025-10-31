-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    initial TEXT NOT NULL,
    profile_image TEXT,
    status TEXT DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'AWAY', 'OFFLINE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Feed Posts Table
CREATE TABLE IF NOT EXISTS feed_posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    location TEXT NOT NULL,
    rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5),
    food_image TEXT,
    category TEXT NOT NULL CHECK (category IN ('KOREAN', 'WESTERN', 'CHINESE', 'JAPANESE', 'CAFE', 'DESSERT')),
    tags TEXT NOT NULL, -- JSON array stored as text
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id TEXT,
    is_reply BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Comment Mentions Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS comment_mentions (
    comment_id TEXT NOT NULL,
    mentioned_user_id TEXT NOT NULL,
    PRIMARY KEY (comment_id, mentioned_user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Post Likes Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Friendships Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS friendships (
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feed_posts_author_id ON feed_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_category ON feed_posts(category);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
