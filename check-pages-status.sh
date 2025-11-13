#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🔍 GitHub Pages Deployment Diagnostics${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${CYAN}📊 Workflow Status:${NC}\n"

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI detected${NC}\n"
    
    echo -e "${YELLOW}Recent workflow runs:${NC}"
    gh run list --limit 5 --workflow="deploy-pages.yml" 2>/dev/null || {
        echo -e "${RED}❌ Failed to fetch workflow runs${NC}"
        echo -e "${YELLOW}Try: gh auth login${NC}\n"
    }
    
    echo -e "\n${YELLOW}Latest workflow run details:${NC}"
    gh run view --log 2>/dev/null || {
        echo -e "${RED}❌ Failed to fetch workflow details${NC}\n"
    }
else
    echo -e "${YELLOW}⚠️  GitHub CLI not installed${NC}"
    echo -e "${CYAN}Install it: https://cli.github.com${NC}\n"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🔧 Troubleshooting Steps:${NC}\n"

echo -e "${CYAN}1. Verify GitHub Pages is enabled:${NC}"
echo -e "   ${YELLOW}https://github.com/swipswaps/Blog-Scraper-AI/settings/pages${NC}\n"

echo -e "${CYAN}2. Check that Source is set to:${NC}"
echo -e "   ${GREEN}'GitHub Actions'${NC} (NOT 'Deploy from a branch')\n"

echo -e "${CYAN}3. Check workflow permissions:${NC}"
echo -e "   ${YELLOW}https://github.com/swipswaps/Blog-Scraper-AI/settings/actions${NC}"
echo -e "   ${GREEN}→ Workflow permissions should be 'Read and write'${NC}\n"

echo -e "${CYAN}4. Verify the workflow file:${NC}"
echo -e "   ${YELLOW}.github/workflows/deploy-pages.yml${NC}\n"

echo -e "${CYAN}5. Check recent deployments:${NC}"
echo -e "   ${YELLOW}https://github.com/swipswaps/Blog-Scraper-AI/deployments${NC}\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}💡 Common Issues:${NC}\n"
echo -e "${CYAN}• Workflows run but site shows 404:${NC}"
echo -e "  ${GREEN}→ GitHub Pages source not set to 'GitHub Actions'${NC}\n"

echo -e "${CYAN}• Permission denied errors:${NC}"
echo -e "  ${GREEN}→ Workflow permissions need to be 'Read and write'${NC}\n"

echo -e "${CYAN}• Build succeeds but deploy fails:${NC}"
echo -e "  ${GREEN}→ Check the 'deploy' job logs in Actions tab${NC}\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

