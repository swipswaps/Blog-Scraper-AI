# 🚀 Quick Deploy Guide

## Fastest Way to Deploy (2 Minutes)

### Option 1: Vercel (RECOMMENDED) ⭐

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swipswaps/Blog-Scraper-AI)

**Or Manual:**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import `Blog-Scraper-AI` from GitHub
4. Click "Deploy" (auto-configured!)
5. Done! 🎉

**Your URL:** `https://blog-scraper-ai.vercel.app`

---

### Option 2: Netlify

**One-Click Deploy:**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/swipswaps/Blog-Scraper-AI)

**Or Manual:**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → Select `Blog-Scraper-AI`
4. Click "Deploy site"
5. Done! 🎉

**Your URL:** `https://blog-scraper-ai.netlify.app`

---

### Option 3: GitHub Pages (Already Configured!)

1. Go to your repo: Settings → Pages
2. Source: "GitHub Actions"
3. Push to `main` branch
4. Wait 2 minutes
5. Done! 🎉

**Your URL:** `https://swipswaps.github.io/Blog-Scraper-AI/`

---

## Using Command Line

### Vercel CLI

```bash
# Install
npm install -g vercel

# Login
vercel login

# Deploy
npm run build
vercel --prod
```

### Netlify CLI

```bash
# Install
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

### Or Use Scripts

```bash
# Make executable (first time only)
chmod +x scripts/*.sh

# Deploy to Vercel
./scripts/deploy-vercel.sh

# Deploy to Netlify
./scripts/deploy-netlify.sh
```

---

## What Happens After Deploy?

✅ **Automatic Updates**
- Every push to `main` auto-deploys
- Pull requests get preview URLs
- Rollback anytime with one click

✅ **Free SSL Certificate**
- HTTPS enabled automatically
- Custom domain support

✅ **Global CDN**
- Fast loading worldwide
- Edge caching

✅ **Zero Configuration**
- All settings pre-configured
- Just click deploy!

---

## Custom Domain (Optional)

### Vercel
1. Project Settings → Domains
2. Add your domain
3. Update DNS (A record or CNAME)

### Netlify
1. Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

### GitHub Pages
1. Settings → Pages
2. Custom domain
3. Create CNAME record

---

## Troubleshooting

**Build fails?**
```bash
# Test locally first
npm run build

# Check Node version
node --version  # Should be 18+
```

**404 errors?**
- Already fixed! SPA redirects configured in all platforms

**Slow loading?**
- CDN caching already enabled
- Build is optimized (204KB + 12KB vendor)

---

## Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guides.

---

## Summary

| Platform | Time | Difficulty | URL |
|----------|------|------------|-----|
| **Vercel** | 2 min | ⭐ Easy | `*.vercel.app` |
| **Netlify** | 2 min | ⭐ Easy | `*.netlify.app` |
| **GitHub Pages** | 5 min | ⭐⭐ Medium | `*.github.io` |
| **Cloudflare** | 3 min | ⭐⭐ Medium | `*.pages.dev` |

**Recommendation:** Use Vercel for best performance and easiest setup!

