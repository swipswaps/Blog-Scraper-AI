# Deployment Guide

This guide explains how to deploy the Blog Scraper AI app to various free hosting services.

## 🚀 Quick Deploy Options

### Option 1: Vercel (RECOMMENDED) ⭐

**Why Vercel?**
- Purpose-built for React/Vite apps
- Automatic deployments from GitHub
- Global CDN with edge caching
- Free SSL certificates
- Custom domains
- Zero configuration needed

**Steps:**

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub account

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find `Blog-Scraper-AI` in the list
   - Click "Import"

3. **Configure (Auto-detected)**
   - Framework Preset: Vite ✅ (auto-detected)
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
   - Install Command: `npm install` ✅

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your app is live! 🎉

5. **Your URLs**
   - Production: `https://blog-scraper-ai.vercel.app`
   - Or custom domain: `https://yourdomain.com`

**Automatic Updates:**
- Every push to `main` branch auto-deploys
- Pull requests get preview deployments
- Rollback to any previous deployment with one click

---

### Option 2: Netlify

**Steps:**

1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Sign Up" → "GitHub"

2. **Import Repository**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select `Blog-Scraper-AI`

3. **Configure**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

4. **Your URL**
   - `https://blog-scraper-ai.netlify.app`

---

### Option 3: GitHub Pages

**Steps:**

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Source: "GitHub Actions"

2. **The workflow is already configured!**
   - File: `.github/workflows/deploy-pages.yml`
   - Automatically deploys on push to `main`

3. **Your URL**
   - `https://swipswaps.github.io/Blog-Scraper-AI/`

**Note:** First deployment requires pushing the workflow file:
```bash
git add .github/workflows/deploy-pages.yml
git commit -m "Add GitHub Pages deployment"
git push origin main
```

---

### Option 4: Cloudflare Pages

**Steps:**

1. **Sign up for Cloudflare**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up with email or GitHub

2. **Create a Project**
   - Click "Create a project"
   - Connect to GitHub
   - Select `Blog-Scraper-AI`

3. **Configure**
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

4. **Deploy**
   - Click "Save and Deploy"
   - Your URL: `https://blog-scraper-ai.pages.dev`

---

### Option 5: GitLab Pages

**Steps:**

1. **Push to GitLab** (if not already there)
   ```bash
   git remote add gitlab https://gitlab.com/yourusername/Blog-Scraper-AI.git
   git push gitlab main
   ```

2. **The CI/CD is already configured!**
   - File: `.gitlab-ci.yml`
   - Automatically builds and deploys

3. **Your URL**
   - `https://yourusername.gitlab.io/Blog-Scraper-AI/`

---

## 🔧 Configuration Files Included

All necessary configuration files are included in the repository:

- ✅ `vercel.json` - Vercel configuration
- ✅ `netlify.toml` - Netlify configuration  
- ✅ `.github/workflows/deploy-pages.yml` - GitHub Pages workflow
- ✅ `.gitlab-ci.yml` - GitLab CI/CD configuration

## 🔒 Security Headers

All deployment configurations include security headers:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy
- `Cache-Control` - Optimized caching for assets

## 🌐 Custom Domains

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

### GitHub Pages
1. Go to Settings → Pages
2. Add custom domain
3. Create CNAME record

## 📊 Comparison

| Feature | Vercel | Netlify | GitHub Pages | Cloudflare | GitLab |
|---------|--------|---------|--------------|------------|--------|
| Setup Time | 2 min | 2 min | 5 min | 3 min | 5 min |
| Auto Deploy | ✅ | ✅ | ✅ | ✅ | ✅ |
| Preview Deploys | ✅ | ✅ | ❌ | ✅ | ✅ |
| Custom Domain | ✅ Free | ✅ Free | ✅ Free | ✅ Free | ✅ Free |
| SSL | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |
| Bandwidth | 100GB | 100GB | 100GB | Unlimited | 10GB |
| Build Minutes | Unlimited | 300/mo | Unlimited | 500/mo | 400/mo |
| CDN | ✅ Global | ✅ Global | ✅ | ✅ Global | ✅ |
| Analytics | ✅ | ✅ | ❌ | ✅ | ✅ |

## 🎯 Recommendation

**For this app, use Vercel:**
- Best performance for React/Vite
- Easiest setup
- Best developer experience
- Automatic optimizations
- Free tier is generous

## 🚨 Important Notes

1. **No Environment Variables Needed**
   - This app runs entirely client-side
   - No API keys or secrets required
   - All scraping happens in the browser

2. **CORS Proxies**
   - The app uses public CORS proxies
   - These are already configured in the code
   - No server-side setup needed

3. **Build Size**
   - Current build: ~217 KB (gzipped: ~68 KB)
   - Well within all free tier limits

4. **No Backend Required**
   - Pure static site
   - No server costs
   - No database needed

## 📱 Testing Your Deployment

After deployment, test these features:

1. ✅ Enter a blog URL and fetch posts
2. ✅ Search and filter posts
3. ✅ Download CSV/JSON
4. ✅ Keyboard shortcuts (Ctrl+Enter)
5. ✅ Copy to clipboard
6. ✅ Pagination
7. ✅ Mobile responsiveness

## 🔄 Updating Your Deployment

All platforms auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Deployment happens automatically!
```

## 🆘 Troubleshooting

**Build fails?**
- Check Node version (should be 18+)
- Ensure `package-lock.json` is committed
- Check build logs for errors

**404 errors?**
- Ensure SPA redirects are configured (already done in config files)
- Check that `dist` folder is being deployed

**Slow loading?**
- Enable CDN caching (already configured)
- Check network tab for large assets

## 📞 Support

- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- GitHub Pages: [docs.github.com/pages](https://docs.github.com/en/pages)

