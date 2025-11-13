#!/bin/bash

# Process Manager Utility for Blog Scraper AI
# Handles detection and management of running dev servers

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to check if dev server is running
check_dev_server() {
    # Check for npm run dev or vite processes
    local pids=$(pgrep -f "vite|npm.*dev" 2>/dev/null)
    
    if [ -n "$pids" ]; then
        return 0  # Running
    else
        return 1  # Not running
    fi
}

# Function to get dev server PID
get_dev_server_pid() {
    pgrep -f "vite|npm.*dev" 2>/dev/null | head -1
}

# Function to check if port is in use
check_port() {
    local port=${1:-3000}
    
    # Try multiple methods to check port
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" -t >/dev/null 2>&1
        return $?
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln 2>/dev/null | grep -q ":$port "
        return $?
    elif command -v ss >/dev/null 2>&1; then
        ss -tuln 2>/dev/null | grep -q ":$port "
        return $?
    else
        # Fallback: assume not in use
        return 1
    fi
}

# Function to get process using port
get_port_process() {
    local port=${1:-3000}
    
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" -t 2>/dev/null | head -1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tulnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1
    elif command -v ss >/dev/null 2>&1; then
        ss -tulnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K[0-9]+'
    fi
}

# Function to stop dev server gracefully
stop_dev_server() {
    local pid=$(get_dev_server_pid)
    
    if [ -z "$pid" ]; then
        echo -e "${YELLOW}No dev server running${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Stopping dev server (PID: $pid)...${NC}"
    
    # Try graceful shutdown first
    kill -TERM "$pid" 2>/dev/null
    
    # Wait up to 5 seconds for graceful shutdown
    local count=0
    while [ $count -lt 10 ]; do
        if ! ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Dev server stopped${NC}"
            return 0
        fi
        sleep 0.5
        count=$((count + 1))
    done
    
    # Force kill if still running
    echo -e "${YELLOW}Forcing shutdown...${NC}"
    kill -9 "$pid" 2>/dev/null
    sleep 1
    
    if ! ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Dev server stopped${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to stop dev server${NC}"
        return 1
    fi
}

# Function to handle port conflict
handle_port_conflict() {
    local port=${1:-3000}
    
    echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
    
    if check_dev_server; then
        echo -e "${CYAN}It looks like a dev server is already running.${NC}"
        echo -e "${YELLOW}What would you like to do?${NC}"
        echo -e "${CYAN}1)${NC} Stop the existing server and continue"
        echo -e "${CYAN}2)${NC} Keep it running (skip local testing)"
        echo -e "${CYAN}3)${NC} Cancel"
        echo ""
        echo -ne "${YELLOW}Enter your choice [1-3]: ${NC}"
        read -r choice
        
        case $choice in
            1)
                stop_dev_server
                return 0
                ;;
            2)
                echo -e "${GREEN}Keeping existing server running${NC}"
                return 1
                ;;
            3)
                echo -e "${YELLOW}Cancelled${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                handle_port_conflict "$port"
                ;;
        esac
    else
        local pid=$(get_port_process "$port")
        if [ -n "$pid" ]; then
            echo -e "${CYAN}Another process (PID: $pid) is using port $port${NC}"
            echo -e "${YELLOW}Would you like to:${NC}"
            echo -e "${CYAN}1)${NC} Try to stop it"
            echo -e "${CYAN}2)${NC} Skip local testing"
            echo -e "${CYAN}3)${NC} Cancel"
            echo ""
            echo -ne "${YELLOW}Enter your choice [1-3]: ${NC}"
            read -r choice
            
            case $choice in
                1)
                    kill -TERM "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
                    sleep 1
                    return 0
                    ;;
                2)
                    return 1
                    ;;
                3)
                    exit 0
                    ;;
                *)
                    echo -e "${RED}Invalid choice${NC}"
                    handle_port_conflict "$port"
                    ;;
            esac
        fi
    fi
}

# Export functions if sourced
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
    export -f check_dev_server
    export -f get_dev_server_pid
    export -f check_port
    export -f get_port_process
    export -f stop_dev_server
    export -f handle_port_conflict
fi

