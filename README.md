# 🎨 UGC Image Generator - AI-Powered Marketing Content Creator

> Transform product and model photos into professional marketing images using AI

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-blue)]()
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)]()
[![Status](https://img.shields.io/badge/Status-MVP%20Ready-success)]()

## 🚀 What is This?

An AI-powered SaaS platform that instantly combines model/person images with product images to create realistic, professional marketing photos. Perfect for e-commerce brands, marketers, and content creators.

### ✨ Key Features

- 🤖 **AI Image Generation** - Merge models with products using Google Gemini AI
- 🔐 **User Authentication** - Secure login with Clerk
- 💳 **Credit System** - 20 free credits to start, 5 credits per generation
- 📁 **Project Management** - Save and organize all your generations
- 🌍 **Community Feed** - Browse and share public creations
- 🎥 **Video Generation** - Convert images to videos (coming soon)

## 📸 Use Cases

- **E-commerce**: Product photography with models
- **Social Media**: Instagram/TikTok content creation
- **Marketing**: Ad creatives and promotional materials
- **Dropshipping**: Quick product showcase images

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, TailwindCSS, Vite |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **AI** | Google Gemini 3 Pro Image Preview |
| **Auth** | Clerk |
| **Storage** | Cloudinary |
| **Monitoring** | Sentry |

## 📁 Project Structure

```
ugc-project/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (Node.js + TypeScript)
└── MVP.md          # Detailed documentation
```

## ⚡ Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database
- [Clerk](https://clerk.com) account
- [Google AI](https://ai.google.dev) API key
- [Cloudinary](https://cloudinary.com) account

### 2. Installation

```bash
# Clone repository
git clone <your-repo-url>
cd ugc-project

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### 3. Environment Setup

Create `.env` files in both `client` and `server` folders:

**client/.env**
```env
VITE_BASEURL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
```

**server/.env**
```env
DATABASE_URL=postgresql://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
CLOUDINARY_URL=cloudinary://...
GOOGLE_CLOUD_API_KEY=AIzaSy...
```

### 4. Database Setup

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 5. Start Development

```bash
# Terminal 1 - Backend
cd server
npm run server

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit: **http://localhost:5173**

## 📖 Full Documentation

For detailed setup instructions, architecture, API documentation, and deployment guide, see:

**→ [MVP.md](./MVP.md)** ← *Complete documentation here*

## 🎯 How It Works

1. **Upload Images**: User uploads product image + model/person image
2. **AI Processing**: Google Gemini AI merges images with proper lighting & composition
3. **Get Result**: Professional marketing photo ready to download/share
4. **Generate Video**: Optional video creation from the generated image

## 💰 Credit System

- 🎁 Sign up: **20 free credits**
- 📸 Image generation: **5 credits**
- 🎥 Video generation: **10 credits**

## 🔒 Security

- ✅ Clerk authentication
- ✅ JWT token authorization
- ✅ Credit-based rate limiting
- ✅ Input validation
- ✅ Secure file uploads

## 🚢 Deployment

**Recommended Platforms:**

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Fly.io
- **Database**: Neon, Supabase, Railway PostgreSQL

See [MVP.md](./MVP.md) for deployment checklist.

## 📋 API Endpoints

```
POST   /api/project/create        # Create new generation
POST   /api/project/video         # Generate video
GET    /api/user/profile          # Get user info
GET    /api/user/projects         # Get user's projects
GET    /api/project/published     # Get community feed
DELETE /api/project/:id           # Delete project
```

## 🐛 Known Issues

- Video generation needs testing
- Payment integration pending (Stripe recommended)
- Community feed pagination needed

See [MVP.md](./MVP.md) for full list and roadmap.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- 📧 Email: [tejsutar8@gmail.com]
- 📚 Documentation: [MVP.md](./MVP.md)
- 🐛 Issues: [GitHub Issues]

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Credits

Built with ❤️ using:
- [React](https://react.dev)
- [Google Gemini AI](https://ai.google.dev)
- [Clerk](https://clerk.com)
- [Prisma](https://prisma.io)
- [Cloudinary](https://cloudinary.com)

---

**Status**: ✅ MVP Ready for Testing  
**Version**: 1.0.0  
**Last Updated**: February 10, 2026

---

*For complete setup, architecture, and deployment guides, read [MVP.md](./MVP.md)*
