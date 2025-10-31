#!/bin/bash
set -e

echo "🚀 Deploying Foodie backend..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/foodie/backend"
SERVICE_NAME="foodie-backend"

# Navigate to app directory
cd "$APP_DIR"

echo "📥 Pulling latest code..."
git fetch origin
git pull origin main

# Load environment variables
if [ -f "$APP_DIR/.env" ]; then
    source "$APP_DIR/.env"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Build the application
echo "🔨 Building application..."
source "$HOME/.cargo/env"
cargo build --release

# Initialize database if needed
if [ ! -f "/opt/foodie/data/foodie.db" ]; then
    echo "🗄️  Initializing database..."
    sqlite3 /opt/foodie/data/foodie.db < "$APP_DIR/schema.sql"
fi

# Run database migrations (if you add migrations later)
# echo "🔄 Running database migrations..."
# sqlx migrate run

# Restart the service
echo "🔄 Restarting service..."
sudo systemctl restart "$SERVICE_NAME"

# Wait for service to start
sleep 2

# Check service status
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✅ Service started successfully!${NC}"

    # Show service status
    sudo systemctl status "$SERVICE_NAME" --no-pager -l

    # Test health endpoint
    echo ""
    echo "🏥 Testing health endpoint..."
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed (service may still be starting)${NC}"
    fi
else
    echo -e "${RED}❌ Service failed to start!${NC}"
    echo "Showing recent logs:"
    sudo journalctl -u "$SERVICE_NAME" -n 50 --no-pager
    exit 1
fi

echo ""
echo "📊 Deployment Summary:"
echo "  Service: $SERVICE_NAME"
echo "  Status: $(sudo systemctl is-active $SERVICE_NAME)"
echo "  Logs: sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
