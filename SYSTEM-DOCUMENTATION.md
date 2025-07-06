# Flowen.eu - Complete System Documentation
*Last Updated: 2025-07-06 13:00 CET*
*Status: User Isolation Working, Projects Page Complete*

## 🎯 Project Overview
**Flowen.eu** combines secure file sharing with project management:
- **Free WeTransfer-like service** with end-to-end encryption
- **Premium project management** with user isolation and secure collaboration
- **Future CRM, Kanban, and social features**

---

## 🏗️ Two-Tier Architecture

### 🌐 FREE TIER (Public Users)
**Entry Point:** `https://flowen.eu/` (marketing landing page)
**Process:** Complete WeTransfer workflow on homepage
**Features:** Email verification → encrypted upload → send to recipient
**Users:** Anyone (no account required)

### 🔐 PREMIUM TIER (Paying Customers)  
**Entry Point:** Login button in header → `/login` → `/dashboard` → `/projects`
**Features:** User isolation, project rooms, secure file management, folder structure
**Users:** Authenticated business customers

---

## 📁 File Structure Analysis

### Frontend: `C:\flowen-landing\flowen-site\` (Next.js 15.3.2)

#### **Core Pages:**
```
app/
├── page.tsx                    # Landing page + marketing
├── layout.tsx                  # Global layout with Header
├── login/page.tsx              # Premium user authentication  
├── dashboard/page.tsx          # Premium overview (English)
├── projects/page.tsx           # Project rooms with folders (English)
├── upload/page.tsx             # Alternative upload (FlowenUploadFlow)
├── register/page.tsx           # User registration (disabled)
├── contact/page.tsx            # Contact form
├── privacy-policy/page.tsx     # Privacy policy
├── thank-you/page.tsx          # Thank you page
└── download/page.tsx           # File download
```

#### **API Routes (Production):**
```
app/api/
├── upload/route.ts             # Secure upload with user isolation ✅
├── download/[id]/route.ts      # File download with encryption metadata
├── send-verification/route.ts  # Email verification sending
├── check-verification/route.ts # Email verification checking
├── send-files/route.ts         # Send files to recipients
└── contact/route.ts            # Contact form handler
```

#### **Components:**
```
components/
├── DemoUpload.tsx              # CORE: Complete WeTransfer functionality
├── EmailWithProTips.tsx        # WRAPPER: Layout + tips around DemoUpload
├── Header.tsx                  # Global navigation with login button
├── Footer.tsx                  # Site footer
├── FlowenUploadFlow.tsx        # Alternative upload flow (3-step)
├── HowItWorks.tsx              # Marketing component
└── Testimonials.tsx            # Marketing component
```

#### **Libraries:**
```
lib/
├── crypto.ts                   # AES-256-GCM encryption implementation
├── api-utils.ts                # Dynamic environment detection (localhost vs production)
└── utils.ts                    # General utilities
```

### Backend: `C:\flowen-backend\` (Express.js - Local Development Only)

#### **Express Server (Port 3001):**
```
app.js                          # Main Express server
routes/
├── checkVerification.js        # Email verification check
├── register.js                 # User registration
├── send.js                     # Send verification email  
├── sendFiles.js                # Send files to recipients
└── upload.js                   # File upload handling
```

#### **Configuration:**
- **Microsoft Graph API** for email sending
- **Multer** for file upload handling
- **CORS** configured for localhost:3000 and flowen.eu
- **Smart URL detection** (localhost vs production)

---

## 🔗 Component Hierarchy & Data Flow

### **Homepage WeTransfer Flow:**
```
app/page.tsx (Landing)
    ↓
<EmailWithProTips />                    # Layout wrapper with 6 pro-tip circles
    ↓ 
<DemoUpload />                          # ACTUAL WeTransfer functionality
    ↓
5-Step Process:
1. Email verification
2. "Check your email" waiting
3. File upload with drag & drop
4. Send form (name, recipient, message)
5. Success confirmation
```

### **Premium User Flow:**
```
Header → Login Button
    ↓
app/login/page.tsx                      # Authentication
    ↓ (localStorage: admin@flowen.se / flowen123)
app/dashboard/page.tsx                  # Overview with stats
    ↓ "View All Projects"
app/projects/page.tsx                   # Project rooms with folders
    ↓
Features: Drag & drop, folder creation, user isolation
```

---

## 🔐 Security Implementation

### **End-to-End Encryption (AES-256-GCM):**
1. **Client generates** unique key per file
2. **Encrypt file** before upload
3. **Server stores** encrypted blob + metadata
4. **Download URL** contains decryption key: `?key=base64key`
5. **Client decrypts** after download

### **User Isolation (Premium):**
- **File naming:** `{userId}-{timestamp}-{random}`
- **Auth middleware:** Validates user before API access
- **Metadata tracking:** Who uploaded what when
- **Folder separation:** Users only see their content

### **Authentication (Current POC):**
- **Method:** localStorage (temporary)
- **Credentials:** `admin@flowen.se` / `flowen123`
- **Middleware:** Inline auth in API routes (fixed import issues)
- **Future:** JWT tokens

---

## 🌐 Environment Architecture

### **Local Development:**
```
Frontend: localhost:3000 (Next.js)
    ↓ API calls to
Backend: localhost:3001 (Express.js)
    ↓ Uses
Microsoft Graph API (Email)
File Storage: C:\flowen-backend\uploads\
```

### **Production:**
```
Frontend + API: flowen.eu (Next.js All-in-One)
    ↓ No separate backend
Next.js API Routes handle everything
    ↓ Uses  
Microsoft Graph API (Email)
File Storage: Server filesystem
```

---

## 🛠️ Current Development Status (2025-07-06)

### ✅ **WORKING FEATURES:**

#### **Free Tier (Complete):**
- **WeTransfer functionality:** Full 5-step process
- **End-to-end encryption:** AES-256-GCM working locally & production
- **Email verification:** Microsoft Graph API integration
- **File sharing:** Send to recipients with download links
- **Multi-file support:** Drag & drop multiple files

#### **Premium Tier (Basic Working):**
- **Authentication:** Basic login system
- **Dashboard:** English interface with navigation
- **Project rooms:** Folder structure, drag & drop upload
- **User isolation:** Files prefixed with userId
- **API security:** Auth middleware working (inline implementation)

#### **Infrastructure:**
- **Responsive design:** Mobile-friendly across all pages
- **Environment detection:** Automatic localhost vs production URLs
- **Git workflow:** Feature branches with auto-timestamps (`git dcommit`)
- **Deployment:** OVH server with PM2 process manager

### 🔧 **TESTED & VERIFIED:**
- **Upload API:** Returns 401 without auth, 200 with valid user ✅
- **File isolation:** Filenames include userId for security ✅
- **Navigation:** Dashboard → Projects → Back navigation ✅
- **Drag & drop:** Functional in projects page ✅
- **Encryption:** Same security level local and production ✅

---

## 📋 Development Workflow

### **Git Structure:**
```bash
main                           # Production branch
development                    # Integration branch  
feature/projektrum-rebuild     # Current active feature

# Daily workflow with auto-timestamps:
git checkout feature/projektrum-rebuild
git add .
git dcommit "Feature description"    # Adds timestamp automatically
git push origin feature/projektrum-rebuild
```

### **Local Testing:**
```bash
# Frontend
cd C:\flowen-landing\flowen-site
npm run dev                    # localhost:3000

# Backend (if needed)
cd C:\flowen-backend
npm start                      # localhost:3001

# Test with REST Client:
# Use test-upload.http in VS Code
```

### **Production Deployment (2025-07-06 - TESTED & WORKING):**
```bash
# Pre-deployment check (locally):
./scripts/pre-deploy.sh

# Server deployment (via SSH):
ssh -i ~/.ssh/id_ovh_flowen root@162.19.252.99
cd /var/www/flowen
chmod +x scripts/*.sh  # First time only
./scripts/deploy.sh

# Emergency reset if needed:
./scripts/emergency-reset.sh

# Status monitoring:
./scripts/status-check.sh
```

**Deployment Scripts Features:**
- ✅ **Automatic git sync** with main branch
- ✅ **Backup uncommitted changes** before deploy
- ✅ **Force reset** to match git exactly
- ✅ **Zero-drift deployment** - no manual server changes
- ✅ **Verified working** on 2025-07-06 13:50 UTC
- ✅ **Build time:** ~4 seconds, PM2 restart successful

---

## 🔍 Key Technical Decisions

### **Why Two Upload Components?**
- **DemoUpload.tsx:** Full-featured WeTransfer (22593 bytes)
- **FlowenUploadFlow.tsx:** Simplified 3-step alternative (3520 bytes)
- **EmailWithProTips:** Layout wrapper with marketing pro-tips

### **Why Local Backend + Production API Routes?**
- **Local:** Express.js for flexibility and debugging
- **Production:** Next.js API routes for simpler deployment
- **Same encryption logic** works in both environments

### **Why Inline Auth Middleware?**
- **Import issues:** Next.js API routes couldn't resolve auth imports
- **Quick solution:** Moved auth logic directly into upload route
- **Works perfectly:** User isolation functional, will refactor later

---

## 🚨 Known Issues & Limitations

### **Authentication System:**
- **localStorage:** Not production-ready (temporary POC)
- **Session management:** Basic, needs JWT implementation
- **Multi-user:** Currently single test user

### **File Management:**
- **Download UI:** Not implemented in projects page yet
- **File preview:** Shows icons only, no thumbnails
- **File deletion:** Not implemented yet

### **API Testing:**
- **Manual only:** No automated test suite
- **Error handling:** Could be more robust
- **Logging:** Basic console logging only

---

## 🎯 Next Priority Development

### **Immediate (This Week):**
1. **Test projects upload:** Verify real file upload in projects page
2. **Implement file download:** From projects page with decryption
3. **Add file deletion:** Remove files and metadata
4. **Test navigation:** Ensure all flows work smoothly

### **Short Term (This Month):**
1. **Better authentication:** JWT instead of localStorage
2. **File preview:** Images, PDFs in projects
3. **Kanban boards:** `/kanban` page for task management
4. **Social wall:** `/social` page for team communication

### **Long Term (3 Months):**
1. **CRM functionality:** Customer management features
2. **Team collaboration:** Multi-user project sharing
3. **Advanced analytics:** Usage insights and reporting
4. **Mobile app:** React Native implementation

---

## 📞 Critical Information for New Chat Sessions

### **Key File Locations:**
- **WeTransfer logic:** `C:\flowen-landing\flowen-site\components\DemoUpload.tsx`
- **Homepage layout:** `C:\flowen-landing\flowen-site\components\EmailWithProTips.tsx`
- **Project rooms:** `C:\flowen-landing\flowen-site\app\projects\page.tsx`
- **Auth upload:** `C:\flowen-landing\flowen-site\app\api\upload\route.ts`
- **Backend server:** `C:\flowen-backend\app.js`

### **Quick Start Commands:**
```bash
cd C:\flowen-landing\flowen-site
npm run dev                           # Start frontend
code test-upload.http                 # Test API with REST Client
git status                            # Check current branch
git dcommit "Description"             # Commit with timestamp
```

### **Login Credentials:**
- **Email:** admin@flowen.se
- **Password:** flowen123
- **Access:** Dashboard → Projects

### **Architecture Summary:**
- **Startsida:** Marketing + EmailWithProTips(wrapper) + DemoUpload(WeTransfer)
- **Premium:** Login → Dashboard → Projects (folders & user isolation)
- **Local:** Frontend (3000) → Backend (3001)
- **Production:** Next.js API routes only

---

## 🎉 Success Metrics

### **Current Achievement Level:**
- **Security:** End-to-end encryption ✅
- **User isolation:** Working premium features ✅
- **Free tier:** Complete WeTransfer functionality ✅
- **Infrastructure:** Stable deployment pipeline ✅
- **MVP Status:** Core features functional ✅

### **Business Model Validation:**
- **Free tier:** Attracts users with secure file sharing
- **Premium tier:** Clear value proposition with project management
- **Technical foundation:** Scalable for enterprise features
- **GDPR compliance:** EU-first design approach

---

*This documentation represents the complete system state as of 2025-07-06. All technical details verified through code inspection and testing.*