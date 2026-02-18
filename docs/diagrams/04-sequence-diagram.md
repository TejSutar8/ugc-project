# Sequence Diagram

## UGC Image Generator - Interaction Flows

This diagram shows the detailed sequence of interactions between components over time.

## 1. Image Generation Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API
    participant Auth as Auth Middleware
    participant Controller as Project Controller
    participant DB as PostgreSQL
    participant Storage as Cloudinary
    participant AI as Google Gemini
    
    User->>Frontend: Navigate to /generate
    Frontend->>User: Display upload form
    
    User->>Frontend: Upload 2 images + fill form
    Frontend->>Frontend: Validate files (type, size)
    
    User->>Frontend: Click "Generate" (5 credits)
    Frontend->>API: POST /api/project/create<br/>(multipart/form-data)
    
    API->>Auth: Verify JWT token
    Auth->>Auth: Extract userId from token
    Auth-->>API: userId validated
    
    API->>Controller: createProject(req, res)
    
    Controller->>DB: SELECT credits FROM User WHERE id=userId
    DB-->>Controller: credits: 20
    
    alt Insufficient Credits
        Controller->>Frontend: 400 Insufficient credits
        Frontend->>User: Error toast notification
    else Credits Available
        Controller->>DB: UPDATE User SET credits = credits - 5
        DB-->>Controller: Credits deducted (20→15)
        
        Controller->>Storage: Upload image 1
        Storage-->>Controller: URL 1
        Controller->>Storage: Upload image 2
        Storage-->>Controller: URL 2
        
        Controller->>DB: INSERT INTO Project<br/>(isGenerating=true)
        DB-->>Controller: Project created (projectId)
        
        Controller->>Frontend: 201 Created {projectId}
        Frontend->>Frontend: Navigate to /result/:projectId
        Frontend->>User: Show loading state
        
        Note over Frontend,User: Polling starts (every 5s)
        
        par AI Generation (Async)
            Controller->>Controller: Load images to base64
            Controller->>AI: generateContent()<br/>(img1, img2, prompt)
            
            Note over AI: Processing...<br/>20-45 seconds
            
            AI->>AI: Merge images with AI
            AI-->>Controller: Generated image (base64)
            
            Controller->>Storage: Upload generated image
            Storage-->>Controller: Generated URL
            
            Controller->>DB: UPDATE Project<br/>SET generatedImage=url,<br/>isGenerating=false
            DB-->>Controller: Updated
        end
        
        loop Polling Every 5s
            Frontend->>API: GET /api/user/projects/:projectId
            API->>Auth: Verify token
            Auth-->>API: Authorized
            API->>DB: SELECT * FROM Project WHERE id=projectId
            DB-->>API: Project data
            
            alt Still Generating
                API-->>Frontend: {isGenerating: true}
                Frontend->>User: Show spinner + timer
            else Generation Complete
                API-->>Frontend: {isGenerating: false, generatedImage: url}
                Frontend->>Frontend: Stop polling
                Frontend->>User: Display generated image
                Frontend->>User: Success toast
            else Generation Failed
                API-->>Frontend: {error: "message"}
                Frontend->>User: Error message
                Note over Controller,DB: Credits refunded
            end
        end
    end
```

## 2. User Authentication Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant Clerk as Clerk Widget
    participant ClerkAPI as Clerk API
    participant Webhook as Backend Webhook
    participant DB as PostgreSQL
    
    User->>Frontend: Click "Sign Up"
    Frontend->>Clerk: Open authentication modal
    
    User->>Clerk: Enter email + password
    Clerk->>ClerkAPI: Create user account
    ClerkAPI->>ClerkAPI: Validate & create user
    
    ClerkAPI-->>Webhook: POST /api/clerk<br/>event: user.created
    
    Webhook->>Webhook: Verify webhook signature
    Webhook->>DB: INSERT INTO User<br/>(id, email, name, credits=20)
    DB-->>Webhook: User created
    Webhook-->>ClerkAPI: 200 OK
    
    ClerkAPI-->>Clerk: User created + JWT token
    Clerk-->>Frontend: Authentication successful
    Frontend->>Frontend: Store JWT in Clerk session
    Frontend->>Frontend: Redirect to home page
    Frontend->>User: Welcome message
    
    Note over User,DB: Subsequent Requests
    
    User->>Frontend: Navigate to /generate
    Frontend->>Frontend: Get JWT from Clerk session
    Frontend->>Frontend: Attach to Authorization header
    Frontend->>Webhook: API request with Bearer token
    Webhook->>Webhook: Verify JWT signature
    Webhook->>DB: Fetch user data
    DB-->>Webhook: User data
    Webhook-->>Frontend: Response with data
    Frontend->>User: Display page
```

## 3. Download Generated Image Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant DB as PostgreSQL
    participant CDN as Cloudinary CDN
    
    User->>Frontend: Click "Download" button
    Frontend->>Frontend: Get generatedImage URL
    
    Frontend->>CDN: Fetch image file<br/>(HTTP GET)
    CDN-->>Frontend: Image file (binary)
    
    Frontend->>Frontend: Create download link
    Frontend->>Frontend: document.createElement('a')
    Frontend->>Frontend: Set href & download attribute
    Frontend->>Frontend: link.click()
    
    Frontend->>User: Browser download starts
    Frontend->>User: Success toast notification
```

## 4. Publish to Community Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant Auth as Auth Middleware
    participant Controller as User Controller
    participant DB as PostgreSQL
    
    User->>Frontend: Toggle "Publish to Community"
    Frontend->>API: POST /api/user/publish/:projectId
    
    API->>Auth: Verify JWT token
    Auth-->>API: userId validated
    
    API->>Controller: toggleProjectPublic(req, res)
    
    Controller->>DB: SELECT * FROM Project<br/>WHERE id=projectId AND userId=userId
    DB-->>Controller: Project data
    
    alt Project Not Found
        Controller->>Frontend: 404 Project not found
        Frontend->>User: Error toast
    else No Generated Content
        Controller->>Frontend: 404 No content to publish
        Frontend->>User: Error toast
    else Valid Project
        Controller->>DB: UPDATE Project<br/>SET isPublished = NOT isPublished
        DB-->>Controller: Updated
        Controller->>Frontend: 200 {isPublished: true}
        Frontend->>Frontend: Update UI state
        Frontend->>User: "Published!" toast
    end
```

## 5. View Community Feed Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant DB as PostgreSQL
    participant CDN as Cloudinary CDN
    
    User->>Frontend: Navigate to /community
    Frontend->>API: GET /api/project/published
    
    Note over API: No auth required<br/>(public endpoint)
    
    API->>DB: SELECT p.*, u.name, u.image<br/>FROM Project p<br/>JOIN User u ON p.userId = u.id<br/>WHERE p.isPublished = true<br/>ORDER BY p.createdAt DESC
    DB-->>API: Published projects array
    
    API-->>Frontend: 200 {projects: [...]}
    
    loop For Each Project
        Frontend->>CDN: Fetch thumbnail image
        CDN-->>Frontend: Image data
        Frontend->>Frontend: Render project card
    end
    
    Frontend->>User: Display community grid
    
    User->>Frontend: Click on project
    Frontend->>CDN: Fetch full-size image
    CDN-->>Frontend: Full image
    Frontend->>User: Show modal/lightbox
```

## 6. Video Generation Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant Auth as Auth Middleware
    participant Controller as Project Controller
    participant DB as PostgreSQL
    participant AI as Google Veo
    participant Storage as Cloudinary
    
    User->>Frontend: Click "Generate Video"
    Frontend->>API: POST /api/project/video<br/>{projectId}
    
    API->>Auth: Verify JWT token
    Auth-->>API: userId validated
    
    API->>Controller: createVideo(req, res)
    
    Controller->>DB: SELECT * FROM Project<br/>WHERE id=projectId
    DB-->>Controller: Project data
    
    alt No Generated Image
        Controller->>Frontend: 400 No image to convert
        Frontend->>User: Error toast
    else Insufficient Credits (need 10)
        Controller->>Frontend: 400 Insufficient credits
        Frontend->>User: Error toast
    else Valid Request
        Controller->>DB: UPDATE User<br/>SET credits = credits - 10
        DB-->>Controller: Credits deducted
        
        Controller->>DB: UPDATE Project<br/>SET isGenerating = true
        DB-->>Controller: Updated
        
        Controller->>AI: generateContent()<br/>(prompt, config)
        
        Note over AI: Video generation<br/>60-90 seconds
        
        AI-->>Controller: Video file path
        
        Controller->>AI: Download video file
        AI-->>Controller: Video buffer
        
        Controller->>Storage: Upload video
        Storage-->>Controller: Video URL
        
        Controller->>DB: UPDATE Project<br/>SET generatedVideo=url,<br/>isGenerating=false
        DB-->>Controller: Updated
        
        Controller->>Frontend: 200 {videoUrl}
        Frontend->>User: Video ready notification
        Frontend->>User: Show video player
    end
```

## 7. Delete Project Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant Auth as Auth Middleware
    participant Controller as Project Controller
    participant DB as PostgreSQL
    
    User->>Frontend: Click "Delete" button
    Frontend->>Frontend: Show confirmation dialog
    
    User->>Frontend: Confirm deletion
    Frontend->>API: DELETE /api/project/:projectId
    
    API->>Auth: Verify JWT token
    Auth-->>API: userId validated
    
    API->>Controller: deleteProject(req, res)
    
    Controller->>DB: DELETE FROM Project<br/>WHERE id=projectId AND userId=userId
    
    alt Project Not Found or Unauthorized
        DB-->>Controller: 0 rows affected
        Controller->>Frontend: 404 Not found
        Frontend->>User: Error toast
    else Deletion Successful
        DB-->>Controller: 1 row deleted
        Controller->>Frontend: 200 {message: "Deleted"}
        Frontend->>Frontend: Remove from UI
        Frontend->>User: Success toast
    end
    
    Note over Storage: Cloudinary files remain<br/>(not automatically deleted)
```

## 8. Credit Check Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant Auth as Auth Middleware
    participant Controller as User Controller
    participant DB as PostgreSQL
    
    Note over Frontend: On page load / after generation
    
    Frontend->>API: GET /api/user/credits
    
    API->>Auth: Verify JWT token
    Auth-->>API: userId validated
    
    API->>Controller: getUserCredits(req, res)
    
    Controller->>DB: SELECT credits FROM User<br/>WHERE id=userId
    DB-->>Controller: {credits: 15}
    
    Controller->>Frontend: 200 {credits: 15}
    Frontend->>Frontend: Update navbar display
    Frontend->>User: Show credit balance
    
    alt Low Credits Warning
        Frontend->>Frontend: Check if credits < 5
        Frontend->>User: Show "Low credits" badge
    end
```

## 9. Error Handling Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React App
    participant API as Backend API
    participant Controller as Controller
    participant DB as PostgreSQL
    participant Sentry as Sentry Monitoring
    
    User->>Frontend: Perform action (e.g., generate)
    Frontend->>API: API request
    API->>Controller: Process request
    
    Controller->>DB: Database operation
    DB-->>Controller: ❌ Database error
    
    Controller->>Controller: Catch error
    
    alt Refundable Error (generation failure)
        Controller->>DB: Refund credits<br/>UPDATE User SET credits = credits + 5
        DB-->>Controller: Credits refunded
    end
    
    Controller->>Sentry: captureException(error)
    Sentry->>Sentry: Log error with context
    
    Controller->>API: Error response
    API->>Frontend: 500 {message: "Error"}
    
    Frontend->>User: Error toast notification
    Frontend->>Frontend: Log to console (dev mode)
    
    Note over Sentry: Admin receives alert
```

## 10. Webhook Processing Sequence

```mermaid
sequenceDiagram
    participant Clerk as Clerk Service
    participant Webhook as Backend Webhook
    participant DB as PostgreSQL
    
    Note over Clerk: User action in Clerk
    
    Clerk->>Webhook: POST /api/clerk<br/>event: user.created
    
    Webhook->>Webhook: Extract raw body
    Webhook->>Webhook: Extract svix headers
    Webhook->>Webhook: Verify signature<br/>(CLERK_WEBHOOK_SIGNING_SECRET)
    
    alt Invalid Signature
        Webhook->>Clerk: 401 Unauthorized
    else Valid Signature
        Webhook->>Webhook: Parse event data
        
        alt Event: user.created
            Webhook->>DB: INSERT INTO User<br/>(id, email, name, image, credits=20)
            DB-->>Webhook: User created
        else Event: user.updated
            Webhook->>DB: UPDATE User SET<br/>email=?, name=?, image=?
            DB-->>Webhook: User updated
        else Event: user.deleted
            Webhook->>DB: DELETE FROM User<br/>WHERE id=?
            DB-->>Webhook: User deleted (cascade projects)
        end
        
        Webhook->>Clerk: 200 OK
    end
```

## Timing Diagrams

### Image Generation Timeline

```
User Upload → Credit Check → Deduction → Create Project → Cloudinary Upload → AI Processing → Result Upload → DB Update → Poll Success
     |            |             |              |                 |                  |                 |              |            |
     0s          0.5s          0.5s           1s               2s              5-45s            46s           46.5s        47s
     
     ←─ Frontend ─→←───────────────────── Backend Async Processing ─────────────────────→←─ Frontend Poll ─→
```

### Polling Mechanism Timeline

```
Navigate to Result → Initial Fetch → Poll #1 → Poll #2 → Poll #3 → ... → Poll #N → Complete
       |                  |            |          |          |               |           |
       0s                0s          5s        10s        15s            (N*5)s     (N*5)s
       
Status: isGenerating=true  →  true  →  true  →  true  →  ... →  false  → Stop Polling
```

## Sequence Patterns

### 1. **Request-Response Pattern**
- Client sends request
- Server processes synchronously
- Server sends response
- Used for: Credits, Projects list, Delete

### 2. **Async Processing Pattern**
- Client sends request
- Server starts background job
- Server responds immediately with job ID
- Client polls for status
- Used for: Image generation, Video generation

### 3. **Webhook Pattern**
- External service triggers webhook
- Server verifies signature
- Server processes event
- Server responds with status
- Used for: User sync from Clerk

### 4. **Middleware Chain Pattern**
- Request passes through multiple middleware
- Each middleware performs validation/transformation
- Final middleware calls controller
- Used for: Authentication, File upload

---

**Diagram Type**: Sequence Diagram  
**Notation**: UML Sequence (Mermaid)  
**Created**: February 18, 2026  
**Version**: 1.0.0
