# 🚀 UGC Image Generator - MVP Documentation

## 📝 Project Overview

**UGC (User Generated Content) Image Generator** is an AI-powered SaaS platform that combines model/person images with product images to create realistic, professional marketing photos using Google's Gemini AI.

### Core Value Proposition
- **Problem**: Creating professional product marketing content is expensive and time-consuming
- **Solution**: AI-powered tool that instantly merges models with products in realistic scenes
- **Target Users**: E-commerce brands, marketers, content creators, small businesses

---

## ✨ MVP Features

### 1. **User Authentication** ✅
- Clerk authentication integration
- User profiles with email, name, and profile image
- Sign up/Sign in functionality

### 2. **AI Image Generation** ✅
- Upload product image + model/person image
- AI merges them into realistic marketing photo
- Configurable aspect ratios (9:16, 16:9)
- Custom prompts for better control
- Professional studio lighting and composition

### 3. **Credit System** ✅
- Users start with 20 free credits
- 5 credits deducted per image generation
- Credit-based monetization model

### 4. **Project Management** ✅
- Save all generations
- View generation history
- Delete unwanted projects
- Track generation status (processing/complete)

### 5. **Community Feed** ✅
- Browse publicly shared generations
- Inspiration gallery
- Social proof for platform

### 6. **Video Generation** ⚠️ (Partially Implemented)
- Convert generated images to videos
- Additional credit cost
- Status: Controller exists but may need testing

---

## 🏗️ Technical Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **Routing**: React Router DOM v7
- **Authentication**: Clerk React
- **API Client**: Axios
- **UI Components**: Lucide Icons, Framer Motion
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js + Express 5
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma
- **Authentication**: Clerk Express
- **AI Model**: Google Gemini 3 Pro Image Preview
- **File Storage**: Cloudinary
- **File Upload**: Multer
- **Monitoring**: Sentry

---

## 📁 Project Architecture

```
ugc-project/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   │   ├── Home.tsx      # Landing page
│   │   │   ├── Genetator.tsx # Create generations
│   │   │   ├── Result.tsx    # View generation result
│   │   │   ├── MyGenerations.tsx # User's history
│   │   │   ├── Community.tsx # Public feed
│   │   │   └── Plans.tsx     # Pricing page
│   │   ├── components/       # Reusable components
│   │   ├── configs/          # Axios configuration
│   │   └── types/            # TypeScript types
│   └── .env
│
└── server/                    # Backend Express app
    ├── controllers/          # Route handlers
    ├── routes/               # API routes
    ├── middlewares/          # Auth middleware
    ├── configs/              # DB, AI, Storage configs
    ├── prisma/               # Database schema & migrations
    └── .env
```

---

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id        String   @id
  email     String
  name      String
  image     String
  credits   Int      @default(20)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  projects  Project[]
}
```

### Project Model
```prisma
model Project {
  id                 String   @id @default(uuid())
  name               String
  userId             String
  productName        String
  productDescription String   @default("")
  userPrompt         String   @default("")
  aspectRatio        String   @default("9:16")
  targetLength       Int      @default(5)
  uploadedImages     String[]  # [product, model]
  generatedImage     String   @default("")
  generatedVideo     String   @default("")
  isGenerating       Boolean  @default(false)
  isPublished        Boolean  @default(false)
  error              String   @default("")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  user               User     @relation(...)
}
```

---

## 🔌 API Endpoints

### User Routes (`/api/user`)
- `GET /profile` - Get user profile with credits
- `GET /projects` - Get user's all projects
- `GET /projects/:id` - Get specific project

### Project Routes (`/api/project`)
- `POST /create` - Create new generation (requires 2 images)
- `POST /video` - Generate video from image
- `GET /published` - Get all public projects
- `DELETE /:projectId` - Delete project

### Webhooks
- `POST /api/clerk` - Clerk user sync webhook

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon serverless)
- Clerk account
- Google Cloud account (for Gemini AI)
- Cloudinary account

### Environment Variables

**Client (`.env`)**
```env
VITE_BASEURL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Server (`.env`)**
```env
# Database
DATABASE_URL='postgresql://...'

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Cloudinary Storage
CLOUDINARY_URL=cloudinary://...

# Google AI
GOOGLE_CLOUD_API_KEY=AIzaSy...

# Optional: Error Monitoring
SENTRY_DSN=https://...  (if using Sentry)
```

### Installation Steps

1. **Clone and Install Dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Setup Database**
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

3. **Configure Clerk Webhook**
- Go to Clerk Dashboard → Webhooks
- Add endpoint: `http://localhost:5000/api/clerk`
- Subscribe to `user.created` and `user.updated` events
- Copy signing secret to `.env`

4. **Start Development Servers**
```bash
# Terminal 1 - Start backend
cd server
npm run server

# Terminal 2 - Start frontend
cd client
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🎯 User Flow

### Generation Flow
1. User signs up/logs in via Clerk
2. Navigates to `/generate` page
3. Uploads product image + model image
4. Fills in project details (name, description, prompt)
5. Selects aspect ratio
6. Clicks "Generate"
7. System:
   - Deducts 5 credits
   - Uploads images to Cloudinary
   - Sends to Google Gemini AI
   - Saves generated image
   - Redirects to `/result/:id`
8. User views result and can:
   - Generate video (additional credits)
   - Download image
   - Share to community
   - Create new generation

---

## 💡 AI Generation Process

The image generation uses **Google Gemini 3 Pro Image Preview** model:

1. **Input**: 2 images (product + model) + text prompt
2. **Process**:
   - Converts images to base64
   - Combines with custom prompt:
     ```
     "Combine the person and product into a realistic photo.
     Make the person naturally hold or use the product.
     Match lighting, shadows, scale and perspective.
     Make the person stand in professional studio lighting.
     Output ecommerce-quality photo realistic imagery."
     ```
   - AI merges images with proper composition
3. **Output**: Professional marketing photo

### Configuration
- Model: `gemini-3-pro-image-preview`
- Temperature: 1.0
- Max Tokens: 32768
- Image Size: 1k
- Safety Settings: All OFF (for creative freedom)
- Aspect Ratio: Configurable (9:16 or 16:9)

---

## 🎨 Frontend Pages

### 1. Home (`/`)
- Hero section
- Features showcase
- Pricing tiers
- FAQ section
- CTA buttons

### 2. Generator (`/generate`)
- Upload zones for 2 images
- Form inputs (name, product details, prompt)
- Aspect ratio selector
- Generate button
- Real-time validation

### 3. Result (`/result/:id`)
- Display generated image
- Original uploaded images
- Project details
- Video generation button
- Download options
- Share to community

### 4. My Generations (`/my-generations`)
- Grid of user's projects
- Filter/sort options
- Quick actions (view, delete)
- Credits display

### 5. Community (`/community`)
- Public feed of shared generations
- Inspiration gallery
- Like/view counts (future feature)

### 6. Plans (`/plans`)
- Pricing tiers
- Credit packages
- Feature comparison
- Purchase flow (future feature)

---

## 🔒 Security Features

1. **Authentication**: Clerk handles all auth flows
2. **Authorization**: JWT tokens for API requests
3. **Rate Limiting**: Credit-based usage limits
4. **Input Validation**: Form validation on client & server
5. **File Upload**: Multer with file type restrictions
6. **Database**: Prisma with parameterized queries
7. **CORS**: Configured for specific origins

---

## 💰 Monetization Strategy

### Credit-Based Pricing
- **Starter**: 20 free credits (signup bonus)
- **Basic**: $9/month - 100 credits
- **Pro**: $29/month - 500 credits
- **Enterprise**: $99/month - Unlimited

### Credit Costs
- Image Generation: 5 credits
- Video Generation: 10 credits
- HD Output: +5 credits (future)

---

## 🐛 Known Issues & Future Improvements

### Current Limitations
1. ⚠️ Video generation needs testing/completion
2. ⚠️ No payment integration yet (Stripe recommended)
3. ⚠️ No image download functionality
4. ⚠️ Community feed may need pagination
5. ⚠️ No analytics/tracking
6. ⚠️ Missing error boundaries in React

### Recommended Enhancements
- [ ] Add Stripe payment integration
- [ ] Implement image download functionality
- [ ] Add social sharing features
- [ ] Implement pagination for community feed
- [ ] Add user analytics dashboard
- [ ] Image editing before generation
- [ ] Batch generation support
- [ ] API rate limiting
- [ ] Admin dashboard
- [ ] Referral program
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] PWA support

---

## 🧪 Testing the MVP

### Manual Test Checklist

**Authentication**
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Check user profile loads
- [ ] Verify 20 starter credits

**Image Generation**
- [ ] Upload product image
- [ ] Upload model image
- [ ] Fill all required fields
- [ ] Submit generation
- [ ] Verify credit deduction (20 → 15)
- [ ] Check generation status
- [ ] View result page

**Project Management**
- [ ] View "My Generations"
- [ ] Open existing project
- [ ] Delete project
- [ ] Verify project list updates

**Community**
- [ ] Publish generation to community
- [ ] Browse community feed
- [ ] View other users' generations

---

## 🚢 Deployment Checklist

### Pre-Deployment
- [ ] Update environment variables for production
- [ ] Set up production database (Neon/Supabase/Railway)
- [ ] Configure Cloudinary production environment
- [ ] Update Clerk production keys
- [ ] Set Google AI production API key
- [ ] Enable Sentry error tracking
- [ ] Set up CI/CD pipeline

### Deployment Options

**Backend (Recommended)**
- Railway.app (easiest)
- Render.com
- Fly.io
- Heroku
- AWS/Azure/GCP

**Frontend (Recommended)**
- Vercel (best for Vite/React)
- Netlify
- Cloudflare Pages

**Database**
- Neon (serverless PostgreSQL)
- Supabase
- Railway PostgreSQL
- AWS RDS

---

## 📊 Success Metrics

### Key Performance Indicators
- User signups per week
- Generation success rate (>95% target)
- Average generations per user
- Credit conversion rate
- Page load time (<2s)
- API response time (<5s for generation)

---

## 📞 Support & Documentation

### Useful Links
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [React Router Documentation](https://reactrouter.com)

### Project Contacts
- GitHub Repository: [Your repo URL]
- Support Email: [Your email]
- Documentation: This file

---

## 🏁 Quick Start Commands

```bash
# Development
npm run dev              # Client (Vite)
npm run server           # Server (nodemon + tsx)

# Database
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database GUI

# Build
npm run build            # Client production build
npm run start            # Server production mode

# Lint
npm run lint             # Check code quality
```

---

## 📄 License

[Add your license here - MIT recommended for open source]

---

## 👏 Credits

Built with:
- React + TypeScript
- Google Gemini AI
- Clerk Authentication
- Prisma ORM
- Cloudinary
- TailwindCSS

---

**Last Updated**: February 10, 2026
**Version**: 1.0.0 (MVP)
**Status**: ✅ Ready for Testing
