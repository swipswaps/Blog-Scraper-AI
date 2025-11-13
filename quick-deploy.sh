#!/bin/bash

# One-Command Deployment for Blog Scraper AI
# Usage: ./quick-deploy.sh [vercel|netlify|github]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PLATFORM=${1:-vercel}

echo -e "${CYAN}🚀 Quick Deploy to ${PLATFORM}...${NC}\n"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install > /dev/null 2>&1
fi

# Build
echo -e "${YELLOW}🔨 Building...${NC}"
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Build complete!${NC}\n"

# Deploy based on platform
case $PLATFORM in
    vercel)
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Installing Vercel CLI...${NC}"
            npm install -g vercel > /dev/null 2>&1
        fi
        echo -e "${CYAN}Deploying to Vercel...${NC}"
        vercel --prod
        ;;
    netlify)
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}Installing Netlify CLI...${NC}"
            npm install -g netlify-cli > /dev/null 2>&1
        fi
        echo -e "${CYAN}Deploying to Netlify...${NC}"
        netlify deploy --prod --dir=dist
        ;;
    github)
        echo -e "${CYAN}Pushing to GitHub...${NC}"
        git add .
        git commit -m "Deploy to GitHub Pages" || true
        git push origin main
        echo -e "${GREEN}✅ Pushed! GitHub Actions will deploy automatically.${NC}"
        ;;
    *)
        echo -e "${YELLOW}Usage: ./quick-deploy.sh [vercel|netlify|github]${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎉 Deployment complete!${NC}\n"

