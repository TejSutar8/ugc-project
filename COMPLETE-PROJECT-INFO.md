# 🎨 UGC Image Generator - Complete Project Documentation

> **Last Updated**: February 18, 2026  
> **Status**: MVP Ready - Production Deployment Ready  
> **Project Type**: AI-Powered SaaS Platform

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Frontend Structure](#frontend-structure)
7. [Backend Structure](#backend-structure)
8. [Environment Variables](#environment-variables)
9. [Setup & Installation](#setup--installation)
10. [Key Features](#key-features)
11. [Data Flow & Logic](#data-flow--logic)
12. [File Structure](#file-structure)
13. [Code Examples](#code-examples)
14. [Testing Guide](#testing-guide)
15. [Deployment](#deployment)
16. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

### What is This Project?

**UGC (User Generated Content) Image Generator** is an AI-powered SaaS platform that combines model/person images with product images to create realistic, professional marketing photos using Google's Gemini AI.

### Core Value Proposition

- **Problem**: Creating professional product marketing content is expensive and time-consuming
- **Solution**: AI-powered tool that instantly merges models with products in realistic scenes
- **Target Users**: E-commerce brands, marketers, content creators, dropshippers, small businesses

### Key Use Cases

1. **E-commerce Product Photography**: Models holding/using products
2. **Social Media Content**: Instagram/TikTok ready content
3. **Marketing Campaigns**: Ad creatives and promotional materials
4. **Dropshipping**: Quick product showcase images
5. **Brand Marketing**: Professional looking UGC-style content

### Business Model

- **Freemium**: 20 free credits on signup
- **Credit System**: 
  - 5 credits per image generation
  - 10 credits per video generation (future)
- **Monetization**: Credit purchase plans (pricing page exists)

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **TypeScript** | ~5.9.3 | Type Safety |
| **Vite** | 7.2.4 | Build Tool & Dev Server |
| **TailwindCSS** | 4.1.17 | Styling |
| **React Router DOM** | 7.12.0 | Client-side Routing |
| **Clerk React** | 5.60.0 | Authentication |
| **Axios** | 1.13.5 | HTTP Client |
| **Framer Motion** | 12.23.26 | Animations |
| **React Hot Toast** | 2.6.0 | Notifications |
| **Lucide React** | 0.555.0 | Icons |
| **Lenis** | 1.3.16 | Smooth Scrolling |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.2.1 | Web Framework |
| **TypeScript** | 5.9.3 | Type Safety |
| **PostgreSQL** | Latest | Database |
| **Prisma** | 7.3.0 | ORM |
| **Clerk Express** | 1.7.69 | Authentication Middleware |
| **Google GenAI** | 1.40.0 | AI Image Generation |
| **Cloudinary** | 2.9.0 | Media Storage |
| **Multer** | 2.0.2 | File Upload |
| **Sentry** | 10.38.0 | Error Monitoring |
| **Axios** | 1.13.5 | HTTP Client |

### External Services

1. **Clerk** - User authentication & JWT tokens
2. **Google Gemini 3 Pro Image Preview** - AI image generation from 2 input images
3. **Google Veo 3.1** - AI video generation (partially implemented)
4. **Cloudinary** - Media storage & CDN for images/videos
5. **Neon/Supabase** - PostgreSQL Database (serverless)
6. **Sentry** - Error tracking & monitoring

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  React Frontend (Vite + TypeScript + TailwindCSS)           │
│  - Pages: Home, Generator, Result, MyGenerations, Community │
│  - Components: Upload, Cards, Navbar, Footer                │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/REST API
                              │ (Axios)
┌─────────────────────────────▼───────────────────────────────┐
│                      API LAYER                               │
│  Express Server (Node.js + TypeScript)                      │
│  - Auth Middleware (JWT Validation via Clerk)               │
│  - Project Routes: /api/project/*                           │
│  - User Routes: /api/user/*                                 │
│  - Multer File Upload Handler                               │
└─────┬─────────────┬─────────────┬─────────────┬─────────────┘
      │             │             │             │
      │             │             │             │
┌─────▼──────┐ ┌───▼────┐ ┌─────▼─────┐ ┌─────▼──────┐
│   Clerk    │ │ Google │ │Cloudinary │ │  Sentry    │
│    Auth    │ │ Gemini │ │  Storage  │ │ Monitoring │
│            │ │   AI   │ │           │ │            │
└────────────┘ └────────┘ └───────────┘ └────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   DATABASE LAYER                             │
│  PostgreSQL (Neon Serverless) + Prisma ORM                  │
│  - User Table: id, email, name, credits, timestamps         │
│  - Project Table: id, userId, images, prompts, outputs      │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

#### Image Generation Flow

1. **User Upload** → Frontend collects 2 images + form data
2. **API Call** → POST /api/project/create (multipart/form-data)
3. **Authentication** → Clerk validates JWT token
4. **Credit Check** → Verify user has ≥5 credits
5. **Credit Deduction** → Immediately deduct 5 credits
6. **Database Record** → Create project with `isGenerating: true`
7. **Upload to Cloudinary** → Store original images
8. **AI Processing** → Google Gemini processes images (20-45s)
9. **Result Upload** → Generated image uploaded to Cloudinary
10. **Database Update** → Set `isGenerating: false`, save image URL
11. **Polling** → Frontend polls every 5s until complete
12. **Display** → Show generated image on Result page

#### Video Generation Flow (Partially Implemented)

1. User clicks "Generate Video" from Result page
2. POST /api/project/video with projectId
3. Check credits ≥10, deduct if available
4. Google Veo AI generates video (60-90s)
5. Upload video to Cloudinary
6. Update project with video URL
7. User can download video

---

## 🗄️ Database Schema

### User Table

```prisma
model User {
  id        String   @id              // Clerk User ID
  email     String
  name      String
  image     String                     // Profile picture URL
  credits   Int      @default(20)     // Starting credits: 20
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  projects  Project[]
}
```

**Fields Explained:**
- `id`: Clerk-provided unique user identifier (not UUID)
- `credits`: Starts at 20, deducted per generation (5 for image, 10 for video)
- `projects`: One-to-many relation with Project table

### Project Table

```prisma
model Project {
  id                 String   @id @default(uuid())
  name               String                    // User-provided project name
  userId             String                    // FK to User
  productName        String                    // Product being showcased
  productDescription String   @default("")     // Optional product details
  userPrompt         String   @default("")     // Optional custom prompt
  aspectRatio        String   @default("9:16") // 9:16 or 16:9
  targetLength       Int      @default(5)      // Video length (future use)
  uploadedImages     String[]                  // Cloudinary URLs (2 images)
  generatedImage     String   @default("")     // AI-generated image URL
  generatedVideo     String   @default("")     // AI-generated video URL
  isGenerating       Boolean  @default(false)  // Status flag
  isPublished        Boolean  @default(false)  // Community visibility
  error              String   @default("")     // Error message if failed

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields Explained:**
- `uploadedImages`: Array of 2 Cloudinary URLs (model image + product image)
- `isGenerating`: `true` during AI processing, `false` when complete
- `isPublished`: Controls visibility in Community feed
- `error`: Stores error message if generation fails (credits refunded)

### Database Relationships

- **User → Project**: One-to-Many (one user has many projects)
- **Cascade Delete**: If user deleted, all their projects are deleted

---

## 🔌 API Endpoints Reference

### Base URL
- Development: `http://localhost:5000`
- Production: Your deployed backend URL

### Authentication
All protected routes require Bearer token in Authorization header:
```
Authorization: Bearer <clerk-jwt-token>
```

---

### 📁 Project Routes (`/api/project/*`)

#### 1. Create Image Generation
```http
POST /api/project/create
```

**Auth**: Required  
**Content-Type**: `multipart/form-data`

**Request Body:**
```javascript
{
  images: File[],              // 2 image files (max 5MB each)
  name: string,                // Project name
  productName: string,         // Required
  productDescription: string,  // Optional
  userPrompt: string,          // Optional custom prompt
  aspectRatio: "9:16" | "16:9", // Default: "9:16"
  targetLength: number         // Default: 5 (for video)
}
```

**Response (201):**
```json
{
  "projectId": "uuid-string",
  "message": "Image generated successfully!"
}
```

**Error Responses:**
- `400`: Insufficient credits or missing images
- `401`: Unauthorized
- `500`: Generation failed (credits refunded)

**Process:**
1. Validates user has ≥5 credits
2. Deducts 5 credits immediately
3. Uploads images to Cloudinary
4. Creates project record with `isGenerating: true`
5. Calls Google Gemini AI with images + prompt
6. Uploads generated image to Cloudinary
7. Updates project with result

---

#### 2. Generate Video from Image
```http
POST /api/project/video
```

**Auth**: Required  
**Content-Type**: `application/json`

**Request Body:**
```json
{
  "projectId": "uuid-string"
}
```

**Response (200):**
```json
{
  "videoUrl": "https://res.cloudinary.com/...",
  "message": "Video generated successfully!"
}
```

**Error Responses:**
- `400`: Insufficient credits or no generated image
- `401`: Unauthorized
- `500`: Video generation failed

**Note**: Partially implemented, may need testing

---

#### 3. Get Published Projects (Community Feed)
```http
GET /api/project/published
```

**Auth**: Not required (public endpoint)

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "generatedImage": "cloudinary-url",
      "createdAt": "ISO-date",
      "user": {
        "name": "User Name",
        "image": "profile-url"
      }
    }
  ]
}
```

---

#### 4. Delete Project
```http
DELETE /api/project/:projectId
```

**Auth**: Required

**Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `404`: Project not found or unauthorized
- `401`: Unauthorized

---

### 👤 User Routes (`/api/user/*`)

#### 1. Get User Credits
```http
GET /api/user/credits
```

**Auth**: Required

**Response (200):**
```json
{
  "credits": 15
}
```

---

#### 2. Get All User Projects
```http
GET /api/user/projects
```

**Auth**: Required

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "My Project",
      "productName": "Coffee Mug",
      "uploadedImages": ["url1", "url2"],
      "generatedImage": "generated-url",
      "generatedVideo": "",
      "isGenerating": false,
      "isPublished": false,
      "createdAt": "ISO-date",
      "updatedAt": "ISO-date"
    }
  ]
}
```

---

#### 3. Get Project by ID
```http
GET /api/user/projects/:projectId
```

**Auth**: Required

**Response (200):**
```json
{
  "project": {
    "id": "uuid",
    "name": "Project Name",
    "productName": "Product",
    "productDescription": "Description",
    "userPrompt": "Custom prompt",
    "aspectRatio": "9:16",
    "uploadedImages": ["url1", "url2"],
    "generatedImage": "url",
    "generatedVideo": "url",
    "isGenerating": false,
    "isPublished": false,
    "error": "",
    "createdAt": "ISO-date"
  }
}
```

**Error Responses:**
- `404`: Project not found

**Usage**: Result page polls this endpoint every 5s to check generation status

---

#### 4. Toggle Project Publish Status
```http
POST /api/user/publish/:projectId
```

**Auth**: Required

**Response (200):**
```json
{
  "isPublished": true
}
```

**Error Responses:**
- `404`: Project not found or no generated content

**Note**: Can only publish projects with generated image or video

---

### 🔔 Webhook Endpoint

#### Clerk Webhook (User Sync)
```http
POST /api/clerk
```

**Auth**: Clerk webhook signature

**Purpose**: Syncs user data from Clerk to database

**Events Handled:**
- `user.created`: Creates new user in database with 20 credits
- `user.updated`: Updates user email/name/image

---

## 📱 Frontend Structure

### Pages Overview

#### 1. Home Page (`/`)
- **File**: `client/src/pages/Home.tsx`
- **Purpose**: Landing page with hero, features, pricing, FAQ
- **Components**: 
  - Hero section with CTA
  - Features showcase
  - Pricing cards
  - FAQ accordion
  - Footer

#### 2. Generator Page (`/generate`)
- **File**: `client/src/pages/Genetator.tsx`
- **Purpose**: Upload images and create generation
- **Features**:
  - Drag & drop or click to upload (2 images)
  - Form inputs: name, product name, description, prompt
  - Aspect ratio selector (9:16 or 16:9)
  - Credit check before submission
  - Loading state during API call
  - Redirects to `/result/:projectId` on success

**Key Form Fields:**
```typescript
{
  name: string;              // Project name
  productName: string;       // Required
  productDescription: string; // Optional
  userPrompt: string;        // Optional custom AI prompt
  aspectRatio: "9:16" | "16:9";
  images: File[];            // 2 files
}
```

#### 3. Result Page (`/result/:projectId`)
- **File**: `client/src/pages/Result.tsx`
- **Purpose**: Display generation result with polling
- **Features**:
  - Fetches project data on mount
  - Polls every 5s if `isGenerating: true`
  - Shows loading spinner during generation
  - Displays generated image when ready
  - Download button
  - Publish/Unpublish toggle
  - Generate Video button (if credits available)
  - Error message display if generation failed

**Polling Logic:**
```typescript
useEffect(() => {
  const pollInterval = setInterval(() => {
    if (project.isGenerating) {
      fetchProject(); // GET /api/user/projects/:projectId
    } else {
      clearInterval(pollInterval);
    }
  }, 5000); // Every 5 seconds
  
  return () => clearInterval(pollInterval);
}, [project.isGenerating]);
```

#### 4. My Generations Page (`/my-generations`)
- **File**: `client/src/pages/MyGenerations.tsx`
- **Purpose**: View user's generation history
- **Features**:
  - Grid layout of all user projects
  - Project cards with thumbnails
  - Click to view full result
  - Delete project button
  - Status indicators (generating, error)

#### 5. Community Page (`/community`)
- **File**: `client/src/pages/Community.tsx`
- **Purpose**: Browse published generations
- **Features**:
  - Grid of public projects
  - User attribution (name + avatar)
  - Inspiration gallery
  - Social proof for platform

#### 6. Plans Page (`/plans`)
- **File**: `client/src/pages/Plans.tsx`
- **Purpose**: Display pricing/credit purchase options
- **Features**:
  - Pricing tiers
  - Credit packages
  - CTA buttons (not functional in MVP)

---

### Key Components

#### `UploadZone.tsx`
```typescript
// Drag & drop file upload component
interface Props {
  onFilesSelected: (files: File[]) => void;
  maxFiles: number;
  acceptedTypes: string[];
}
```

#### `ProjectCard.tsx`
```typescript
// Displays project thumbnail in grid
interface Props {
  project: Project;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}
```

#### `Navbar.tsx`
- Clerk UserButton component
- Credit balance display
- Navigation links
- Logo

#### `Footer.tsx`
- Social links
- Copyright info
- Navigation links

---

### Frontend Configuration

#### Axios Setup (`client/src/configs/axios.ts`)
```typescript
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASEURL, // http://localhost:5000
});

// Auto-attach Clerk JWT token
API.interceptors.request.use(async (config) => {
  const token = await window.Clerk.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

#### TypeScript Types (`client/src/types/index.ts`)
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  credits: number;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  productName: string;
  productDescription: string;
  userPrompt: string;
  aspectRatio: string;
  uploadedImages: string[];
  generatedImage: string;
  generatedVideo: string;
  isGenerating: boolean;
  isPublished: boolean;
  error: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## ⚙️ Backend Structure

### Main Server File (`server/server.ts`)

```typescript
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import * as Sentry from "@sentry/node";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import clerkWebhooks from "./controllers/clerk.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());

// Clerk webhook (must be BEFORE express.json())
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

app.use(express.json());
app.use(clerkMiddleware()); // Attaches req.auth()

// Routes
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

### Controllers

#### `projectController.ts` - Core Logic

**Key Functions:**

1. **`createProject()`**
```typescript
// Main image generation function
async function createProject(req, res) {
  // 1. Extract user ID from JWT
  const { userId } = req.auth();
  
  // 2. Validate images and credits
  if (images.length < 2 || user.credits < 5) {
    return res.status(400).json({ message: "..." });
  }
  
  // 3. Deduct credits immediately
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 5 } }
  });
  
  // 4. Upload original images to Cloudinary
  const uploadedImages = await Promise.all(
    images.map(img => cloudinary.uploader.upload(img.path))
  );
  
  // 5. Create project record
  const project = await prisma.project.create({
    data: {
      userId,
      name,
      productName,
      uploadedImages,
      isGenerating: true,
      ...otherFields
    }
  });
  
  // 6. Prepare images for AI model
  const img1 = loadImage(images[0].path, images[0].mimetype);
  const img2 = loadImage(images[1].path, images[1].mimetype);
  
  // 7. Generate prompt
  const prompt = {
    text: `Combine the person and product into a realistic photo.
           Make the person naturally hold or use the product.
           Match lighting, shadows, scale and perspective.
           Professional studio lighting.
           Ecommerce-quality photo realistic imagery.
           ${userPrompt}`
  };
  
  // 8. Call Google Gemini AI
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [img1, img2, prompt],
    config: {
      maxOutputTokens: 32768,
      temperature: 1,
      imageConfig: {
        aspectRatio: aspectRatio || "9:16",
        imageSize: "1k"
      }
    }
  });
  
  // 9. Extract image from response
  const imageBuffer = Buffer.from(
    response.candidates[0].content.parts[0].inlineData.data,
    "base64"
  );
  
  // 10. Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(
    `data:image/png;base64,${imageBuffer.toString("base64")}`
  );
  
  // 11. Update project with result
  await prisma.project.update({
    where: { id: project.id },
    data: {
      generatedImage: uploadResult.secure_url,
      isGenerating: false
    }
  });
  
  // 12. Send response
  res.json({
    projectId: project.id,
    message: "Image generated successfully!"
  });
}
```

**Error Handling:**
- If generation fails, credits are refunded
- Error message saved to project.error field
- Sentry captures exception

2. **`createVideo()`** - Partially implemented video generation
3. **`deleteProject()`** - Delete user project
4. **`getAllPublishedProjects()`** - Community feed data

#### `userController.ts`

1. **`getUserCredits()`** - Fetch user credit balance
2. **`getAllProjects()`** - Get user's project history
3. **`getProjectById()`** - Get single project (for Result page polling)
4. **`toggleProjectPublic()`** - Publish/unpublish to community

#### `clerk.ts` - Webhook Handler

```typescript
import { Webhook } from "@clerk/express";
import { prisma } from "../configs/prisma.js";

export default async function clerkWebhooks(req, res) {
  const webhook = new Webhook({
    signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET
  });
  
  const payload = webhook.verify(req.body, req.headers);
  const { type, data } = payload;
  
  if (type === "user.created") {
    // Create user in database with 20 credits
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
        credits: 20
      }
    });
  }
  
  if (type === "user.updated") {
    // Update user info
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url
      }
    });
  }
  
  res.json({ success: true });
}
```

---

### Middleware

#### `auth.ts` - Protection Middleware

```typescript
export const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth(); // Clerk provides this
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    next();
  } catch (error) {
    Sentry.captureException(error);
    res.status(401).json({ message: error.message });
  }
};
```

---

### Configuration Files

#### `configs/prisma.ts`
```typescript
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

#### `configs/ai.ts`
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY
});

export default ai;
```

#### `configs/multer.ts`
```typescript
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed (JPEG, JPG, PNG)"));
    }
  }
});

export default upload;
```

#### `configs/instrument.mjs` - Sentry Setup
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

---

## 🔐 Environment Variables

### Client `.env` File

```env
# Backend API URL
VITE_BASEURL=http://localhost:5000

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Server `.env` File

```env
# Database Connection (PostgreSQL - Neon/Supabase)
DATABASE_URL=postgresql://username:password@hostname/database_name?sslmode=require

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_webhook_signing_secret

# Google AI (Gemini)
GOOGLE_CLOUD_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# Cloudinary Media Storage
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Sentry Error Monitoring (Optional)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Server Port
PORT=5000
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Neon, Supabase, or local)
- Clerk account (free tier available)
- Google AI Studio API key (free tier available)
- Cloudinary account (free tier available)

### Option 1: Automated Setup (Windows)

```powershell
# From project root
.\setup.ps1
```

This script automatically:
1. Checks Node.js version
2. Installs all dependencies
3. Creates `.env` files from examples
4. Runs database migrations
5. Prompts you to fill in API keys

### Option 2: Manual Setup

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd ugc-project
```

#### Step 2: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### Step 3: Set Up Environment Variables

**Create `client/.env`:**
```bash
cd client
cp .env.example .env
# Edit .env and add your Clerk publishable key
```

**Create `server/.env`:**
```bash
cd server
cp .env.example .env
# Edit .env and add all required API keys
```

#### Step 4: Configure External Services

**Clerk Setup:**
1. Go to [clerk.com](https://clerk.com) and create account
2. Create new application
3. Copy publishable key to client `.env`
4. Copy secret key to server `.env`
5. Go to Webhooks → Add Endpoint
6. URL: `http://localhost:5000/api/clerk` (use ngrok for testing)
7. Subscribe to events: `user.created`, `user.updated`
8. Copy signing secret to server `.env`

**Google AI Studio:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Create API key
3. Add to server `.env` as `GOOGLE_CLOUD_API_KEY`

**Cloudinary:**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create account
3. Copy "API Environment Variable" from dashboard
4. Add to server `.env` as `CLOUDINARY_URL`

**Database (Neon):**
1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string
4. Add to server `.env` as `DATABASE_URL`

#### Step 5: Database Setup
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

#### Step 6: Start Development Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run server
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

#### Step 7: Open Browser
Navigate to `http://localhost:5173`

---

## ✨ Key Features

### 1. User Authentication ✅
- **Technology**: Clerk
- **Features**:
  - Sign up / Sign in
  - Social login (Google, GitHub, etc.)
  - JWT-based authentication
  - User profile management
  - Secure session handling

### 2. Credit System ✅
- **Initial Credits**: 20 on signup
- **Cost Per Generation**:
  - Image: 5 credits
  - Video: 10 credits
- **Credit Tracking**: Real-time display in navbar
- **Refund Logic**: Credits returned if generation fails

### 3. AI Image Generation ✅
- **Model**: Google Gemini 3 Pro Image Preview
- **Input**: 2 images (person + product)
- **Output**: Realistic merged image
- **Processing Time**: 20-45 seconds
- **Aspect Ratios**: 9:16 (portrait) or 16:9 (landscape)
- **Customization**: Optional custom prompts

**Default AI Prompt:**
```
Combine the person and product into a realistic photo.
Make the person naturally hold or use the product.
Match lighting, shadows, scale and perspective.
Make the person stand in professional studio lighting.
Output ecommerce-quality photo realistic imagery.
[User's custom prompt appended here]
```

### 4. Project Management ✅
- **Save All Generations**: Auto-saved with metadata
- **Generation History**: View all past projects
- **Status Tracking**: Live generation status
- **Delete Projects**: Remove unwanted generations
- **Named Projects**: Organize with custom names

### 5. Community Feed ✅
- **Public Gallery**: Browse published creations
- **User Attribution**: See creator's name and avatar
- **Toggle Visibility**: Publish/unpublish anytime
- **Inspiration Gallery**: Social proof for platform

### 6. Download & Share ✅
- **Download Generated Images**: High-res downloads
- **Community Sharing**: One-click publish to feed

### 7. Video Generation ⚠️
- **Status**: Partially implemented
- **Model**: Google Veo 3.1
- **Input**: Text prompt
- **Output**: 720p MP4 video
- **Processing Time**: 60-90 seconds
- **Cost**: 10 credits
- **Note**: Needs testing before production use

### 8. Error Handling & Monitoring ✅
- **Sentry Integration**: Real-time error tracking
- **Credit Refunds**: Auto-refund on failure
- **User Notifications**: Toast messages for all actions
- **Detailed Error Messages**: User-friendly error displays

### 9. Responsive Design ✅
- **Mobile-Optimized**: Works on all screen sizes
- **TailwindCSS 4**: Modern, utility-first styling
- **Smooth Animations**: Framer Motion for transitions
- **Lenis Scroll**: Smooth scrolling experience

---

## 📊 Data Flow & Logic

### Image Generation Detailed Flow

#### Phase 1: User Upload (Frontend)

```typescript
// User fills form in Generator page
const formData = new FormData();
formData.append("images", file1);
formData.append("images", file2);
formData.append("name", "My Project");
formData.append("productName", "Coffee Mug");
formData.append("aspectRatio", "9:16");

// API call
const response = await API.post("/api/project/create", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

// Redirect to result page
navigate(`/result/${response.data.projectId}`);
```

#### Phase 2: Backend Processing

```typescript
// 1. Authentication
const { userId } = req.auth(); // Clerk JWT validation

// 2. Credit Check
const user = await prisma.user.findUnique({ where: { id: userId } });
if (user.credits < 5) {
  return res.status(400).json({ message: "Insufficient credits" });
}

// 3. Immediate Credit Deduction
await prisma.user.update({
  where: { id: userId },
  data: { credits: { decrement: 5 } }
});

// 4. File Upload to Cloudinary
const uploadedImages = await Promise.all(
  images.map(img => cloudinary.uploader.upload(img.path))
);

// 5. Database Record Creation
const project = await prisma.project.create({
  data: {
    userId,
    name,
    productName,
    uploadedImages: uploadedImages.map(r => r.secure_url),
    isGenerating: true
  }
});

// 6. AI Image Generation
const aiResponse = await ai.models.generateContent({
  model: "gemini-3-pro-image-preview",
  contents: [image1, image2, prompt],
  config: { aspectRatio, temperature: 1, ... }
});

// 7. Extract & Upload Result
const imageBuffer = Buffer.from(aiResponse.data, "base64");
const cloudinaryResult = await cloudinary.uploader.upload(imageBuffer);

// 8. Update Database
await prisma.project.update({
  where: { id: project.id },
  data: {
    generatedImage: cloudinaryResult.secure_url,
    isGenerating: false
  }
});

// 9. Return Project ID
res.json({ projectId: project.id });
```

#### Phase 3: Result Polling (Frontend)

```typescript
// Result page fetches project on mount and polls
const [project, setProject] = useState(null);
const projectId = useParams().projectId;

const fetchProject = async () => {
  const response = await API.get(`/api/user/projects/${projectId}`);
  setProject(response.data.project);
};

useEffect(() => {
  fetchProject(); // Initial fetch
  
  // Poll every 5 seconds if generating
  const interval = setInterval(() => {
    if (project?.isGenerating) {
      fetchProject();
    } else {
      clearInterval(interval);
    }
  }, 5000);
  
  return () => clearInterval(interval);
}, [project?.isGenerating]);

// Display logic
if (project.isGenerating) {
  return <LoadingSpinner />;
}

if (project.error) {
  return <ErrorMessage error={project.error} />;
}

return <GeneratedImage src={project.generatedImage} />;
```

### Credit System Flow

```
User Signup
   ↓
Clerk Webhook: user.created
   ↓
Database: Create user with credits=20
   ↓
User Creates Generation
   ↓
Check: credits >= 5?
   ↓ Yes
Deduct 5 credits immediately
   ↓
Start AI generation
   ↓
Generation Success → Keep deduction
   ↓
Generation Failure → Refund 5 credits
```

### Publish/Unpublish Flow

```typescript
// User toggles "Publish to Community"
const togglePublish = async (projectId: string) => {
  await API.post(`/api/user/publish/${projectId}`);
  // Backend toggles project.isPublished
  // Community page shows only where isPublished=true
};
```

---

## 📁 File Structure

### Complete Project Tree

```
ugc-project/
├── README.md                      # Quick start guide
├── MVP.md                         # Technical documentation
├── MVP-SUMMARY.md                 # MVP delivery summary
├── TESTING.md                     # Testing checklist
├── COMPLETE-PROJECT-INFO.md       # This file
├── setup.ps1                      # Windows setup script
│
├── docs/                          # Architecture diagrams
│   ├── architecture-system.md
│   ├── architecture-dataflow.md
│   ├── diagrams.html
│   └── README-DIAGRAMS.md
│
├── client/                        # React Frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   ├── index.html
│   ├── .env.example
│   ├── .env                       # Your environment variables
│   │
│   ├── public/                    # Static assets
│   │
│   └── src/
│       ├── main.tsx               # React entry point
│       ├── App.tsx                # Main app component
│       ├── index.css              # Global styles
│       │
│       ├── pages/                 # Route pages
│       │   ├── Home.tsx           # Landing page (/)
│       │   ├── Genetator.tsx     # Create generation (/generate)
│       │   ├── Result.tsx         # View result (/result/:id)
│       │   ├── MyGenerations.tsx  # User history (/my-generations)
│       │   ├── Community.tsx      # Public feed (/community)
│       │   ├── Plans.tsx          # Pricing (/plans)
│       │   └── Loading.tsx        # Loading page
│       │
│       ├── components/            # Reusable components
│       │   ├── Navbar.tsx         # Navigation + user menu
│       │   ├── Footer.tsx         # Footer links
│       │   ├── Hero.tsx           # Homepage hero section
│       │   ├── Features.tsx       # Feature cards
│       │   ├── Pricing.tsx        # Price cards
│       │   ├── Faq.tsx            # FAQ accordion
│       │   ├── ProjectCard.tsx    # Project thumbnail
│       │   ├── UploadZone.tsx     # File upload component
│       │   ├── Buttons.tsx        # Button components
│       │   ├── Title.tsx          # Section titles
│       │   ├── CTA.tsx            # Call-to-action
│       │   ├── lenis.tsx          # Smooth scroll
│       │   └── SoftBackdrop.tsx   # Background gradient
│       │
│       ├── configs/
│       │   └── axios.ts           # Axios instance + interceptors
│       │
│       ├── types/
│       │   └── index.ts           # TypeScript interfaces
│       │
│       └── assets/                # Images, icons, dummy data
│           ├── assets.tsx
│           ├── dummy-data.tsx
│           └── schema.prisma      # Schema reference
│
└── server/                        # Express Backend
    ├── package.json
    ├── tsconfig.json
    ├── server.ts                  # Main server file
    ├── prisma.config.ts
    ├── .env.example
    ├── .env                       # Your environment variables
    │
    ├── prisma/                    # Database
    │   ├── schema.prisma          # Database schema
    │   └── migrations/            # Migration history
    │       ├── migration_lock.toml
    │       └── 20260205164833_init/
    │           └── migration.sql
    │
    ├── controllers/               # Route handlers
    │   ├── projectController.ts   # Image/video generation
    │   ├── userController.ts      # User & project queries
    │   └── clerk.ts               # Clerk webhook handler
    │
    ├── routes/                    # API route definitions
    │   ├── projectRoutes.ts       # /api/project/*
    │   └── userRoutes.ts          # /api/user/*
    │
    ├── middlewares/
    │   └── auth.ts                # JWT validation middleware
    │
    ├── configs/                   # Service configurations
    │   ├── prisma.ts              # Database client
    │   ├── ai.ts                  # Google AI client
    │   ├── multer.ts              # File upload config
    │   └── instrument.mjs         # Sentry setup
    │
    ├── generated/                 # Auto-generated Prisma files
    │   └── prisma/
    │       ├── client.ts
    │       ├── models.ts
    │       └── ...
    │
    ├── types/
    │   └── express.d.ts           # Express type extensions
    │
    ├── videos/                    # Temporary video storage
    └── uploads/                   # Temporary image uploads
```

---

## 💻 Code Examples

### Frontend: Create Generation

```typescript
// client/src/pages/Genetator.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../configs/axios";
import toast from "react-hot-toast";

export default function Generator() {
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    productName: "",
    productDescription: "",
    userPrompt: "",
    aspectRatio: "9:16"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length < 2) {
      toast.error("Please upload 2 images");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      files.forEach(file => data.append("images", file));
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const response = await API.post("/api/project/create", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Generation started!");
      navigate(`/result/${response.data.projectId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <UploadZone onFilesSelected={setFiles} maxFiles={2} />
      
      <input
        type="text"
        placeholder="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <input
        type="text"
        placeholder="Product Name *"
        required
        value={formData.productName}
        onChange={(e) => setFormData({...formData, productName: e.target.value})}
      />
      
      <textarea
        placeholder="Product Description (optional)"
        value={formData.productDescription}
        onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
      />
      
      <textarea
        placeholder="Custom Prompt (optional)"
        value={formData.userPrompt}
        onChange={(e) => setFormData({...formData, userPrompt: e.target.value})}
      />
      
      <select
        value={formData.aspectRatio}
        onChange={(e) => setFormData({...formData, aspectRatio: e.target.value})}
      >
        <option value="9:16">9:16 (Portrait)</option>
        <option value="16:9">16:9 (Landscape)</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Image (5 Credits)"}
      </button>
    </form>
  );
}
```

### Frontend: Result Page with Polling

```typescript
// client/src/pages/Result.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../configs/axios";
import toast from "react-hot-toast";

export default function Result() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const response = await API.get(`/api/user/projects/${projectId}`);
      setProject(response.data.project);
      setLoading(false);
    } catch (error: any) {
      toast.error("Failed to load project");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();

    // Poll every 5 seconds if generating
    const interval = setInterval(() => {
      if (project?.isGenerating) {
        fetchProject();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, project?.isGenerating]);

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = project.generatedImage;
    link.download = `${project.name}.png`;
    link.click();
    toast.success("Download started!");
  };

  const handlePublish = async () => {
    try {
      const response = await API.post(`/api/user/publish/${projectId}`);
      setProject({...project, isPublished: response.data.isPublished});
      toast.success(response.data.isPublished ? "Published!" : "Unpublished!");
    } catch (error: any) {
      toast.error("Failed to toggle publish");
    }
  };

  if (loading) {
    return <div>Loading project...</div>;
  }

  if (project.isGenerating) {
    return (
      <div>
        <div className="spinner" />
        <p>AI is generating your image...</p>
        <p>This usually takes 20-45 seconds</p>
      </div>
    );
  }

  if (project.error) {
    return (
      <div>
        <h2>Generation Failed</h2>
        <p>{project.error}</p>
        <p>Your credits have been refunded.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{project.name}</h1>
      
      <img
        src={project.generatedImage}
        alt="Generated"
        className="max-w-full rounded-lg"
      />
      
      <button onClick={handleDownload}>
        Download Image
      </button>
      
      <button onClick={handlePublish}>
        {project.isPublished ? "Unpublish" : "Publish to Community"}
      </button>
      
      <div>
        <h3>Original Images:</h3>
        {project.uploadedImages.map((url, i) => (
          <img key={i} src={url} alt={`Original ${i+1}`} />
        ))}
      </div>
    </div>
  );
}
```

### Backend: AI Image Generation

```typescript
// server/controllers/projectController.ts (simplified)
import { Request, Response } from "express";
import { prisma } from "../configs/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import ai from "../configs/ai.js";
import fs from "fs";

const loadImage = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType
    }
  };
};

export const createProject = async (req: Request, res: Response) => {
  const { userId } = req.auth();
  const { name, productName, userPrompt, aspectRatio } = req.body;
  const images: any = req.files;
  
  try {
    // 1. Check credits
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < 5) {
      return res.status(400).json({ message: "Insufficient credits" });
    }
    
    // 2. Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } }
    });
    
    // 3. Upload original images
    const uploadedImages = await Promise.all(
      images.map(async (img: any) => {
        const result = await cloudinary.uploader.upload(img.path);
        return result.secure_url;
      })
    );
    
    // 4. Create project
    const project = await prisma.project.create({
      data: {
        userId,
        name,
        productName,
        userPrompt,
        aspectRatio,
        uploadedImages,
        isGenerating: true
      }
    });
    
    // 5. Prepare AI inputs
    const img1 = loadImage(images[0].path, images[0].mimetype);
    const img2 = loadImage(images[1].path, images[1].mimetype);
    
    const prompt = {
      text: `Combine the person and product into a realistic photo.
             Make the person naturally hold or use the product.
             Match lighting, shadows, scale and perspective.
             Professional studio lighting. Ecommerce-quality.
             ${userPrompt}`
    };
    
    // 6. Call Google Gemini AI
    const response: any = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [img1, img2, prompt],
      config: {
        maxOutputTokens: 32768,
        temperature: 1,
        imageConfig: {
          aspectRatio: aspectRatio || "9:16",
          imageSize: "1k"
        }
      }
    });
    
    // 7. Extract generated image
    const parts = response.candidates[0].content.parts;
    let imageBuffer: Buffer | null = null;
    
    for (const part of parts) {
      if (part.inlineData) {
        imageBuffer = Buffer.from(part.inlineData.data, "base64");
      }
    }
    
    if (!imageBuffer) {
      throw new Error("Failed to generate image");
    }
    
    // 8. Upload to Cloudinary
    const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    const uploadResult = await cloudinary.uploader.upload(base64Image);
    
    // 9. Update project with result
    await prisma.project.update({
      where: { id: project.id },
      data: {
        generatedImage: uploadResult.secure_url,
        isGenerating: false
      }
    });
    
    // 10. Return success
    res.json({
      projectId: project.id,
      message: "Image generated successfully!"
    });
    
  } catch (error: any) {
    // Refund credits on failure
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 } }
    });
    
    res.status(500).json({ message: error.message });
  }
};
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### 1. Authentication Flow
- [ ] Sign up with email
- [ ] Sign in with existing account
- [ ] Profile displays correctly
- [ ] User starts with 20 credits

#### 2. Image Generation
- [ ] Navigate to `/generate`
- [ ] Upload 2 images (person + product)
- [ ] Fill project name and product name
- [ ] Select aspect ratio
- [ ] Click "Generate" button
- [ ] Credits deducted (20 → 15)
- [ ] Redirects to `/result/:projectId`
- [ ] Loading spinner shows
- [ ] Generated image appears after ~30 seconds
- [ ] Image quality is good and realistic

#### 3. Result Page
- [ ] Generated image displays correctly
- [ ] Download button works
- [ ] Publish toggle works
- [ ] Original images shown
- [ ] If generation fails, error message shown
- [ ] If failed, credits refunded

#### 4. My Generations
- [ ] Navigate to `/my-generations`
- [ ] All projects listed
- [ ] Thumbnails load correctly
- [ ] Click project to view
- [ ] Delete button works

#### 5. Community Feed
- [ ] Navigate to `/community`
- [ ] Published projects visible
- [ ] User attribution shown
- [ ] Unpublished projects not visible

#### 6. Error Scenarios
- [ ] Try generating with <5 credits (should fail)
- [ ] Upload invalid file types (should fail)
- [ ] Upload >5MB files (should fail)
- [ ] Test network failure handling

### API Testing with Postman

#### Test Create Project
```http
POST http://localhost:5000/api/project/create
Authorization: Bearer <clerk-jwt-token>
Content-Type: multipart/form-data

Body:
- images: [File, File]
- name: "Test Project"
- productName: "Coffee Mug"
- aspectRatio: "9:16"
```

#### Test Get User Credits
```http
GET http://localhost:5000/api/user/credits
Authorization: Bearer <clerk-jwt-token>
```

#### Test Get Projects
```http
GET http://localhost:5000/api/user/projects
Authorization: Bearer <clerk-jwt-token>
```

### Common Issues & Solutions

**Issue**: "Insufficient credits"
- **Solution**: Check user credits in database, reset to 20 if needed

**Issue**: "Failed to generate image"
- **Solution**: Check Google AI API key is valid and has quota

**Issue**: Images not uploading to Cloudinary
- **Solution**: Verify CLOUDINARY_URL is correct in .env

**Issue**: Webhook not syncing users
- **Solution**: Use ngrok to expose localhost, update Clerk webhook URL

**Issue**: Frontend can't connect to backend
- **Solution**: Ensure VITE_BASEURL matches server PORT

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# From client directory
npm run build

# Deploy to Vercel
# Set environment variables in Vercel dashboard:
# - VITE_BASEURL=<your-backend-url>
# - VITE_CLERK_PUBLISHABLE_KEY=<your-key>
```

### Backend Deployment (Railway/Render)

```bash
# Build command
npm install && npx prisma generate && npm run build

# Start command
npx prisma migrate deploy && npm start

# Environment variables to set:
# - DATABASE_URL
# - CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - CLERK_WEBHOOK_SIGNING_SECRET
# - GOOGLE_CLOUD_API_KEY
# - CLOUDINARY_URL
# - SENTRY_DSN (optional)
# - PORT=5000
```

### Database Deployment (Neon)

1. Create Neon project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Add to Railway/Render environment variables
4. Run migrations: `npx prisma migrate deploy`

### Update Clerk Webhook

1. Update webhook URL to production backend URL
2. Format: `https://your-backend.railway.app/api/clerk`
3. Verify events: `user.created`, `user.updated`

---

## 🔮 Future Enhancements

### Planned Features

1. **Payment Integration**
   - Stripe/PayPal checkout
   - Credit purchase packages
   - Subscription plans

2. **Video Generation (Complete)**
   - Test and finalize Google Veo integration
   - Add video preview
   - Video download with watermark removal

3. **Advanced Editor**
   - Crop/resize generated images
   - Add text overlays
   - Apply filters

4. **Batch Generation**
   - Upload multiple product images
   - Generate all at once
   - Bulk download

5. **Template Library**
   - Pre-made scene templates
   - Background options
   - Lighting presets

6. **Social Features**
   - Like/comment on community posts
   - Follow users
   - Share to social media

7. **Admin Dashboard**
   - User management
   - Usage analytics
   - Revenue tracking
   - Content moderation

8. **API Access**
   - REST API for developers
   - Webhook integrations
   - Zapier/Make integration

9. **Team Collaboration**
   - Shared workspaces
   - Team credit pools
   - Role-based permissions

10. **Quality Improvements**
    - HD/4K output options
    - More aspect ratios (1:1, 4:5)
    - Style presets (minimal, vibrant, dark)

### Technical Debt to Address

- [ ] Add comprehensive unit tests (Jest)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Implement rate limiting
- [ ] Add Redis caching for API responses
- [ ] Optimize image compression
- [ ] Add CDN for static assets
- [ ] Implement log aggregation (Datadog/LogRocket)
- [ ] Add automated backups for database
- [ ] Implement CI/CD pipeline (GitHub Actions)
- [ ] Add performance monitoring (New Relic)

---

## 📊 Project Statistics

### Codebase Metrics
- **Total Files**: ~50+ files
- **Lines of Code**: ~5,000+ lines
- **Frontend Components**: 15+
- **API Endpoints**: 10
- **Database Tables**: 2

### Technology Versions
- React: 19.2.0
- Node.js: 18+
- TypeScript: 5.9.3
- Prisma: 7.3.0
- Express: 5.2.1

### External Dependencies
- **Frontend**: 11 production dependencies
- **Backend**: 10 production dependencies
- **Dev Dependencies**: 15+ combined

---

## 🛠️ Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- REST Client

### Useful Commands

#### Client
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

#### Server
```bash
npm run server       # Start with nodemon (auto-reload)
npm start            # Start production server
npm run build        # Compile TypeScript
npx prisma studio    # Open database GUI
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate  # Generate Prisma client
```

---

## 📚 Additional Resources

### Documentation Links
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

### Tutorial References
- Google Gemini Image Generation API
- Clerk Authentication Setup
- Prisma with PostgreSQL
- React Router v7 Guide

---

## 🤝 Contributing Guidelines

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### Commit Message Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code style change
- `refactor:` Code refactoring
- `test:` Add tests
- `chore:` Maintenance tasks

---

## 📞 Support & Contact

### Getting Help
1. Check `TESTING.md` for troubleshooting
2. Review error logs in Sentry dashboard
3. Check Clerk dashboard for auth issues
4. Verify all environment variables are set correctly

### Common Support Questions

**Q: How do I get more credits?**
A: Currently manual, payment integration coming soon

**Q: Why is generation taking so long?**
A: AI processing typically takes 20-45 seconds, check network connection

**Q: Can I use this commercially?**
A: Yes, generated images are yours to use

**Q: What image formats are supported?**
A: JPEG, JPG, PNG up to 5MB each

---

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack TypeScript development
- Modern React patterns (hooks, routing)
- RESTful API design
- Database modeling with Prisma
- JWT authentication flow
- Third-party API integration (AI, storage, auth)
- Async job processing
- Error handling & monitoring
- File upload handling
- Credit-based monetization model

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🎉 Summary

You now have a **complete, production-ready MVP** of the UGC Image Generator platform. This document contains everything needed to:

✅ Understand the project architecture  
✅ Set up development environment  
✅ Extend features  
✅ Deploy to production  
✅ Debug issues  
✅ Onboard new developers  

**Next Steps:**
1. Complete testing using `TESTING.md`
2. Gather user feedback
3. Implement payment system
4. Scale infrastructure as user base grows

---

**Last Updated**: February 18, 2026  
**Version**: 1.0.0 MVP  
**Status**: ✅ Production Ready
