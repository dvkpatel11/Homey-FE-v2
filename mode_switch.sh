#!/bin/bash

# API Mode Switcher
# Quickly switch between mock, development, and production APIs

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_usage() {
  echo "Usage: $0 [mock|dev|prod]"
  echo ""
  echo "API Mode Switcher - Changes VITE_API_MODE in .env.local"
  echo ""
  echo "Modes:"
  echo "  mock  - Use mock server (http://localhost:8000)"
  echo "  dev   - Use development API"  
  echo "  prod  - Use production API"
  echo ""
  echo "Current mode: $(grep VITE_API_MODE .env.local 2>/dev/null | cut -d= -f2 || echo 'not set')"
}

set_mode() {
  local mode=$1
  
  # Validate mode
  case $mode in
    mock|dev|prod) ;;
    *) 
      echo -e "${RED}❌ Invalid mode: $mode${NC}"
      show_usage
      exit 1
      ;;
  esac
  
  # Update .env.local
  if [ -f .env.local ]; then
    # Update existing VITE_API_MODE
    if grep -q "VITE_API_MODE=" .env.local; then
      case $mode in
        mock)
          sed -i 's/VITE_API_MODE=.*/VITE_API_MODE=mock/' .env.local
          ;;
        dev)
          sed -i 's/VITE_API_MODE=.*/VITE_API_MODE=development/' .env.local
          ;;
        prod)
          sed -i 's/VITE_API_MODE=.*/VITE_API_MODE=production/' .env.local
          ;;
      esac
    else
      # Add VITE_API_MODE if it doesn't exist
      case $mode in
        mock)
          echo "VITE_API_MODE=mock" >> .env.local
          ;;
        dev)
          echo "VITE_API_MODE=development" >> .env.local
          ;;
        prod)
          echo "VITE_API_MODE=production" >> .env.local
          ;;
      esac
    fi
  else
    echo -e "${YELLOW}⚠️  .env.local not found, creating it...${NC}"
    case $mode in
      mock)
        echo "VITE_API_MODE=mock" > .env.local
        ;;
      dev)
        echo "VITE_API_MODE=development" > .env.local
        ;;
      prod)
        echo "VITE_API_MODE=production" > .env.local
        ;;
    esac
  fi
  
  # Show success message
  case $mode in
    mock)
      echo -e "${GREEN}✅ API mode set to: mock${NC}"
      echo -e "${BLUE}🎭 Using mock server at http://localhost:8000${NC}"
      echo -e "${YELLOW}💡 Make sure to run: npm run mock${NC}"
      ;;
    dev)
      echo -e "${GREEN}✅ API mode set to: development${NC}"
      echo -e "${BLUE}🔧 Using development API${NC}"
      ;;
    prod)
      echo -e "${GREEN}✅ API mode set to: production${NC}"
      echo -e "${BLUE}🚀 Using production API${NC}"
      echo -e "${RED}⚠️  Make sure your production API URL is configured!${NC}"
      ;;
  esac
  
  echo ""
  echo -e "${BLUE}Current configuration:${NC}"
  grep "VITE_API" .env.local | head -5
}

# Main logic
if [ $# -eq 0 ]; then
  show_usage
  exit 0
fi

set_mode $1