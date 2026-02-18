# Deployment Diagram

## UGC Image Generator - Infrastructure & Deployment Architecture

Deployment diagrams show the physical architecture of the system, including hardware, software, and network topology.

## 1. Production Deployment Architecture

```mermaid
graph TB
    subgraph "User Devices"
        Desktop[Desktop Browser<br/>Chrome/Firefox/Safari]
        Mobile[Mobile Browser<br/>iOS/Android]
        Tablet[Tablet Browser]
    end
    
    subgraph "CDN Layer"
        VercelCDN[Vercel Edge Network<br/>Global CDN<br/>300+ Locations]
        CloudinaryCDN[Cloudinary CDN<br/>Media Delivery<br/>Automatic Optimization]
    end
    
    subgraph "Frontend Hosting - Vercel"
        direction TB
        VercelNode1[Edge Node 1<br/>React App]
        VercelNode2[Edge Node 2<br/>React App]
        VercelNode3[Edge Node 3<br/>React App]
        VercelLB[Load Balancer]
        
        VercelLB --> VercelNode1
        VercelLB --> VercelNode2
        VercelLB --> VercelNode3
    end
    
    subgraph "Backend Hosting - Railway"
        direction TB
        RailwayContainer[Docker Container<br/>Node.js 22<br/>Express Server<br/>Port 5000]
        RailwayEnv[Environment Variables<br/>Secrets Manager]
        RailwayLogs[Railway Logs<br/>stdout/stderr]
        
        RailwayEnv --> RailwayContainer
        RailwayContainer --> RailwayLogs
    end
    
    subgraph "Database - Neon PostgreSQL"
        direction TB
        NeonPrimary[Primary Instance<br/>PostgreSQL 16<br/>Auto-scaling]
        NeonReplica1[Read Replica 1]
        NeonReplica2[Read Replica 2]
        NeonBackup[Automated Backups<br/>Point-in-time Recovery]
        
        NeonPrimary -.Replicate.-> NeonReplica1
        NeonPrimary -.Replicate.-> NeonReplica2
        NeonPrimary -.Backup.-> NeonBackup
    end
    
    subgraph "External Services - Cloud"
        direction TB
        ClerkServers[Clerk Auth Servers<br/>JWT Token Service<br/>User Management]
        GoogleAI[Google Cloud AI<br/>Gemini 3 Pro<br/>Veo 3.1]
        CloudinaryStorage[Cloudinary Storage<br/>Image/Video Processing<br/>Transformation API]
        SentryMonitoring[Sentry Cloud<br/>Error Tracking<br/>Performance Monitoring]
    end
    
    Desktop --> VercelCDN
    Mobile --> VercelCDN
    Tablet --> VercelCDN
    
    VercelCDN --> VercelLB
    
    VercelNode1 -.API Calls.-> RailwayContainer
    VercelNode2 -.API Calls.-> RailwayContainer
    VercelNode3 -.API Calls.-> RailwayContainer
    
    VercelNode1 -.Load Media.-> CloudinaryCDN
    VercelNode2 -.Load Media.-> CloudinaryCDN
    VercelNode3 -.Load Media.-> CloudinaryCDN
    
    Desktop -.Auth UI.-> ClerkServers
    Mobile -.Auth UI.-> ClerkServers
    
    RailwayContainer -->|SQL Queries| NeonPrimary
    RailwayContainer -->|Verify Token| ClerkServers
    RailwayContainer -->|Generate Image| GoogleAI
    RailwayContainer -->|Upload Files| CloudinaryStorage
    RailwayContainer -->|Log Errors| SentryMonitoring
    
    CloudinaryStorage --> CloudinaryCDN
    
    style Desktop fill:#61dafb
    style VercelCDN fill:#000
    style RailwayContainer fill:#7733ff
    style NeonPrimary fill:#00e699
    style ClerkServers fill:#6c47ff
    style GoogleAI fill:#4285f4
    style CloudinaryStorage fill:#3448c5
    style SentryMonitoring fill:#362d59
```

---

## 2. Detailed Node Specifications

### Frontend Node - Vercel Edge

| Property | Value |
|----------|-------|
| **Platform** | Vercel Serverless |
| **Runtime** | Node.js 22.x |
| **Framework** | React 19 + Vite 6 |
| **Build Tool** | Vite (ESBuild) |
| **Output** | Static HTML/JS/CSS |
| **CDN** | Vercel Edge Network (300+ locations) |
| **Region** | Global (auto) |
| **Auto-scaling** | Yes (unlimited) |
| **SSL/TLS** | Automatic (Let's Encrypt) |
| **Environment Variables** | `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY` |
| **Deployment** | Git push to main branch |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install` |
| **Output Directory** | `dist/` |

### Backend Node - Railway Container

| Property | Value |
|----------|-------|
| **Platform** | Railway (Docker-based) |
| **Runtime** | Node.js 22.x LTS |
| **Framework** | Express 5.0.1 |
| **Port** | 5000 (internal), 443 (external) |
| **Memory** | 512 MB (auto-scale to 2 GB) |
| **CPU** | 1 vCPU (burstable) |
| **Region** | US East (configurable) |
| **Auto-scaling** | Horizontal (1-10 instances) |
| **Health Check** | `/health` endpoint (every 30s) |
| **Restart Policy** | On failure (exponential backoff) |
| **SSL/TLS** | Automatic (Railway proxy) |
| **Environment Variables** | 12 secrets (DB, Clerk, AI, Storage, Monitoring) |
| **Deployment** | Git push or Railway CLI |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |

### Database Node - Neon PostgreSQL

| Property | Value |
|----------|-------|
| **Database** | PostgreSQL 16 |
| **Hosting** | Neon Serverless |
| **Region** | US East 1 |
| **Compute** | Auto-scaling (0.25 - 4 vCPU) |
| **Storage** | Auto-scaling (0 GB - 200 GB) |
| **Connection Pooling** | Built-in (PgBouncer) |
| **Max Connections** | 100 simultaneous |
| **Replication** | 2 read replicas (async) |
| **Backups** | Daily automated (7-day retention) |
| **Point-in-time Recovery** | Yes (last 7 days) |
| **SSL** | Required (certificate verification) |
| **Connection String** | `postgresql://user:pass@host/db?sslmode=require` |

---

## 3. Network Topology & Communication Protocols

```mermaid
graph LR
    subgraph "Internet"
        User[End User<br/>HTTPS]
    end
    
    subgraph "DNS & CDN"
        DNS[DNS<br/>Vercel DNS]
        EdgeNode[Vercel Edge<br/>TLS 1.3]
    end
    
    subgraph "Application Layer"
        Frontend[React App<br/>HTTPS/2]
        Backend[Express API<br/>HTTPS/2]
    end
    
    subgraph "Data & Services"
        Database[(PostgreSQL<br/>TLS 1.3)]
        Clerk[Clerk Auth<br/>HTTPS]
        AI[Google AI<br/>HTTPS]
        Storage[Cloudinary<br/>HTTPS]
    end
    
    User -->|HTTPS Request| DNS
    DNS -->|Route| EdgeNode
    EdgeNode -->|Serve| Frontend
    Frontend -->|REST API<br/>HTTPS| Backend
    
    Backend -->|SQL<br/>TLS| Database
    Backend -->|REST<br/>HTTPS| Clerk
    Backend -->|REST<br/>HTTPS| AI
    Backend -->|REST<br/>HTTPS| Storage
    
    Frontend -.WebSocket?.-> Backend
    
    style User fill:#61dafb
    style Frontend fill:#61dafb
    style Backend fill:#68a063
    style Database fill:#336791
```

### Protocol Details

| Communication Path | Protocol | Port | Encryption | Authentication |
|-------------------|----------|------|------------|----------------|
| User → Vercel CDN | HTTPS/2 | 443 | TLS 1.3 | None |
| Vercel → Railway | HTTPS/2 | 443 | TLS 1.3 | None |
| Railway → Neon | PostgreSQL | 5432 | TLS 1.3 | Password + SSL |
| Railway → Clerk | HTTPS | 443 | TLS 1.3 | API Key |
| Railway → Google AI | HTTPS | 443 | TLS 1.3 | API Key |
| Railway → Cloudinary | HTTPS | 443 | TLS 1.3 | API Secret |
| Railway → Sentry | HTTPS | 443 | TLS 1.3 | DSN Token |
| Frontend → Clerk | HTTPS | 443 | TLS 1.3 | Publishable Key |

---

## 4. Deployment Pipeline & CI/CD

```mermaid
graph LR
    Developer[Developer]
    GitHub[GitHub Repository]
    VercelCI[Vercel CI/CD]
    RailwayCI[Railway CI/CD]
    ProdFE[Production Frontend]
    ProdBE[Production Backend]
    
    subgraph "Development Workflow"
        LocalDev[Local Development<br/>npm run dev]
        GitCommit[Git Commit]
        GitPush[Git Push]
    end
    
    subgraph "Build & Test"
        VercelBuild[Vercel Build<br/>npm run build]
        RailwayBuild[Railway Build<br/>npm run build]
        Tests[Run Tests<br/>npm test]
    end
    
    subgraph "Deployment"
        VercelDeploy[Deploy to Vercel]
        RailwayDeploy[Deploy to Railway]
    end
    
    Developer --> LocalDev
    LocalDev --> GitCommit
    GitCommit --> GitPush
    GitPush --> GitHub
    
    GitHub -->|Webhook| VercelCI
    GitHub -->|Webhook| RailwayCI
    
    VercelCI --> VercelBuild
    RailwayCI --> RailwayBuild
    
    VercelBuild --> Tests
    RailwayBuild --> Tests
    
    Tests -->|Pass| VercelDeploy
    Tests -->|Pass| RailwayDeploy
    
    VercelDeploy --> ProdFE
    RailwayDeploy --> ProdBE
    
    style Developer fill:#61dafb
    style GitHub fill:#000
    style ProdFE fill:#000
    style ProdBE fill:#7733ff
```

### CI/CD Configuration

**Vercel (Frontend)**
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_CLERK_PUBLISHABLE_KEY": "@clerk-key"
  },
  "regions": ["all"],
  "functions": {}
}
```

**Railway (Backend)**
```yaml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"

[env]
NODE_ENV = "production"
PORT = "5000"
```

---

## 5. Environment Configuration

### Environment Variables (Backend)

```bash
# Database
DATABASE_URL=postgresql://user:pass@neon.tech:5432/ugc_db?sslmode=require

# Authentication
CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# AI Services
GEMINI_API_KEY=AIzaSyxxx
VEO_API_KEY=AIzaSyxxx

# Storage
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ugc-generator.vercel.app
```

### Environment Variables (Frontend)

```bash
# API
VITE_API_URL=https://ugc-api.railway.app

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 6. Scalability & Load Balancing

```mermaid
graph TB
    subgraph "Load Distribution"
        LB[Load Balancer<br/>Railway Auto-scale]
    end
    
    subgraph "Backend Instances"
        BE1[Instance 1<br/>512 MB]
        BE2[Instance 2<br/>512 MB]
        BE3[Instance 3<br/>512 MB]
    end
    
    subgraph "Database Connection Pool"
        Pool[PgBouncer Pool<br/>100 connections]
    end
    
    subgraph "Database"
        Primary[(Primary DB<br/>Write)]
        Replica1[(Replica 1<br/>Read)]
        Replica2[(Replica 2<br/>Read)]
    end
    
    LB --> BE1
    LB --> BE2
    LB --> BE3
    
    BE1 --> Pool
    BE2 --> Pool
    BE3 --> Pool
    
    Pool -->|Write| Primary
    Pool -->|Read| Replica1
    Pool -->|Read| Replica2
    
    Primary -.Replicate.-> Replica1
    Primary -.Replicate.-> Replica2
    
    style LB fill:#7733ff
    style Primary fill:#00e699
```

### Scaling Metrics

| Component | Min | Max | Trigger | Strategy |
|-----------|-----|-----|---------|----------|
| **Frontend** | 1 | ∞ | Request traffic | Auto (Vercel) |
| **Backend** | 1 | 10 | CPU > 80% or Memory > 80% | Horizontal |
| **Database Compute** | 0.25 vCPU | 4 vCPU | Query load | Auto (Neon) |
| **Database Storage** | 0 GB | 200 GB | Data growth | Auto (Neon) |
| **Connection Pool** | 10 | 100 | Active connections | Dynamic |

---

## 7. Monitoring & Logging Architecture

```mermaid
graph TB
    subgraph "Application"
        Frontend[React App]
        Backend[Express API]
    end
    
    subgraph "Monitoring Tools"
        Sentry[Sentry<br/>Error Tracking]
        RailwayLogs[Railway Logs<br/>Application Logs]
        NeonMetrics[Neon Dashboard<br/>DB Metrics]
        VercelAnalytics[Vercel Analytics<br/>Web Vitals]
    end
    
    subgraph "Alerts"
        Email[Email Alerts]
        Slack[Slack Notifications]
    end
    
    Frontend -->|Errors| Sentry
    Frontend -->|Metrics| VercelAnalytics
    
    Backend -->|Errors| Sentry
    Backend -->|Logs| RailwayLogs
    Backend -->|DB Queries| NeonMetrics
    
    Sentry -->|Critical Errors| Email
    RailwayLogs -->|Deployment| Slack
    NeonMetrics -->|High Load| Email
    
    style Sentry fill:#362d59
    style RailwayLogs fill:#7733ff
    style NeonMetrics fill:#00e699
    style VercelAnalytics fill:#000
```

### Monitoring Endpoints

| Metric | Source | Frequency | Threshold |
|--------|--------|-----------|-----------|
| **Error Rate** | Sentry | Real-time | > 1% |
| **Response Time** | Railway | 1 min | > 2s avg |
| **CPU Usage** | Railway | 1 min | > 80% |
| **Memory Usage** | Railway | 1 min | > 80% |
| **DB Connections** | Neon | 1 min | > 80 |
| **DB Query Time** | Neon | Real-time | > 1s |
| **Web Vitals (LCP)** | Vercel | Page load | > 2.5s |
| **Web Vitals (FID)** | Vercel | Interaction | > 100ms |

---

## 8. Backup & Disaster Recovery

```mermaid
graph TB
    subgraph "Production Data"
        PrimaryDB[(Primary Database)]
    end
    
    subgraph "Replication"
        Replica1[(Replica 1<br/>Real-time)]
        Replica2[(Replica 2<br/>Real-time)]
    end
    
    subgraph "Backup Storage"
        DailyBackup[Daily Snapshots<br/>7-day retention]
        PITRBackup[Point-in-time Recovery<br/>7-day retention]
    end
    
    subgraph "Recovery Scenarios"
        Failover[Automatic Failover<br/>< 1 minute]
        Restore[Manual Restore<br/>< 5 minutes]
    end
    
    PrimaryDB -.Async Replication.-> Replica1
    PrimaryDB -.Async Replication.-> Replica2
    PrimaryDB -.Daily 2 AM UTC.-> DailyBackup
    PrimaryDB -.Continuous WAL.-> PITRBackup
    
    PrimaryDB -.Failure.-> Failover
    Failover --> Replica1
    
    DailyBackup --> Restore
    PITRBackup --> Restore
    
    style PrimaryDB fill:#00e699
    style Failover fill:#ff6b6b
    style Restore fill:#4ecdc4
```

### Recovery Procedures

| Scenario | RTO (Recovery Time) | RPO (Data Loss) | Procedure |
|----------|---------------------|-----------------|-----------|
| **Primary DB Failure** | < 1 minute | 0 seconds | Auto-failover to replica |
| **Data Corruption** | < 5 minutes | < 1 hour | Restore from PITR |
| **Accidental Deletion** | < 10 minutes | < 24 hours | Restore from daily backup |
| **Region Outage** | < 30 minutes | 0 seconds | Failover to different region |
| **Complete Disaster** | < 1 hour | < 24 hours | Full restore from backups |

---

## 9. Security Architecture

```mermaid
graph TB
    subgraph "Perimeter Security"
        WAF[Web Application Firewall<br/>Cloudflare/Vercel]
        DDoS[DDoS Protection]
    end
    
    subgraph "Application Security"
        CORS[CORS Policy]
        RateLimit[Rate Limiting]
        Auth[JWT Authentication]
        Validation[Input Validation]
    end
    
    subgraph "Data Security"
        Encryption[TLS 1.3 Encryption]
        Secrets[Secrets Manager]
        DatabaseSSL[Database SSL]
    end
    
    subgraph "Monitoring"
        SecurityLogs[Security Logs]
        Alerts[Security Alerts]
    end
    
    WAF --> CORS
    DDoS --> RateLimit
    
    CORS --> Auth
    RateLimit --> Auth
    Auth --> Validation
    
    Validation --> Encryption
    Encryption --> Secrets
    Secrets --> DatabaseSSL
    
    Auth --> SecurityLogs
    Validation --> SecurityLogs
    SecurityLogs --> Alerts
    
    style WAF fill:#ff6b6b
    style Auth fill:#6c47ff
    style Encryption fill:#4ecdc4
```

### Security Measures

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| **Network** | HTTPS/TLS 1.3 | All communication encrypted |
| **Authentication** | JWT Tokens | Clerk-managed, 1-hour expiry |
| **Authorization** | Middleware | User ID validation per request |
| **Input Validation** | Zod | Schema validation on all inputs |
| **Rate Limiting** | Express | 100 requests/15 min per IP |
| **CORS** | Express CORS | Whitelist frontend domain only |
| **SQL Injection** | Prisma ORM | Parameterized queries only |
| **XSS** | React | Auto-escaping by default |
| **CSRF** | SameSite Cookies | Clerk-managed tokens |
| **Secrets** | Environment Vars | Railway/Vercel encrypted storage |

---

## 10. Cost Optimization Strategy

### Resource Allocation

| Service | Tier | Monthly Cost | Optimization |
|---------|------|--------------|--------------|
| **Vercel** | Hobby | $0 | Free tier sufficient |
| **Railway** | Pro | $5 + usage | Auto-scale down during low traffic |
| **Neon** | Free | $0 | Scale-to-zero, pay for usage |
| **Clerk** | Free | $0 | < 10k MAU |
| **Google AI** | Pay-per-use | ~$10-50 | Cache similar prompts (future) |
| **Cloudinary** | Free | $0 | < 25 GB storage |
| **Sentry** | Developer | $0 | < 5k errors/month |
| **Total** | - | **~$15-55/mo** | Scales with usage |

---

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates valid
- [ ] Health check endpoint tested
- [ ] Error tracking configured

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Monitoring dashboards active
- [ ] Backup jobs scheduled
- [ ] DNS records propagated
- [ ] CDN cache warmed

---

**Diagram Type**: Deployment Diagram  
**Notation**: UML Deployment (Mermaid Graph)  
**Created**: February 18, 2026  
**Version**: 1.0.0
