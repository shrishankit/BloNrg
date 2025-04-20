# Expense Tracker Application

A full-stack expense tracking application built with Angular and Node.js, featuring real-time updates and user authentication.

## Features

- 🔐 User Authentication (Login/Register)
- 💰 Expense Management
  - Create, Read, Update, Delete expenses
  - Categorize expenses
  - Filter expenses by date and category
- 📊 Dashboard
  - Expense statistics
  - Recent transactions
  - Real-time updates
- 👥 User Management
  - Admin panel for user management
  - User roles (Admin/Regular User)
- 🌐 Real-time Features
  - Online user status


## Getting Started

Too lazy ... Just save some time run "run-project.sh", PS make it execuatable
```bash
chmod +x run-project.sh && ./run-project.sh
```
    

### Prerequisites
- Node.js (v18 or higher)
- MySQL
- Angular CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. Install Backend Dependencies
```bash
cd expense-tracker-backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../expense-tracker-frontend
npm install
```

### Configuration

1. Backend Configuration
   - Create a `.env` file in the backend directory
   - Add the following environment variables:
     ```
     PORT=4000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=expense_tracker
     JWT_SECRET=your_jwt_secret
     ```

2. Frontend Configuration
   - Update the API URL in `src/environments/environment.ts`
   - Update the WebSocket URL in `src/app/shared/services/socket.service.ts`

### Running the Application

1. Start the Backend Server
```bash
cd expense-tracker-backend
npm run dev
```

2. Start the Frontend Application
```bash
cd expense-tracker-frontend
ng serve
```
## Tech Stack

### Frontend
- Angular 17
- TypeScript
- Socket.io-client
- Chart.js
- Bootstrap 5

### Backend
- Node.js
- Express.js
- MySQL
- Socket.io
- JWT Authentication

## Project Structure

```
expense-tracker/
├── expense-tracker-frontend/     # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # Core services and guards
│   │   │   ├── features/        # Feature modules
│   │   │   ├── shared/          # Shared components and services
│   │   │   └── app.component.ts
│   │   └── environments/        # Environment configurations
│   └── package.json
│
└── expense-tracker-backend/      # Node.js backend application
    ├── src/
    │   ├── controllers/         # Route controllers
    │   ├── middleware/          # Custom middleware
    │   ├── models/             # Database models
    │   ├── routes/             # API routes
    │   ├── services/           # Business logic
    │   └── index.ts            # Application entry point
    └── package.json
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:4000

## Testing

### Backend Tests
```bash
cd expense-tracker-backend
npm test
```

### Frontend Tests
```bash
cd expense-tracker-frontend
ng test
```

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user profile

### Expense Endpoints
- GET `/api/expenses` - Get user expenses
- POST `/api/expenses` - Create new expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense
- GET `/api/expenses/all` - Get all expenses (Admin only)

### User Endpoints
- GET `/api/users` - Get all users (Admin only)
- PUT `/api/users/:id` - Update user (Admin only)
- DELETE `/api/users/:id` - Delete user (Admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Angular Team for the amazing framework
- Node.js community for the robust ecosystem
- MySQL for the reliable database solution
- Socket.io for real-time capabilities 