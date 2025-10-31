#!/bin/bash
set -e

echo "🚀 Setting up EC2 instance for Foodie backend..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential dependencies
echo "📦 Installing essential dependencies..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    sqlite3 \
    nginx

# Install Rust
echo "🦀 Installing Rust..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo 'source "$HOME/.cargo/env"' >> ~/.bashrc
else
    echo "Rust already installed"
fi

# Install Redis
echo "🔴 Installing Redis..."
sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure Redis for production
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
sudo systemctl restart redis-server

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/foodie
sudo chown -R $USER:$USER /opt/foodie

# Clone repository (if not exists)
if [ ! -d "/opt/foodie/backend" ]; then
    echo "📥 Cloning repository..."
    cd /opt/foodie
    # User should set up their own git clone command
    echo "⚠️  Please clone your repository to /opt/foodie"
fi

# Create data directory for SQLite
sudo mkdir -p /opt/foodie/data
sudo chown -R $USER:$USER /opt/foodie/data

# Create .env file
if [ ! -f "/opt/foodie/backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > /opt/foodie/backend/.env << 'EOF'
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database Configuration
DATABASE_URL=sqlite:/opt/foodie/data/foodie.db

# JWT Configuration (⚠️ CHANGE THIS!)
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
SESSION_TTL=86400

# Logging
RUST_LOG=info
EOF
    echo "⚠️  Please update /opt/foodie/backend/.env with secure values!"
fi

# Create systemd service
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/foodie-backend.service > /dev/null << EOF
[Unit]
Description=Foodie GraphQL Backend
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/foodie/backend
Environment="RUST_LOG=info"
EnvironmentFile=/opt/foodie/backend/.env
ExecStart=/opt/foodie/backend/target/release/foodie_server
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx as reverse proxy
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/foodie-backend > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain or IP

    # GraphQL endpoint
    location /graphql {
        proxy_pass http://127.0.0.1:8080/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # GraphQL specific settings
        client_max_body_size 10M;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8080/health;
        access_log off;
    }

    # CORS headers (if needed)
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
}
EOF

sudo ln -sf /etc/nginx/sites-available/foodie-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository to /opt/foodie"
echo "2. Update /opt/foodie/backend/.env with secure values"
echo "3. Run the deploy script: cd /opt/foodie/backend && ./deploy.sh"
echo "4. Check service status: sudo systemctl status foodie-backend"
echo "5. View logs: sudo journalctl -u foodie-backend -f"
