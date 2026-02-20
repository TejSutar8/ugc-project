# Package Diagrams - UGC Image Generator

## 1. Overall System Package Diagram

```mermaid
graph TB
    subgraph RootPackage["ugc-project (Root)"]
        subgraph ClientPkg["client/"]
            direction TB
            ClientSrc["src/"]
            ClientPublic["public/"]
            ClientConfig["Configuration<br/>vite.config.ts<br/>tsconfig.json<br/>eslint.config.js"]
        end

        subgraph ServerPkg["server/"]
            direction TB
            ServerSrc["Source Files"]
            ServerPrisma["prisma/"]
            ServerGenerated["generated/"]
            ServerUploads["uploads/"]
            ServerVideos["videos/"]
            ServerConfigFiles["Configuration<br/>tsconfig.json<br/>prisma.config.ts"]
        end

        subgraph DocsPkg["docs/"]
            ArchDocs["Architecture Docs"]
            DiagramsHTML["diagrams.html"]
        end

        subgraph DiagramsPkg["diagrams/"]
            UMLDiagrams["UML Diagrams<br/>(10 diagram files)"]
        end

        RootFiles["Root Files<br/>README.md<br/>COMPLETE-PROJECT-INFO.md<br/>MVP.md<br/>TESTING.md<br/>setup.ps1"]
    end

    ClientPkg ==>|"HTTP REST API"| ServerPkg
    ServerPkg -.->|"references"| DocsPkg
```

## 2. Client Package Diagram (Detailed)

```mermaid
graph TB
    subgraph ClientPackage["client/src/"]
        subgraph PagesPkg["pages/"]
            Home["Home.tsx"]
            Generator["Genetator.tsx"]
            Result["Result.tsx"]
            MyGenerations["MyGenerations.tsx"]
            Community["Community.tsx"]
            Plans["Plans.tsx"]
            Loading["Loading.tsx"]
        end

        subgraph ComponentsPkg["components/"]
            subgraph LayoutComponents["Layout"]
                Navbar["Navbar.tsx"]
                Footer["Footer.tsx"]
            end
            subgraph UIComponents["UI Components"]
                UploadZone["UploadZone.tsx"]
                ProjectCard["ProjectCard.tsx"]
                Buttons["Buttons.tsx"]
                Title["Title.tsx"]
                SoftBackdrop["SoftBackdrop.tsx"]
            end
            subgraph MarketingComponents["Marketing Sections"]
                Hero["Hero.tsx"]
                Features["Features.tsx"]
                Pricing["Pricing.tsx"]
                Faq["Faq.tsx"]
                CTA["CTA.tsx"]
            end
            subgraph UtilComponents["Utility"]
                Lenis["lenis.tsx"]
            end
        end

        subgraph ConfigsPkg["configs/"]
            AxiosConfig["axios.ts<br/>(HTTP Client Instance)"]
        end

        subgraph TypesPkg["types/"]
            TypeDefs["index.ts<br/>(User, Project, UploadZoneProps)"]
        end

        subgraph AssetsPkg["assets/"]
            AssetsFile["assets.tsx<br/>(Static images, logos)"]
            DummyData["dummy-data.tsx<br/>(Mock data)"]
            SchemaRef["schema.prisma<br/>(Reference copy)"]
        end

        EntryPoint["main.tsx<br/>(React Entry Point)"]
        AppFile["App.tsx<br/>(Route Definitions)"]
        Styles["index.css<br/>(Global Styles)"]
    end

    %% Dependencies
    EntryPoint --> AppFile
    AppFile --> PagesPkg
    PagesPkg --> ComponentsPkg
    PagesPkg --> ConfigsPkg
    PagesPkg --> TypesPkg
    ComponentsPkg --> AssetsPkg
    ComponentsPkg --> TypesPkg

    Home --> Hero
    Home --> Features
    Home --> Pricing
    Home --> Faq
    Home --> CTA
    Generator --> UploadZone
    MyGenerations --> ProjectCard
    Community --> ProjectCard

    %% External Dependencies
    subgraph ExternalPkgs["External Packages (node_modules)"]
        React["react<br/>react-dom"]
        ReactRouter["react-router-dom"]
        ClerkReact["@clerk/clerk-react"]
        Axios["axios"]
        FramerMotion["framer-motion"]
        HotToast["react-hot-toast"]
        Lucide["lucide-react"]
        LenisLib["lenis"]
    end

    EntryPoint -.-> React
    EntryPoint -.-> ClerkReact
    AppFile -.-> ReactRouter
    ConfigsPkg -.-> Axios
    ComponentsPkg -.-> FramerMotion
    ComponentsPkg -.-> HotToast
    ComponentsPkg -.-> Lucide
    UtilComponents -.-> LenisLib
```

## 3. Server Package Diagram (Detailed)

```mermaid
graph TB
    subgraph ServerPackage["server/"]
        ServerEntry["server.ts<br/>(Express App Entry Point)"]

        subgraph RoutesPkg["routes/"]
            ProjectRoutes["projectRoutes.ts<br/>- POST /create<br/>- POST /video<br/>- GET /published<br/>- DELETE /:projectId"]
            UserRoutes["userRoutes.ts<br/>- GET /credits<br/>- GET /projects<br/>- GET /projects/:id<br/>- POST /publish/:id"]
        end

        subgraph ControllersPkg["controllers/"]
            ProjectCtrl["projectController.ts<br/>- createProject()<br/>- createVideo()<br/>- deleteProject()<br/>- getAllPublishedProjects()"]
            UserCtrl["userController.ts<br/>- getUserCredits()<br/>- getAllProjects()<br/>- getProjectById()<br/>- toggleProjectPublic()"]
            ClerkCtrl["clerk.ts<br/>- handleWebhook()"]
        end

        subgraph MiddlewaresPkg["middlewares/"]
            AuthMiddleware["auth.ts<br/>- protect()"]
        end

        subgraph ConfigsPkg["configs/"]
            PrismaConfig["prisma.ts<br/>(Database Client)"]
            AIConfig["ai.ts<br/>(Google GenAI Client)"]
            MulterConfig["multer.ts<br/>(File Upload Config)"]
            InstrumentConfig["instrument.mjs<br/>(Sentry Setup)"]
        end

        subgraph PrismaPkg["prisma/"]
            Schema["schema.prisma<br/>(User, Project models)"]
            Migrations["migrations/<br/>- 20260205164833_init/"]
        end

        subgraph GeneratedPkg["generated/"]
            PrismaClient["prisma/<br/>- client.ts<br/>- models.ts<br/>- (auto-generated types)"]
        end

        subgraph TypesPkg["types/"]
            ExpressTypes["express.d.ts<br/>(Type extensions)"]
        end

        subgraph TempStorage["Temporary Storage"]
            Uploads["uploads/<br/>(Temp image files)"]
            Videos["videos/<br/>(Temp video files)"]
        end

        PrismaConfigFile["prisma.config.ts"]
    end

    %% Internal Dependencies
    ServerEntry --> RoutesPkg
    ServerEntry --> ClerkCtrl
    ServerEntry --> InstrumentConfig

    RoutesPkg --> MiddlewaresPkg
    RoutesPkg --> ControllersPkg
    RoutesPkg --> MulterConfig

    ControllersPkg --> ConfigsPkg
    ControllersPkg --> TempStorage

    PrismaConfig --> GeneratedPkg
    GeneratedPkg --> PrismaPkg

    %% External Dependencies
    subgraph ExternalPkgs["External Packages (node_modules)"]
        Express["express"]
        Cors["cors"]
        ClerkExpress["@clerk/express"]
        PrismaORM["@prisma/client<br/>@prisma/adapter-pg"]
        GoogleGenAI["@google/genai"]
        CloudinarySDK["cloudinary"]
        Multer["multer"]
        SentrySDK["@sentry/node"]
        PG["pg"]
        AxiosServer["axios"]
    end

    ServerEntry -.-> Express
    ServerEntry -.-> Cors
    ServerEntry -.-> ClerkExpress
    ServerEntry -.-> SentrySDK
    PrismaConfig -.-> PrismaORM
    PrismaConfig -.-> PG
    AIConfig -.-> GoogleGenAI
    ProjectCtrl -.-> CloudinarySDK
    MulterConfig -.-> Multer
    ProjectCtrl -.-> AxiosServer
```

## Package Dependency Summary

### Client Dependencies
| Package | Purpose | Used By |
|---|---|---|
| react, react-dom | UI framework | All components and pages |
| react-router-dom | Client-side routing | App.tsx, all pages |
| @clerk/clerk-react | Authentication UI | main.tsx, Navbar |
| axios | HTTP requests | configs/axios.ts |
| framer-motion | Animations | Components |
| react-hot-toast | Notifications | Pages |
| lucide-react | Icons | Components |
| lenis | Smooth scrolling | lenis.tsx |

### Server Dependencies
| Package | Purpose | Used By |
|---|---|---|
| express | Web framework | server.ts, routes |
| cors | Cross-origin requests | server.ts |
| @clerk/express | Auth middleware | server.ts, middlewares |
| @prisma/client | Database ORM | configs/prisma.ts |
| @google/genai | AI generation | configs/ai.ts |
| cloudinary | Media storage | projectController.ts |
| multer | File uploads | configs/multer.ts |
| @sentry/node | Error tracking | instrument.mjs |
| pg | PostgreSQL driver | configs/prisma.ts |
| axios | HTTP client | projectController.ts |
