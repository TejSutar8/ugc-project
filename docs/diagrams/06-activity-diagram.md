# Activity Diagram

## UGC Image Generator - Process Flows

Activity diagrams show the workflow of business processes and system operations.

## 1. Image Generation Process Flow

```mermaid
flowchart TD
    Start([User Starts Generation]) --> CheckAuth{User<br/>Authenticated?}
    
    CheckAuth -->|No| RedirectLogin[Redirect to Login]
    RedirectLogin --> End1([End])
    
    CheckAuth -->|Yes| NavigateGen[Navigate to /generate]
    NavigateGen --> UploadImg[Upload 2 Images]
    
    UploadImg --> ValidateFiles{Files Valid?<br/>Type & Size}
    ValidateFiles -->|No| ShowError1[Show Error Message]
    ShowError1 --> UploadImg
    
    ValidateFiles -->|Yes| FillForm[Fill Form Fields:<br/>Name, Product, Prompt]
    FillForm --> SelectRatio[Select Aspect Ratio]
    SelectRatio --> ClickGenerate[Click Generate Button]
    
    ClickGenerate --> CheckCredits{Credits >= 5?}
    CheckCredits -->|No| ShowLowCredits[Show Insufficient<br/>Credits Error]
    ShowLowCredits --> End2([End])
    
    CheckCredits -->|Yes| DeductCredits[Deduct 5 Credits]
    DeductCredits --> UploadToCloud[Upload Images<br/>to Cloudinary]
    
    UploadToCloud --> CreateProject[Create Project Record<br/>isGenerating = true]
    CreateProject --> RedirectResult[Redirect to<br/>/result/:projectId]
    
    RedirectResult --> ShowLoading[Show Loading Spinner]
    
    par Async AI Processing
        CreateProject --> PrepareImages[Load Images to Base64]
        PrepareImages --> BuildPrompt[Build AI Prompt]
        BuildPrompt --> CallGemini[Call Google Gemini API]
        CallGemini --> WaitAI[Wait for AI<br/>20-45 seconds]
        WaitAI --> ReceiveResult{Generation<br/>Successful?}
        
        ReceiveResult -->|No| LogError[Log Error to Sentry]
        LogError --> RefundCredits[Refund 5 Credits]
        RefundCredits --> UpdateError[Update Project<br/>with Error Message]
        UpdateError --> SetGeneratingFalse1[Set isGenerating = false]
        
        ReceiveResult -->|Yes| ExtractImage[Extract Image Buffer]
        ExtractImage --> UploadResult[Upload Generated Image<br/>to Cloudinary]
        UploadResult --> UpdateProject[Update Project with<br/>Generated Image URL]
        UpdateProject --> SetGeneratingFalse2[Set isGenerating = false]
    end
    
    ShowLoading --> StartPolling[Start Polling<br/>Every 5 Seconds]
    StartPolling --> FetchStatus[Fetch Project Status]
    FetchStatus --> CheckGenerating{isGenerating?}
    
    CheckGenerating -->|true| Wait5Sec[Wait 5 Seconds]
    Wait5Sec --> FetchStatus
    
    CheckGenerating -->|false| CheckError{Has Error?}
    CheckError -->|Yes| DisplayError[Display Error Message<br/>Show Refund Notice]
    DisplayError --> End3([End])
    
    CheckError -->|No| DisplayImage[Display Generated Image]
    DisplayImage --> ShowActions[Show Action Buttons:<br/>Download, Publish, Video]
    ShowActions --> End4([End: Success])
    
    style Start fill:#90EE90
    style End1 fill:#FFB6C1
    style End2 fill:#FFB6C1
    style End3 fill:#FFB6C1
    style End4 fill:#90EE90
    style CheckCredits fill:#FFE4B5
    style CheckAuth fill:#FFE4B5
    style ValidateFiles fill:#FFE4B5
    style ReceiveResult fill:#FFE4B5
```

## 2. User Registration & Onboarding Flow

```mermaid
flowchart TD
    Start([User Visits Website]) --> Landing[View Landing Page]
    Landing --> Decision{Want to<br/>Generate?}
    
    Decision -->|Browse Only| ViewCommunity[Browse Community Feed]
    ViewCommunity --> End1([End])
    
    Decision -->|Yes, Generate| ClickSignUp[Click Sign Up Button]
    ClickSignUp --> OpenClerk[Clerk Modal Opens]
    
    OpenClerk --> ChooseMethod{Authentication<br/>Method?}
    
    ChooseMethod -->|Email/Password| EnterEmail[Enter Email & Password]
    EnterEmail --> ValidateEmail{Email Valid?}
    ValidateEmail -->|No| ShowEmailError[Show Validation Error]
    ShowEmailError --> EnterEmail
    
    ValidateEmail -->|Yes| CreateClerkUser[Clerk Creates User]
    
    ChooseMethod -->|Social Login| SelectProvider[Select Google/GitHub]
    SelectProvider --> OAuthFlow[OAuth Authorization]
    OAuthFlow --> CreateClerkUser
    
    CreateClerkUser --> SendWebhook[Clerk Sends Webhook<br/>to Backend]
    SendWebhook --> VerifySignature{Webhook<br/>Signature Valid?}
    
    VerifySignature -->|No| RejectWebhook[Return 401]
    RejectWebhook --> RetryWebhook[Clerk Retries<br/>3 Times]
    RetryWebhook --> End2([End: Failed])
    
    VerifySignature -->|Yes| CreateUserDB[Create User in Database:<br/>- id from Clerk<br/>- email, name, image<br/>- credits = 20]
    
    CreateUserDB --> ReturnJWT[Return JWT Token<br/>to Frontend]
    ReturnJWT --> StoreSession[Store Token in<br/>Clerk Session]
    StoreSession --> RedirectHome[Redirect to Home Page]
    
    RedirectHome --> ShowWelcome[Show Welcome Toast:<br/>You have 20 free credits!]
    ShowWelcome --> UpdateNavbar[Update Navbar:<br/>Show User Profile & Credits]
    UpdateNavbar --> End3([End: Registered])
    
    style Start fill:#90EE90
    style End1 fill:#87CEEB
    style End2 fill:#FFB6C1
    style End3 fill:#90EE90
    style Decision fill:#FFE4B5
    style VerifySignature fill:#FFE4B5
```

## 3. Project Management Flow

```mermaid
flowchart TD
    Start([User Logged In]) --> NavigateMyGen[Navigate to<br/>My Generations]
    NavigateMyGen --> FetchProjects[Fetch All User Projects<br/>from Database]
    FetchProjects --> DisplayGrid[Display Projects Grid]
    
    DisplayGrid --> UserAction{User Action?}
    
    UserAction -->|Click Project| ViewProject[Navigate to<br/>/result/:projectId]
    ViewProject --> ShowFullResult[Show Full Result Page]
    ShowFullResult --> End1([End])
    
    UserAction -->|Click Delete| ConfirmDelete{Confirm<br/>Deletion?}
    ConfirmDelete -->|No| DisplayGrid
    ConfirmDelete -->|Yes| DeleteAPI[Call DELETE API]
    DeleteAPI --> RemoveFromDB[Remove from Database]
    RemoveFromDB --> RemoveFromUI[Remove from UI Grid]
    RemoveFromUI --> ShowDeleteToast[Show Success Toast]
    ShowDeleteToast --> DisplayGrid
    
    UserAction -->|Filter Projects| ApplyFilter[Apply Filter:<br/>All/Generating/Complete]
    ApplyFilter --> FilterGrid[Filter Display Grid]
    FilterGrid --> DisplayGrid
    
    UserAction -->|Search| EnterSearch[Enter Search Term]
    EnterSearch --> SearchProjects[Search by Name or<br/>Product Name]
    SearchProjects --> DisplayGrid
    
    UserAction -->|Sort| SelectSort[Select Sort Order:<br/>Newest/Oldest]
    SelectSort --> SortProjects[Re-sort Project Array]
    SortProjects --> DisplayGrid
    
    style Start fill:#90EE90
    style End1 fill:#87CEEB
    style UserAction fill:#FFE4B5
    style ConfirmDelete fill:#FFE4B5
```

## 4. Community Publishing Flow

```mermaid
flowchart TD
    Start([User on Result Page]) --> CheckComplete{Generation<br/>Complete?}
    
    CheckComplete -->|No| DisablePublish[Disable Publish Toggle]
    DisablePublish --> End1([End])
    
    CheckComplete -->|Yes| EnablePublish[Enable Publish Toggle]
    EnablePublish --> ToggleClick[User Toggles Publish Switch]
    
    ToggleClick --> GetCurrentState{Current State?}
    
    GetCurrentState -->|Unpublished| CallPublishAPI[Call POST<br/>/api/user/publish/:id]
    CallPublishAPI --> ValidateOwnership{User Owns<br/>Project?}
    
    ValidateOwnership -->|No| Return404[Return 404 Error]
    Return404 --> ShowErrorToast[Show Error Toast]
    ShowErrorToast --> End2([End])
    
    ValidateOwnership -->|Yes| SetPublishedTrue[Set isPublished = true<br/>in Database]
    SetPublishedTrue --> UpdateUIPublished[Update UI:<br/>Toggle = ON]
    UpdateUIPublished --> ShowPublishedToast[Show Published Toast:<br/>Visible in Community]
    ShowPublishedToast --> AddToCommunity[Project Appears<br/>in Community Feed]
    AddToCommunity --> End3([End: Published])
    
    GetCurrentState -->|Published| CallUnpublishAPI[Call POST<br/>/api/user/publish/:id]
    CallUnpublishAPI --> SetPublishedFalse[Set isPublished = false<br/>in Database]
    SetPublishedFalse --> UpdateUIUnpublished[Update UI:<br/>Toggle = OFF]
    UpdateUIUnpublished --> ShowUnpublishedToast[Show Unpublished Toast:<br/>Removed from Community]
    ShowUnpublishedToast --> RemoveFromCommunity[Project Hidden<br/>from Community Feed]
    RemoveFromCommunity --> End4([End: Unpublished])
    
    style Start fill:#90EE90
    style End1 fill:#FFB6C1
    style End2 fill:#FFB6C1
    style End3 fill:#90EE90
    style End4 fill:#87CEEB
    style CheckComplete fill:#FFE4B5
    style ValidateOwnership fill:#FFE4B5
```

## 5. Video Generation Flow

```mermaid
flowchart TD
    Start([User on Result Page]) --> CheckImageComplete{Generated Image<br/>Exists?}
    
    CheckImageComplete -->|No| DisableVideoBtn[Disable Video Button]
    DisableVideoBtn --> End1([End])
    
    CheckImageComplete -->|Yes| CheckVideoCredits{Credits >= 10?}
    CheckVideoCredits -->|No| ShowInsufficientMsg[Show Insufficient<br/>Credits Message]
    ShowInsufficientMsg --> End2([End])
    
    CheckVideoCredits -->|Yes| EnableVideoBtn[Enable Generate Video<br/>Button]
    EnableVideoBtn --> ClickVideo[User Clicks<br/>Generate Video]
    
    ClickVideo --> ConfirmVideo{Confirm?<br/>Costs 10 Credits}
    ConfirmVideo -->|No| End3([End])
    
    ConfirmVideo -->|Yes| DeductVideoCredits[Deduct 10 Credits]
    DeductVideoCredits --> UpdateGenerating[Set isGenerating = true]
    UpdateGenerating --> ShowVideoLoading[Show Video Generation<br/>Progress Indicator]
    
    ShowVideoLoading --> BuildVideoPrompt[Build Video Prompt<br/>from Project Data]
    BuildVideoPrompt --> CallVeoAPI[Call Google Veo API<br/>with Prompt + Config]
    CallVeoAPI --> WaitVideo[Wait for Video<br/>Generation: 60-90s]
    
    WaitVideo --> CheckVideoResult{Generation<br/>Success?}
    
    CheckVideoResult -->|No| LogVideoError[Log Error to Sentry]
    LogVideoError --> RefundVideoCredits[Refund 10 Credits]
    RefundVideoCredits --> SetVideoError[Set Error Message]
    SetVideoError --> SetGenerating1[Set isGenerating = false]
    SetGenerating1 --> ShowVideoError[Show Error Toast]
    ShowVideoError --> End4([End: Failed])
    
    CheckVideoResult -->|Yes| DownloadVideo[Download Video File<br/>from Veo]
    DownloadVideo --> UploadVideoCloud[Upload Video<br/>to Cloudinary]
    UploadVideoCloud --> GetVideoURL[Get Video URL]
    GetVideoURL --> UpdateProjectVideo[Update Project with<br/>Video URL]
    UpdateProjectVideo --> SetGenerating2[Set isGenerating = false]
    SetGenerating2 --> DisplayVideo[Display Video Player]
    DisplayVideo --> ShowVideoActions[Show Download<br/>Video Button]
    ShowVideoActions --> ShowSuccessToast[Show Success Toast:<br/>Video Ready!]
    ShowSuccessToast --> End5([End: Success])
    
    style Start fill:#90EE90
    style End1 fill:#FFB6C1
    style End2 fill:#FFB6C1
    style End3 fill:#87CEEB
    style End4 fill:#FFB6C1
    style End5 fill:#90EE90
    style CheckImageComplete fill:#FFE4B5
    style CheckVideoCredits fill:#FFE4B5
    style ConfirmVideo fill:#FFE4B5
    style CheckVideoResult fill:#FFE4B5
```

## 6. Download Generated Content Flow

```mermaid
flowchart TD
    Start([User Viewing Result]) --> HasContent{Generated Content<br/>Available?}
    
    HasContent -->|No| DisableDownload[Disable Download Button]
    DisableDownload --> End1([End])
    
    HasContent -->|Yes| EnableDownload[Enable Download Button]
    EnableDownload --> ClickDownload[User Clicks Download]
    
    ClickDownload --> ChooseType{Download Type?}
    
    ChooseType -->|Image| GetImageURL[Get Generated<br/>Image URL]
    GetImageURL --> FetchImage[Fetch Image from<br/>Cloudinary CDN]
    FetchImage --> CreateImageLink[Create Download Link:<br/>createElement('a')]
    CreateImageLink --> SetImageAttrs[Set href & download<br/>attributes]
    SetImageAttrs --> TriggerImageDownload[Programmatically<br/>Click Link]
    TriggerImageDownload --> BrowserImageDownload[Browser Initiates<br/>Image Download]
    BrowserImageDownload --> ShowImageToast[Show Success Toast:<br/>Image Downloaded]
    ShowImageToast --> End2([End: Image])
    
    ChooseType -->|Video| CheckVideoExists{Video<br/>Generated?}
    CheckVideoExists -->|No| ShowNoVideo[Show No Video<br/>Available Message]
    ShowNoVideo --> End3([End])
    
    CheckVideoExists -->|Yes| GetVideoURL[Get Generated<br/>Video URL]
    GetVideoURL --> FetchVideo[Fetch Video from<br/>Cloudinary CDN]
    FetchVideo --> CreateVideoLink[Create Download Link]
    CreateVideoLink --> SetVideoAttrs[Set href & download<br/>attributes]
    SetVideoAttrs --> TriggerVideoDownload[Programmatically<br/>Click Link]
    TriggerVideoDownload --> BrowserVideoDownload[Browser Initiates<br/>Video Download]
    BrowserVideoDownload --> ShowVideoToast[Show Success Toast:<br/>Video Downloaded]
    ShowVideoToast --> End4([End: Video])
    
    style Start fill:#90EE90
    style End1 fill:#FFB6C1
    style End2 fill:#90EE90
    style End3 fill:#FFB6C1
    style End4 fill:#90EE90
    style HasContent fill:#FFE4B5
    style ChooseType fill:#FFE4B5
    style CheckVideoExists fill:#FFE4B5
```

## 7. Credit Management Flow

```mermaid
flowchart TD
    Start([Credit Operation]) --> OperationType{Operation Type?}
    
    OperationType -->|Check Balance| FetchCredits[Query User Credits<br/>from Database]
    FetchCredits --> DisplayCredits[Display in Navbar]
    DisplayCredits --> CheckLow{Credits < 5?}
    CheckLow -->|Yes| ShowWarning[Show Low Credits<br/>Warning Badge]
    CheckLow -->|No| HideWarning[Hide Warning]
    ShowWarning --> End1([End])
    HideWarning --> End1
    
    OperationType -->|Deduct Credits| ValidateAmount{Amount Valid?<br/>5 or 10}
    ValidateAmount -->|No| ThrowError[Throw Invalid<br/>Amount Error]
    ThrowError --> End2([End: Error])
    
    ValidateAmount -->|Yes| CheckSufficient{Current Credits<br/>>= Amount?}
    CheckSufficient -->|No| ReturnInsufficient[Return Insufficient<br/>Credits Error]
    ReturnInsufficient --> End3([End: Failed])
    
    CheckSufficient -->|Yes| UpdateDeduct[UPDATE User<br/>SET credits = credits - amount]
    UpdateDeduct --> LogTransaction[Log Transaction<br/>(future)]
    LogTransaction --> RefreshUI[Refresh Credit Display]
    RefreshUI --> End4([End: Deducted])
    
    OperationType -->|Refund Credits| ValidateRefund{Refund Reason?<br/>Generation Failed}
    ValidateRefund -->|Valid| UpdateAdd[UPDATE User<br/>SET credits = credits + amount]
    UpdateAdd --> LogRefund[Log Refund<br/>(future)]
    LogRefund --> NotifyUser[Notify User:<br/>Credits Refunded]
    NotifyUser --> End5([End: Refunded])
    
    ValidateRefund -->|Invalid| RejectRefund[Reject Refund]
    RejectRefund --> End6([End: Rejected])
    
    OperationType -->|Purchase Credits| RedirectPayment[Redirect to<br/>Stripe Checkout]
    RedirectPayment --> WaitPayment[Wait for Payment<br/>Confirmation]
    WaitPayment --> PaymentResult{Payment<br/>Success?}
    PaymentResult -->|No| ShowPaymentFail[Show Payment<br/>Failed Message]
    ShowPaymentFail --> End7([End: Failed])
    
    PaymentResult -->|Yes| AddPurchased[ADD Purchased<br/>Credits to Balance]
    AddPurchased --> SendConfirmation[Send Confirmation<br/>Email]
    SendConfirmation --> ShowSuccess[Show Success Message]
    ShowSuccess --> End8([End: Purchased])
    
    style Start fill:#90EE90
    style End1 fill:#87CEEB
    style End2 fill:#FFB6C1
    style End3 fill:#FFB6C1
    style End4 fill:#90EE90
    style End5 fill:#90EE90
    style End6 fill:#FFB6C1
    style End7 fill:#FFB6C1
    style End8 fill:#90EE90
    style OperationType fill:#FFE4B5
    style ValidateAmount fill:#FFE4B5
    style CheckSufficient fill:#FFE4B5
    style PaymentResult fill:#FFE4B5
```

## 8. Error Handling & Recovery Flow

```mermaid
flowchart TD
    Start([Error Occurs]) --> IdentifyError{Error Type?}
    
    IdentifyError -->|Network Error| RetryLogic[Retry with<br/>Exponential Backoff]
    RetryLogic --> RetryCount{Retry Count<br/>< 3?}
    RetryCount -->|Yes| WaitBackoff[Wait 2^n Seconds]
    WaitBackoff --> RetryRequest[Retry Request]
    RetryRequest --> RetryResult{Success?}
    RetryResult -->|Yes| End1([End: Recovered])
    RetryResult -->|No| RetryCount
    RetryCount -->|No| LogNetworkError[Log to Sentry]
    LogNetworkError --> ShowNetworkError[Show Network<br/>Error Toast]
    ShowNetworkError --> End2([End: Failed])
    
    IdentifyError -->|Generation Error| CheckCreditsDeducted{Credits<br/>Already Deducted?}
    CheckCreditsDeducted -->|Yes| RefundCredits[Refund Credits]
    RefundCredits --> UpdateProjectError[Update Project<br/>with Error Message]
    UpdateProjectError --> LogGenError[Log to Sentry<br/>with Context]
    LogGenError --> NotifyGenError[Notify User:<br/>Generation Failed]
    NotifyGenError --> End3([End: Refunded])
    
    CheckCreditsDeducted -->|No| LogGenError
    
    IdentifyError -->|Authentication Error| ClearSession[Clear Local Session]
    ClearSession --> RedirectLogin[Redirect to Login]
    RedirectLogin --> ShowAuthError[Show Authentication<br/>Error Message]
    ShowAuthError --> End4([End: Logout])
    
    IdentifyError -->|Validation Error| ExtractErrors[Extract Validation<br/>Error Messages]
    ExtractErrors --> DisplayFieldErrors[Display Errors<br/>Near Form Fields]
    DisplayFieldErrors --> HighlightFields[Highlight Invalid<br/>Fields in Red]
    HighlightFields --> End5([End: User Fix])
    
    IdentifyError -->|Database Error| LogDBError[Log to Sentry<br/>with Stack Trace]
    LogDBError --> CheckCritical{Critical<br/>Operation?}
    CheckCritical -->|Yes| RollbackTransaction[Rollback Database<br/>Transaction]
    RollbackTransaction --> NotifyAdmin[Send Alert to Admin]
    NotifyAdmin --> ShowMaintenanceMsg[Show Maintenance<br/>Message to User]
    ShowMaintenanceMsg --> End6([End: Critical])
    
    CheckCritical -->|No| ShowGenericError[Show Generic<br/>Error Message]
    ShowGenericError --> End7([End: Logged])
    
    IdentifyError -->|Unknown Error| LogUnknown[Log to Sentry as<br/>Unhandled Exception]
    LogUnknown --> ShowGeneric[Show Generic<br/>Error Message]
    ShowGeneric --> OfferSupport[Offer Contact<br/>Support Link]
    OfferSupport --> End8([End: Support])
    
    style Start fill:#FFB6C1
    style End1 fill:#90EE90
    style End2 fill:#FFB6C1
    style End3 fill:#87CEEB
    style End4 fill:#FFB6C1
    style End5 fill:#87CEEB
    style End6 fill:#FFB6C1
    style End7 fill:#FFB6C1
    style End8 fill:#FFB6C1
    style IdentifyError fill:#FFE4B5
    style RetryResult fill:#FFE4B5
    style CheckCreditsDeducted fill:#FFE4B5
```

## Activity Pattern Summary

### Parallel Activities (Fork/Join)
- AI image generation happens in parallel with frontend polling
- Multiple image uploads to Cloudinary happen concurrently
- Community feed loads thumbnails in parallel

### Decision Points (Diamond Shapes)
- Credit checks before operations
- Authentication validation
- File type/size validation
- Error type identification

### Loops (Back Arrows)
- Polling mechanism (every 5 seconds)
- Retry logic for failed requests
- Form validation re-attempts

### Swim Lanes (Not shown but implied)
- **User Lane**: User interactions
- **Frontend Lane**: Client-side processing
- **Backend Lane**: Server-side processing
- **External Services Lane**: AI, Storage, Auth

---

**Diagram Type**: Activity Diagram  
**Notation**: UML Activity (Flowchart)  
**Created**: February 18, 2026  
**Version**: 1.0.0
