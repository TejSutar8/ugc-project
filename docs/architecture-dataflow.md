# UGC Image & Video Generator - Data Flow Architecture

This diagram shows the detailed data flow for image and video generation.

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant F as React Frontend
    participant A as Express API
    participant Auth as Clerk Auth
    participant DB as PostgreSQL
    participant AI as Google Gemini
    participant VEO as Google Veo
    participant CDN as Cloudinary

    Note over U,CDN: Image Generation Flow
    
    U->>F: Upload 2 images + prompt
    F->>F: Validate files (max 5MB each)
    
    F->>A: POST /api/project/create<br/>(multipart/form-data)
    A->>Auth: Verify JWT token
    Auth-->>A: User ID validated
    
    A->>DB: Check user credits >= 5
    DB-->>A: Credits available
    
    A->>DB: Deduct 5 credits
    A->>DB: Create project (isGenerating=true)
    DB-->>A: Project ID
    
    A-->>F: 201 Created {projectId}
    F->>F: Navigate to /result/:projectId
    
    Note over F,DB: Async Background Generation
    
    F->>A: GET /api/user/projects/:id<br/>(Poll every 5s)
    A->>DB: Fetch project
    DB-->>A: {isGenerating: true, generatedImage: null}
    A-->>F: Project status
    
    par Background Image Generation
        A->>A: Load images to base64
        A->>AI: generateContent()<br/>(2 images + prompt)
        AI->>AI: AI model processing<br/>(20-45 seconds)
        AI-->>A: Generated image (base64)
        A->>CDN: Upload image
        CDN-->>A: Secure URL
        A->>DB: Update project<br/>(generatedImage=url, isGenerating=false)
    end
    
    Note over F,DB: Polling Continues
    
    F->>A: GET /api/user/projects/:id
    A->>DB: Fetch project
    DB-->>A: {isGenerating: false, generatedImage: url}
    A-->>F: ✅ Image ready!
    F->>F: Display image + success toast
    
    Note over U,CDN: Video Generation Flow
    
    U->>F: Click "Generate Video"
    F->>A: POST /api/project/video<br/>{projectId}
    
    A->>Auth: Verify JWT token
    Auth-->>A: User ID validated
    
    A->>DB: Check credits >= 10
    DB-->>A: Credits available
    
    A->>DB: Deduct 10 credits
    A->>DB: Update project (isGenerating=true)
    
    A->>VEO: generateContent()<br/>(prompt + config)
    VEO->>VEO: Video generation<br/>(60-90 seconds)
    VEO-->>A: Video file path
    
    A->>VEO: Download video file
    VEO-->>A: Video buffer (MP4)
    
    A->>CDN: Upload video
    CDN-->>A: Secure URL
    
    A->>DB: Update project<br/>(generatedVideo=url, isGenerating=false)
    A-->>F: {videoUrl}
    
    F->>F: Display video + download button
    F->>F: Show success toast

    Note over U,CDN: Download & Publish Flow
    
    U->>F: Click "Download Image"
    F->>CDN: Request image file
    CDN-->>F: Image file
    F->>U: Browser download
    
    U->>F: Toggle "Publish to Community"
    F->>A: POST /api/project/publish<br/>{projectId, isPublished}
    A->>DB: Update project.isPublished
    DB-->>A: Updated
    A-->>F: Success
    F->>F: Update UI state
```

## Key Data Flows

### 1. Image Generation (20-45 seconds)
- **Input**: 2 images (person + product) + text prompt
- **Process**: Gemini 3 Pro combines images realistically
- **Output**: Professional ecommerce-quality image
- **Cost**: 5 credits

### 2. Video Generation (60-90 seconds)
- **Input**: Text prompt describing desired video
- **Process**: Google Veo 3.1 creates 720p MP4 video
- **Output**: High-quality video (aspect ratio: 9:16, 16:9, or 1:1)
- **Cost**: 10 credits

### 3. Polling Mechanism
- **Initial**: Checks at 2s, 5s, 8s after navigation
- **Continuous**: Every 5 seconds while `isGenerating=true`
- **Stop Condition**: When `isGenerating=false` or error occurs

### 4. Credit System
- **Initial**: 20 credits on signup
- **Deduction**: Upfront before generation
- **Refund**: If generation fails
- **Tracking**: Real-time updates in user profile

### 5. Error Handling
- Retry failed API calls (3 attempts for 404)
- Refund credits on generation failure
- Display error messages via toast notifications
- Log errors to Sentry for monitoring

## File Storage Structure

```
Cloudinary Storage
├── images/
│   └── {unique-id}.png (generated images)
└── videos/
    └── {unique-id}.mp4 (generated videos)
```

## Database Schema

```
User
- id: UUID (PK)
- clerkId: String (unique)
- email: String
- credits: Int (default: 20)
- createdAt: DateTime
- updatedAt: DateTime
- projects: Project[]

Project
- id: UUID (PK)
- userId: UUID (FK)
- userImage: String (input image 1)
- productImage: String (input image 2)
- userPrompt: String
- generatedImage: String? (Cloudinary URL)
- generatedVideo: String? (Cloudinary URL)
- isPublished: Boolean (default: false)
- isGenerating: Boolean (default: true)
- error: String? (generation error message)
- createdAt: DateTime
- updatedAt: DateTime
- user: User
```
