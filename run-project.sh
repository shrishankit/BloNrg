#!/bin/bash

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored text
print_message() {
  echo -e "${2}${1}${NC}"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
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

# Create .env file if it doesn't exist
if [ ! -f "expense-tracker-backend/.env" ]; then
  print_message "Creating .env file for backend..." "${YELLOW}"
  cat > expense-tracker-backend/.env << EOF
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=expense_tracker
JWT_SECRET=your_jwt_secret_key_change_this_in_production
EOF
  print_message "Created .env file with default values. Please update with your actual MySQL credentials." "${YELLOW}"
fi

# Install dependencies
print_message "Installing backend dependencies..." "${BLUE}"
cd expense-tracker-backend
npm install
if [ $? -ne 0 ]; then
  print_message "Failed to install backend dependencies." "${RED}"
  exit 1
fi

print_message "Installing frontend dependencies..." "${BLUE}"
cd ../expense-tracker-frontend
npm install
if [ $? -ne 0 ]; then
  print_message "Failed to install frontend dependencies." "${RED}"
  exit 1
fi

# Run tests
print_message "Running backend tests..." "${BLUE}"
cd ../expense-tracker-backend
npm test
if [ $? -ne 0 ]; then
  print_message "Backend tests failed. Continuing anyway..." "${YELLOW}"
fi

print_message "Running frontend tests..." "${BLUE}"
cd ../expense-tracker-frontend
ng test --watch=false --browsers=ChromeHeadless
if [ $? -ne 0 ]; then
  print_message "Frontend tests failed. Continuing anyway..." "${YELLOW}"
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