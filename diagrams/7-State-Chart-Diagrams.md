# State Chart Diagrams - UGC Image Generator

## 1. Project State Chart

```mermaid
stateDiagram-v2
    [*] --> Created: User submits generation form

    Created --> UploadingImages: Images received by server
    UploadingImages --> CreditDeducted: Images validated

    CreditDeducted --> ImagesUploaded: Upload to Cloudinary complete
    ImagesUploaded --> Generating: AI generation started<br/>(isGenerating = true)

    Generating --> Generated: AI returns image successfully<br/>(isGenerating = false)
    Generating --> Failed: AI generation error<br/>(isGenerating = false, error set)

    Failed --> CreditRefunded: Credits restored to user
    CreditRefunded --> [*]

    Generated --> Published: User publishes<br/>(isPublished = true)
    Generated --> VideoGenerating: User requests video<br/>(isGenerating = true)
    Generated --> Deleted: User deletes project

    Published --> Unpublished: User unpublishes<br/>(isPublished = false)
    Unpublished --> Published: User re-publishes

    Published --> VideoGenerating: User requests video
    Unpublished --> VideoGenerating: User requests video

    VideoGenerating --> VideoGenerated: Video ready<br/>(generatedVideo set)
    VideoGenerating --> VideoFailed: Video generation error

    VideoGenerated --> Published: User publishes
    VideoGenerated --> Deleted: User deletes

    Deleted --> [*]

    state Generated {
        [*] --> ImageReady
        ImageReady --> Downloaded: User downloads image
        Downloaded --> ImageReady
    }

    state VideoGenerated {
        [*] --> VideoReady
        VideoReady --> VideoDownloaded: User downloads video
        VideoDownloaded --> VideoReady
    }
```

## 2. User Account State Chart

```mermaid
stateDiagram-v2
    [*] --> Visitor: Lands on platform

    Visitor --> Registering: Clicks Sign Up
    Visitor --> LoggingIn: Clicks Sign In
    Visitor --> BrowsingCommunity: Views community feed
    Visitor --> ViewingPlans: Views pricing

    Registering --> Authenticated: Registration successful<br/>(20 credits assigned)
    LoggingIn --> Authenticated: Login successful
    LoggingIn --> Visitor: Login failed

    Authenticated --> Active: Has credits > 0
    Authenticated --> OutOfCredits: Credits = 0

    Active --> Generating: Starts image generation
    Generating --> Active: Generation complete
    Generating --> Active: Generation failed (refund)

    Active --> OutOfCredits: Last credits used
    OutOfCredits --> Active: Purchases credits

    Active --> LoggedOut: Signs out
    OutOfCredits --> LoggedOut: Signs out
    LoggedOut --> Visitor

    Active --> AccountDeleted: Deletes account
    OutOfCredits --> AccountDeleted: Deletes account
    AccountDeleted --> [*]
```

## 3. Image Generation Process State Chart

```mermaid
stateDiagram-v2
    [*] --> Idle: Page loaded

    Idle --> FormFilling: User starts filling form

    state FormFilling {
        [*] --> UploadingImage1
        UploadingImage1 --> Image1Ready: File selected
        Image1Ready --> UploadingImage2
        UploadingImage2 --> Image2Ready: File selected
        Image2Ready --> FillingMetadata
        FillingMetadata --> FormComplete: Required fields filled
    }

    FormFilling --> Idle: User clears form

    FormComplete --> Submitting: User clicks Generate

    Submitting --> Validating: FormData sent to server

    state Validating {
        [*] --> CheckingAuth
        CheckingAuth --> CheckingCredits: Auth valid
        CheckingCredits --> CheckingImages: Credits sufficient
        CheckingImages --> ValidationPassed: 2 images present
    }

    Validating --> Error: Validation failed
    Error --> Idle: User acknowledges error

    ValidationPassed --> Processing

    state Processing {
        [*] --> DeductingCredits
        DeductingCredits --> UploadingToCloud
        UploadingToCloud --> CallingAI
        CallingAI --> ExtractingResult
        ExtractingResult --> UploadingResult
        UploadingResult --> UpdatingDatabase
    }

    Processing --> Failed: Any step fails
    Failed --> RefundingCredits
    RefundingCredits --> Error

    Processing --> Complete: All steps successful
    Complete --> Displaying: Result page loaded
    Displaying --> [*]
```

## 4. Authentication State Chart

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: App loaded

    Unauthenticated --> ClerkModal: User initiates auth

    state ClerkModal {
        [*] --> SignUpForm
        [*] --> SignInForm
        SignUpForm --> Verifying: Submit credentials
        SignInForm --> Verifying: Submit credentials
        Verifying --> Verified: Credentials valid
        Verifying --> InputError: Credentials invalid
        InputError --> SignUpForm
        InputError --> SignInForm
    }

    Verified --> SessionActive: JWT token issued

    state SessionActive {
        [*] --> TokenValid
        TokenValid --> TokenExpiring: Token nearing expiry
        TokenExpiring --> TokenRefreshed: Clerk refreshes token
        TokenRefreshed --> TokenValid
    }

    SessionActive --> Unauthenticated: User signs out
    SessionActive --> Unauthenticated: Session expires

    note right of SessionActive
        All API requests include
        Bearer token in headers.
        Clerk auto-refreshes tokens.
    end note
```

## State Summary Table

| Entity | States | Key Transitions |
|---|---|---|
| Project | Created, Generating, Generated, Failed, Published, Unpublished, VideoGenerating, Deleted | Generation start/complete/fail, Publish toggle, Delete |
| User Account | Visitor, Registering, Authenticated, Active, OutOfCredits, LoggedOut | Auth, credit use, credit purchase, logout |
| Generation Process | Idle, FormFilling, Submitting, Validating, Processing, Complete, Failed | Form submit, validation pass/fail, AI success/error |
| Authentication | Unauthenticated, ClerkModal, SessionActive | Login/signup, token refresh, logout |
