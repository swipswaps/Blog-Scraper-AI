#!/bin/bash

# Interactive Deployment Assistant for Blog Scraper AI
# This script abstracts away all complexity and guides you through deployment

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source process manager utilities
if [ -f "$SCRIPT_DIR/scripts/process-manager.sh" ]; then
    source "$SCRIPT_DIR/scripts/process-manager.sh"
fi

# Colors for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for visual feedback
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
GEAR="⚙️"
LOCK="🔒"
GLOBE="🌐"
SPARKLES="✨"
THINKING="🤔"
PARTY="🎉"
WARNING="⚠️"

# Clear screen for clean start
clear

echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║        ${CYAN}${ROCKET} Blog Scraper AI - Deployment Assistant${PURPLE}        ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║     ${YELLOW}I'll handle everything - just answer a few questions${PURPLE}  ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to show spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Function to run command with spinner
run_with_spinner() {
    local message=$1
    shift
    echo -ne "${CYAN}${GEAR} ${message}...${NC}"
    
    # Run command in background
    "$@" > /tmp/deploy_output.log 2>&1 &
    local pid=$!
    
    # Show spinner
    spinner $pid
    
    # Wait for completion
    wait $pid
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\r${GREEN}${CHECK} ${message}... Done!${NC}"
        return 0
    else
        echo -e "\r${RED}${CROSS} ${message}... Failed!${NC}"
        echo -e "${YELLOW}Error details:${NC}"
        cat /tmp/deploy_output.log
        return 1
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js if needed
check_node() {
    if command_exists node; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 18 ]; then
            echo -e "${GREEN}${CHECK} Node.js $(node -v) detected${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Node.js version too old (need 18+)${NC}"
        fi
    fi
    
    echo -e "${YELLOW}${THINKING} Node.js 18+ is required${NC}"
    echo -e "${CYAN}Would you like me to install it? (y/n)${NC}"
    read -r install_node
    
    if [[ $install_node =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Installing Node.js via nvm...${NC}"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 18
        nvm use 18
        echo -e "${GREEN}${CHECK} Node.js installed!${NC}"
    else
        echo -e "${RED}${CROSS} Node.js is required. Please install it manually.${NC}"
        exit 1
    fi
}

# Function to check dependencies
check_dependencies() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${GEAR} Checking system requirements...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    check_node
    
    if ! command_exists git; then
        echo -e "${RED}${CROSS} Git is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}${CHECK} Git detected${NC}"
    
    if ! command_exists npm; then
        echo -e "${RED}${CROSS} npm is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}${CHECK} npm detected${NC}"
}

# Function to build project
build_project() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${GEAR} Building your project...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        run_with_spinner "Installing dependencies" npm install
    else
        echo -e "${GREEN}${CHECK} Dependencies already installed${NC}"
    fi
    
    # Build the project
    run_with_spinner "Building production bundle" npm run build
    
    # Show build stats
    if [ -d "dist" ]; then
        local build_size=$(du -sh dist | cut -f1)
        echo -e "${GREEN}${SPARKLES} Build complete! Size: ${build_size}${NC}"
    fi
}

# Function to choose deployment platform
choose_platform() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${GLOBE} Choose your deployment platform:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${GREEN}1)${NC} ${ROCKET} Vercel ${YELLOW}(Recommended - Easiest & Fastest)${NC}"
    echo -e "   ${CYAN}→${NC} Best for React/Vite apps"
    echo -e "   ${CYAN}→${NC} Auto-deploy on git push"
    echo -e "   ${CYAN}→${NC} Free SSL & custom domains"
    echo -e "   ${CYAN}→${NC} 100GB bandwidth/month\n"

    echo -e "${GREEN}2)${NC} ${ROCKET} Netlify"
    echo -e "   ${CYAN}→${NC} Great for static sites"
    echo -e "   ${CYAN}→${NC} Form handling included"
    echo -e "   ${CYAN}→${NC} 100GB bandwidth/month\n"

    echo -e "${GREEN}3)${NC} ${ROCKET} GitHub Pages ${YELLOW}(Already configured!)${NC}"
    echo -e "   ${CYAN}→${NC} Free hosting from GitHub"
    echo -e "   ${CYAN}→${NC} Auto-deploy via GitHub Actions"
    echo -e "   ${CYAN}→${NC} 100GB bandwidth/month\n"

    echo -e "${GREEN}4)${NC} ${ROCKET} GitLab Pages ${YELLOW}(Already configured!)${NC}"
    echo -e "   ${CYAN}→${NC} Free hosting from GitLab"
    echo -e "   ${CYAN}→${NC} Auto-deploy via GitLab CI/CD"
    echo -e "   ${CYAN}→${NC} 10GB bandwidth/month\n"

    echo -e "${GREEN}5)${NC} ${ROCKET} Cloudflare Pages"
    echo -e "   ${CYAN}→${NC} Unlimited bandwidth"
    echo -e "   ${CYAN}→${NC} Global CDN"
    echo -e "   ${CYAN}→${NC} Fast edge network\n"

    echo -e "${GREEN}6)${NC} ${THINKING} Show me a comparison first\n"

    echo -e "${GREEN}7)${NC} ${CROSS} Exit\n"

    echo -ne "${YELLOW}Enter your choice [1-7] (default: 1): ${NC}"
    read -r platform_choice

    # Default to Vercel if no input
    platform_choice=${platform_choice:-1}

    case $platform_choice in
        1) deploy_vercel ;;
        2) deploy_netlify ;;
        3) deploy_github_pages ;;
        4) deploy_gitlab_pages ;;
        5) deploy_cloudflare ;;
        6) show_comparison ;;
        7) echo -e "\n${YELLOW}Deployment cancelled${NC}\n"; exit 0 ;;
        *) echo -e "${RED}Invalid choice${NC}"; choose_platform ;;
    esac
}

# Function to show platform comparison
show_comparison() {
    clear
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║              ${CYAN}Platform Comparison${PURPLE}                         ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${CYAN}┌─────────────┬──────────┬────────────┬──────────────┬─────────┐${NC}"
    echo -e "${CYAN}│${NC} Platform    ${CYAN}│${NC} Setup    ${CYAN}│${NC} Bandwidth  ${CYAN}│${NC} Best For     ${CYAN}│${NC} Rating  ${CYAN}│${NC}"
    echo -e "${CYAN}├─────────────┼──────────┼────────────┼──────────────┼─────────┤${NC}"
    echo -e "${CYAN}│${NC} Vercel      ${CYAN}│${NC} 2 min    ${CYAN}│${NC} 100GB/mo   ${CYAN}│${NC} React/Vite   ${CYAN}│${NC} ⭐⭐⭐   ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} Netlify     ${CYAN}│${NC} 2 min    ${CYAN}│${NC} 100GB/mo   ${CYAN}│${NC} Static Sites ${CYAN}│${NC} ⭐⭐⭐   ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} GitHub      ${CYAN}│${NC} 5 min    ${CYAN}│${NC} 100GB/mo   ${CYAN}│${NC} GitHub Users ${CYAN}│${NC} ⭐⭐    ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} GitLab      ${CYAN}│${NC} 5 min    ${CYAN}│${NC} 10GB/mo    ${CYAN}│${NC} GitLab Users ${CYAN}│${NC} ⭐⭐    ${CYAN}│${NC}"
    echo -e "${CYAN}│${NC} Cloudflare  ${CYAN}│${NC} 3 min    ${CYAN}│${NC} Unlimited  ${CYAN}│${NC} High Traffic ${CYAN}│${NC} ⭐⭐⭐   ${CYAN}│${NC}"
    echo -e "${CYAN}└─────────────┴──────────┴────────────┴──────────────┴─────────┘${NC}\n"

    echo -e "${YELLOW}${THINKING} Recommendation: Vercel${NC}"
    echo -e "${CYAN}   → Easiest setup for React/Vite apps${NC}"
    echo -e "${CYAN}   → Best performance out of the box${NC}"
    echo -e "${CYAN}   → Automatic optimizations${NC}\n"

    echo -ne "${YELLOW}Press Enter to continue...${NC}"
    read
    choose_platform
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}${ROCKET} Deploying to Vercel${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        echo -e "${YELLOW}${GEAR} Vercel CLI not found${NC}"
        echo -e "${CYAN}Installing Vercel CLI globally...${NC}"
        run_with_spinner "Installing Vercel CLI" npm install -g vercel
    else
        echo -e "${GREEN}${CHECK} Vercel CLI detected${NC}"
    fi

    # Check authentication
    echo -e "\n${CYAN}${LOCK} Checking authentication...${NC}"
    if ! vercel whoami >/dev/null 2>&1; then
        echo -e "${YELLOW}You need to log in to Vercel${NC}"
        echo -e "${CYAN}I'll open the login page in your browser...${NC}\n"
        vercel login
    else
        local vercel_user=$(vercel whoami 2>/dev/null)
        echo -e "${GREEN}${CHECK} Logged in as: ${vercel_user}${NC}"
    fi

    # Ask about production deployment
    echo -e "\n${YELLOW}${THINKING} Deploy to production or preview?${NC}"
    echo -e "${CYAN}1)${NC} Production (live site)"
    echo -e "${CYAN}2)${NC} Preview (test deployment)\n"
    echo -ne "${YELLOW}Enter your choice [1-2] (default: 1): ${NC}"
    read -r deploy_type
    deploy_type=${deploy_type:-1}

    echo -e "\n${CYAN}${ROCKET} Deploying to Vercel...${NC}"
    echo -e "${YELLOW}This may take 1-2 minutes...${NC}\n"

    if [ "$deploy_type" = "1" ]; then
        vercel --prod
    else
        vercel
    fi

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}${PARTY}${PARTY}${PARTY} Deployment successful! ${PARTY}${PARTY}${PARTY}${NC}\n"
        echo -e "${CYAN}Your app is now live!${NC}"
        echo -e "${GREEN}${GLOBE} View your deployment: ${YELLOW}vercel ls${NC}"
        echo -e "${GREEN}${GLOBE} Open in browser: ${YELLOW}vercel open${NC}\n"

        # Ask if user wants to open in browser
        echo -ne "${YELLOW}Open in browser now? (y/n): ${NC}"
        read -r open_browser
        if [[ $open_browser =~ ^[Yy]$ ]]; then
            vercel open
        fi
    else
        echo -e "\n${RED}${CROSS} Deployment failed${NC}"
        echo -e "${YELLOW}Check the error messages above${NC}\n"
        exit 1
    fi
}

# Function to deploy to Netlify
deploy_netlify() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}${ROCKET} Deploying to Netlify${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    # Check if Netlify CLI is installed
    if ! command_exists netlify; then
        echo -e "${YELLOW}${GEAR} Netlify CLI not found${NC}"
        echo -e "${CYAN}Installing Netlify CLI globally...${NC}"
        run_with_spinner "Installing Netlify CLI" npm install -g netlify-cli
    else
        echo -e "${GREEN}${CHECK} Netlify CLI detected${NC}"
    fi

    # Check authentication
    echo -e "\n${CYAN}${LOCK} Checking authentication...${NC}"
    if ! netlify status >/dev/null 2>&1; then
        echo -e "${YELLOW}You need to log in to Netlify${NC}"
        echo -e "${CYAN}I'll open the login page in your browser...${NC}\n"
        netlify login
    else
        echo -e "${GREEN}${CHECK} Already logged in to Netlify${NC}"
    fi

    # Ask about production deployment
    echo -e "\n${YELLOW}${THINKING} Deploy to production or preview?${NC}"
    echo -e "${CYAN}1)${NC} Production (live site)"
    echo -e "${CYAN}2)${NC} Preview (test deployment)\n"
    echo -ne "${YELLOW}Enter your choice [1-2] (default: 1): ${NC}"
    read -r deploy_type
    deploy_type=${deploy_type:-1}

    echo -e "\n${CYAN}${ROCKET} Deploying to Netlify...${NC}"
    echo -e "${YELLOW}This may take 1-2 minutes...${NC}\n"

    if [ "$deploy_type" = "1" ]; then
        netlify deploy --prod --dir=dist
    else
        netlify deploy --dir=dist
    fi

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}${PARTY}${PARTY}${PARTY} Deployment successful! ${PARTY}${PARTY}${PARTY}${NC}\n"
        echo -e "${CYAN}Your app is now live!${NC}"
        echo -e "${GREEN}${GLOBE} Open in browser: ${YELLOW}netlify open${NC}\n"

        # Ask if user wants to open in browser
        echo -ne "${YELLOW}Open in browser now? (y/n): ${NC}"
        read -r open_browser
        if [[ $open_browser =~ ^[Yy]$ ]]; then
            netlify open
        fi
    else
        echo -e "\n${RED}${CROSS} Deployment failed${NC}"
        echo -e "${YELLOW}Check the error messages above${NC}\n"
        exit 1
    fi
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}${ROCKET} Setting up GitHub Pages${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${GREEN}${CHECK} GitHub Pages workflow is already configured!${NC}"
    echo -e "${CYAN}The workflow file is at: ${YELLOW}.github/workflows/deploy-pages.yml${NC}\n"

    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}${CROSS} Not a git repository${NC}"
        exit 1
    fi

    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        echo -e "${CYAN}Would you like me to commit them? (y/n)${NC}"
        read -r commit_changes

        if [[ $commit_changes =~ ^[Yy]$ ]]; then
            echo -ne "${YELLOW}Enter commit message (default: 'Deploy to GitHub Pages'): ${NC}"
            read -r commit_msg
            commit_msg=${commit_msg:-"Deploy to GitHub Pages"}

            git add .
            git commit -m "$commit_msg"
            echo -e "${GREEN}${CHECK} Changes committed${NC}"
        fi
    fi

    # Get remote URL
    local remote_url=$(git config --get remote.origin.url)
    if [ -z "$remote_url" ]; then
        echo -e "${RED}${CROSS} No remote repository configured${NC}"
        exit 1
    fi

    # Extract repo info
    local repo_name=$(basename -s .git "$remote_url")
    local repo_owner=$(echo "$remote_url" | sed -n 's/.*[:/]\([^/]*\)\/[^/]*$/\1/p')

    echo -e "${CYAN}Repository: ${YELLOW}${repo_owner}/${repo_name}${NC}\n"

    # Push to GitHub
    echo -e "${CYAN}${ROCKET} Pushing to GitHub...${NC}"
    git push origin main

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}${CHECK} Pushed to GitHub!${NC}\n"
        echo -e "${YELLOW}${GEAR} Next steps:${NC}"
        echo -e "${CYAN}1. Go to: ${YELLOW}https://github.com/${repo_owner}/${repo_name}/settings/pages${NC}"
        echo -e "${CYAN}2. Under 'Source', select: ${YELLOW}GitHub Actions${NC}"
        echo -e "${CYAN}3. Wait 2-3 minutes for the workflow to complete${NC}"
        echo -e "${CYAN}4. Your site will be live at: ${YELLOW}https://${repo_owner}.github.io/${repo_name}/${NC}\n"

        echo -ne "${YELLOW}Open GitHub Pages settings now? (y/n): ${NC}"
        read -r open_settings
        if [[ $open_settings =~ ^[Yy]$ ]]; then
            if command_exists xdg-open; then
                xdg-open "https://github.com/${repo_owner}/${repo_name}/settings/pages"
            elif command_exists open; then
                open "https://github.com/${repo_owner}/${repo_name}/settings/pages"
            else
                echo -e "${YELLOW}Please open this URL manually:${NC}"
                echo -e "${CYAN}https://github.com/${repo_owner}/${repo_name}/settings/pages${NC}"
            fi
        fi

        echo -e "\n${GREEN}${PARTY} GitHub Pages setup complete!${NC}\n"
    else
        echo -e "\n${RED}${CROSS} Failed to push to GitHub${NC}"
        exit 1
    fi
}

# Function to deploy to GitLab Pages
deploy_gitlab_pages() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}${ROCKET} Setting up GitLab Pages${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${GREEN}${CHECK} GitLab Pages CI/CD is already configured!${NC}"
    echo -e "${CYAN}The workflow file is at: ${YELLOW}.gitlab-ci.yml${NC}\n"

    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}${CROSS} Not a git repository${NC}"
        exit 1
    fi

    # Check for GitLab remote
    local remote_url=$(git config --get remote.origin.url)
    if [ -z "$remote_url" ]; then
        echo -e "${RED}${CROSS} No remote repository configured${NC}"
        exit 1
    fi

    # Check if it's a GitLab repo
    if [[ ! "$remote_url" =~ gitlab ]]; then
        echo -e "${YELLOW}${WARNING} This doesn't appear to be a GitLab repository${NC}"
        echo -e "${CYAN}Current remote: ${remote_url}${NC}\n"
        echo -e "${YELLOW}Would you like to:${NC}"
        echo -e "${CYAN}1)${NC} Add a GitLab remote"
        echo -e "${CYAN}2)${NC} Continue anyway"
        echo -e "${CYAN}3)${NC} Cancel\n"
        echo -ne "${YELLOW}Enter your choice [1-3]: ${NC}"
        read -r gitlab_choice

        case $gitlab_choice in
            1)
                echo -ne "${YELLOW}Enter your GitLab repository URL: ${NC}"
                read -r gitlab_url
                git remote add gitlab "$gitlab_url"
                echo -e "${GREEN}${CHECK} GitLab remote added${NC}"
                remote_url="$gitlab_url"
                ;;
            2)
                echo -e "${YELLOW}Continuing...${NC}"
                ;;
            3)
                echo -e "${YELLOW}Cancelled${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                deploy_gitlab_pages
                return
                ;;
        esac
    fi

    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo -e "${YELLOW}${WARNING} You have uncommitted changes${NC}"
        echo -e "${CYAN}Would you like me to commit them? (y/n)${NC}"
        read -r commit_changes

        if [[ $commit_changes =~ ^[Yy]$ ]]; then
            echo -ne "${YELLOW}Enter commit message (default: 'Deploy to GitLab Pages'): ${NC}"
            read -r commit_msg
            commit_msg=${commit_msg:-"Deploy to GitLab Pages"}

            git add .
            git commit -m "$commit_msg"
            echo -e "${GREEN}${CHECK} Changes committed${NC}"
        fi
    fi

    # Determine which remote to push to
    local push_remote="origin"
    if git remote | grep -q "^gitlab$"; then
        push_remote="gitlab"
    fi

    # Extract repo info
    local repo_path=$(echo "$remote_url" | sed -n 's/.*gitlab\.com[:/]\(.*\)\.git/\1/p')
    if [ -z "$repo_path" ]; then
        repo_path=$(echo "$remote_url" | sed -n 's/.*gitlab\.com[:/]\(.*\)/\1/p')
    fi

    echo -e "\n${CYAN}${ROCKET} Pushing to GitLab...${NC}"
    git push "$push_remote" main || git push "$push_remote" master

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}${CHECK} Pushed to GitLab!${NC}\n"
        echo -e "${YELLOW}${GEAR} Next steps:${NC}"
        echo -e "${CYAN}1. Go to your GitLab project: ${YELLOW}https://gitlab.com/${repo_path}${NC}"
        echo -e "${CYAN}2. Navigate to: ${YELLOW}Settings → Pages${NC}"
        echo -e "${CYAN}3. Wait 2-3 minutes for the CI/CD pipeline to complete${NC}"
        echo -e "${CYAN}4. Your site will be live at: ${YELLOW}https://${repo_path//\//.}.gitlab.io/${NC}\n"

        echo -ne "${YELLOW}Open GitLab Pages settings now? (y/n): ${NC}"
        read -r open_settings
        if [[ $open_settings =~ ^[Yy]$ ]]; then
            local gitlab_url="https://gitlab.com/${repo_path}/-/settings/pages"
            if command_exists xdg-open; then
                xdg-open "$gitlab_url"
            elif command_exists open; then
                open "$gitlab_url"
            else
                echo -e "${YELLOW}Please open this URL manually:${NC}"
                echo -e "${CYAN}${gitlab_url}${NC}"
            fi
        fi

        echo -e "\n${GREEN}${PARTY} GitLab Pages setup complete!${NC}\n"
    else
        echo -e "\n${RED}${CROSS} Failed to push to GitLab${NC}"
        exit 1
    fi
}

# Function to deploy to Cloudflare Pages
deploy_cloudflare() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}${ROCKET} Deploying to Cloudflare Pages${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${CYAN}Cloudflare Pages deployment is done through their dashboard.${NC}\n"

    echo -e "${YELLOW}${GEAR} I'll guide you through the process:${NC}\n"

    echo -e "${CYAN}1. Go to: ${YELLOW}https://pages.cloudflare.com/${NC}"
    echo -e "${CYAN}2. Click 'Create a project'${NC}"
    echo -e "${CYAN}3. Connect your GitHub account${NC}"
    echo -e "${CYAN}4. Select the 'Blog-Scraper-AI' repository${NC}"
    echo -e "${CYAN}5. Use these build settings:${NC}"
    echo -e "${GREEN}   • Framework preset: ${YELLOW}Vite${NC}"
    echo -e "${GREEN}   • Build command: ${YELLOW}npm run build${NC}"
    echo -e "${GREEN}   • Build output directory: ${YELLOW}dist${NC}"
    echo -e "${CYAN}6. Click 'Save and Deploy'${NC}\n"

    echo -ne "${YELLOW}Open Cloudflare Pages now? (y/n): ${NC}"
    read -r open_cf
    if [[ $open_cf =~ ^[Yy]$ ]]; then
        if command_exists xdg-open; then
            xdg-open "https://pages.cloudflare.com/"
        elif command_exists open; then
            open "https://pages.cloudflare.com/"
        else
            echo -e "${YELLOW}Please open this URL manually:${NC}"
            echo -e "${CYAN}https://pages.cloudflare.com/${NC}"
        fi
    fi

    echo -e "\n${GREEN}${SPARKLES} Your site will be live at: ${YELLOW}https://blog-scraper-ai.pages.dev${NC}\n"
}

# Main execution flow
main() {
    check_dependencies
    build_project
    choose_platform

    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}${PARTY} All done! Your app is deployed!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${CYAN}${SPARKLES} What's next?${NC}"
    echo -e "${GREEN}→${NC} Every push to 'main' will auto-deploy"
    echo -e "${GREEN}→${NC} You can add a custom domain in your platform settings"
    echo -e "${GREEN}→${NC} SSL certificates are automatically provisioned\n"

    echo -e "${YELLOW}Need help? Check out:${NC}"
    echo -e "${CYAN}→${NC} DEPLOYMENT.md - Detailed guide"
    echo -e "${CYAN}→${NC} QUICK_DEPLOY.md - Quick reference\n"
}

# Run main function
main

