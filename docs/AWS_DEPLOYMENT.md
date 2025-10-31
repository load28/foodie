# AWS 배포 가이드

이 문서는 Foodie 프로젝트를 AWS에 배포하는 방법을 안내합니다.

## 아키텍처 개요

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  AWS Amplify    │────▶│   EC2 Instance   │────▶│  ElastiCache    │
│  (Frontend)     │     │   (Backend)      │     │  (Redis)        │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │  SQLite  │
                        │  (Local) │
                        └──────────┘
```

- **프론트엔드**: AWS Amplify (자동 빌드 및 배포)
- **백엔드**: EC2 인스턴스 (Rust GraphQL 서버)
- **세션 스토어**: ElastiCache (Redis) 또는 EC2 내부 Redis
- **데이터베이스**: SQLite (로컬) 또는 RDS 전환 권장

---

## 1. EC2 백엔드 배포

### 1.1 EC2 인스턴스 생성

1. **AWS Console** → **EC2** → **Launch Instance**
2. 인스턴스 설정:
   - **Name**: `foodie-backend`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: `t2.micro` (Free Tier) 또는 `t3.small`
   - **Key Pair**: 새 키페어 생성 및 다운로드 (예: `foodie-backend.pem`)
   - **Network Settings**:
     - ✅ Allow SSH traffic (포트 22)
     - ✅ Allow HTTP traffic (포트 80)
     - ✅ Allow HTTPS traffic (포트 443)
   - **Storage**: 20GB gp3

3. **Launch Instance** 클릭

### 1.2 Elastic IP 할당 (선택 사항, 권장)

1. **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. 생성된 IP를 EC2 인스턴스에 연결
3. 도메인이 있다면 DNS A 레코드에 이 IP 추가

### 1.3 EC2 초기 설정

로컬 터미널에서 SSH 접속:

```bash
# 키 파일 권한 설정
chmod 400 foodie-backend.pem

# SSH 접속
ssh -i foodie-backend.pem ubuntu@<EC2_PUBLIC_IP>
```

EC2 인스턴스에서:

```bash
# 설정 스크립트 다운로드 및 실행
git clone https://github.com/YOUR_USERNAME/foodie.git /tmp/foodie
cd /tmp/foodie/backend
chmod +x setup-ec2.sh
./setup-ec2.sh

# 리포지토리를 /opt/foodie로 클론
sudo mkdir -p /opt/foodie
sudo chown -R ubuntu:ubuntu /opt/foodie
cd /opt/foodie
git clone https://github.com/YOUR_USERNAME/foodie.git .
```

### 1.4 환경 변수 설정

```bash
# .env 파일 편집
cd /opt/foodie/backend
nano .env
```

**중요**: 다음 값들을 반드시 변경하세요:

```bash
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database Configuration
DATABASE_URL=sqlite:/opt/foodie/data/foodie.db

# JWT Configuration - ⚠️ 반드시 변경!
JWT_SECRET=<32자 이상의 랜덤 문자열>

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
SESSION_TTL=86400

# Logging
RUST_LOG=info
```

**JWT_SECRET 생성 방법**:
```bash
openssl rand -base64 32
```

### 1.5 첫 배포

```bash
cd /opt/foodie/backend
chmod +x deploy.sh
./deploy.sh
```

### 1.6 서비스 확인

```bash
# 서비스 상태 확인
sudo systemctl status foodie-backend

# 로그 확인
sudo journalctl -u foodie-backend -f

# Health check
curl http://localhost:8080/health

# GraphQL playground (외부에서)
curl http://<EC2_PUBLIC_IP>/graphql
```

---

## 2. Redis 설정 (ElastiCache 사용 시)

### 2.1 ElastiCache Redis 클러스터 생성

1. **AWS Console** → **ElastiCache** → **Create**
2. 설정:
   - **Cluster Engine**: Redis
   - **Cluster Mode**: Disabled
   - **Node Type**: `cache.t2.micro` (Free Tier)
   - **Number of Replicas**: 0 (개발용)
   - **Subnet Group**: EC2와 같은 VPC 선택
   - **Security Group**: EC2 인스턴스에서 접근 가능하도록 설정 (포트 6379)

3. 생성 완료 후 **Primary Endpoint** 복사

### 2.2 백엔드 환경 변수 업데이트

```bash
# EC2에서
nano /opt/foodie/backend/.env
```

```bash
REDIS_URL=redis://<ELASTICACHE_ENDPOINT>:6379
```

```bash
# 서비스 재시작
sudo systemctl restart foodie-backend
```

---

## 3. 프론트엔드 AWS Amplify 배포

### 3.1 Amplify 앱 생성

1. **AWS Console** → **AWS Amplify** → **Create new app**
2. **Deploy from Git provider** 선택
3. GitHub 연결:
   - GitHub 계정 인증
   - 리포지토리 선택: `YOUR_USERNAME/foodie`
   - 브랜치 선택: `main`

### 3.2 빌드 설정

Amplify가 `amplify.yml`을 자동으로 감지합니다. 설정 확인:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm@10.12.4
        - pnpm install --frozen-lockfile
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

### 3.3 환경 변수 설정

Amplify Console에서:

1. **App settings** → **Environment variables**
2. 다음 변수 추가:

| Key | Value |
|-----|-------|
| `VITE_GRAPHQL_URI` | `http://<EC2_PUBLIC_IP>/graphql` 또는 `https://api.yourdomain.com/graphql` |

### 3.4 배포 시작

1. **Save and deploy** 클릭
2. 빌드 로그 확인
3. 배포 완료 후 Amplify가 제공하는 URL로 접속 (예: `https://main.xxxxx.amplifyapp.com`)

### 3.5 커스텀 도메인 설정 (선택 사항)

1. **Domain management** → **Add domain**
2. 도메인 입력 (예: `foodie.yourdomain.com`)
3. DNS 레코드 설정 (Amplify가 자동으로 안내)

---

## 4. GitHub Actions CI/CD 설정

### 4.1 GitHub Secrets 설정

1. GitHub 리포지토리 → **Settings** → **Secrets and variables** → **Actions**
2. 다음 Secret 추가:

| Secret Name | Value |
|-------------|-------|
| `EC2_SSH_PRIVATE_KEY` | 키페어 파일(`.pem`)의 전체 내용 |
| `EC2_HOST` | EC2 퍼블릭 IP 또는 Elastic IP |
| `EC2_USER` | `ubuntu` |

**EC2_SSH_PRIVATE_KEY 추가 방법**:
```bash
# 로컬에서 키 파일 내용 복사
cat foodie-backend.pem
```

전체 내용을 복사하여 GitHub Secret에 붙여넣기 (-----BEGIN ... END----- 포함)

### 4.2 자동 배포 테스트

백엔드 코드 수정 후:

```bash
git add backend/
git commit -m "test: CI/CD 배포 테스트"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황 확인

---

## 5. 보안 설정

### 5.1 EC2 Security Group 설정

1. **EC2** → **Security Groups** → 인스턴스의 SG 선택
2. **Inbound Rules**:

| Type | Protocol | Port Range | Source |
|------|----------|------------|--------|
| SSH | TCP | 22 | My IP (또는 특정 IP만) |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 6379 | ElastiCache SG (ElastiCache 사용 시) |

### 5.2 SSL/TLS 인증서 설정 (HTTPS)

#### 옵션 1: Let's Encrypt (무료)

EC2에서:

```bash
# Certbot 설치
sudo apt-get install -y certbot python3-certbot-nginx

# 인증서 발급 (도메인 필요)
sudo certbot --nginx -d api.yourdomain.com
```

#### 옵션 2: AWS Certificate Manager

1. **ACM** → **Request certificate**
2. 도메인 검증
3. ALB(Application Load Balancer) 사용 시 적용

### 5.3 환경 변수 보안

```bash
# .env 파일 권한 설정
chmod 600 /opt/foodie/backend/.env
```

---

## 6. 모니터링 및 로그

### 6.1 CloudWatch 로그 (선택 사항)

EC2에서 CloudWatch Agent 설치:

```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

### 6.2 로그 확인 방법

```bash
# 백엔드 로그
sudo journalctl -u foodie-backend -f

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Redis 로그
sudo journalctl -u redis-server -f
```

### 6.3 서비스 상태 모니터링

```bash
# 서비스 상태
sudo systemctl status foodie-backend
sudo systemctl status redis-server
sudo systemctl status nginx

# 리소스 사용량
htop
df -h
free -h
```

---

## 7. 데이터베이스 업그레이드 (선택 사항)

### SQLite → PostgreSQL/MySQL 전환

프로덕션 환경에서는 RDS 사용 권장:

1. **RDS** → **Create database**
   - Engine: PostgreSQL 또는 MySQL
   - Instance: `db.t3.micro`
   - Storage: 20GB

2. `Cargo.toml` 수정:
```toml
sqlx = { version = "0.8", features = ["runtime-tokio-native-tls", "postgres"] }
```

3. `.env` 수정:
```bash
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/foodie
```

---

## 8. 트러블슈팅

### 문제 1: 배포 스크립트 실행 실패

```bash
# 권한 확인
chmod +x /opt/foodie/backend/deploy.sh

# 스크립트 수동 실행
cd /opt/foodie/backend
./deploy.sh
```

### 문제 2: 서비스 시작 실패

```bash
# 로그 확인
sudo journalctl -u foodie-backend -n 100 --no-pager

# 환경 변수 확인
cat /opt/foodie/backend/.env

# 데이터베이스 파일 확인
ls -la /opt/foodie/data/
```

### 문제 3: Redis 연결 실패

```bash
# Redis 상태 확인
sudo systemctl status redis-server

# Redis 연결 테스트
redis-cli ping
# 응답: PONG
```

### 문제 4: CORS 에러

`backend/src/main.rs`에서 CORS 설정 확인:

```rust
.wrap(
    Cors::default()
        .allowed_origin("https://your-amplify-domain.amplifyapp.com")
        .allowed_methods(vec!["GET", "POST", "OPTIONS"])
        .allowed_headers(vec![
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
        ])
        .supports_credentials()
        .max_age(3600)
)
```

---

## 9. 비용 최적화

### 예상 월 비용 (Free Tier 이후)

| 서비스 | 스펙 | 월 비용 (USD) |
|--------|------|--------------|
| EC2 (t3.small) | 2 vCPU, 2GB RAM | ~$15 |
| Elastic IP | 1개 (사용 중) | $0 |
| ElastiCache (t2.micro) | Redis | ~$12 |
| Amplify | 빌드 + 호스팅 | ~$1-5 |
| **합계** | | **~$28-32** |

### 비용 절감 방법

1. **EC2 내부 Redis 사용**: ElastiCache 대신 EC2 내부 Redis 사용 (-$12)
2. **Reserved Instance**: 1년 약정 시 EC2 비용 40% 절감
3. **S3 + CloudFront**: Amplify 대신 S3 정적 호스팅 사용 (-$3)

---

## 10. 체크리스트

### 배포 전

- [ ] EC2 인스턴스 생성 및 Elastic IP 할당
- [ ] EC2 초기 설정 스크립트 실행
- [ ] `.env` 파일 설정 (JWT_SECRET 변경)
- [ ] Redis 설치 확인 (또는 ElastiCache 생성)
- [ ] Security Group 규칙 설정
- [ ] 수동 배포 테스트 (`deploy.sh` 실행)

### GitHub Actions 설정

- [ ] GitHub Secrets 추가 (`EC2_SSH_PRIVATE_KEY`, `EC2_HOST`, `EC2_USER`)
- [ ] `.github/workflows/deploy-backend.yml` 확인
- [ ] 테스트 커밋으로 자동 배포 확인

### Amplify 설정

- [ ] Amplify 앱 생성 및 GitHub 연결
- [ ] 환경 변수 설정 (`VITE_GRAPHQL_URI`)
- [ ] 빌드 및 배포 테스트
- [ ] 프론트엔드 - 백엔드 연결 확인

### 프로덕션 준비

- [ ] SSL/TLS 인증서 설정 (HTTPS)
- [ ] 도메인 연결 (선택 사항)
- [ ] CORS 설정 검증
- [ ] 로그 모니터링 설정
- [ ] 백업 전략 수립

---

## 11. 유용한 명령어 모음

```bash
# 서비스 관리
sudo systemctl start foodie-backend
sudo systemctl stop foodie-backend
sudo systemctl restart foodie-backend
sudo systemctl status foodie-backend

# 로그 확인
sudo journalctl -u foodie-backend -f         # 실시간 로그
sudo journalctl -u foodie-backend -n 100     # 최근 100줄
sudo journalctl -u foodie-backend --since "1 hour ago"

# 배포
cd /opt/foodie/backend && ./deploy.sh

# 데이터베이스
sqlite3 /opt/foodie/data/foodie.db ".tables"
sqlite3 /opt/foodie/data/foodie.db "SELECT * FROM users;"

# Redis
redis-cli
> KEYS *
> GET session:xxxxx

# 디스크 사용량
df -h
du -sh /opt/foodie/*

# 프로세스 확인
ps aux | grep foodie_server
```

---

## 12. 참고 자료

- [AWS Amplify 문서](https://docs.aws.amazon.com/amplify/)
- [AWS EC2 문서](https://docs.aws.amazon.com/ec2/)
- [AWS ElastiCache 문서](https://docs.aws.amazon.com/elasticache/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Rust 배포 가이드](https://www.rust-lang.org/tools/install)

---

**문의사항이나 문제가 있으면 이슈를 등록해주세요!** 🚀
