# Deployment Diagram - UGC Image Generator

## Deployment Diagram

```mermaid
graph TB
    subgraph UserDevice["User Device (Browser)"]
        Browser["Web Browser<br/>(Chrome, Firefox, Safari)"]
        subgraph ReactApp["React SPA"]
            ReactBundle["React 19 + Vite Build<br/>- HTML/CSS/JS Bundle<br/>- TailwindCSS Styles<br/>- Framer Motion Animations"]
            ClerkJS["Clerk.js SDK<br/>- Auth UI Components<br/>- Session Management"]
        end
    end

    subgraph VercelCloud["Frontend Host (Vercel)"]
        CDN["Vercel Edge Network / CDN"]
        StaticFiles["Static File Server<br/>- index.html<br/>- JS bundles<br/>- CSS files<br/>- Images/Assets"]
        EnvVarsClient["Environment Variables<br/>- VITE_BASEURL<br/>- VITE_CLERK_PUBLISHABLE_KEY"]
    end

    subgraph BackendHost["Backend Host (Railway / Render)"]
        subgraph NodeProcess["Node.js Process"]
            ExpressApp["Express 5 Server<br/>- CORS Middleware<br/>- Clerk Middleware<br/>- JSON Parser<br/>- Sentry Handler"]
            APIEndpoints["API Endpoints<br/>- /api/project/*<br/>- /api/user/*<br/>- /api/clerk"]
            FileSystem["Temporary File Storage<br/>- /uploads/ (images)<br/>- /videos/ (temp videos)"]
        end
        EnvVarsServer["Environment Variables<br/>- DATABASE_URL<br/>- CLERK_SECRET_KEY<br/>- GOOGLE_CLOUD_API_KEY<br/>- CLOUDINARY_URL<br/>- SENTRY_DSN<br/>- PORT"]
    end

    subgraph NeonCloud["Database Host (Neon)"]
        PGServer["PostgreSQL Server<br/>(Serverless)"]
        subgraph Database["Database: ugc_db"]
            UserTable["User Table<br/>- id, email, name<br/>- image, credits<br/>- timestamps"]
            ProjectTable["Project Table<br/>- id, userId, name<br/>- images, generated content<br/>- status flags<br/>- timestamps"]
        end
    end

    subgraph ClerkCloud["Clerk Cloud"]
        ClerkDashboard["Clerk Dashboard<br/>- User Management<br/>- Application Settings<br/>- Webhook Configuration"]
        ClerkAPI["Clerk API<br/>- JWT Issuance<br/>- Token Verification<br/>- User CRUD"]
        WebhookService["Webhook Service<br/>- user.created<br/>- user.updated<br/>- user.deleted<br/>- payment events"]
    end

    subgraph GoogleCloud["Google Cloud"]
        GeminiAPI["Gemini 3 Pro<br/>Image Preview API<br/>- Image generation<br/>- Multi-modal input"]
        VeoAPI["Veo 3.1 API<br/>- Video generation<br/>- Async operations"]
    end

    subgraph CloudinaryCloud["Cloudinary"]
        MediaStorage["Media Storage<br/>- Uploaded images<br/>- Generated images<br/>- Generated videos"]
        CDNCloudinary["Cloudinary CDN<br/>- Image optimization<br/>- Format conversion<br/>- Global delivery"]
    end

    subgraph SentryCloud["Sentry"]
        ErrorTracking["Error Tracking<br/>- Exception capture<br/>- Performance monitoring<br/>- Alert notifications"]
    end

    %% User to Frontend
    Browser -->|"HTTPS"| CDN
    CDN --> StaticFiles
    ReactBundle --> ClerkJS

    %% Frontend to Backend
    ReactApp ==>|"HTTPS REST API<br/>Bearer JWT Token"| APIEndpoints

    %% Frontend to External
    ClerkJS -.->|"HTTPS"| ClerkAPI

    %% Backend to Database
    ExpressApp ==>|"TCP/SSL<br/>Prisma ORM"| PGServer

    %% Backend to External Services
    ExpressApp -.->|"HTTPS API"| GeminiAPI
    ExpressApp -.->|"HTTPS API"| VeoAPI
    ExpressApp -.->|"HTTPS API"| MediaStorage
    ExpressApp -.->|"HTTPS"| ErrorTracking

    %% Clerk Webhooks
    WebhookService ==>|"HTTPS POST<br/>Signed Payload"| APIEndpoints

    %% Cloudinary CDN to Browser
    CDNCloudinary -.->|"HTTPS<br/>Image/Video URLs"| Browser
```

## Deployment Nodes Summary

| Node | Platform | Technology | Purpose |
|---|---|---|---|
| User Device | Browser | Chrome/Firefox/Safari | Client-side rendering |
| Frontend Host | Vercel | Static file server + CDN | Serves React SPA |
| Backend Host | Railway/Render | Node.js 18+ runtime | Express API server |
| Database | Neon | PostgreSQL (Serverless) | Data persistence |
| Clerk Cloud | Clerk SaaS | Auth platform | User management & JWT |
| Google Cloud | Google AI | Gemini 3 + Veo 3.1 | AI generation |
| Cloudinary | Cloudinary SaaS | Media platform | File storage & CDN |
| Sentry | Sentry SaaS | Monitoring platform | Error tracking |

## Communication Protocols

| From | To | Protocol | Data Format |
|---|---|---|---|
| Browser | Vercel CDN | HTTPS | HTML/CSS/JS |
| React App | Express API | HTTPS REST | JSON, multipart/form-data |
| Express | PostgreSQL | TCP/SSL | SQL (via Prisma) |
| Express | Gemini AI | HTTPS | JSON (base64 images) |
| Express | Cloudinary | HTTPS | Binary/base64 uploads |
| Clerk | Express Webhook | HTTPS POST | Signed JSON payload |
| Cloudinary CDN | Browser | HTTPS | Image/Video binary |

## Deployment Configuration

### Frontend (Vercel)
```
Build Command: npm run build
Output Directory: dist/
Node Version: 18.x
Environment Variables:
  - VITE_BASEURL = https://api.your-domain.com
  - VITE_CLERK_PUBLISHABLE_KEY = pk_live_xxx
```

### Backend (Railway/Render)
```
Build Command: npm install && npx prisma generate && npm run build
Start Command: npx prisma migrate deploy && npm start
Node Version: 18.x
Port: 5000
Environment Variables:
  - DATABASE_URL
  - CLERK_SECRET_KEY
  - CLERK_PUBLISHABLE_KEY
  - CLERK_WEBHOOK_SIGNING_SECRET
  - GOOGLE_CLOUD_API_KEY
  - CLOUDINARY_URL
  - SENTRY_DSN
```

### Database (Neon)
```
Engine: PostgreSQL 16
Mode: Serverless
SSL: Required
Connection Pooling: Enabled
Auto-suspend: After 5 minutes idle
```
