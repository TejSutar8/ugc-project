# Collaboration Diagram - UGC Image Generator

## 1. Image Generation Collaboration

```mermaid
graph TB
    User["<b>:User</b><br/>(Actor)"]
    Frontend["<b>:React Frontend</b><br/>(Boundary)"]
    GenPage["<b>:Generator Page</b><br/>(Controller)"]
    AxiosClient["<b>:Axios Instance</b><br/>(Service)"]
    ExpressServer["<b>:Express Server</b><br/>(Controller)"]
    AuthMW["<b>:Auth Middleware</b><br/>(Controller)"]
    ProjCtrl["<b>:ProjectController</b><br/>(Controller)"]
    PrismaDB["<b>:Prisma Client</b><br/>(Entity)"]
    Cloudinary["<b>:Cloudinary</b><br/>(External)"]
    GeminiAI["<b>:Google Gemini</b><br/>(External)"]
    MulterMW["<b>:Multer Upload</b><br/>(Controller)"]

    User -->|"1: fillForm(images, metadata)"| Frontend
    Frontend -->|"2: handleSubmit(formData)"| GenPage
    GenPage -->|"3: POST /api/project/create"| AxiosClient
    AxiosClient -->|"4: attachJWTToken()"| AxiosClient
    AxiosClient -->|"5: sendRequest(formData)"| ExpressServer
    ExpressServer -->|"6: parseMultipart()"| MulterMW
    MulterMW -->|"7: saveFiles(uploads/)"| MulterMW
    ExpressServer -->|"8: validateToken()"| AuthMW
    AuthMW -->|"9: extractUserId()"| ProjCtrl
    ProjCtrl -->|"10: findUser(userId)"| PrismaDB
    ProjCtrl -->|"11: deductCredits(5)"| PrismaDB
    ProjCtrl -->|"12: uploadImages(files)"| Cloudinary
    ProjCtrl -->|"13: createProject(data)"| PrismaDB
    ProjCtrl -->|"14: generateContent(images, prompt)"| GeminiAI
    GeminiAI -->|"15: return(base64Image)"| ProjCtrl
    ProjCtrl -->|"16: uploadResult(base64)"| Cloudinary
    ProjCtrl -->|"17: updateProject(imageUrl)"| PrismaDB
    ProjCtrl -->|"18: return(projectId)"| ExpressServer
    ExpressServer -->|"19: response(201)"| AxiosClient
    AxiosClient -->|"20: navigate(/result/id)"| GenPage
    GenPage -->|"21: showResultPage()"| Frontend
```

## 2. User Authentication Collaboration

```mermaid
graph TB
    User["<b>:User</b><br/>(Actor)"]
    Frontend["<b>:React Frontend</b><br/>(Boundary)"]
    ClerkModal["<b>:Clerk Modal</b><br/>(Boundary)"]
    ClerkService["<b>:Clerk Service</b><br/>(External)"]
    Webhook["<b>:Webhook Endpoint</b><br/>(Controller)"]
    ClerkHandler["<b>:Clerk Handler</b><br/>(Controller)"]
    PrismaDB["<b>:Prisma Client</b><br/>(Entity)"]

    User -->|"1: clickSignUp()"| Frontend
    Frontend -->|"2: openModal()"| ClerkModal
    User -->|"3: enterCredentials()"| ClerkModal
    ClerkModal -->|"4: authenticate()"| ClerkService
    ClerkService -->|"5: return(JWT, session)"| ClerkModal
    ClerkModal -->|"6: setSession()"| Frontend
    ClerkService -->|"7: POST /api/clerk (user.created)"| Webhook
    Webhook -->|"8: verifySignature()"| ClerkHandler
    ClerkHandler -->|"9: createUser(id, email, name, 20 credits)"| PrismaDB
    PrismaDB -->|"10: return(user)"| ClerkHandler
    ClerkHandler -->|"11: return(200 OK)"| Webhook
```

## 3. Result Polling Collaboration

```mermaid
graph TB
    User["<b>:User</b><br/>(Actor)"]
    ResultPage["<b>:Result Page</b><br/>(Controller)"]
    AxiosClient["<b>:Axios Instance</b><br/>(Service)"]
    ExpressServer["<b>:Express Server</b><br/>(Controller)"]
    AuthMW["<b>:Auth Middleware</b><br/>(Controller)"]
    UserCtrl["<b>:UserController</b><br/>(Controller)"]
    PrismaDB["<b>:Prisma Client</b><br/>(Entity)"]

    User -->|"1: navigateToResult()"| ResultPage
    ResultPage -->|"2: useEffect(fetchProject)"| ResultPage
    ResultPage -->|"3: GET /api/user/projects/:id"| AxiosClient
    AxiosClient -->|"4: sendRequest()"| ExpressServer
    ExpressServer -->|"5: validateToken()"| AuthMW
    AuthMW -->|"6: getProjectById()"| UserCtrl
    UserCtrl -->|"7: findUnique(projectId)"| PrismaDB
    PrismaDB -->|"8: return(project)"| UserCtrl
    UserCtrl -->|"9: return(project)"| ExpressServer
    ExpressServer -->|"10: response(200)"| AxiosClient
    AxiosClient -->|"11: setProject(data)"| ResultPage
    ResultPage -->|"12: if isGenerating, setInterval(5s)"| ResultPage
    ResultPage -->|"13: displayResult()"| User
```

## Object Interaction Summary

| Object | Role | Collaborates With |
|---|---|---|
| User (Actor) | Initiates all interactions | Frontend components |
| React Frontend | UI boundary, form handling | Axios, Pages, Components |
| Generator Page | Orchestrates image upload flow | Axios, UploadZone, FormData |
| Result Page | Manages polling and display | Axios, Project state |
| Axios Instance | HTTP communication layer | Express Server (API) |
| Express Server | Request routing and middleware | Auth, Multer, Controllers |
| Auth Middleware | JWT token validation | Clerk service |
| ProjectController | Business logic for generations | Prisma, Cloudinary, Gemini |
| UserController | Business logic for user data | Prisma |
| Clerk Handler | Webhook event processing | Prisma |
| Prisma Client | Database operations | PostgreSQL |
| Cloudinary | Media file storage | File system |
| Google Gemini AI | Image/video generation | API calls |
