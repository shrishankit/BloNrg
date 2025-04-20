import { 
  getUserExpenses, 
  getAllExpenses, 
  createExpense, 
  createBulkExpenses,
  deleteExpense,
  deleteBulkExpenses
} from '../controllers/expenseController';
import { createMockUser, createMockExpense, mockRequest, mockResponse, cleanupDatabase, prisma } from './setup';

// Define a type for our extended response
interface ExtendedResponse extends Response {
  statusCode: number;
  data: any;
}

describe('Expense Controller', () => {
  let regularUser: any;
  let adminUser: any;
  let userExpense: any;
  let adminExpense: any;

  beforeEach(async () => {
    // Only cleanup if not preserving database
    if (process.env.PRESERVE_DATABASE !== 'true') {
      await cleanupDatabase();
    }
    
    // Create test users
    regularUser = await createMockUser('USER');
    adminUser = await createMockUser('ADMIN');
    
    // Create test expenses
    userExpense = await createMockExpense(regularUser.id);
    adminExpense = await createMockExpense(adminUser.id);
  });

  describe('getUserExpenses', () => {
    it('should return expenses for the authenticated user', async () => {
      // Arrange
      const req = mockRequest({
        params: { userId: regularUser.id },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await getUserExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe(userExpense.id);
    });

    it('should return 403 if user tries to access another user\'s expenses', async () => {
      // Arrange
      const req = mockRequest({
        params: { userId: adminUser.id },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await getUserExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.data).toHaveProperty('message', 'Access denied');
    });

    it('should allow admin to access any user\'s expenses', async () => {
      // Arrange
      const req = mockRequest({
        params: { userId: regularUser.id },
        user: adminUser
      });
      const res = mockResponse() as any;

      // Act
      await getUserExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe(userExpense.id);
    });
  });

  describe('getAllExpenses', () => {
    it('should return all expenses for admin users', async () => {
      // Arrange
      const req = mockRequest({
        user: adminUser
      });
      const res = mockResponse() as any;

      // Act
      await getAllExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBe(2); // Both user and admin expenses
    });
  });

  describe('createExpense', () => {
    it('should create a new expense successfully', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          amount: 50.25,
          description: 'Test expense',
          category: 'Food',
          date: '2023-05-01'
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await createExpense(req, res);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.data).toHaveProperty('amount', 50.25);
      expect(res.data).toHaveProperty('description', 'Test expense');
      expect(res.data).toHaveProperty('userId', regularUser.id);
    });
  });

  describe('createBulkExpenses', () => {
    it('should create multiple expenses successfully', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          expenses: [
            {
              amount: 25.50,
              description: 'Lunch',
              category: 'Food',
              date: '2023-05-01'
            },
            {
              amount: 15.00,
              description: 'Bus fare',
              category: 'Transportation',
              date: '2023-05-01'
            }
          ]
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await createBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.data).toHaveProperty('message');
      expect(res.data).toHaveProperty('expenses');
      expect(res.data.expenses.length).toBe(2);
    });

    it('should return 400 if expenses array is empty', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          expenses: []
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await createBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('message', 'Invalid request. Expected an array of expenses.');
    });

    it('should return 400 if an expense is missing required fields', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          expenses: [
            {
              amount: 25.50,
              description: 'Lunch',
              // Missing category and date
            }
          ]
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await createBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('message', 'Each expense must have amount, description, category, and date fields.');
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense successfully', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: userExpense.id },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteExpense(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('message', 'Expense deleted successfully');
    });

    it('should return 403 if user tries to delete another user\'s expense', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: adminExpense.id },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteExpense(req, res);

      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.data).toHaveProperty('message', 'Access denied');
    });

    it('should allow admin to delete any expense', async () => {
      // Arrange
      const req = mockRequest({
        params: { id: userExpense.id },
        user: adminUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteExpense(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('message', 'Expense deleted successfully');
    });
  });

  describe('deleteBulkExpenses', () => {
    it('should delete multiple expenses successfully', async () => {
      // Create another expense for the user
      const anotherExpense = await createMockExpense(regularUser.id);
      
      // Arrange
      const req = mockRequest({
        body: {
          expenseIds: [userExpense.id, anotherExpense.id]
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('message', 'Successfully deleted 2 expenses');
    });

    it('should return 400 if expenseIds array is empty', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          expenseIds: []
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('message', 'Invalid request. Expected an array of expense IDs.');
    });

    it('should return 403 if user tries to delete another user\'s expense', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          expenseIds: [userExpense.id, adminExpense.id]
        },
        user: regularUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.data).toHaveProperty('message', 'Access denied to one or more expenses');
    });

    it('should allow admin to delete any expenses', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          expenseIds: [userExpense.id, adminExpense.id]
        },
        user: adminUser
      });
      const res = mockResponse() as any;

      // Act
      await deleteBulkExpenses(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('message', 'Successfully deleted 2 expenses');
    });
  });
}); 