import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ExpenseService } from '../../shared/services/expense.service';
import { AuthService } from '../../core/auth.service';
import { SocketService } from '../../shared/services/socket.service';
import { of, BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let expenseServiceSpy: jasmine.SpyObj<ExpenseService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let socketServiceSpy: jasmine.SpyObj<SocketService>;
  let currentUserSubject: BehaviorSubject<any>;

  const mockExpenses = [
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

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER'
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<any>(mockUser);
    
    const expenseSpy = jasmine.createSpyObj('ExpenseService', ['getExpenses']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: currentUserSubject,
      currentUserValue: mockUser
    });
    const socketSpy = jasmine.createSpyObj('SocketService', ['isUserOnline'], {
      onlineUsers$: new BehaviorSubject<any[]>([])
    });

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientModule,
        DashboardComponent
      ],
      providers: [
        { provide: ExpenseService, useValue: expenseSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: SocketService, useValue: socketSpy }
      ]
    }).compileComponents();

    expenseServiceSpy = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;

    expenseServiceSpy.getExpenses.and.returnValue(of(mockExpenses));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    component.ngOnInit();
    expect(expenseServiceSpy.getExpenses).toHaveBeenCalled();
    expect(component.recentExpenses).toEqual(mockExpenses);
    expect(component.filteredExpenses).toEqual(mockExpenses);
    expect(component.stats.totalExpenses).toBe(300);
    expect(component.stats.transactionCount).toBe(2);
    expect(component.stats.averagePerTransaction).toBe(150);
    expect(component.stats.latestExpense).toBe(100);
  });

  it('should filter expenses correctly', () => {
    component.recentExpenses = mockExpenses;
    component.dateFrom = '2024-01-01';
    component.dateTo = '2024-12-31';
    component.selectedCategory = 'Food';
    
    component.filterExpenses();
    
    expect(component.filteredExpenses.length).toBe(1);
    expect(component.filteredExpenses[0].category).toBe('Food');
  });

  it('should check if user is online', () => {
    socketServiceSpy.isUserOnline.and.returnValue(true);
    expect(component.isUserOnline(1)).toBe(true);
    expect(socketServiceSpy.isUserOnline).toHaveBeenCalledWith(1);
  });

  it('should handle error when checking online status', () => {
    socketServiceSpy.isUserOnline.and.throwError('Error checking online status');
    expect(component.isUserOnline(1)).toBe(false);
  });

  it('should update when current user changes', () => {
    const newUser = { ...mockUser, username: 'newuser' };
    currentUserSubject.next(newUser);
    expect(component.currentUser).toEqual(newUser);
  });
}); 