# Expense Tracker Backend

A Node.js/Express backend for an expense tracking application with user authentication and role-based access control.

## Features

- User authentication (register, login)
- Role-based access control (USER, ADMIN)
- CRUD operations for expenses
- Bulk operations for expenses (create, delete)
- Admin features for managing all users' expenses

## API Endpoints

### User Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user

### Expense Endpoints

- `GET /api/expenses/user/:userId` - Get expenses for a specific user
- `GET /api/expenses/all` - Get all expenses (admin only)
- `POST /api/expenses` - Create a single expense
- `POST /api/expenses/bulk` - Create multiple expenses in bulk
- `DELETE /api/expenses/:id` - Delete a single expense
- `DELETE /api/expenses/bulk` - Delete multiple expenses in bulk

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

The application includes comprehensive unit tests for all API endpoints.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- `src/tests/setup.ts` - Test setup and helper functions
- `src/tests/userController.test.ts` - Tests for user controller
- `src/tests/expenseController.test.ts` - Tests for expense controller

### Test Coverage

The tests cover:
- User registration and login
- Expense creation (single and bulk)
- Expense retrieval (user-specific and admin)
- Expense deletion (single and bulk)
- Authorization checks
- Error handling

## Database Schema

The application uses Prisma with a PostgreSQL database. The schema includes:

- Users table with role-based access
- Expenses table with user relationships
- Categories table for expense categorization

## License

ISC 