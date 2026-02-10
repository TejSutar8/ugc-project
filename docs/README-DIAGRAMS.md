# 📊 Architecture Diagrams

This folder contains comprehensive architecture documentation for the UGC Image & Video Generator project.

## 📁 Files

### 1. `architecture-system.md`
**System Architecture - Component Overview**
- Shows all major components (Frontend, Backend, Database, External Services)
- Illustrates data flow between layers
- Color-coded by technology (React blue, Node green, PostgreSQL purple, etc.)
- Best for: Understanding overall system structure

### 2. `architecture-dataflow.md`
**Data Flow - Image & Video Generation**
- Sequence diagram showing step-by-step operations
- Detailed image generation flow (upload → process → display)
- Video generation workflow
- Polling mechanism and async behavior
- Best for: Understanding how features work internally

### 3. `diagrams.html`
**Interactive HTML Viewer**
- Renders both diagrams in a beautiful web interface
- Easy to export as images
- Includes tech stack overview and key features
- Best for: Sharing with team or portfolio

## 🎨 How to View Diagrams

### Method 1: Visual Studio Code (Recommended)
1. Install extension: **Markdown Preview Mermaid Support** by Matt Bierner
2. Open any `.md` file in this folder
3. Press `Ctrl+Shift+V` to preview
4. Diagrams will render beautifully

### Method 2: HTML File (Easiest)
1. Open `diagrams.html` in any web browser (Chrome, Edge, Firefox)
2. Both diagrams will display professionally styled
3. Use browser tools to export/print

### Method 3: Online Mermaid Editor
1. Go to https://mermaid.live/
2. Copy the mermaid code from any `.md` file
3. Paste into the editor
4. Export as PNG/SVG

## 💾 How to Export as Images

### Option 1: Screenshot (Quick & Easy)
```
Windows: Win + Shift + S
Mac: Cmd + Shift + 4
```
- Open `diagrams.html` in browser
- Use snipping tool to capture each diagram
- Save as PNG/JPG

### Option 2: Browser DevTools (High Quality)
1. Open `diagrams.html` in Chrome/Edge
2. Right-click on diagram → Inspect Element
3. In DevTools, right-click the `<svg>` element
4. Select "Capture node screenshot"
5. Image saves automatically

### Option 3: Print to PDF
1. Open `diagrams.html`
2. Press `Ctrl+P` (Print)
3. Destination: Save as PDF
4. Save PDF, then extract images

### Option 4: VS Code Extension
1. Install **Mermaid Editor** extension
2. Open `.md` file with diagram
3. Click "Export diagram" button
4. Choose PNG, SVG, or PDF

### Option 5: Mermaid CLI (Advanced)
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Export System Architecture
mmdc -i architecture-system.md -o architecture-system.png

# Export Data Flow
mmdc -i architecture-dataflow.md -o architecture-dataflow.png
```

## 🎯 Recommended Export Settings

### For Presentations/Slides
- **Format:** PNG
- **Resolution:** 1920x1080 or higher
- **Background:** White
- **Use:** System Architecture diagram

### For Documentation
- **Format:** SVG (scalable)
- **Method:** Mermaid Live Editor → Export SVG
- **Use:** Both diagrams

### For Portfolio/Website
- **Format:** PNG or WebP
- **Resolution:** 2560x1440
- **Optimization:** Use TinyPNG to compress
- **Use:** High-quality version of both

## 📖 Diagram Descriptions

### System Architecture (Graph Diagram)
```
Components:
├── Client Layer (React Frontend)
├── API Layer (Express Server)
├── External Services (Clerk, Google AI, Cloudinary)
├── Database Layer (PostgreSQL + Prisma)
└── Generated Content (Images & Videos)

Key Relationships:
• Frontend ↔ Backend: HTTP/REST API
• Backend ↔ Database: Prisma ORM
• Backend ↔ AI Services: Google Gemini & Veo
• Backend ↔ Storage: Cloudinary CDN
```

### Data Flow (Sequence Diagram)
```
Flows:
1. Image Generation Flow
   • Upload → Validate → Create Project → Background Generation
   • Polling mechanism (2s, 5s, 8s, then every 5s)
   • Auto-refresh when complete

2. Video Generation Flow
   • Click button → Verify credits → Call Google Veo
   • Download video → Upload to Cloudinary → Update UI

3. Download & Publish Flow
   • Download: Direct from Cloudinary
   • Publish: Toggle in database, shows in Community
```

## 🏗️ Architecture Highlights

### Technology Stack
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS 4, React Router v7
- **Backend:** Node.js, Express 5, TypeScript, Multer
- **Database:** PostgreSQL (Neon), Prisma ORM 7.3
- **AI Models:** Google Gemini 3 Pro (images), Google Veo 3.1 (videos)
- **Storage:** Cloudinary (images & videos with CDN)
- **Auth:** Clerk (JWT tokens)
- **Monitoring:** Sentry

### Key Features
- ✅ Async image generation (20-45 seconds)
- ✅ Video generation from AI (60-90 seconds)
- ✅ Credit system (20 free, 5/image, 10/video)
- ✅ Auto-refresh polling
- ✅ Background job processing
- ✅ Error recovery with credit refunds
- ✅ Community publishing
- ✅ Download original & generated content

### Security
- JWT authentication via Clerk
- File size limits (5MB per image)
- MIME type validation
- Credit validation before processing
- Error tracking with Sentry

## 🔗 Related Documentation
- [README.md](../README.md) - Project setup and installation
- [MVP.md](MVP.md) - Feature specifications
- [TESTING.md](TESTING.md) - Testing guide
- [MVP-SUMMARY.md](MVP-SUMMARY.md) - Quick reference

## 💡 Tips

1. **For GitHub README:** Use the HTML file link or embed PNG exports
2. **For Presentations:** Export at 1920x1080, use system architecture
3. **For Technical Docs:** Use sequence diagram to explain workflows
4. **For Portfolio:** Use both diagrams with explanations

## ❓ Troubleshooting

**Diagrams not rendering in VS Code?**
- Install "Markdown Preview Mermaid Support" extension
- Restart VS Code
- Open `.md` file and press `Ctrl+Shift+V`

**HTML file not loading diagrams?**
- Check internet connection (loads Mermaid from CDN)
- Try different browser
- Open from file system, not web server

**Export quality poor?**
- Use browser DevTools screenshot method
- Export as SVG for infinite scaling
- Use Mermaid CLI for production quality

---

**Created:** February 2026  
**Updated:** February 10, 2026  
**Project:** UGC Image & Video Generator MVP
