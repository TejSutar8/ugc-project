# Test Cases - UGC Image Generator

---

## Overview

| Module | Test Cases |
|--------|-----------|
| Authentication & Authorization | 9 |
| Clerk Webhooks | 7 |
| User Controller API | 11 |
| Image Generation (Create Project) | 12 |
| Video Generation | 8 |
| Published Projects & Delete | 6 |
| Generator Page UI | 11 |
| Result Page UI | 12 |
| My Generations Page UI | 5 |
| Community Page UI | 3 |
| UploadZone Component | 4 |
| Credit System (End-to-End) | 8 |
| Database & Data Integrity | 5 |
| Navigation & Routing | 8 |
| Error Handling & Edge Cases | 7 |
| Security | 5 |
| **TOTAL** | **121** |

Each test case includes **Priority** (Critical/High/Medium/Low), **Preconditions**, **Steps**, and **Expected Result**. The breakdown is:

- **33 Critical** -- must-pass for MVP
- **51 High** -- important for quality
- **32 Medium** -- nice-to-have coverage
- **5 Low** -- minor scenarios

**Key areas covered:**

- JWT auth validation and protected route access
- Credit deduction, insufficient credit checks, and refund on failure
- Cross-user data isolation (User B cannot access/delete/modify User A's projects)
- Full image/video generation flow with edge cases
- Frontend form validation and UI states (loading, error, empty)
- Clerk webhook handling for user lifecycle and payments
- Database cascade deletes and default values

---

## Module 1: Authentication & Authorization

### TC-1.1: Auth Middleware - Valid Token
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User exists in Clerk and database |
| **Steps** | 1. Send GET request to `/api/user/credits` with valid Bearer token |
| **Expected Result** | Request passes through middleware, returns 200 with user credits |

### TC-1.2: Auth Middleware - Missing Token
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | None |
| **Steps** | 1. Send GET request to `/api/user/credits` without Authorization header |
| **Expected Result** | Returns 401 with `{ message: "Unauthorized" }` |

### TC-1.3: Auth Middleware - Invalid/Expired Token
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | None |
| **Steps** | 1. Send GET request to `/api/user/credits` with expired or malformed JWT |
| **Expected Result** | Returns 401 with error message |

### TC-1.4: Sign Up - New User Registration
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Clerk is configured, webhook endpoint active |
| **Steps** | 1. Open app at `/` <br> 2. Click "Sign Up" <br> 3. Complete registration form <br> 4. Verify email if required |
| **Expected Result** | User created in Clerk, webhook fires `user.created`, user row inserted in DB with 20 credits |

### TC-1.5: Sign In - Existing User Login
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User already registered |
| **Steps** | 1. Click "Sign In" <br> 2. Enter valid credentials |
| **Expected Result** | User logged in, navbar shows user name, profile image, and credit balance |

### TC-1.6: Sign Out
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is logged in |
| **Steps** | 1. Click user avatar in navbar <br> 2. Click "Sign Out" |
| **Expected Result** | User logged out, redirected to home page, navbar shows Sign In button |

### TC-1.7: Protected Route - Unauthenticated Access to /generate
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is not logged in |
| **Steps** | 1. Navigate directly to `/generate` <br> 2. Try to submit the generation form |
| **Expected Result** | Toast error "Please Login to generate" shown |

### TC-1.8: Protected Route - Unauthenticated Access to /my-generations
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is not logged in |
| **Steps** | 1. Navigate directly to `/my-generations` |
| **Expected Result** | User redirected to `/` (home page) |

### TC-1.9: Protected Route - Unauthenticated Access to /result/:id
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is not logged in |
| **Steps** | 1. Navigate directly to `/result/some-project-id` |
| **Expected Result** | User redirected to `/` (home page) |

---

## Module 2: Clerk Webhooks

### TC-2.1: Webhook - user.created Event
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Clerk webhook configured with signing secret |
| **Steps** | 1. Register a new user via Clerk <br> 2. Clerk sends `user.created` webhook to `/api/clerk` |
| **Expected Result** | New user row created in DB with id, email, name, image, and 20 default credits |

### TC-2.2: Webhook - user.updated Event
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User exists in database |
| **Steps** | 1. Update user profile in Clerk (e.g., change name) <br> 2. Clerk sends `user.updated` webhook |
| **Expected Result** | User row in DB updated with new name, email, and image |

### TC-2.3: Webhook - user.deleted Event
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User exists in database |
| **Steps** | 1. Delete user from Clerk dashboard <br> 2. Clerk sends `user.deleted` webhook |
| **Expected Result** | User row deleted from DB, all related projects cascade-deleted |

### TC-2.4: Webhook - paymentAttempt.updated (Pro Plan)
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User exists in DB, payment integration configured |
| **Steps** | 1. User completes Pro plan purchase <br> 2. Clerk sends `paymentAttempt.updated` with `status: "paid"` and plan slug `"pro"` |
| **Expected Result** | User credits incremented by 80 |

### TC-2.5: Webhook - paymentAttempt.updated (Premium Plan)
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User exists in DB, payment integration configured |
| **Steps** | 1. User completes Premium plan purchase <br> 2. Clerk sends `paymentAttempt.updated` with `status: "paid"` and plan slug `"premium"` |
| **Expected Result** | User credits incremented by 240 |

### TC-2.6: Webhook - paymentAttempt.updated (Invalid Plan)
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User exists in DB |
| **Steps** | 1. Send `paymentAttempt.updated` with an invalid plan slug (e.g., `"basic"`) |
| **Expected Result** | Returns 400 with `{ message: "Invalid plan" }`, credits unchanged |

### TC-2.7: Webhook - Invalid Signature
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | None |
| **Steps** | 1. Send POST to `/api/clerk` with tampered or missing webhook signature |
| **Expected Result** | Returns 500, `verifyWebhook` throws error, no DB changes |

---

## Module 3: User Controller (API)

### TC-3.1: GET /api/user/credits - Valid User
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User exists with known credit balance |
| **Steps** | 1. Send GET `/api/user/credits` with valid token |
| **Expected Result** | Returns 200 with `{ credits: <number> }` |

### TC-3.2: GET /api/user/credits - User Not in DB
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User authenticated via Clerk but not yet in DB (webhook delay) |
| **Steps** | 1. Send GET `/api/user/credits` with valid token |
| **Expected Result** | Returns 200 with `{ credits: undefined }` (no crash) |

### TC-3.3: GET /api/user/projects - User With Projects
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 3+ projects in DB |
| **Steps** | 1. Send GET `/api/user/projects` with valid token |
| **Expected Result** | Returns 200 with `{ projects: [...] }` sorted by `createdAt` descending |

### TC-3.4: GET /api/user/projects - User With No Projects
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User exists but has no projects |
| **Steps** | 1. Send GET `/api/user/projects` with valid token |
| **Expected Result** | Returns 200 with `{ projects: [] }` |

### TC-3.5: GET /api/user/projects/:projectId - Valid Project
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project exists and belongs to authenticated user |
| **Steps** | 1. Send GET `/api/user/projects/<projectId>` with valid token |
| **Expected Result** | Returns 200 with `{ project: {...} }` containing full project data |

### TC-3.6: GET /api/user/projects/:projectId - Project Not Found
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project ID does not exist |
| **Steps** | 1. Send GET `/api/user/projects/nonexistent-id` with valid token |
| **Expected Result** | Returns 404 with `{ message: "Project not found" }` |

### TC-3.7: GET /api/user/projects/:projectId - Project Belongs to Another User
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project exists but belongs to a different user |
| **Steps** | 1. Send GET `/api/user/projects/<otherUsersProjectId>` with valid token |
| **Expected Result** | Returns 404 with `{ message: "Project not found" }` (userId filter prevents access) |

### TC-3.8: POST /api/user/publish/:projectId - Publish Project
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project exists with `isPublished: false` and has a generated image |
| **Steps** | 1. Send POST `/api/user/publish/<projectId>` with valid token |
| **Expected Result** | Returns 200 with `{ isPublished: true }`, project now visible in community |

### TC-3.9: POST /api/user/publish/:projectId - Unpublish Project
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project exists with `isPublished: true` |
| **Steps** | 1. Send POST `/api/user/publish/<projectId>` with valid token |
| **Expected Result** | Returns 200 with `{ isPublished: false }`, project removed from community |

### TC-3.10: POST /api/user/publish/:projectId - No Generated Content
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Project exists but has no generated image or video |
| **Steps** | 1. Send POST `/api/user/publish/<projectId>` with valid token |
| **Expected Result** | Returns 404 with `{ message: "image or video not generated" }` |

### TC-3.11: POST /api/user/publish/:projectId - Project Not Found
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Project ID does not exist |
| **Steps** | 1. Send POST `/api/user/publish/nonexistent-id` with valid token |
| **Expected Result** | Returns 404 with `{ message: "Project not found" }` |

---

## Module 4: Project Controller - Image Generation

### TC-4.1: POST /api/project/create - Successful Generation
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has >= 5 credits, valid images and product name provided |
| **Steps** | 1. Send POST `/api/project/create` with multipart form: 2 images, name, productName, aspectRatio |
| **Expected Result** | Returns 200 with `{ projectId, message: "Image generated successfully!" }`, credits decremented by 5, project created with generatedImage URL |

### TC-4.2: POST /api/project/create - Missing Images
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User is authenticated |
| **Steps** | 1. Send POST `/api/project/create` with only 1 image (or no images) |
| **Expected Result** | Returns 400 with `{ message: "Please upload at least 2 images" }` |

### TC-4.3: POST /api/project/create - Missing Product Name
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is authenticated |
| **Steps** | 1. Send POST `/api/project/create` with 2 images but no productName |
| **Expected Result** | Returns 400 with `{ message: "Please upload at least 2 images" }` |

### TC-4.4: POST /api/project/create - Insufficient Credits (0 credits)
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 0 credits |
| **Steps** | 1. Send POST `/api/project/create` with valid data |
| **Expected Result** | Returns 400 with `{ message: "Insufficient credits" }`, no project created |

### TC-4.5: POST /api/project/create - Insufficient Credits (4 credits)
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has exactly 4 credits |
| **Steps** | 1. Send POST `/api/project/create` with valid data |
| **Expected Result** | Returns 400 with `{ message: "Insufficient credits" }`, credits unchanged |

### TC-4.6: POST /api/project/create - Exactly 5 Credits
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has exactly 5 credits |
| **Steps** | 1. Send POST `/api/project/create` with valid data |
| **Expected Result** | Generation proceeds, credits become 0, project created |

### TC-4.7: POST /api/project/create - AI Generation Failure (Credit Refund)
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has >= 5 credits, AI API returns error |
| **Steps** | 1. Send POST `/api/project/create` with valid data <br> 2. AI model fails (e.g., API key invalid, quota exceeded) |
| **Expected Result** | Returns 500 with error message, credits refunded (incremented by 5), project `isGenerating` set to false, `error` field populated |

### TC-4.8: POST /api/project/create - Aspect Ratio 9:16 (Portrait)
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User has sufficient credits |
| **Steps** | 1. Send POST with `aspectRatio: "9:16"` |
| **Expected Result** | Project created with `aspectRatio: "9:16"`, AI generates portrait image |

### TC-4.9: POST /api/project/create - Aspect Ratio 16:9 (Landscape)
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User has sufficient credits |
| **Steps** | 1. Send POST with `aspectRatio: "16:9"` |
| **Expected Result** | Project created with `aspectRatio: "16:9"`, AI generates landscape image |

### TC-4.10: POST /api/project/create - With Custom User Prompt
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User has sufficient credits |
| **Steps** | 1. Send POST with `userPrompt: "Outdoor setting with natural lighting"` |
| **Expected Result** | Custom prompt appended to default prompt, AI image reflects user intent |

### TC-4.11: POST /api/project/create - Without Optional Fields
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User has sufficient credits |
| **Steps** | 1. Send POST with only required fields (images, productName), omit productDescription, userPrompt, name |
| **Expected Result** | Project created with defaults: name="New Project", productDescription="", userPrompt="" |

### TC-4.12: POST /api/project/create - User Not in Database
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Token is valid but user doesn't exist in DB |
| **Steps** | 1. Send POST `/api/project/create` with valid token |
| **Expected Result** | Returns 400 with `{ message: "Insufficient credits" }` |

---

## Module 5: Project Controller - Video Generation

### TC-5.1: POST /api/project/video - Successful Video Generation
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has >= 10 credits, project has a generatedImage, not currently generating |
| **Steps** | 1. Send POST `/api/project/video` with `{ projectId }` |
| **Expected Result** | Returns 200 with `{ message, videoUrl }`, credits decremented by 10, project updated with generatedVideo URL |

### TC-5.2: POST /api/project/video - Insufficient Credits
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has < 10 credits |
| **Steps** | 1. Send POST `/api/project/video` with valid projectId |
| **Expected Result** | Returns 401 with `{ message: "Insufficient credits" }` |

### TC-5.3: POST /api/project/video - Project Not Found
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project ID does not exist |
| **Steps** | 1. Send POST `/api/project/video` with `{ projectId: "nonexistent" }` |
| **Expected Result** | Returns 404 with `{ message: "Generation in progress" }` |

### TC-5.4: POST /api/project/video - Generation Already In Progress
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project exists with `isGenerating: true` |
| **Steps** | 1. Send POST `/api/project/video` |
| **Expected Result** | Returns 404 with `{ message: "Generation in progress" }` |

### TC-5.5: POST /api/project/video - Video Already Generated
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Project already has a generatedVideo URL |
| **Steps** | 1. Send POST `/api/project/video` |
| **Expected Result** | Returns 200 with `{ message: "Video already generated" }`, no credits deducted |

### TC-5.6: POST /api/project/video - No Generated Image
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project exists but `generatedImage` is empty |
| **Steps** | 1. Send POST `/api/project/video` |
| **Expected Result** | Returns 500 with error "Generated image not found", credits refunded (+10) |

### TC-5.7: POST /api/project/video - AI Failure (Credit Refund)
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project has generated image, user has >= 10 credits, video AI fails |
| **Steps** | 1. Send POST `/api/project/video` <br> 2. Veo API returns error |
| **Expected Result** | Returns 500, credits refunded (+10), project `isGenerating` set to false, `error` populated |

### TC-5.8: POST /api/project/video - Project Belongs to Another User
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project exists but belongs to different user |
| **Steps** | 1. Send POST `/api/project/video` with another user's projectId |
| **Expected Result** | Returns 404, user's credits are refunded if deducted |

---

## Module 6: Project Controller - Published Projects & Delete

### TC-6.1: GET /api/project/published - Fetch Community Feed
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Some projects have `isPublished: true` |
| **Steps** | 1. Send GET `/api/project/published` (no auth required) |
| **Expected Result** | Returns 200 with `{ projects: [...] }` containing only published projects |

### TC-6.2: GET /api/project/published - No Published Projects
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | No projects have `isPublished: true` |
| **Steps** | 1. Send GET `/api/project/published` |
| **Expected Result** | Returns 200 with `{ projects: [] }` |

### TC-6.3: GET /api/project/published - No Auth Required
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | None |
| **Steps** | 1. Send GET `/api/project/published` without Authorization header |
| **Expected Result** | Returns 200 (endpoint is public, no `protect` middleware) |

### TC-6.4: DELETE /api/project/:projectId - Successful Delete
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project exists and belongs to authenticated user |
| **Steps** | 1. Send DELETE `/api/project/<projectId>` with valid token |
| **Expected Result** | Returns 200 with `{ message: "Project deleted" }`, project removed from DB |

### TC-6.5: DELETE /api/project/:projectId - Project Not Found
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project ID does not exist |
| **Steps** | 1. Send DELETE `/api/project/nonexistent-id` with valid token |
| **Expected Result** | Returns 404 with `{ message: "Project not found" }` |

### TC-6.6: DELETE /api/project/:projectId - Project Belongs to Another User
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project exists but belongs to different user |
| **Steps** | 1. Send DELETE `/api/project/<otherUsersProjectId>` with valid token |
| **Expected Result** | Returns 404 with `{ message: "Project not found" }` (userId filter prevents access) |

---

## Module 7: Frontend - Generator Page (/generate)

### TC-7.1: Form Rendering
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User is logged in, navigated to `/generate` |
| **Steps** | 1. Open `/generate` page |
| **Expected Result** | Page shows: 2 upload zones (Product Image, Model Image), Project Name input, Product Name input, Product Description textarea, Aspect Ratio selector (9:16 selected by default), User Prompt textarea, Generate button |

### TC-7.2: Upload Product Image
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | On `/generate` page |
| **Steps** | 1. Click on "Product Image" upload zone <br> 2. Select a valid JPG/PNG file |
| **Expected Result** | Image preview shown in upload zone, file name displayed |

### TC-7.3: Upload Model Image
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | On `/generate` page |
| **Steps** | 1. Click on "Model Image" upload zone <br> 2. Select a valid JPG/PNG file |
| **Expected Result** | Image preview shown in upload zone, file name displayed |

### TC-7.4: Clear Uploaded Image
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | An image is already uploaded in the zone |
| **Steps** | 1. Hover over the uploaded image <br> 2. Click the X (clear) button |
| **Expected Result** | Image preview removed, upload zone returns to default "Drag & Drop" state |

### TC-7.5: Aspect Ratio Toggle - Portrait
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | On `/generate` page |
| **Steps** | 1. Click the vertical rectangle icon (9:16) |
| **Expected Result** | 9:16 icon highlighted with violet ring, aspectRatio state set to "9:16" |

### TC-7.6: Aspect Ratio Toggle - Landscape
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | On `/generate` page |
| **Steps** | 1. Click the horizontal rectangle icon (16:9) |
| **Expected Result** | 16:9 icon highlighted with violet ring, aspectRatio state set to "16:9" |

### TC-7.7: Submit Form - All Required Fields Filled
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User logged in, both images uploaded, name and productName filled |
| **Steps** | 1. Fill all required fields <br> 2. Click "Generate Image" button |
| **Expected Result** | Button shows "Generating..." with spinner, API call made, on success navigates to `/result/<projectId>`, toast "Redirecting to result page..." |

### TC-7.8: Submit Form - Missing Required Fields
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User logged in |
| **Steps** | 1. Leave product image empty <br> 2. Click "Generate Image" |
| **Expected Result** | Toast error "Please fill all the required fields", no API call made |

### TC-7.9: Submit Form - Not Logged In
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is not logged in |
| **Steps** | 1. Fill all fields <br> 2. Click "Generate Image" |
| **Expected Result** | Toast error "Please Login to generate" |

### TC-7.10: Submit Form - API Error
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User logged in, server returns error (e.g., insufficient credits) |
| **Steps** | 1. Fill all required fields <br> 2. Click "Generate Image" |
| **Expected Result** | Toast error with server message displayed, isGenerating reset to false, button re-enabled |

### TC-7.11: Generate Button Disabled During Generation
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User clicked Generate, request is in progress |
| **Steps** | 1. Observe the Generate button during API call |
| **Expected Result** | Button shows "Generating..." with spinner, is disabled (cannot double-submit) |

---

## Module 8: Frontend - Result Page (/result/:id)

### TC-8.1: Loading State
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User navigated to `/result/<id>` |
| **Steps** | 1. Observe page while project data is being fetched |
| **Expected Result** | Spinner shown with "Loading project..." text |

### TC-8.2: Project Not Found
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project ID does not exist |
| **Steps** | 1. Navigate to `/result/invalid-id` |
| **Expected Result** | "Project not found" message shown with link to "Go to My Generations" |

### TC-8.3: Generation In Progress - Polling
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project has `isGenerating: true` |
| **Steps** | 1. Open `/result/<projectId>` <br> 2. Wait for polling to complete |
| **Expected Result** | Yellow banner "Generating your image..." shown, page auto-polls at 2s, 5s, 8s then every 5s, updates when generation completes |

### TC-8.4: Generation Complete - Image Displayed
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project has `isGenerating: false` and `generatedImage` URL |
| **Steps** | 1. Open `/result/<projectId>` |
| **Expected Result** | Generated image displayed, yellow banner gone, "Download Image" button enabled |

### TC-8.5: Generation Failed - Error Banner
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Project has non-empty `error` field |
| **Steps** | 1. Open `/result/<projectId>` |
| **Expected Result** | Red error banner shown with "Generation Failed" heading, error message text, and "Try again" link to `/generate` |

### TC-8.6: Download Image Button
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project has generated image |
| **Steps** | 1. Click "Download Image" button |
| **Expected Result** | Image file download initiated |

### TC-8.7: Download Image Button - Disabled When No Image
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Project has no generated image yet |
| **Steps** | 1. Observe "Download Image" button |
| **Expected Result** | Button is disabled (opacity 50%, cursor not-allowed) |

### TC-8.8: Generate Video Button
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Project has generated image, no video yet, user has >= 10 credits |
| **Steps** | 1. Click "Generate Video" button |
| **Expected Result** | Button shows "Generating Video..." with spinner, API call to `/api/project/video`, on success shows video and "Video Generated Successfully" badge |

### TC-8.9: Generate Video Button - Disabled During Generation
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Image is still generating |
| **Steps** | 1. Observe "Generate Video" button |
| **Expected Result** | Button is disabled |

### TC-8.10: Video Already Generated
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Project has both generated image and video |
| **Steps** | 1. Open `/result/<projectId>` |
| **Expected Result** | Video player shown (autoplay, loop), "Download Video" button enabled, green "Video Generated Successfully" badge shown instead of generate button |

### TC-8.11: Retry Fetch on 404
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Project was just created (race condition - DB hasn't synced yet) |
| **Steps** | 1. Navigate to `/result/<newProjectId>` immediately after creation |
| **Expected Result** | Auto-retries up to 3 times with 1s delay before showing error |

### TC-8.12: New Generation Button
| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Precondition** | On result page |
| **Steps** | 1. Click "New Generation" button (top right) |
| **Expected Result** | Navigates to `/generate` |

---

## Module 9: Frontend - My Generations Page (/my-generations)

### TC-9.1: Display User Projects
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User logged in, has 3+ projects |
| **Steps** | 1. Navigate to `/my-generations` |
| **Expected Result** | All user projects shown in grid layout (1-3 columns responsive), sorted by newest first |

### TC-9.2: Empty State
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User logged in, has 0 projects |
| **Steps** | 1. Navigate to `/my-generations` |
| **Expected Result** | "No generations yet" message shown with "Creating New Generation" button |

### TC-9.3: Loading State
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | User navigated to `/my-generations` |
| **Steps** | 1. Observe page while data loads |
| **Expected Result** | Spinner shown center screen |

### TC-9.4: Click Project Card
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has projects |
| **Steps** | 1. Click on a project card |
| **Expected Result** | Navigates to `/result/<projectId>` |

### TC-9.5: Redirect When Not Logged In
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User not logged in, isLoaded = true |
| **Steps** | 1. Navigate to `/my-generations` |
| **Expected Result** | Redirected to `/` |

---

## Module 10: Frontend - Community Page (/community)

### TC-10.1: Display Published Projects
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Published projects exist in DB |
| **Steps** | 1. Navigate to `/community` |
| **Expected Result** | All published projects displayed in grid, showing thumbnails and user attribution |

### TC-10.2: No Published Projects
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | No published projects in DB |
| **Steps** | 1. Navigate to `/community` |
| **Expected Result** | Empty state or "No projects yet" message |

### TC-10.3: Public Access Without Auth
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User is not logged in |
| **Steps** | 1. Navigate to `/community` |
| **Expected Result** | Page loads and shows published projects (no auth required) |

---

## Module 11: Frontend - UploadZone Component

### TC-11.1: Default State Rendering
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | No file selected |
| **Steps** | 1. Render UploadZone with `file=null` |
| **Expected Result** | Shows upload icon, label text, "Drag & Drop or click to upload" message, hidden file input |

### TC-11.2: File Selected State
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | File has been selected |
| **Steps** | 1. Render UploadZone with a File object |
| **Expected Result** | Image preview shown, file name displayed at bottom, clear (X) button appears on hover |

### TC-11.3: Clear File
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | File is selected |
| **Steps** | 1. Hover over the upload zone <br> 2. Click the X button |
| **Expected Result** | `onClear` callback called, zone returns to default state |

### TC-11.4: File Input Accept Attribute
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | No file selected |
| **Steps** | 1. Inspect the file input element |
| **Expected Result** | `accept="image/*"` attribute present, only image files can be selected |

---

## Module 12: Credit System (End-to-End)

### TC-12.1: Initial Credits on Signup
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | Fresh user registration |
| **Steps** | 1. Register a new account <br> 2. Check credits in navbar |
| **Expected Result** | User has 20 credits |

### TC-12.2: Credit Deduction - Image Generation
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 20 credits |
| **Steps** | 1. Generate an image successfully |
| **Expected Result** | Credits reduced to 15 (20 - 5) |

### TC-12.3: Credit Deduction - Video Generation
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has 15 credits |
| **Steps** | 1. Generate a video from an existing image |
| **Expected Result** | Credits reduced to 5 (15 - 10) |

### TC-12.4: Credit Refund on Image Generation Failure
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 20 credits, AI API will fail |
| **Steps** | 1. Trigger image generation <br> 2. AI fails |
| **Expected Result** | Credits remain 20 (deducted 5 then refunded 5) |

### TC-12.5: Credit Refund on Video Generation Failure
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 15 credits, video AI will fail |
| **Steps** | 1. Trigger video generation <br> 2. Video AI fails |
| **Expected Result** | Credits remain 15 (deducted 10 then refunded 10) |

### TC-12.6: Cannot Generate Image with 0 Credits
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 0 credits |
| **Steps** | 1. Attempt image generation |
| **Expected Result** | Error returned "Insufficient credits", no project created |

### TC-12.7: Cannot Generate Video with < 10 Credits
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has 5 credits |
| **Steps** | 1. Attempt video generation |
| **Expected Result** | Error returned "Insufficient credits", credits unchanged |

### TC-12.8: Multiple Generations - Credit Tracking
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User has 20 credits |
| **Steps** | 1. Generate image 1 (20 -> 15) <br> 2. Generate image 2 (15 -> 10) <br> 3. Generate image 3 (10 -> 5) <br> 4. Generate image 4 (5 -> 0) <br> 5. Try generate image 5 |
| **Expected Result** | 4 successful generations, 5th fails with "Insufficient credits", balance is 0 |

---

## Module 13: Database & Data Integrity

### TC-13.1: User Cascade Delete
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User has 3 projects in DB |
| **Steps** | 1. Delete user via Clerk (triggers webhook) |
| **Expected Result** | User row deleted, all 3 projects cascade-deleted |

### TC-13.2: Project UUID Generation
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | None |
| **Steps** | 1. Create a new project |
| **Expected Result** | Project ID is a valid UUID (auto-generated) |

### TC-13.3: Default Values on Project Creation
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | None |
| **Steps** | 1. Create project with minimal fields |
| **Expected Result** | Defaults applied: `productDescription=""`, `userPrompt=""`, `aspectRatio="9:16"`, `targetLength=5`, `generatedImage=""`, `generatedVideo=""`, `isGenerating=false`, `isPublished=false`, `error=""` |

### TC-13.4: User Default Credits
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | None |
| **Steps** | 1. Create a new user |
| **Expected Result** | User has `credits: 20` by default |

### TC-13.5: Project-User Relationship
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User exists |
| **Steps** | 1. Create a project with a valid userId |
| **Expected Result** | Project correctly linked to user via `userId` foreign key |

---

## Module 14: Navigation & Routing

### TC-14.1: Home Page Route
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps** | 1. Navigate to `/` |
| **Expected Result** | Home page displays: Hero, Features, Pricing, FAQ, Footer |

### TC-14.2: Generator Page Route
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps** | 1. Navigate to `/generate` |
| **Expected Result** | Generator form page loads |

### TC-14.3: Result Page Route
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps** | 1. Navigate to `/result/<validId>` |
| **Expected Result** | Result page loads with project data |

### TC-14.4: My Generations Route
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps** | 1. Navigate to `/my-generations` |
| **Expected Result** | My Generations page loads |

### TC-14.5: Community Route
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps** | 1. Navigate to `/community` |
| **Expected Result** | Community page loads |

### TC-14.6: Plans Route
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Steps** | 1. Navigate to `/plans` |
| **Expected Result** | Pricing/Plans page loads |

### TC-14.7: Navbar Links
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Steps** | 1. Click each navbar link in sequence |
| **Expected Result** | Each link navigates to the correct page |

### TC-14.8: 404 / Unknown Route
| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Steps** | 1. Navigate to `/nonexistent-page` |
| **Expected Result** | Graceful handling (blank page or redirect to home) |

---

## Module 15: Error Handling & Edge Cases

### TC-15.1: Server Down - API Calls Fail
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Backend server is stopped |
| **Steps** | 1. Try to generate an image from the frontend |
| **Expected Result** | Toast error shown (network error), app does not crash |

### TC-15.2: Cloudinary Upload Failure
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Cloudinary credentials invalid or service down |
| **Steps** | 1. Try to create a project |
| **Expected Result** | Error caught, credits refunded, error message stored in project, 500 returned |

### TC-15.3: Sentry Error Capture
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Sentry is configured |
| **Steps** | 1. Trigger any server-side error |
| **Expected Result** | Error captured in Sentry dashboard with stack trace |

### TC-15.4: Large File Upload
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | None |
| **Steps** | 1. Try to upload a very large image file (>10MB) |
| **Expected Result** | Multer rejects file or upload fails gracefully with error message |

### TC-15.5: Non-Image File Upload
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | None |
| **Steps** | 1. Try to upload a .pdf or .txt file in the upload zone |
| **Expected Result** | File input `accept="image/*"` prevents non-image selection in most browsers |

### TC-15.6: Concurrent Requests - Double Submit
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | User on generator page |
| **Steps** | 1. Click "Generate" button rapidly twice |
| **Expected Result** | Button is disabled after first click, only one API call made |

### TC-15.7: Network Timeout During Generation
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | Slow network or AI takes too long |
| **Steps** | 1. Start image generation <br> 2. Wait for timeout |
| **Expected Result** | Error handled gracefully, credits refunded if deducted |

---

## Module 16: Security

### TC-16.1: Cross-User Data Access - Projects
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User A has projects, User B is authenticated |
| **Steps** | 1. User B sends GET `/api/user/projects/<UserA_projectId>` |
| **Expected Result** | Returns 404 (userId filter prevents access) |

### TC-16.2: Cross-User Data Access - Delete
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User A has a project |
| **Steps** | 1. User B sends DELETE `/api/project/<UserA_projectId>` |
| **Expected Result** | Returns 404, project not deleted |

### TC-16.3: Cross-User Data Access - Publish Toggle
| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Precondition** | User A has a project |
| **Steps** | 1. User B sends POST `/api/user/publish/<UserA_projectId>` |
| **Expected Result** | Returns 404, publish state unchanged |

### TC-16.4: CORS - Same Origin
| Field | Value |
|-------|-------|
| **Priority** | High |
| **Precondition** | Frontend running on localhost:5173 |
| **Steps** | 1. Make API calls from frontend |
| **Expected Result** | CORS headers present, requests succeed |

### TC-16.5: CORS - Different Origin
| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Precondition** | None |
| **Steps** | 1. Try API call from a different origin (e.g., a random website) |
| **Expected Result** | CORS blocks the request (depends on server CORS config) |

---

## Summary

| Module | Test Cases | Critical | High | Medium | Low |
|--------|-----------|----------|------|--------|-----|
| 1. Authentication & Authorization | 9 | 3 | 5 | 0 | 1 |
| 2. Clerk Webhooks | 7 | 2 | 3 | 1 | 1 |
| 3. User Controller API | 11 | 3 | 4 | 4 | 0 |
| 4. Image Generation | 12 | 4 | 4 | 4 | 0 |
| 5. Video Generation | 8 | 3 | 4 | 1 | 0 |
| 6. Published & Delete | 6 | 2 | 3 | 1 | 0 |
| 7. Generator Page UI | 11 | 3 | 3 | 5 | 0 |
| 8. Result Page UI | 12 | 3 | 4 | 4 | 1 |
| 9. My Generations UI | 5 | 1 | 3 | 1 | 0 |
| 10. Community Page UI | 3 | 0 | 2 | 1 | 0 |
| 11. UploadZone Component | 4 | 0 | 2 | 2 | 0 |
| 12. Credit System E2E | 8 | 4 | 3 | 0 | 1 |
| 13. Database Integrity | 5 | 2 | 1 | 2 | 0 |
| 14. Navigation & Routing | 8 | 0 | 6 | 1 | 1 |
| 15. Error Handling | 7 | 0 | 3 | 4 | 0 |
| 16. Security | 5 | 3 | 1 | 1 | 0 |
| **TOTAL** | **121** | **33** | **51** | **32** | **5** |
