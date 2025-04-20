import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExpenseListComponent } from './expense-list.component';
import { ExpenseService, Expense } from '../../../shared/services/expense.service';
import { AuthService } from '../../../core/auth.service';
import { of, BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ExpenseListComponent', () => {
  let component: ExpenseListComponent;
  let fixture: ComponentFixture<ExpenseListComponent>;
  let expenseServiceSpy: jasmine.SpyObj<ExpenseService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 100,
      category: 'Food',
      date: new Date(),
      description: 'Lunch',
      user: { id: '1', username: 'user1', email: 'user1@test.com' }
    },
    {
      id: '2',
      amount: 200,
      category: 'Transport',
      date: new Date(),
      description: 'Bus',
      user: { id: '2', username: 'user2', email: 'user2@test.com' }
    }
  ];

  const mockAdminUser = {
    id: '1',
    username: 'admin',
    role: 'ADMIN'
  };

  const mockRegularUser = {
    id: '2',
    username: 'user',
    role: 'USER'
  };

  beforeEach(async () => {
    const expenseSpy = jasmine.createSpyObj('ExpenseService', ['getExpenses', 'deleteExpense']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: new BehaviorSubject<any>(mockAdminUser),
      currentUserValue: mockAdminUser
    });

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ExpenseListComponent],
      providers: [
        { provide: ExpenseService, useValue: expenseSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    expenseServiceSpy = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    expenseServiceSpy.getExpenses.and.returnValue(of(mockExpenses));
    expenseServiceSpy.deleteExpense.and.returnValue(of(void 0));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize as admin user', () => {
    expect(component.isAdmin).toBe(true);
  });

  it('should initialize as regular user', () => {
    (authServiceSpy.currentUser as any) = new BehaviorSubject<any>(mockRegularUser);
    (authServiceSpy as any).currentUserValue = mockRegularUser;
    
    fixture = TestBed.createComponent(ExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.isAdmin).toBe(false);
  });

  it('should load expenses on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    
    expect(expenseServiceSpy.getExpenses).toHaveBeenCalled();
    expect(component.expenses).toEqual(mockExpenses);
    expect(component.filteredExpenses).toEqual(mockExpenses);
  }));

  it('should calculate admin statistics correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();
    
    expect(component.totalExpenses).toBe(300);
    expect(component.averagePerUser).toBe(150);
    expect(component.uniqueUsers.length).toBe(2);
  }));

  it('should filter expenses by user', () => {
    component.expenses = mockExpenses;
    component.selectedUser = '1';
    
    component.filterExpenses();
    
    expect(component.filteredExpenses.length).toBe(1);
    expect(component.filteredExpenses[0].user?.id).toBe('1');
  });

  it('should filter expenses by date range', () => {
    component.expenses = mockExpenses;
    component.dateFrom = '2024-01-01';
    component.dateTo = '2024-12-31';
    
    component.filterExpenses();
    
    expect(component.filteredExpenses.length).toBe(2);
  });

  it('should delete expense', fakeAsync(() => {
    const expenseToDelete = mockExpenses[0];
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.deleteExpense(expenseToDelete);
    tick();
    
    expect(expenseServiceSpy.deleteExpense).toHaveBeenCalledWith(expenseToDelete.id as string);
    expect(expenseServiceSpy.getExpenses).toHaveBeenCalled();
  }));

  it('should not delete expense if user cancels', () => {
    const expenseToDelete = mockExpenses[0];
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteExpense(expenseToDelete);
    
    expect(expenseServiceSpy.deleteExpense).not.toHaveBeenCalled();
  });

  it('should handle error when deleting expense', fakeAsync(() => {
    const expenseToDelete = mockExpenses[0];
    spyOn(window, 'confirm').and.returnValue(true);
    expenseServiceSpy.deleteExpense.and.returnValue(of(null).pipe(() => {
      throw new Error('Delete failed');
    }));
    
    spyOn(console, 'error');
    component.deleteExpense(expenseToDelete);
    tick();
    
    expect(console.error).toHaveBeenCalled();
  }));
}); 