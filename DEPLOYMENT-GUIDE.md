## System Komponenter

### 1. Fildelning
- Upload filer lokalt
- Email med downloadlänkar
- GDPR-fokuserad messaging

### 2. Formulär med API Integration
- **[Behöver kartläggas]** - Vilka formulär?
- Trolig Microsoft Graph användning här
- API-integration för Office 365 data

### 3. Användarhantering
- Registrering via `/register`
- JWT-baserad autentisering
- Email verifiering

## API Arkitektur

### Dubbel API-struktur
**Next.js API Routes** (Frontend layer):
- `/api/upload` - Frontend upload wrapper
- `/api/send-files` - Frontend send wrapper  
- `/api/contact` - Kontaktformulär
- `/api/send-verification` - Email verifiering
- `/api/check-verification` - Verifiering check

**Express Backend** (Huvudbackend):
- `/register` - Användarregistrering
- `/send` - Email-funktionalitet  
- `/sendFiles` - Skickar email med fillänkar
- `/upload` - Filuppladdning till `/uploads/`
- `/checkVerification` - Email verifiering

*Troligen anropar Next.js API:erna Express backend internt*

### Fildelningsflöde

### Upload Process
1. **Frontend:** Användare laddar upp filer via Next.js interface
2. **Backend `/upload`:** 
   - Multer sparar filer i `C:\flowen-backend\uploads\`
   - Filnamn: `timestamp-originalname`
   - Returnerar: `{filename, url}` för varje fil
3. **Backend `/sendFiles`:**
   - Tar emot fillänkar och mottagarinfo
   - Skickar HTML-email med downloadlänkar
   - Loggar aktivitet i `email-activity.json`

### Fillagring
- **Lokal:** `C:\flowen-backend\uploads\`
- **URL-format:** `http://localhost:3001/uploads/filename`
- **Namnkonvention:** `Date.now()-originalname`

### Frontend
- **Framework:** Next.js 15.3.2 + React 18.3.1 + TypeScript
- **Location:** `C:\flowen-landing\flowen-site`
- **UI-bibliotek:** Tailwind CSS + Radix UI (Avatar)
- **App Router Structure:**
  - `/` - Landing page (page.tsx - 10KB)
  - `/upload` - Filuppladdning
  - `/download` - Filnedladdning
  - `/register` - Användarregistrering
  - `/login` - Inloggning
  - `/contact` - Kontaktformulär
  - `/privacy-policy` - GDPR/Privacy policy
  - `/thank-you` - Bekräftelsesida
  - `/api` - Next.js API routes (frontend API layer)
- **Main Components:**
  - `DemoUpload.tsx` - Huvuduppladdningsgränssnitt (19KB - stor komponent)
  - `FlowenUploadFlow.tsx` - Upload workflow
  - `FlowenEmailVerification.tsx` - Email verifiering
  - `FlowenVerificationSent.tsx` - Verifiering skickad
  - `EmailWithProTips.tsx` - Email med tips/funktionalitet
  - `Header.tsx` / `Footer.tsx` - Layout
  - `HowItWorks.tsx` / `Testimonials.tsx` - Landing page content
- **Dependencies:**
  - ~~Supabase~~ (ej längre använd)
  - EmailJS (@emailjs/browser)
  - Axios för HTTP requests till backend
  - Lucide React för ikoner
- **Dev command:** `npm run dev` (port 3000, tillgänglig på 0.0.0.0)

### Backend
- **Framework:** Node.js + Express 5.1.0 (hybrid CommonJS/ES modules)
- **Location:** `C:\flowen-backend`
- **Port:** 3001
- **Main file:** app.js
- **Dev command:** `npm run dev` (nodemon)
- **API Routes:**
  - `/register` - Användarregistrering
  - `/send` - Email-funktionalitet  
  - `/sendFiles` - Skickar email med fillänkar
  - `/upload` - Filuppladdning till `/uploads/` mapp
  - `/checkVerification` - Email verifiering
- **Static files:** `/uploads/` mappas för direktåtkomst
- **Logging:** Email aktivitet sparas i `email-activity.json`
- **Dependencies:**
  - **Microsoft Graph:** @azure/msal-node + @microsoft/microsoft-graph-client *(användning behöver kartläggas)*
  - **Authentication:** jsonwebtoken (JWT)
  - **File uploads:** multer
  - **Email:** nodemailer
  - **CORS:** cors
  - **Utils:** axios, uuid, crypto

### Autentisering & Integration
- **Microsoft Graph:** MSAL Node (@azure/msal-node) + Graph Client
- **JWT:** Egen JWT-baserad autentisering (jsonwebtoken)
- **Location:** Backend hanterar Graph integration
- **Environment konfiguration:**
  - CLIENT_ID: Azure App Registration
  - TENANT_ID: Azure AD Tenant
  - CLIENT_SECRET: Azure App Secret
  - JWT_SECRET: För egen autentisering
  - NODE_ENV: development/production
  - BASE_URL: Backend URL (localhost:3001 / produktion)

## GDPR & Säkerhet
- **Fokus:** EU-first, GDPR-compliance
- **[Behöver kartläggas]**
  - Data encryption?
  - User consent hantering?
  - Audit trails?

## Deployment Process
- **Git:** GitHub repository
- **[Behöver kartläggas]**
  - Build process?
  - Deployment automatisering?
  - Environment variables?

---

## Nästa steg för kartläggning

För att fylla i de tomma delarna, behöver vi kolla:

1. **Package.json filer** (både frontend och backend)
2. **MSAL konfiguration** i React-appen
3. **Graph API setup** och permissions
4. **Backend API struktur** och endpoints
5. **Databaskonfiguration**
6. **Environment variables** och konfiguration
7. **Build och deployment scripts**

### Kommandon att köra för kartläggning:

```bash
# I frontend-mappen
cat package.json
ls src/
cat src/App.js  # eller huvudkomponent

# I backend-mappen  
cat package.json
ls routes/ # eller motsvarande
cat server.js # eller huvudfil

# Kolla environment
ls .env*
```