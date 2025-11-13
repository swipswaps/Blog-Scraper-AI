#!/bin/bash

# One-Command Deployment for Blog Scraper AI
# Usage: ./quick-deploy.sh [vercel|netlify|github|gitlab]

# Don't exit on error - we'll handle errors gracefully
set +e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Emojis
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
ROCKET="🚀"
GEAR="⚙️"
PARTY="🎉"

PLATFORM=${1:-vercel}

echo -e "${CYAN}${ROCKET} Quick Deploy to ${PLATFORM}...${NC}\n"

# Helper function to check command existence
command_exists() {
    command -v "$1" &> /dev/null
}

# Helper function to check if user is logged in to Vercel
check_vercel_auth() {
    if vercel whoami &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Helper function to check if user is logged in to Netlify
check_netlify_auth() {
    if netlify status &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    if ! npm install > /dev/null 2>&1; then
        echo -e "${RED}${CROSS} Failed to install dependencies${NC}"
        echo -e "${YELLOW}Try running: ${CYAN}npm install${NC}"
        exit 1
    fi
fi

# Build
echo -e "${YELLOW}🔨 Building...${NC}"
if ! npm run build > /dev/null 2>&1; then
    echo -e "${RED}${CROSS} Build failed${NC}"
    echo -e "${YELLOW}Try running: ${CYAN}npm run build${NC}"
    exit 1
fi
echo -e "${GREEN}${CHECK} Build complete!${NC}\n"

# Deploy based on platform
case $PLATFORM in
    vercel)
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${PURPLE}${ROCKET} Deploying to Vercel${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Check if Vercel CLI is installed
        if ! command_exists vercel; then
            echo -e "${YELLOW}${GEAR} Installing Vercel CLI...${NC}"
            if ! npm install -g vercel > /dev/null 2>&1; then
                echo -e "${RED}${CROSS} Failed to install Vercel CLI${NC}"
                echo -e "${YELLOW}Try running: ${CYAN}npm install -g vercel${NC}"
                exit 1
            fi
            echo -e "${GREEN}${CHECK} Vercel CLI installed${NC}\n"
        fi

        # Check if user is logged in
        if ! check_vercel_auth; then
            echo -e "${YELLOW}${WARNING} You're not logged in to Vercel${NC}\n"
            echo -e "${CYAN}${GEAR} Let me help you log in...${NC}"
            echo -e "${YELLOW}A browser window will open. Please:${NC}"
            echo -e "${CYAN}1. Confirm the login in your browser${NC}"
            echo -e "${CYAN}2. Return to this terminal${NC}\n"

            if ! vercel login; then
                echo -e "\n${RED}${CROSS} Login failed${NC}"
                echo -e "${YELLOW}Please try: ${CYAN}vercel login${NC}"
                exit 1
            fi
            echo -e "\n${GREEN}${CHECK} Successfully logged in!${NC}\n"
        else
            user=$(vercel whoami 2>/dev/null)
            echo -e "${GREEN}${CHECK} Logged in as: ${CYAN}${user}${NC}\n"
        fi

        # Provide helpful guidance for first-time deployment
        echo -e "${CYAN}${GEAR} Deploying to Vercel...${NC}\n"
        echo -e "${YELLOW}${WARNING} First-time setup tips:${NC}"
        echo -e "${CYAN}• When asked 'Link to existing project?'${NC}"
        echo -e "  ${GREEN}→ Choose 'No' to create a new project${NC}"
        echo -e "${CYAN}• Project name:${NC}"
        echo -e "  ${GREEN}→ Use 'Blog-Scraper-AI' or any name you like${NC}"
        echo -e "${CYAN}• Directory:${NC}"
        echo -e "  ${GREEN}→ Press Enter to use current directory (./)${NC}"
        echo -e "${CYAN}• Override settings?${NC}"
        echo -e "  ${GREEN}→ Choose 'No' (Vercel auto-detects Vite)${NC}\n"

        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Deploy
        if vercel --prod; then
            echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}${PARTY} Successfully deployed to Vercel!${NC}"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

            # Extract the production URL from Vercel output
            echo -e "${CYAN}${ROCKET} Your app is now live!${NC}\n"

            echo -e "${YELLOW}📋 What's Next?${NC}\n"

            echo -e "${CYAN}1. ${GREEN}View Your Live App${NC}"
            echo -e "   ${PURPLE}→${NC} Check the Production URL above"
            echo -e "   ${PURPLE}→${NC} Or visit: ${CYAN}https://vercel.com/dashboard${NC}\n"

            echo -e "${CYAN}2. ${GREEN}Test Your Blog Scraper${NC}"
            echo -e "   ${PURPLE}→${NC} Enter a GoDaddy blog URL (e.g., https://example.godaddysites.com)"
            echo -e "   ${PURPLE}→${NC} Click 'Fetch Blog Posts'"
            echo -e "   ${PURPLE}→${NC} View and export your scraped content\n"

            echo -e "${CYAN}3. ${GREEN}Automatic Deployments${NC}"
            echo -e "   ${PURPLE}→${NC} Connect your GitHub repo in Vercel dashboard"
            echo -e "   ${PURPLE}→${NC} Every git push will auto-deploy\n"

            echo -e "${CYAN}4. ${GREEN}Manage Your Project${NC}"
            echo -e "   ${PURPLE}→${NC} Dashboard: ${CYAN}https://vercel.com/dashboard${NC}"
            echo -e "   ${PURPLE}→${NC} View logs, analytics, and settings\n"

            echo -e "${YELLOW}💡 Pro Tips:${NC}"
            echo -e "${CYAN}• Set up a custom domain in Vercel dashboard${NC}"
            echo -e "${CYAN}• Enable analytics to track usage${NC}"
            echo -e "${CYAN}• Check deployment logs if issues occur${NC}\n"

            echo -e "${GREEN}${PARTY} Deployment complete! Happy scraping! ${PARTY}${NC}\n"
        else
            echo -e "\n${RED}${CROSS} Deployment failed${NC}"
            echo -e "${YELLOW}Common issues:${NC}"
            echo -e "${CYAN}• If project not found: Choose 'No' when asked to link${NC}"
            echo -e "${CYAN}• If authentication error: Run ${GREEN}vercel login${NC}"
            echo -e "${CYAN}• For help: Run ${GREEN}./deploy.sh${CYAN} for interactive mode${NC}\n"
            exit 1
        fi
        ;;
    netlify)
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${PURPLE}${ROCKET} Deploying to Netlify${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Check if Netlify CLI is installed
        if ! command_exists netlify; then
            echo -e "${YELLOW}${GEAR} Installing Netlify CLI...${NC}"
            if ! npm install -g netlify-cli > /dev/null 2>&1; then
                echo -e "${RED}${CROSS} Failed to install Netlify CLI${NC}"
                echo -e "${YELLOW}Try running: ${CYAN}npm install -g netlify-cli${NC}"
                exit 1
            fi
            echo -e "${GREEN}${CHECK} Netlify CLI installed${NC}\n"
        fi

        # Check if user is logged in
        if ! check_netlify_auth; then
            echo -e "${YELLOW}${WARNING} You're not logged in to Netlify${NC}\n"
            echo -e "${CYAN}${GEAR} Let me help you log in...${NC}"
            echo -e "${YELLOW}A browser window will open. Please:${NC}"
            echo -e "${CYAN}1. Authorize Netlify CLI${NC}"
            echo -e "${CYAN}2. Return to this terminal${NC}\n"

            if ! netlify login; then
                echo -e "\n${RED}${CROSS} Login failed${NC}"
                echo -e "${YELLOW}Please try: ${CYAN}netlify login${NC}"
                exit 1
            fi
            echo -e "\n${GREEN}${CHECK} Successfully logged in!${NC}\n"
        else
            echo -e "${GREEN}${CHECK} Already logged in to Netlify${NC}\n"
        fi

        # Provide helpful guidance
        echo -e "${CYAN}${GEAR} Deploying to Netlify...${NC}\n"
        echo -e "${YELLOW}${WARNING} First-time setup tips:${NC}"
        echo -e "${CYAN}• When asked to create a new site:${NC}"
        echo -e "  ${GREEN}→ Choose 'Yes'${NC}"
        echo -e "${CYAN}• Site name:${NC}"
        echo -e "  ${GREEN}→ Use 'blog-scraper-ai' or leave blank for random${NC}\n"

        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Deploy
        if netlify deploy --prod --dir=dist; then
            echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}${PARTY} Successfully deployed to Netlify!${NC}"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

            echo -e "${CYAN}${ROCKET} Your app is now live!${NC}\n"

            echo -e "${YELLOW}📋 What's Next?${NC}\n"

            echo -e "${CYAN}1. ${GREEN}View Your Live App${NC}"
            echo -e "   ${PURPLE}→${NC} Check the Website URL above"
            echo -e "   ${PURPLE}→${NC} Or visit: ${CYAN}https://app.netlify.com/sites${NC}\n"

            echo -e "${CYAN}2. ${GREEN}Test Your Blog Scraper${NC}"
            echo -e "   ${PURPLE}→${NC} Enter a GoDaddy blog URL (e.g., https://example.godaddysites.com)"
            echo -e "   ${PURPLE}→${NC} Click 'Fetch Blog Posts'"
            echo -e "   ${PURPLE}→${NC} View and export your scraped content\n"

            echo -e "${CYAN}3. ${GREEN}Automatic Deployments${NC}"
            echo -e "   ${PURPLE}→${NC} Connect your GitHub repo in Netlify dashboard"
            echo -e "   ${PURPLE}→${NC} Every git push will auto-deploy\n"

            echo -e "${CYAN}4. ${GREEN}Manage Your Project${NC}"
            echo -e "   ${PURPLE}→${NC} Dashboard: ${CYAN}https://app.netlify.com${NC}"
            echo -e "   ${PURPLE}→${NC} View logs, analytics, and settings\n"

            echo -e "${YELLOW}💡 Pro Tips:${NC}"
            echo -e "${CYAN}• Set up a custom domain in Netlify dashboard${NC}"
            echo -e "${CYAN}• Enable form handling and serverless functions${NC}"
            echo -e "${CYAN}• Check deploy logs if issues occur${NC}\n"

            echo -e "${GREEN}${PARTY} Deployment complete! Happy scraping! ${PARTY}${NC}\n"
        else
            echo -e "\n${RED}${CROSS} Deployment failed${NC}"
            echo -e "${YELLOW}Common issues:${NC}"
            echo -e "${CYAN}• If authentication error: Run ${GREEN}netlify login${NC}"
            echo -e "${CYAN}• If site not found: Create a new site when prompted${NC}"
            echo -e "${CYAN}• For help: Run ${GREEN}./deploy.sh${CYAN} for interactive mode${NC}\n"
            exit 1
        fi
        ;;
    github)
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${PURPLE}${ROCKET} Deploying to GitHub Pages${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Check if in git repo
        if ! git rev-parse --git-dir > /dev/null 2>&1; then
            echo -e "${RED}${CROSS} Not a git repository${NC}"
            echo -e "${YELLOW}Initialize git first: ${CYAN}git init${NC}"
            exit 1
        fi

        # Check for remote
        if ! git config --get remote.origin.url > /dev/null 2>&1; then
            echo -e "${RED}${CROSS} No remote repository configured${NC}"
            echo -e "${YELLOW}Add a remote: ${CYAN}git remote add origin <url>${NC}"
            exit 1
        fi

        echo -e "${CYAN}${GEAR} Pushing to GitHub...${NC}"
        git add .
        git commit -m "Deploy to GitHub Pages" 2>/dev/null || echo -e "${YELLOW}No changes to commit${NC}"

        if git push origin main 2>&1; then
            repo_path=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')

            echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}${PARTY} Deployment initiated!${NC}"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

            echo -e "${CYAN}${ROCKET} GitHub Actions is building your app...${NC}\n"

            echo -e "${YELLOW}📋 What's Next?${NC}\n"

            echo -e "${CYAN}1. ${GREEN}Enable GitHub Pages (REQUIRED - First Time Only)${NC}"
            echo -e "   ${PURPLE}→${NC} Open: ${CYAN}https://github.com/${repo_path}/settings/pages${NC}"
            echo -e "   ${PURPLE}→${NC} Under 'Build and deployment', set Source to: ${YELLOW}'GitHub Actions'${NC}"
            echo -e "   ${PURPLE}→${NC} Save settings\n"

            echo -e "${CYAN}2. ${GREEN}Monitor Deployment${NC}"
            echo -e "   ${PURPLE}→${NC} View progress: ${CYAN}https://github.com/${repo_path}/actions${NC}"
            echo -e "   ${PURPLE}→${NC} Wait 2-3 minutes for build to complete\n"

            echo -e "${CYAN}3. ${GREEN}View Your Live App${NC}"
            echo -e "   ${PURPLE}→${NC} Once deployed: ${CYAN}https://${repo_path%%/*}.github.io/${repo_path##*/}${NC}"
            echo -e "   ${PURPLE}→${NC} Or check: ${CYAN}https://github.com/${repo_path}/settings/pages${NC}\n"

            echo -e "${CYAN}4. ${GREEN}Test Your Blog Scraper${NC}"
            echo -e "   ${PURPLE}→${NC} Enter a GoDaddy blog URL (e.g., https://example.godaddysites.com)"
            echo -e "   ${PURPLE}→${NC} Click 'Fetch Blog Posts'"
            echo -e "   ${PURPLE}→${NC} View and export your scraped content\n"

            echo -e "${CYAN}5. ${GREEN}Automatic Deployments${NC}"
            echo -e "   ${PURPLE}→${NC} Every git push to main will auto-deploy"
            echo -e "   ${PURPLE}→${NC} No manual steps needed!\n"

            echo -e "${YELLOW}💡 Pro Tips:${NC}"
            echo -e "${CYAN}• Run ${GREEN}./enable-github-pages.sh${CYAN} for interactive setup${NC}"
            echo -e "${CYAN}• Check Actions tab if deployment fails${NC}"
            echo -e "${CYAN}• Use a custom domain if desired${NC}\n"

            echo -e "${YELLOW}${WARNING} IMPORTANT: If you get a 404 error:${NC}"
            echo -e "${CYAN}• GitHub Pages is not enabled yet${NC}"
            echo -e "${CYAN}• Run: ${GREEN}./enable-github-pages.sh${NC}"
            echo -e "${CYAN}• Or manually enable at: ${YELLOW}https://github.com/${repo_path}/settings/pages${NC}\n"

            echo -e "${GREEN}${PARTY} Deployment in progress! ${PARTY}${NC}\n"
        else
            echo -e "\n${RED}${CROSS} Failed to push to GitHub${NC}"
            echo -e "${YELLOW}Common issues:${NC}"
            echo -e "${CYAN}• Check your internet connection${NC}"
            echo -e "${CYAN}• Verify you have push access to the repository${NC}"
            echo -e "${CYAN}• Try: ${GREEN}git push origin main${NC}"
            exit 1
        fi
        ;;
    gitlab)
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${PURPLE}${ROCKET} Deploying to GitLab Pages${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

        # Check if in git repo
        if ! git rev-parse --git-dir > /dev/null 2>&1; then
            echo -e "${RED}${CROSS} Not a git repository${NC}"
            echo -e "${YELLOW}Initialize git first: ${CYAN}git init${NC}"
            exit 1
        fi

        # Check for remote
        if ! git config --get remote.origin.url > /dev/null 2>&1; then
            echo -e "${RED}${CROSS} No remote repository configured${NC}"
            echo -e "${YELLOW}Add a remote: ${CYAN}git remote add origin <url>${NC}"
            exit 1
        fi

        echo -e "${CYAN}${GEAR} Pushing to GitLab...${NC}"
        git add .
        git commit -m "Deploy to GitLab Pages" 2>/dev/null || echo -e "${YELLOW}No changes to commit${NC}"

        # Check if gitlab remote exists, otherwise use origin
        push_success=false
        if git remote | grep -q "^gitlab$"; then
            if git push gitlab main 2>&1 || git push gitlab master 2>&1; then
                push_success=true
            fi
        else
            if git push origin main 2>&1 || git push origin master 2>&1; then
                push_success=true
            fi
        fi

        if [ "$push_success" = true ]; then
            repo_url=$(git config --get remote.origin.url | sed 's/\.git$//')

            echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}${PARTY} Deployment initiated!${NC}"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

            echo -e "${CYAN}${ROCKET} GitLab CI/CD is building your app...${NC}\n"

            echo -e "${YELLOW}📋 What's Next?${NC}\n"

            echo -e "${CYAN}1. ${GREEN}Monitor Deployment${NC}"
            echo -e "   ${PURPLE}→${NC} View pipeline: ${CYAN}${repo_url}/-/pipelines${NC}"
            echo -e "   ${PURPLE}→${NC} Wait 2-3 minutes for build to complete\n"

            echo -e "${CYAN}2. ${GREEN}View Your Live App${NC}"
            echo -e "   ${PURPLE}→${NC} Once deployed: ${CYAN}${repo_url}${NC}"
            echo -e "   ${PURPLE}→${NC} Or check: ${CYAN}${repo_url}/-/pages${NC}\n"

            echo -e "${CYAN}3. ${GREEN}Test Your Blog Scraper${NC}"
            echo -e "   ${PURPLE}→${NC} Enter a GoDaddy blog URL (e.g., https://example.godaddysites.com)"
            echo -e "   ${PURPLE}→${NC} Click 'Fetch Blog Posts'"
            echo -e "   ${PURPLE}→${NC} View and export your scraped content\n"

            echo -e "${CYAN}4. ${GREEN}Automatic Deployments${NC}"
            echo -e "   ${PURPLE}→${NC} Every git push to main will auto-deploy"
            echo -e "   ${PURPLE}→${NC} No manual steps needed!\n"

            echo -e "${YELLOW}💡 Pro Tips:${NC}"
            echo -e "${CYAN}• Check CI/CD tab if deployment fails${NC}"
            echo -e "${CYAN}• Configure custom domain in Pages settings${NC}"
            echo -e "${CYAN}• View deployment logs in pipeline${NC}\n"

            echo -e "${GREEN}${PARTY} Deployment in progress! ${PARTY}${NC}\n"
        else
            echo -e "\n${RED}${CROSS} Failed to push to GitLab${NC}"
            echo -e "${YELLOW}Common issues:${NC}"
            echo -e "${CYAN}• Check your internet connection${NC}"
            echo -e "${CYAN}• Verify you have push access to the repository${NC}"
            echo -e "${CYAN}• Try: ${GREEN}git push origin main${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}${CROSS} Unknown platform: ${PLATFORM}${NC}"
        echo -e "${YELLOW}Usage: ./quick-deploy.sh [vercel|netlify|github|gitlab]${NC}"
        echo ""
        echo -e "${CYAN}Available platforms:${NC}"
        echo -e "  ${GREEN}vercel${NC}   - Deploy to Vercel (recommended for React/Vite)"
        echo -e "  ${GREEN}netlify${NC}  - Deploy to Netlify"
        echo -e "  ${GREEN}github${NC}   - Deploy to GitHub Pages (auto-deploy via Actions)"
        echo -e "  ${GREEN}gitlab${NC}   - Deploy to GitLab Pages (auto-deploy via CI/CD)"
        echo ""
        echo -e "${CYAN}Examples:${NC}"
        echo -e "  ${GREEN}./quick-deploy.sh vercel${NC}"
        echo -e "  ${GREEN}./quick-deploy.sh netlify${NC}"
        echo -e "  ${GREEN}./quick-deploy.sh github${NC}"
        echo -e "  ${GREEN}./quick-deploy.sh gitlab${NC}"
        echo ""
        echo -e "${YELLOW}For interactive mode with more guidance:${NC}"
        echo -e "  ${GREEN}./deploy.sh${NC}\n"
        exit 1
        ;;
esac

