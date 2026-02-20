# ER Diagram - UGC Image Generator

## Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        String id PK "Clerk User ID"
        String email "User email address"
        String name "Full name"
        String image "Profile picture URL"
        Int credits "Default: 20"
        DateTime createdAt "Account creation date"
        DateTime updatedAt "Last update date"
    }

    PROJECT {
        String id PK "UUID auto-generated"
        String userId FK "References User.id"
        String name "Project name"
        String productName "Product being showcased"
        String productDescription "Optional product details"
        String userPrompt "Optional custom AI prompt"
        String aspectRatio "9:16 or 16:9"
        Int targetLength "Video length (default: 5)"
        StringArray uploadedImages "Cloudinary URLs (2 images)"
        String generatedImage "AI-generated image URL"
        String generatedVideo "AI-generated video URL"
        Boolean isGenerating "True during AI processing"
        Boolean isPublished "Community visibility flag"
        String error "Error message if failed"
        DateTime createdAt "Record creation date"
        DateTime updatedAt "Last update date"
    }

    USER ||--o{ PROJECT : "creates"
```

## Relationships

| Relationship | Type | Description |
|---|---|---|
| User -> Project | One-to-Many | One user can create many projects |
| Project -> User | Many-to-One | Each project belongs to exactly one user |

## Constraints

- **Primary Keys**: `User.id` (Clerk ID), `Project.id` (UUID)
- **Foreign Key**: `Project.userId` references `User.id`
- **Cascade Delete**: Deleting a User removes all their Projects
- **Defaults**: `credits = 20`, `aspectRatio = "9:16"`, `isGenerating = false`, `isPublished = false`
