#!/bin/bash

# First-Time Setup Wizard for Blog Scraper AI
# This script helps new users get started with zero knowledge required

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source process manager utilities
if [ -f "$SCRIPT_DIR/scripts/process-manager.sh" ]; then
    source "$SCRIPT_DIR/scripts/process-manager.sh"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     ██████╗ ██╗      ██████╗  ██████╗     ███████╗ ██████╗        ║
║     ██╔══██╗██║     ██╔═══██╗██╔════╝     ██╔════╝██╔════╝        ║
║     ██████╔╝██║     ██║   ██║██║  ███╗    ███████╗██║             ║
║     ██╔══██╗██║     ██║   ██║██║   ██║    ╚════██║██║             ║
║     ██████╔╝███████╗╚██████╔╝╚██████╔╝    ███████║╚██████╗        ║
║     ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝     ╚══════╝ ╚═════╝        ║
║                                                                    ║
║                    🚀 Setup Wizard 🚀                              ║
║                                                                    ║
║          Welcome! I'll help you get started in 3 steps            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF

echo ""
echo -e "${CYAN}This wizard will:${NC}"
echo -e "${GREEN}  ✓${NC} Check your system requirements"
echo -e "${GREEN}  ✓${NC} Install dependencies"
echo -e "${GREEN}  ✓${NC} Test the app locally"
echo -e "${GREEN}  ✓${NC} Help you deploy (optional)"
echo ""
echo -ne "${YELLOW}Ready to begin? (y/n): ${NC}"
read -r ready

if [[ ! $ready =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled. Run this script again when ready!${NC}"
    exit 0
fi

# Step 1: System Check
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📋 Step 1/3: System Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installed${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org/${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} installed${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✅ Git ${GIT_VERSION} installed${NC}"
else
    echo -e "${YELLOW}⚠️  Git not found (optional for deployment)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 System check passed!${NC}"
sleep 1

# Step 2: Install Dependencies
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📦 Step 2/3: Installing Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
else
    echo -e "${CYAN}Installing packages... (this may take 1-2 minutes)${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
fi

sleep 1

# Step 3: Test Locally
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🧪 Step 3/3: Test the App${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if dev server is already running
if type check_dev_server >/dev/null 2>&1 && check_dev_server; then
    echo -e "${YELLOW}⚠️  A development server is already running!${NC}"
    echo -e "${CYAN}You can access it at: ${GREEN}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}What would you like to do?${NC}"
    echo -e "${CYAN}1)${NC} Keep it running (skip to deployment)"
    echo -e "${CYAN}2)${NC} Stop it and restart"
    echo -e "${CYAN}3)${NC} Skip local testing"
    echo ""
    echo -ne "${YELLOW}Enter your choice [1-3]: ${NC}"
    read -r server_choice

    case $server_choice in
        1)
            echo -e "${GREEN}✅ Keeping existing server running${NC}"
            echo -e "${CYAN}Visit http://localhost:3000 to test${NC}"
            ;;
        2)
            if type stop_dev_server >/dev/null 2>&1; then
                stop_dev_server
                echo ""
                echo -e "${GREEN}🚀 Starting development server...${NC}"
                echo -e "${CYAN}Press Ctrl+C to stop the server when done testing${NC}"
                echo ""
                sleep 2
                npm run dev
            fi
            ;;
        3)
            echo -e "${YELLOW}Skipping local testing${NC}"
            ;;
    esac
else
    echo -e "${CYAN}Would you like to test the app locally before deploying?${NC}"
    echo -e "${YELLOW}This will start a development server at http://localhost:3000${NC}"
    echo ""

    # Check if port 3000 is in use
    if type check_port >/dev/null 2>&1 && check_port 3000; then
        echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
        if type handle_port_conflict >/dev/null 2>&1; then
            if handle_port_conflict 3000; then
                echo -ne "${YELLOW}Start local server now? (y/n): ${NC}"
                read -r start_local
                if [[ $start_local =~ ^[Yy]$ ]]; then
                    echo ""
                    echo -e "${GREEN}🚀 Starting development server...${NC}"
                    echo -e "${CYAN}Press Ctrl+C to stop the server when done testing${NC}"
                    echo ""
                    sleep 2
                    npm run dev
                fi
            fi
        fi
    else
        echo -ne "${YELLOW}Start local server? (y/n): ${NC}"
        read -r start_local

        if [[ $start_local =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${GREEN}🚀 Starting development server...${NC}"
            echo -e "${CYAN}Press Ctrl+C to stop the server when done testing${NC}"
            echo ""
            sleep 2
            npm run dev
        fi
    fi
fi

# Deployment Option
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🌐 Optional: Deploy Your App${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Your app is ready to deploy!${NC}"
echo ""
echo -e "${YELLOW}Would you like to deploy now?${NC}"
echo -e "${CYAN}1)${NC} Yes, deploy now (I'll guide you)"
echo -e "${CYAN}2)${NC} No, I'll deploy later"
echo ""
echo -ne "${YELLOW}Enter your choice [1-2]: ${NC}"
read -r deploy_choice

if [ "$deploy_choice" = "1" ]; then
    echo ""
    echo -e "${GREEN}Great! Starting deployment wizard...${NC}"
    sleep 1
    ./deploy.sh
else
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo -e "${CYAN}📚 Next steps:${NC}"
    echo -e "${GREEN}→${NC} Run ${YELLOW}npm run dev${NC} to start development server"
    echo -e "${GREEN}→${NC} Run ${YELLOW}./deploy.sh${NC} when ready to deploy"
    echo -e "${GREEN}→${NC} Read ${YELLOW}DEPLOYMENT.md${NC} for deployment guides"
    echo ""
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                        ║${NC}"
    echo -e "${PURPLE}║     ${GREEN}🎉 You're all set! Happy coding! 🎉${PURPLE}              ║${NC}"
    echo -e "${PURPLE}║                                                        ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
fi

