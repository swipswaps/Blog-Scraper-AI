#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emoji
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
GEAR="⚙️"
WARNING="⚠️"
PARTY="🎉"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}${ROCKET} GitHub Pages Setup Helper${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}${WARNING} GitHub Pages needs to be enabled in your repository settings${NC}\n"

echo -e "${CYAN}📋 Follow these steps:${NC}\n"

echo -e "${GREEN}1. Open your repository settings:${NC}"
echo -e "   ${CYAN}https://github.com/swipswaps/Blog-Scraper-AI/settings/pages${NC}\n"

echo -e "${GREEN}2. Under 'Build and deployment':${NC}"
echo -e "   ${PURPLE}→${NC} Source: Select ${YELLOW}'GitHub Actions'${NC}"
echo -e "   ${PURPLE}→${NC} (NOT 'Deploy from a branch')${NC}\n"

echo -e "${GREEN}3. Save the settings${NC}\n"

echo -e "${GREEN}4. Check the workflow status:${NC}"
echo -e "   ${CYAN}https://github.com/swipswaps/Blog-Scraper-AI/actions${NC}\n"

echo -e "${GREEN}5. Once the workflow completes (2-3 minutes):${NC}"
echo -e "   ${CYAN}https://swipswaps.github.io/Blog-Scraper-AI${NC}\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Would you like me to open the settings page in your browser? (y/n):${NC} "
read -r open_browser

if [[ "$open_browser" =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/swipswaps/Blog-Scraper-AI/settings/pages" 2>/dev/null &
        echo -e "${GREEN}${CHECK} Opening browser...${NC}\n"
    elif command -v open &> /dev/null; then
        open "https://github.com/swipswaps/Blog-Scraper-AI/settings/pages" 2>/dev/null &
        echo -e "${GREEN}${CHECK} Opening browser...${NC}\n"
    else
        echo -e "${YELLOW}${WARNING} Could not detect browser. Please open manually:${NC}"
        echo -e "${CYAN}https://github.com/swipswaps/Blog-Scraper-AI/settings/pages${NC}\n"
    fi
fi

echo -e "${CYAN}${GEAR} Checking workflow status...${NC}\n"

# Try to check workflow status with gh CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}Recent workflow runs:${NC}\n"
    gh run list --limit 3 2>/dev/null || echo -e "${YELLOW}Run 'gh auth login' to view workflow status${NC}\n"
else
    echo -e "${YELLOW}Install GitHub CLI for workflow status: ${CYAN}https://cli.github.com${NC}\n"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${GREEN}${PARTY} After enabling GitHub Pages, your site will be live at:${NC}"
echo -e "${CYAN}https://swipswaps.github.io/Blog-Scraper-AI${NC}\n"

