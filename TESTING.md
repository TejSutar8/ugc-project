# 🧪 Testing Checklist for UGC Generator MVP

## Pre-Testing Setup ✅

### 1. Environment Variables
- [ ] Client `.env` file created with correct values
- [ ] Server `.env` file created with correct values
- [ ] All API keys are valid and not expired

### 2. Dependencies Installed
```bash
# In /server directory
cd server
npm install

# In /client directory
cd client
npm install
```

### 3. Database Ready
```bash
# In /server directory
npx prisma migrate dev
npx prisma generate
```

### 4. Clerk Webhook Configured
- [ ] Webhook endpoint added: `http://localhost:5000/api/clerk`
- [ ] Events subscribed: `user.created`, `user.updated`
- [ ] Signing secret copied to `.env`

---

## Critical Fixes Applied ✅

- [✓] Fixed typo: `GOOGLE_COLUD_API_KEY` → `GOOGLE_CLOUD_API_KEY`
- [✓] Fixed file upload field name: `"Image"` → `"images"`

---

## Manual Testing Steps

### 🔐 Phase 1: Authentication

1. **Start Servers**
   ```bash
   # Terminal 1
   cd server
   npm run server
   
   # Terminal 2
   cd client
   npm run dev
   ```

2. **Test Sign Up**
   - [ ] Open http://localhost:5173
   - [ ] Click "Sign Up" or "Get Started"
   - [ ] Complete registration
   - [ ] Verify email if required
   - [ ] Check you're redirected to home page

3. **Test Sign In**
   - [ ] Sign out
   - [ ] Click "Sign In"
   - [ ] Enter credentials
   - [ ] Successfully logged in

4. **Verify User Profile**
   - [ ] User name displays in navbar
   - [ ] Profile image shows (if uploaded)
   - [ ] User has 20 starter credits

### 📸 Phase 2: Image Generation

5. **Navigate to Generator**
   - [ ] Click "Generate" or "Create" button
   - [ ] Generator page loads (`/generate`)

6. **Upload Images**
   - [ ] Upload a product image (PNG/JPG)
   - [ ] Upload a model/person image (PNG/JPG)
   - [ ] Both preview images display correctly

7. **Fill Form Fields**
   - [ ] Enter project name (e.g., "Test Generation 1")
   - [ ] Enter product name (e.g., "Coffee Mug")
   - [ ] Enter product description (optional)
   - [ ] Enter custom prompt (optional)
   - [ ] Select aspect ratio (9:16 or 16:9)

8. **Generate Image**
   - [ ] Click "Generate" button
   - [ ] Loading state shows
   - [ ] Credits deducted (20 → 15)
   - [ ] Redirects to `/result/:projectId`

9. **Check Result Page**
   - [ ] Generated image displays
   - [ ] Original images shown
   - [ ] Project details correct
   - [ ] No error messages

### 📁 Phase 3: Project Management

10. **View My Generations**
    - [ ] Navigate to "My Generations"
    - [ ] New project appears in list
    - [ ] Thumbnail displays correctly
    - [ ] Click to open project

11. **Delete Project**
    - [ ] Click delete button
    - [ ] Confirm deletion
    - [ ] Project removed from list

### 🌍 Phase 4: Community Feed

12. **Publish to Community**
    - [ ] Open a project
    - [ ] Toggle "Publish to Community" (if feature exists)
    - [ ] Project becomes public

13. **Browse Community**
    - [ ] Navigate to `/community`
    - [ ] Public projects display
    - [ ] Can view other users' generations

### 💰 Phase 5: Credit System

14. **Credit Tracking**
    - [ ] Check initial credits (20)
    - [ ] Generate image (5 credits deducted)
    - [ ] Verify new balance (15 credits)
    - [ ] Try generating with 0 credits (should fail)

15. **Pricing Page**
    - [ ] Navigate to `/plans`
    - [ ] Pricing tiers display
    - [ ] Clear pricing information

---

## 🐛 Common Issues & Solutions

### Issue: "Insufficient credits" error on first generation
**Solution**: Check database - ensure user has 20 default credits

### Issue: Image upload fails
**Solution**: 
- Check Cloudinary credentials in `.env`
- Verify Cloudinary URL format is correct
- Check file size limit (usually 10MB max)

### Issue: AI generation fails
**Solution**:
- Verify Google AI API key is valid
- Check API quota hasn't been exceeded
- Check server logs for specific error

### Issue: "User not found" error
**Solution**:
- Ensure Clerk webhook is working
- Check webhook signing secret matches
- Manually create user in database if needed

### Issue: CORS errors
**Solution**:
- Verify `VITE_BASEURL` in client `.env`
- Check server CORS configuration
- Restart both servers

### Issue: Database connection failed
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run `npx prisma migrate dev` again

---

## 🔍 API Testing (Optional)

### Using Thunder Client / Postman / Insomnia

**Get User Profile**
```http
GET http://localhost:5000/api/user/profile
Authorization: Bearer <clerk_jwt_token>
```

**Get User Projects**
```http
GET http://localhost:5000/api/user/projects
Authorization: Bearer <clerk_jwt_token>
```

**Get Community Feed**
```http
GET http://localhost:5000/api/project/published
```

**Create Project** (use multipart form-data)
```http
POST http://localhost:5000/api/project/create
Authorization: Bearer <clerk_jwt_token>
Content-Type: multipart/form-data

Fields:
- name: "Test Project"
- productName: "Test Product"
- aspectRatio: "9:16"
- images: [file1.jpg, file2.jpg]
```

---

## 📊 Performance Checks

- [ ] Page load < 2 seconds
- [ ] Image upload < 5 seconds
- [ ] AI generation < 30 seconds
- [ ] No console errors
- [ ] No network errors (check DevTools)

---

## 🚨 Critical Features Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| User authentication | ✅ | Clerk integration |
| Image upload | ✅ | Cloudinary storage |
| AI generation | ✅ | Google Gemini AI |
| Credit system | ✅ | Deducts 5 per generation |
| Project management | ✅ | CRUD operations |
| Community feed | ⚠️ | May need pagination |
| Video generation | ⚠️ | Needs testing |
| Payment system | ❌ | Not implemented |
| Download images | ⚠️ | May not work |

---

## 📝 Test Data Suggestions

### Good Test Images
- **Product**: Coffee mug, phone, sunglasses, bottle
- **Model**: Portrait photos, full body shots, professional photos
- **Format**: JPG or PNG
- **Size**: Under 5MB recommended

### Test Prompts
- "Holding the product outdoors with natural lighting"
- "Using the product in a professional setting"
- "Happy person showcasing the product"
- Leave empty for default AI behavior

---

## ✅ MVP Acceptance Criteria

The MVP is ready when:

- [✓] User can sign up and log in
- [✓] User receives 20 starter credits
- [✓] User can upload 2 images
- [✓] AI generates realistic merged image
- [✓] Credits are deducted correctly
- [✓] User can view generation history
- [✓] User can delete projects
- [✓] Community feed displays public projects
- [ ] No critical bugs found

---

## 🎯 Next Steps After Testing

1. **If all tests pass**:
   - Deploy to production
   - Set up production database
   - Update environment variables
   - Configure production URLs

2. **If issues found**:
   - Document all bugs
   - Prioritize by severity
   - Fix critical issues first
   - Re-test after fixes

3. **Future Enhancements**:
   - Add Stripe payment integration
   - Implement video generation
   - Add download functionality
   - Add social sharing
   - Implement analytics

---

## 📞 Support

If you encounter issues:
1. Check console logs (browser & server)
2. Review error messages
3. Check [MVP.md](./MVP.md) for detailed docs
4. Verify environment variables
5. Restart servers

---

**Testing Started**: ___________  
**Testing Completed**: ___________  
**Tested By**: ___________  
**Overall Status**: ⭕ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed
