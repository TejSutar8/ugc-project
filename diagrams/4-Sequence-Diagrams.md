# Sequence Diagrams - UGC Image Generator

## 1. Image Generation Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Server
    participant Auth as Clerk Auth
    participant DB as PostgreSQL (Prisma)
    participant Cloud as Cloudinary
    participant AI as Google Gemini AI

    User->>Frontend: Fill form + Upload 2 images
    User->>Frontend: Click "Generate Image"
    Frontend->>Frontend: Create FormData (images + metadata)
    Frontend->>API: POST /api/project/create (multipart/form-data)

    API->>Auth: Validate JWT Token
    Auth-->>API: userId confirmed

    API->>DB: findUnique(userId) - Get user
    DB-->>API: User {credits: 20}

    alt credits < 5
        API-->>Frontend: 400 "Insufficient credits"
        Frontend-->>User: Toast error message
    end

    API->>DB: update(userId) - Deduct 5 credits
    DB-->>API: User {credits: 15}

    par Upload images to Cloudinary
        API->>Cloud: upload(image1)
        Cloud-->>API: {secure_url: "url1"}
        API->>Cloud: upload(image2)
        Cloud-->>API: {secure_url: "url2"}
    end

    API->>DB: create(project) - isGenerating: true
    DB-->>API: Project {id: "uuid"}

    API->>AI: generateContent(image1, image2, prompt)
    Note over AI: Processing takes 20-45 seconds

    alt AI Generation Success
        AI-->>API: Response with base64 image data
        API->>API: Extract image buffer from response
        API->>Cloud: upload(base64Image)
        Cloud-->>API: {secure_url: "generated-url"}
        API->>DB: update(project) - generatedImage, isGenerating: false
        API-->>Frontend: 201 {projectId: "uuid", message: "Success"}
    else AI Generation Failure
        AI-->>API: Error response
        API->>DB: update(project) - error message, isGenerating: false
        API->>DB: update(userId) - Refund 5 credits
        API-->>Frontend: 500 {message: "Generation failed"}
    end

    Frontend->>Frontend: navigate(/result/projectId)
```

## 2. Result Page Polling Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Server
    participant Auth as Clerk Auth
    participant DB as PostgreSQL (Prisma)

    User->>Frontend: Navigate to /result/:projectId
    Frontend->>API: GET /api/user/projects/:projectId
    API->>Auth: Validate JWT Token
    Auth-->>API: userId confirmed
    API->>DB: findUnique(projectId, userId)
    DB-->>API: Project {isGenerating: true}
    API-->>Frontend: {project: {..., isGenerating: true}}
    Frontend-->>User: Show loading spinner

    loop Every 5 seconds while isGenerating
        Frontend->>API: GET /api/user/projects/:projectId
        API->>Auth: Validate JWT
        Auth-->>API: OK
        API->>DB: findUnique(projectId)
        DB-->>API: Project data
        API-->>Frontend: {project: {...}}

        alt isGenerating: false AND generatedImage exists
            Frontend-->>User: Display generated image
            Frontend->>Frontend: Clear polling interval
        else isGenerating: false AND error exists
            Frontend-->>User: Show error + "Credits refunded"
            Frontend->>Frontend: Clear polling interval
        else isGenerating: true
            Frontend-->>User: Continue showing spinner
        end
    end
```

## 3. User Authentication Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant Clerk as Clerk Auth
    participant API as Express Server
    participant DB as PostgreSQL (Prisma)

    User->>Frontend: Click "Sign Up"
    Frontend->>Clerk: Open Clerk sign-up modal
    User->>Clerk: Enter credentials
    Clerk->>Clerk: Create user account
    Clerk-->>Frontend: JWT token + user session

    Note over Clerk,API: Webhook (async)
    Clerk->>API: POST /api/clerk (user.created event)
    API->>API: Verify webhook signature
    API->>DB: create(User) - 20 credits
    DB-->>API: User created
    API-->>Clerk: 200 OK

    Frontend->>Frontend: Store session
    Frontend-->>User: Redirect to dashboard
```

## 4. Video Generation Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Server
    participant Auth as Clerk Auth
    participant DB as PostgreSQL (Prisma)
    participant Cloud as Cloudinary
    participant VeoAI as Google Veo 3.1

    User->>Frontend: Click "Generate Video"
    Frontend->>API: POST /api/project/video {projectId}
    API->>Auth: Validate JWT Token
    Auth-->>API: userId confirmed

    API->>DB: findUnique(projectId)
    DB-->>API: Project {generatedImage: "url"}

    API->>DB: findUnique(userId) - Check credits
    DB-->>API: User {credits: 15}

    alt credits < 10
        API-->>Frontend: 400 "Insufficient credits"
    end

    API->>DB: update(userId) - Deduct 10 credits
    API->>DB: update(project) - isGenerating: true

    API->>Cloud: Fetch generated image
    Cloud-->>API: Image data

    API->>VeoAI: generateVideos(image, prompt)
    VeoAI-->>API: Operation {name: "operation-id"}

    loop Poll every 10 seconds
        API->>VeoAI: getOperation(operation-id)
        VeoAI-->>API: Operation status
        alt Operation complete
            VeoAI-->>API: Video data
        end
    end

    API->>API: Download video to temp file
    API->>Cloud: upload(videoFile, {resource_type: "video"})
    Cloud-->>API: {secure_url: "video-url"}
    API->>API: Delete temp file

    API->>DB: update(project) - generatedVideo, isGenerating: false
    API-->>Frontend: 200 {videoUrl: "video-url"}
    Frontend-->>User: Display video player
```

## 5. Publish/Unpublish Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express Server
    participant Auth as Clerk Auth
    participant DB as PostgreSQL (Prisma)

    User->>Frontend: Click "Publish to Community"
    Frontend->>API: POST /api/user/publish/:projectId
    API->>Auth: Validate JWT Token
    Auth-->>API: userId confirmed

    API->>DB: findUnique(projectId, userId)
    DB-->>API: Project {isPublished: false}

    alt No generated content
        API-->>Frontend: 404 "No generated content to publish"
    end

    API->>DB: update(project) - isPublished: true (toggle)
    DB-->>API: Project {isPublished: true}
    API-->>Frontend: 200 {isPublished: true}
    Frontend-->>User: Toast "Published to Community!"
```
