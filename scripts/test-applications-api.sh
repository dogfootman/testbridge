#!/bin/bash

# Applications API Integration Test Script
# This script tests the Applications API endpoints

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/applications"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Applications API Integration Tests ===${NC}\n"

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local test_name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=$5
  local session_token=$6

  echo -n "Testing: $test_name... "

  if [ -n "$session_token" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Cookie: next-auth.session-token=$session_token" \
      -d "$data" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  fi

  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $status)"
    ((PASSED++))
    if [ -n "$body" ]; then
      echo "  Response: $body" | head -c 100
      echo ""
    fi
  else
    echo -e "${RED}FAIL${NC} (Expected $expected_status, got $status)"
    ((FAILED++))
    echo "  Response: $body"
  fi
  echo ""
}

# Test 1: POST without authentication (should return 401)
test_endpoint \
  "POST /api/applications without auth" \
  "POST" \
  "$API_URL" \
  '{"appId":1,"deviceInfo":"Samsung Galaxy S23"}' \
  "401" \
  ""

# Test 2: POST with missing appId (should return 400)
# Note: This requires a valid session token - skip for now
echo -e "${YELLOW}Skipping authenticated tests - requires manual session token${NC}\n"

# Test 3: GET without authentication (should return 401)
test_endpoint \
  "GET /api/applications without auth" \
  "GET" \
  "$API_URL" \
  "" \
  "401" \
  ""

# Test 4: PATCH without authentication (should return 401)
test_endpoint \
  "PATCH /api/applications/1 without auth" \
  "PATCH" \
  "$API_URL/1" \
  '{"status":"APPROVED"}' \
  "401" \
  ""

# Summary
echo -e "${YELLOW}=== Test Summary ===${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed${NC}"
  exit 1
fi
