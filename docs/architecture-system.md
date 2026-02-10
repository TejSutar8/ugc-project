# UGC Image & Video Generator - System Architecture

This diagram shows the overall system architecture and component interactions.

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Vite + TypeScript]
        A1[Pages: Home, Generator, Result]
        A2[Components: Upload, Cards]
    end

    subgraph "API Layer"
        B[Express Server<br/>Node.js + TypeScript]
        B1[Auth Middleware<br/>JWT Validation]
        B2[Project Routes]
        B3[User Routes]
        B4[Multer Upload]
    end

    subgraph "External Services"
        C[Clerk Auth<br/>Authentication]
        D[Google Gemini AI<br/>Image Generation]
        E[Google Veo AI<br/>Video Generation]
        F[Cloudinary<br/>Media Storage]
        G[Sentry<br/>Error Monitoring]
    end

    subgraph "Database Layer"
        H[(PostgreSQL<br/>Neon Serverless)]
        H1[User Table]
        H2[Project Table]
        I[Prisma ORM]
    end

    subgraph "Generated Content"
        J[Generated Images<br/>PNG/JPG]
        K[Generated Videos<br/>MP4 720p]
    end

    A --> A1
    A --> A2
    A1 --> |HTTP/REST| B
    A2 --> |Upload Files| B

    B --> B1
    B --> B2
    B --> B3
    B --> B4

    B1 --> |Verify Token| C
    B2 --> |Generate| D
    B2 --> |Generate| E
    B2 --> |Upload| F
    B --> |Monitor| G

    B --> I
    I --> H
    H --> H1
    H --> H2

    D --> |AI Image| J
    E --> |AI Video| K
    J --> F
    K --> F
    F --> |Secure URLs| A

    style A fill:#61dafb,stroke:#333,stroke-width:2px
    style B fill:#68a063,stroke:#333,stroke-width:2px
    style H fill:#336791,stroke:#333,stroke-width:2px
    style D fill:#4285f4,stroke:#333,stroke-width:2px
    style E fill:#ea4335,stroke:#333,stroke-width:2px
    style F fill:#3448c5,stroke:#333,stroke-width:2px
```

## Component Details

### Frontend (React)
- **Technology**: React 19, TypeScript, Vite, TailwindCSS 4
- **Key Features**: 
  - Image upload with drag & drop
  - Real-time generation status
  - Auto-refresh polling
  - Download & publish functionality

### Backend (Express)
- **Technology**: Node.js, Express 5, TypeScript
- **Key Features**:
  - JWT authentication via Clerk
  - Async image/video generation
  - Credit system (5 per image, 10 per video)
  - File upload handling with Multer

### Database (PostgreSQL + Prisma)
- **Tables**:
  - **User**: clerkId, email, credits, timestamps
  - **Project**: userId, images, prompt, generatedImage, generatedVideo, isPublished, isGenerating

### External Services
- **Clerk**: User authentication & JWT tokens
- **Google Gemini 3 Pro**: AI image generation from 2 input images
- **Google Veo 3.1**: AI video generation from prompts
- **Cloudinary**: Media storage & CDN for images/videos
- **Sentry**: Error tracking & monitoring

## Data Flow Summary
1. User uploads 2 images + prompt through React frontend
2. Backend validates JWT token via Clerk
3. Backend deducts 5 credits and creates project record
4. Background job generates image using Google Gemini AI
5. Generated image uploaded to Cloudinary
6. Frontend polls every 5s until generation completes
7. User can generate video (10 credits) from generated image
8. Video generated using Google Veo AI and uploaded to Cloudinary
