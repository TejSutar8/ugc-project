# Class Diagram - UGC Image Generator

## Class Diagram

```mermaid
classDiagram
    direction TB

    class User {
        +String id
        +String email
        +String name
        +String image
        +Int credits
        +DateTime createdAt
        +DateTime updatedAt
        +Project[] projects
    }

    class Project {
        +String id
        +String userId
        +String name
        +String productName
        +String productDescription
        +String userPrompt
        +String aspectRatio
        +Int targetLength
        +String[] uploadedImages
        +String generatedImage
        +String generatedVideo
        +Boolean isGenerating
        +Boolean isPublished
        +String error
        +DateTime createdAt
        +DateTime updatedAt
        +User user
    }

    class ProjectController {
        +createProject(req, res) Promise~void~
        +createVideo(req, res) Promise~void~
        +getAllPublishedProjects(req, res) Promise~void~
        +deleteProject(req, res) Promise~void~
    }

    class UserController {
        +getUserCredits(req, res) Promise~void~
        +getAllProjects(req, res) Promise~void~
        +getProjectById(req, res) Promise~void~
        +toggleProjectPublic(req, res) Promise~void~
    }

    class ClerkWebhookHandler {
        +handleWebhook(req, res) Promise~void~
        -handleUserCreated(data) Promise~void~
        -handleUserUpdated(data) Promise~void~
        -handleUserDeleted(data) Promise~void~
        -handlePaymentUpdated(data) Promise~void~
    }

    class AuthMiddleware {
        +protect(req, res, next) Promise~void~
    }

    class PrismaClient {
        +user UserDelegate
        +project ProjectDelegate
        +findUnique(args) Promise
        +create(args) Promise
        +update(args) Promise
        +delete(args) Promise
        +findMany(args) Promise
    }

    class GoogleGenAI {
        +models ModelsAPI
        +generateContent(config) Promise~GenerateContentResponse~
    }

    class CloudinaryUploader {
        +upload(file, options) Promise~UploadResult~
        +destroy(publicId) Promise~void~
    }

    class MulterUpload {
        +storage DiskStorage
        +limits Object
        +fileFilter Function
        +array(fieldName, maxCount) Middleware
    }

    class AxiosInstance {
        +baseURL String
        +interceptors Object
        +get(url, config) Promise
        +post(url, data, config) Promise
        +delete(url, config) Promise
    }

    class ExpressApp {
        +use(middleware) void
        +get(path, handler) void
        +post(path, handler) void
        +delete(path, handler) void
        +listen(port, callback) void
    }

    class Router {
        +get(path, ...handlers) void
        +post(path, ...handlers) void
        +delete(path, ...handlers) void
    }

    %% Relationships
    User "1" --> "*" Project : has many
    Project "*" --> "1" User : belongs to

    ProjectController ..> PrismaClient : uses
    ProjectController ..> GoogleGenAI : uses
    ProjectController ..> CloudinaryUploader : uses
    ProjectController ..> MulterUpload : uses

    UserController ..> PrismaClient : uses

    ClerkWebhookHandler ..> PrismaClient : uses

    AuthMiddleware ..> ClerkWebhookHandler : validates with Clerk

    ExpressApp --> Router : registers
    Router --> AuthMiddleware : applies
    Router --> ProjectController : routes to
    Router --> UserController : routes to

    AxiosInstance ..> ExpressApp : sends requests to
```

## Class Descriptions

### Models (Data Layer)
| Class | Description |
|---|---|
| User | Represents a platform user with credits and profile info |
| Project | Represents an AI generation project with images, videos, and metadata |

### Controllers (Business Logic)
| Class | Description |
|---|---|
| ProjectController | Handles image/video generation, publishing, and deletion |
| UserController | Handles user data queries, credit checks, and project retrieval |
| ClerkWebhookHandler | Processes Clerk authentication webhooks for user sync |

### Middleware
| Class | Description |
|---|---|
| AuthMiddleware | Validates JWT tokens and protects routes |

### Services / Configurations
| Class | Description |
|---|---|
| PrismaClient | ORM client for PostgreSQL database operations |
| GoogleGenAI | Google Gemini AI client for image/video generation |
| CloudinaryUploader | Media storage and CDN service |
| MulterUpload | File upload middleware for handling multipart form data |
| AxiosInstance | HTTP client configured with auth interceptors |

### Infrastructure
| Class | Description |
|---|---|
| ExpressApp | Main web server application |
| Router | Express router for API endpoint definitions |
