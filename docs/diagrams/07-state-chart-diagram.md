# State Chart Diagram

## UGC Image Generator - State Transitions

State chart diagrams show how objects transition between different states in response to events.

## 1. Project State Machine

```mermaid
stateDiagram-v2
    [*] --> NotCreated
    
    NotCreated --> Creating : User clicks Generate
    
    Creating --> CreditCheck : Validate user
    
    CreditCheck --> InsufficientCredits : Credits < 5
    InsufficientCredits --> [*] : Show error
    
    CreditCheck --> CreditsDeducted : Credits >= 5
    CreditsDeducted --> ImagesUploading : Deduct 5 credits
    
    ImagesUploading --> UploadFailed : Upload error
    UploadFailed --> CreditsRefunded : Refund 5 credits
    CreditsRefunded --> [*] : Show error
    
    ImagesUploading --> ProjectCreated : Upload success
    ProjectCreated --> Generating : Call AI service
    
    Generating --> GenerationFailed : AI error
    GenerationFailed --> CreditsRefunded : Refund 5 credits
    
    Generating --> Complete : AI success
    Complete --> Published : User publishes
    Complete --> VideoGenerating : User generates video
    Complete --> Deleted : User deletes
    
    Published --> Unpublished : User unpublishes
    Unpublished --> Published : User republishes
    Unpublished --> Deleted : User deletes
    Published --> Deleted : User deletes
    
    VideoGenerating --> VideoCheckCredits : Validate credits
    VideoCheckCredits --> VideoInsufficientCredits : Credits < 10
    VideoInsufficientCredits --> Complete : Show error
    
    VideoCheckCredits --> VideoCreditsDeducted : Credits >= 10
    VideoCreditsDeducted --> VideoProcessing : Deduct 10 credits
    
    VideoProcessing --> VideoFailed : Veo error
    VideoFailed --> VideoCreditsRefunded : Refund 10 credits
    VideoCreditsRefunded --> Complete : Show error
    
    VideoProcessing --> VideoComplete : Veo success
    VideoComplete --> Deleted : User deletes
    VideoComplete --> Published : User publishes
    
    Deleted --> [*]
    
    note right of Generating
        isGenerating = true
        Frontend polls every 5s
    end note
    
    note right of Complete
        isGenerating = false
        generatedImage URL stored
        User can download
    end note
    
    note right of Published
        isPublished = true
        Visible in community feed
    end note
```

### Project States Explained

| State | Description | Database Flags | User Actions Available |
|-------|-------------|----------------|------------------------|
| **Not Created** | Initial state before generation | N/A | Navigate to Generator |
| **Creating** | User initiating generation | N/A | Wait |
| **Credit Check** | Validating user credits | N/A | N/A |
| **Insufficient Credits** | User lacks credits | N/A | Purchase credits |
| **Credits Deducted** | Credits subtracted | credits -= 5 | N/A |
| **Images Uploading** | Uploading to Cloudinary | N/A | Wait |
| **Upload Failed** | Cloudinary error | N/A | Retry |
| **Project Created** | DB record created | isGenerating = true | Wait |
| **Generating** | AI processing images | isGenerating = true | Wait, Poll status |
| **Generation Failed** | AI error occurred | isGenerating = false, error set | View error, Retry |
| **Complete** | Image generated successfully | isGenerating = false, generatedImage set | Download, Publish, Video, Delete |
| **Published** | Visible in community | isPublished = true | Unpublish, Download, Delete |
| **Unpublished** | Removed from community | isPublished = false | Publish, Delete |
| **Video Generating** | Creating video from image | isGenerating = true | Wait |
| **Video Complete** | Video generated | generatedVideo set | Download video, Delete |
| **Deleted** | Project removed | Record deleted | N/A |

### State Transitions & Events

```
Event: CREATE_PROJECT
  Condition: User authenticated, form valid
  From: NotCreated → To: Creating

Event: CREDITS_VALIDATED
  Condition: Credits >= 5
  From: CreditCheck → To: CreditsDeducted
  Action: credits -= 5

Event: CREDITS_INSUFFICIENT
  Condition: Credits < 5
  From: CreditCheck → To: InsufficientCredits
  Action: Show error toast

Event: IMAGES_UPLOADED
  Condition: All files uploaded successfully
  From: ImagesUploading → To: ProjectCreated
  Action: Save Cloudinary URLs

Event: AI_GENERATION_START
  From: ProjectCreated → To: Generating
  Action: Call Gemini API, set isGenerating = true

Event: AI_GENERATION_SUCCESS
  Condition: Valid image returned
  From: Generating → To: Complete
  Action: Save generatedImage, set isGenerating = false

Event: AI_GENERATION_FAILED
  Condition: API error, timeout, invalid response
  From: Generating → To: GenerationFailed
  Action: Set error message, refund credits

Event: PUBLISH
  Condition: Image exists
  From: Complete/Unpublished → To: Published
  Action: Set isPublished = true

Event: UNPUBLISH
  From: Published → To: Unpublished
  Action: Set isPublished = false

Event: DELETE
  From: Any non-deleted state → To: Deleted
  Action: Delete DB record

Event: GENERATE_VIDEO
  Condition: Image exists, Credits >= 10
  From: Complete → To: VideoGenerating
  Action: credits -= 10, call Veo API
```

---

## 2. User State Machine

```mermaid
stateDiagram-v2
    [*] --> Guest
    
    Guest --> SigningUp : Click Sign Up
    Guest --> SigningIn : Click Sign In
    
    SigningUp --> EnteringCredentials : Modal opens
    SigningIn --> EnteringCredentials : Modal opens
    
    EnteringCredentials --> Validating : Submit form
    
    Validating --> CredentialError : Invalid credentials
    CredentialError --> EnteringCredentials : Show error
    
    Validating --> CreatingAccount : Valid signup
    CreatingAccount --> WebhookProcessing : Clerk creates user
    
    WebhookProcessing --> WebhookFailed : Webhook error
    WebhookFailed --> [*] : Show error
    
    WebhookProcessing --> Authenticated : DB user created
    
    Validating --> Authenticated : Valid signin
    
    Authenticated --> Active : JWT stored
    
    Active --> Generating : Start generation
    Active --> Viewing : View projects
    Active --> Browsing : Browse community
    
    Generating --> Active : Generation complete
    Viewing --> Active : Back to home
    Browsing --> Active : Back to home
    
    Active --> SessionExpired : JWT expires
    SessionExpired --> Guest : Clear session
    
    Active --> LoggingOut : Click logout
    LoggingOut --> Guest : Clear session
    
    Active --> Suspended : Account suspended
    Suspended --> [*] : Admin action
    
    note right of Guest
        No authentication
        Can view community
        Cannot generate
    end note
    
    note right of Active
        Full access
        20 credits on signup
        Can generate images
    end note
    
    note right of Generating
        Credits deducted
        Polling for result
    end note
```

### User States Explained

| State | Description | Credits | Permissions |
|-------|-------------|---------|-------------|
| **Guest** | Unauthenticated visitor | 0 | View landing, community, pricing |
| **Signing Up** | Registration flow started | 0 | Fill registration form |
| **Signing In** | Login flow started | 0 | Fill login form |
| **Entering Credentials** | User typing credentials | 0 | Submit form |
| **Validating** | Clerk verifying credentials | 0 | Wait |
| **Creating Account** | Clerk creating user | 0 | Wait |
| **Webhook Processing** | Backend syncing user | 0 | Wait |
| **Authenticated** | JWT token received | 20 | All permissions |
| **Active** | Normal logged-in state | Variable | Full CRUD operations |
| **Generating** | Active generation in progress | Variable | Wait, view status |
| **Viewing** | Viewing own projects | Variable | Navigate, delete |
| **Browsing** | Viewing community | Variable | View, get inspired |
| **Session Expired** | JWT token expired | Variable | Re-authenticate |
| **Logging Out** | User initiated logout | Variable | Clearing session |
| **Suspended** | Account banned/suspended | Variable | Contact support |

---

## 3. Generation Process State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> ValidatingInput : User submits form
    
    ValidatingInput --> ValidationFailed : Invalid files/data
    ValidationFailed --> Idle : Show errors
    
    ValidatingInput --> CheckingCredits : Input valid
    
    CheckingCredits --> InsufficientCredits : Credits < 5
    InsufficientCredits --> Idle : Show error
    
    CheckingCredits --> DeductingCredits : Credits >= 5
    DeductingCredits --> UploadingFiles : Credits deducted
    
    UploadingFiles --> UploadError : Network/storage error
    UploadError --> RefundingCredits : Rollback
    RefundingCredits --> Idle : Credits restored
    
    UploadingFiles --> CreatingProject : Files uploaded
    CreatingProject --> CallingAI : Project record created
    
    CallingAI --> WaitingForAI : Request sent
    
    WaitingForAI --> AITimeout : 120s timeout
    AITimeout --> RefundingCredits
    
    WaitingForAI --> AIError : API error
    AIError --> RefundingCredits
    
    WaitingForAI --> ProcessingResponse : Response received
    
    ProcessingResponse --> InvalidResponse : No image data
    InvalidResponse --> RefundingCredits
    
    ProcessingResponse --> ExtractingImage : Valid response
    ExtractingImage --> UploadingResult : Image extracted
    
    UploadingResult --> ResultUploadError : Cloudinary error
    ResultUploadError --> RetryUpload : Retry 3 times
    RetryUpload --> UploadingResult
    RetryUpload --> RefundingCredits : Max retries exceeded
    
    UploadingResult --> UpdatingProject : Result uploaded
    UpdatingProject --> Complete : DB updated
    
    Complete --> [*]
    
    note right of WaitingForAI
        Typical: 20-45 seconds
        Max: 120 seconds
        Frontend polls every 5s
    end note
    
    note right of Complete
        generatedImage URL stored
        isGenerating = false
        User can view result
    end note
```

### Generation States Timeline

```
0s: Idle
|
├─ 0-1s: ValidatingInput
├─ 1-2s: CheckingCredits
├─ 2-3s: DeductingCredits
├─ 3-5s: UploadingFiles
├─ 5-6s: CreatingProject
├─ 6-7s: CallingAI
|
├─ 7-52s: WaitingForAI (20-45s typical)
|     └─ Frontend polls every 5s
|     └─ Shows progress indicator
|
├─ 52-54s: ProcessingResponse
├─ 54-56s: ExtractingImage
├─ 56-58s: UploadingResult
├─ 58-59s: UpdatingProject
└─ 59s: Complete
```

---

## 4. Credit Balance State Machine

```mermaid
stateDiagram-v2
    [*] --> Initial : User created
    
    Initial --> Sufficient : 20 credits
    
    Sufficient --> Adequate : 15+ credits
    Sufficient --> Low : 5-14 credits
    Sufficient --> Depleted : 0 credits
    
    Adequate --> Sufficient : +5 credits (refund/purchase)
    Adequate --> Low : -5 credits (generation)
    Low --> Adequate : +10 credits (purchase)
    Low --> Depleted : -5 credits (generation)
    
    Depleted --> Low : +10 credits (purchase)
    Depleted --> Adequate : +15 credits (purchase)
    Depleted --> Sufficient : +20 credits (purchase)
    
    Low --> Warning : Credits < 5
    Depleted --> Blocked : Credits = 0
    
    Warning --> Adequate : Purchase credits
    Blocked --> Low : Purchase credits
    
    note right of Sufficient
        User can generate freely
        No warnings shown
    end note
    
    note right of Low
        Yellow badge shown
        Can generate 1-2 more
    end note
    
    note right of Depleted
        Red badge shown
        Cannot generate
        Must purchase
    end note
```

### Credit State Thresholds

| State | Range | UI Indicator | Actions Allowed |
|-------|-------|--------------|-----------------|
| **Initial** | 20 | Green badge | Generate (4x), Video (2x) |
| **Sufficient** | 20+ | Green | Generate multiple times |
| **Adequate** | 15-19 | Green | Generate 3+ times |
| **Low** | 5-14 | Yellow warning | Generate 1-2 times |
| **Warning** | 5-9 | Yellow + text | Generate once |
| **Depleted** | 0-4 | Red + text | Cannot generate |
| **Blocked** | 0 | Red banner | Must purchase |

### Credit Operations

```
Operation: IMAGE_GENERATION
  Cost: 5 credits
  Condition: credits >= 5
  On Success: Deduct 5
  On Failure: Refund 5

Operation: VIDEO_GENERATION
  Cost: 10 credits
  Condition: credits >= 10
  On Success: Deduct 10
  On Failure: Refund 10

Operation: PURCHASE (Future)
  Add: Variable (10, 25, 50, 100)
  Condition: Payment successful
  On Success: Add credits
  On Failure: No change
```

---

## 5. UI Component State Machine (Result Page)

```mermaid
stateDiagram-v2
    [*] --> Loading : Component mounts
    
    Loading --> FetchingProject : Fetch project data
    
    FetchingProject --> FetchError : API error
    FetchError --> ErrorDisplay : Show error
    ErrorDisplay --> Retry : User clicks retry
    Retry --> FetchingProject
    ErrorDisplay --> [*] : Navigate away
    
    FetchingProject --> CheckingStatus : Data received
    
    CheckingStatus --> Generating : isGenerating = true
    CheckingStatus --> Failed : error exists
    CheckingStatus --> Success : isGenerating = false, has image
    
    Generating --> PollingActive : Start 5s interval
    PollingActive --> FetchingProject : Poll tick
    
    Failed --> FailedDisplay : Show error message
    FailedDisplay --> [*] : Navigate away
    
    Success --> DisplayingImage : Render image
    DisplayingImage --> ActionsReady : Show buttons
    
    ActionsReady --> Downloading : User clicks download
    Downloading --> ActionsReady : Download complete
    
    ActionsReady --> Publishing : User clicks publish
    Publishing --> Published : isPublished = true
    Published --> Unpublishing : User clicks unpublish
    Unpublishing --> ActionsReady : isPublished = false
    
    ActionsReady --> VideoGeneration : User clicks video
    VideoGeneration --> VideoPolling : Start polling
    VideoPolling --> FetchingProject : Poll tick
    VideoPolling --> VideoReady : Video complete
    VideoReady --> ActionsReady : Show video player
    
    ActionsReady --> Deleting : User clicks delete
    Deleting --> Deleted : Confirmation
    Deleted --> [*] : Navigate to My Generations
    
    note right of PollingActive
        Polls every 5 seconds
        while isGenerating = true
    end note
    
    note right of ActionsReady
        Download button enabled
        Publish toggle enabled
        Video button if credits ok
    end note
```

---

## 6. Form Validation State Machine

```mermaid
stateDiagram-v2
    [*] --> Empty : Form loads
    
    Empty --> Typing : User starts typing
    Typing --> Validating : OnChange event
    
    Validating --> Invalid : Validation fails
    Invalid --> Typing : User corrects
    
    Validating --> Valid : Validation passes
    Valid --> Typing : User continues editing
    
    Valid --> Submitting : User clicks submit
    Submitting --> ServerValidation : API call
    
    ServerValidation --> ServerError : 400/500 response
    ServerError --> Invalid : Show server errors
    
    ServerValidation --> Success : 200/201 response
    Success --> [*] : Navigate away
    
    Invalid --> Empty : User clears form
    Valid --> Empty : User clears form
    
    note right of Invalid
        Show error messages
        Highlight fields red
        Disable submit button
    end note
    
    note right of Valid
        Remove error messages
        Show green checkmarks
        Enable submit button
    end note
```

---

## State Patterns Summary

### Common State Transitions

1. **Creation Flow**: Not Created → Creating → Processing → Complete
2. **Error Flow**: Any State → Error State → Recovery/End
3. **Polling Flow**: Initiated → Polling → Completed
4. **Toggle Flow**: State A ↔ State B (Publish/Unpublish)

### State Persistence

- **Database**: Project states (isGenerating, isPublished, error)
- **Client Session**: User authentication state (JWT token)
- **Local Storage**: UI preferences, form drafts (future)
- **Memory**: Component states (loading, error, data)

### Concurrent States

Some objects can be in multiple states simultaneously:
- Project can be: `Complete + Published + Downloaded`
- User can be: `Authenticated + Active + Generating`
- UI can be: `Loading + Polling + Displaying`

---

**Diagram Type**: State Chart Diagram  
**Notation**: UML State Machine (Mermaid)  
**Created**: February 18, 2026  
**Version**: 1.0.0
