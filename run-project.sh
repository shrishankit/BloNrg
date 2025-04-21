#!/bin/bash

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
SKIP_TESTS=false
PRESERVE_DB=true
for arg in "$@"; do
  case $arg in
    -st|--skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    -pd|--preserve-db)
      PRESERVE_DB=true
      shift
      ;;
    *)
      # Unknown option
      print_message "Unknown option: $arg" "${RED}"
      print_message "Usage: $0 [-st|--skip-tests] [-pd|--preserve-db]" "${YELLOW}"
      exit 1
      ;;
  esac
done

# Function to print colored text
print_message() {
  echo -e "${2}${1}${NC}"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to get value from .env file
get_env_value() {
  local key=$1
  local file=$2
  if [ -f "$file" ]; then
    grep "^${key}=" "$file" | cut -d '=' -f2
  fi
}

# Function to check if dependencies are installed
check_dependencies() {
  local dir=$1
  if [ -d "$dir/node_modules" ] && [ -f "$dir/package-lock.json" ]; then
    return 0  # Dependencies are installed
  else
    return 1  # Dependencies need to be installed
  fi
}

# Check prerequisites
print_message "Checking prerequisites..." "${BLUE}"

# Check Node.js
if ! command_exists node; then
  print_message "Node.js is not installed. Please install Node.js v18 or higher." "${RED}"
  exit 1
fi

# Check npm
if ! command_exists npm; then
  print_message "npm is not installed. Please install npm." "${RED}"
  exit 1
fi

# Check Angular CLI
if ! command_exists ng; then
  print_message "Angular CLI is not installed. Installing globally..." "${YELLOW}"
  npm install -g @angular/cli
fi

# Check MySQL
if ! command_exists mysql; then
  print_message "MySQL is not installed or not in PATH. Please ensure MySQL is installed and running." "${YELLOW}"
  print_message "You can install MySQL from https://dev.mysql.com/downloads/mysql/" "${YELLOW}"
fi

# Check for existing .env file and values
ENV_FILE="expense-tracker-backend/.env"
if [ -f "$ENV_FILE" ]; then
  print_message "Found existing .env file. Checking for database credentials..." "${BLUE}"
  
  # Get existing values
  EXISTING_DB_HOST=$(get_env_value "DB_HOST" "$ENV_FILE")
  EXISTING_DB_USER=$(get_env_value "DB_USER" "$ENV_FILE")
  EXISTING_DB_PASSWORD=$(get_env_value "DB_PASSWORD" "$ENV_FILE")
  EXISTING_DB_NAME=$(get_env_value "DB_NAME" "$ENV_FILE")
  
  # Check if all required values exist
  if [ -n "$EXISTING_DB_HOST" ] && [ -n "$EXISTING_DB_USER" ] && [ -n "$EXISTING_DB_PASSWORD" ] && [ -n "$EXISTING_DB_NAME" ]; then
    print_message "Database credentials already configured in .env file." "${GREEN}"
    DB_HOST=$EXISTING_DB_HOST
    DB_USER=$EXISTING_DB_USER
    DB_PASSWORD=$EXISTING_DB_PASSWORD
    DB_NAME=$EXISTING_DB_NAME
  else
    print_message "Some database credentials are missing in .env file." "${YELLOW}"
    # Prompt for missing credentials
    read -p "Database Host (default: ${EXISTING_DB_HOST:-localhost}): " DB_HOST
    DB_HOST=${DB_HOST:-${EXISTING_DB_HOST:-localhost}}

    read -p "Database User (default: ${EXISTING_DB_USER:-root}): " DB_USER
    DB_USER=${DB_USER:-${EXISTING_DB_USER:-root}}

    read -s -p "Database Password: " DB_PASSWORD
    echo

    read -p "Database Name (default: ${EXISTING_DB_NAME:-expense_tracker}): " DB_NAME
    DB_NAME=${DB_NAME:-${EXISTING_DB_NAME:-expense_tracker}}
  fi
else
  # Prompt for database credentials if .env doesn't exist
  print_message "Please enter your MySQL database credentials:" "${BLUE}"
  read -p "Database Host (default: localhost): " DB_HOST
  DB_HOST=${DB_HOST:-localhost}

  read -p "Database User (default: root): " DB_USER
  DB_USER=${DB_USER:-root}

  read -s -p "Database Password: " DB_PASSWORD
  echo

  read -p "Database Name (default: expense_tracker): " DB_NAME
  DB_NAME=${DB_NAME:-expense_tracker}
fi

# Create DATABASE_URL
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}"

# Create or update .env file
if [ ! -f "$ENV_FILE" ] || [ -z "$EXISTING_DB_HOST" ] || [ -z "$EXISTING_DB_USER" ] || [ -z "$EXISTING_DB_PASSWORD" ] || [ -z "$EXISTING_DB_NAME" ]; then
  print_message "Creating/Updating .env file for backend..." "${YELLOW}"
  cat > "$ENV_FILE" << EOF
PORT=4000
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=your_jwt_secret_key_change_this_in_production
EOF
  print_message "Created/Updated .env file with database credentials." "${GREEN}"
fi

# Install dependencies
print_message "Checking backend dependencies..." "${BLUE}"
cd expense-tracker-backend
if check_dependencies "."; then
  print_message "Backend dependencies are already installed." "${GREEN}"
else
  print_message "Installing backend dependencies..." "${BLUE}"
  npm install
  if [ $? -ne 0 ]; then
    print_message "Failed to install backend dependencies." "${RED}"
    exit 1
  fi
fi

print_message "Checking frontend dependencies..." "${BLUE}"
cd ../expense-tracker-frontend
if check_dependencies "."; then
  print_message "Frontend dependencies are already installed." "${GREEN}"
else
  print_message "Installing frontend dependencies..." "${BLUE}"
  npm install
  if [ $? -ne 0 ]; then
    print_message "Failed to install frontend dependencies." "${RED}"
    exit 1
  fi
fi

# Run tests
if [ "$SKIP_TESTS" = false ]; then
  print_message "Running backend tests..." "${BLUE}"
  cd ../expense-tracker-backend
  if [ "$PRESERVE_DB" = true ]; then
    print_message "Running tests with database preservation..." "${YELLOW}"
    PRESERVE_DATABASE=true npm test
  else
    npm test
  fi
  if [ $? -ne 0 ]; then
    print_message "Backend tests failed. Continuing anyway..." "${YELLOW}"
  fi

  print_message "Running frontend tests..." "${BLUE}"
  cd ../expense-tracker-frontend
  ng test --watch=false --browsers=ChromeHeadless
  if [ $? -ne 0 ]; then
    print_message "Frontend tests failed. Continuing anyway..." "${YELLOW}"
  fi
else
  print_message "Skipping tests as requested..." "${YELLOW}"
fi

# Start the application
print_message "Starting the application..." "${BLUE}"

# Start backend in background
print_message "Starting backend server..." "${GREEN}"
cd ../expense-tracker-backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
print_message "Waiting for backend to start..." "${BLUE}"
sleep 5

# Start frontend
print_message "Starting frontend application..." "${GREEN}"
cd ../expense-tracker-frontend
ng serve &
FRONTEND_PID=$!

# Print success message
print_message "Expense Tracker Application is running!" "${GREEN}"
print_message "Frontend: http://localhost:4200" "${GREEN}"
print_message "Backend API: http://localhost:4000" "${GREEN}"
print_message "Press Ctrl+C to stop both servers" "${YELLOW}"

# Seed default users
print_message "Seeding default users..." "${BLUE}"
# Create admin user
curl -s -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"Admin123","firstName":"Admin","lastName":"User"}'
# Login as admin to get token
LOGIN_RESP=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123"}')
# Extract token
ADMIN_TOKEN=$(echo "$LOGIN_RESP" | sed -E 's/.*"token":"([^"]+)".*/\1/')
# Promote admin user to ADMIN role
curl -s -X POST http://localhost:4000/api/users/promote \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'
# Create normal user
curl -s -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"user@example.com","password":"User123","firstName":"Normal","lastName":"User"}'
print_message "Default users seeded." "${GREEN}"

# Display seeded user credentials
print_message "#####" "${BLUE}"
print_message "Admin => useremail: admin@example.com, password: Admin123" "${YELLOW}"
print_message "User  => username: user@example.com,  password: User123" "${YELLOW}"
print_message "#####" "${BLUE}"

# Function to handle script termination
cleanup() {
  print_message "Stopping servers..." "${YELLOW}"
  kill $BACKEND_PID
  kill $FRONTEND_PID
  print_message "Servers stopped. Goodbye!" "${GREEN}"
  exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep the script running
wait 