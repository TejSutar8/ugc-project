# Component Diagram - UGC Image Generator

## System Component Diagram

```mermaid
graph TB
    subgraph ClientLayer["Client Layer (React + Vite)"]
        subgraph Pages["Pages"]
            Home["Home Page"]
            Generator["Generator Page"]
            Result["Result Page"]
            MyGens["MyGenerations Page"]
            Community["Community Page"]
            Plans["Plans Page"]
        end

        subgraph Components["UI Components"]
            Navbar["Navbar"]
            Footer["Footer"]
            UploadZone["UploadZone"]
            ProjectCard["ProjectCard"]
            Hero["Hero"]
            Features["Features"]
            Pricing["Pricing"]
            FAQ["FAQ"]
            CTA["CTA"]
            Buttons["Buttons"]
        end

        subgraph ClientConfig["Client Configuration"]
            AxiosConfig["Axios Instance<br/>(HTTP Client + JWT Interceptor)"]
            Types["TypeScript Types<br/>(User, Project interfaces)"]
            Assets["Assets & Dummy Data"]
        end

        subgraph ClientAuth["Authentication (Client)"]
            ClerkProvider["Clerk Provider"]
            ClerkUserButton["Clerk UserButton"]
            SignInButton["SignIn/SignUp Buttons"]
        end
    end

    subgraph ServerLayer["Server Layer (Express + Node.js)"]
        subgraph APIRoutes["API Routes"]
            ProjectRoutes["/api/project/*<br/>Project Routes"]
            UserRoutes["/api/user/*<br/>User Routes"]
            WebhookRoute["/api/clerk<br/>Webhook Route"]
        end

        subgraph Controllers["Controllers"]
            ProjectCtrl["ProjectController<br/>- createProject()<br/>- createVideo()<br/>- deleteProject()<br/>- getAllPublished()"]
            UserCtrl["UserController<br/>- getUserCredits()<br/>- getAllProjects()<br/>- getProjectById()<br/>- togglePublish()"]
            ClerkCtrl["Clerk Handler<br/>- user.created<br/>- user.updated<br/>- user.deleted<br/>- payment.updated"]
        end

        subgraph Middleware["Middleware"]
            AuthMW["Auth Middleware<br/>(JWT Validation)"]
            MulterMW["Multer Middleware<br/>(File Upload)"]
            CorsMW["CORS Middleware"]
            ClerkMW["Clerk Middleware<br/>(Token Parsing)"]
        end

        subgraph ServerConfig["Server Configuration"]
            PrismaConfig["Prisma Client<br/>(Database ORM)"]
            AIConfig["Google GenAI Client"]
            MulterConfig["Multer Config<br/>(Storage, Limits)"]
            SentryConfig["Sentry Instrument<br/>(Error Tracking)"]
        end
    end

    subgraph DataLayer["Data Layer"]
        PostgreSQL[("PostgreSQL<br/>(Neon Serverless)<br/>- User table<br/>- Project table")]
    end

    subgraph ExternalServices["External Services"]
        ClerkAuth["Clerk<br/>Authentication<br/>& Webhooks"]
        GeminiAI["Google Gemini AI<br/>Image Generation"]
        VeoAI["Google Veo 3.1<br/>Video Generation"]
        CloudinaryCDN["Cloudinary<br/>Media Storage & CDN"]
        SentryService["Sentry<br/>Error Monitoring"]
    end

    %% Client internal connections
    Pages --> Components
    Pages --> ClientConfig
    Pages --> ClientAuth
    Generator --> UploadZone
    MyGens --> ProjectCard
    Community --> ProjectCard
    Home --> Hero
    Home --> Features
    Home --> Pricing
    Home --> FAQ

    %% Client to Server
    AxiosConfig ==>|"REST API<br/>HTTP/HTTPS"| APIRoutes

    %% Route to controller
    ProjectRoutes --> ProjectCtrl
    UserRoutes --> UserCtrl
    WebhookRoute --> ClerkCtrl

    %% Middleware
    ProjectRoutes --> AuthMW
    ProjectRoutes --> MulterMW
    UserRoutes --> AuthMW

    %% Controller to config
    ProjectCtrl --> PrismaConfig
    ProjectCtrl --> AIConfig
    UserCtrl --> PrismaConfig
    ClerkCtrl --> PrismaConfig

    %% Server to external
    PrismaConfig ==>|"TCP/SSL"| PostgreSQL
    AIConfig ==>|"HTTPS API"| GeminiAI
    AIConfig ==>|"HTTPS API"| VeoAI
    ProjectCtrl ==>|"HTTPS API"| CloudinaryCDN
    SentryConfig ==>|"HTTPS"| SentryService
    ClerkMW ==>|"JWT Verify"| ClerkAuth
    ClerkAuth ==>|"Webhook POST"| WebhookRoute
    ClientAuth ==>|"OAuth/JWT"| ClerkAuth
```

## Component Descriptions

### Client Components

| Component | Type | Responsibility |
|---|---|---|
| Home Page | Page | Landing page with marketing sections |
| Generator Page | Page | Image upload form and generation trigger |
| Result Page | Page | Display results with polling mechanism |
| MyGenerations Page | Page | User's project gallery |
| Community Page | Page | Public feed of published projects |
| Plans Page | Page | Credit pricing and purchase info |
| Navbar | UI Component | Navigation, auth buttons, credit display |
| UploadZone | UI Component | Drag-and-drop file upload |
| ProjectCard | UI Component | Project thumbnail with actions |
| Axios Instance | Config | HTTP client with JWT interceptor |
| Clerk Provider | Auth | Authentication context provider |

### Server Components

| Component | Type | Responsibility |
|---|---|---|
| Project Routes | Route | API endpoints for generation operations |
| User Routes | Route | API endpoints for user data queries |
| Webhook Route | Route | Clerk event processing |
| ProjectController | Controller | Image/video generation business logic |
| UserController | Controller | User data and project retrieval |
| Auth Middleware | Middleware | JWT token validation |
| Multer Middleware | Middleware | Multipart file upload handling |
| Prisma Client | Config | Database ORM operations |
| AI Client | Config | Google Gemini/Veo API communication |
| Sentry | Config | Error tracking and monitoring |

### External Services

| Service | Protocol | Purpose |
|---|---|---|
| Clerk | OAuth/JWT/Webhooks | User authentication and management |
| Google Gemini AI | HTTPS REST | AI image generation |
| Google Veo 3.1 | HTTPS REST | AI video generation |
| Cloudinary | HTTPS REST | Media file storage and CDN |
| Sentry | HTTPS | Error monitoring and alerting |
| PostgreSQL (Neon) | TCP/SSL | Relational database |
