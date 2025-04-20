import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense } from '../../../shared/services/expense.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expense-list">
      <div class="expense-header">
        <h2>Expenses</h2>
        <div *ngIf="isAdmin" class="admin-controls">
          <select [(ngModel)]="selectedUser" (change)="filterExpenses()" class="user-filter">
            <option value="all">All Users</option>
            <option *ngFor="let user of uniqueUsers" [value]="user.id">
              {{user.username}}
            </option>
          </select>
          <div class="date-filters">
            <input type="date" [(ngModel)]="dateFrom" (change)="filterExpenses()" placeholder="From">
            <input type="date" [(ngModel)]="dateTo" (change)="filterExpenses()" placeholder="To">
          </div>
        </div>
      </div>

      <div class="expense-stats" *ngIf="isAdmin">
        <div class="stat-card">
          <h3>Total Expenses</h3>
          <div class="stat-value">\${{totalExpenses.toFixed(2)}}</div>
        </div>
        <div class="stat-card">
          <h3>Average per User</h3>
          <div class="stat-value">\${{averagePerUser.toFixed(2)}}</div>
        </div>
        <div class="stat-card">
          <h3>Total Users</h3>
          <div class="stat-value">{{uniqueUsers.length}}</div>
        </div>
      </div>

      <div class="expense-items">
        <div *ngFor="let expense of filteredExpenses" class="expense-item">
          <div class="expense-main">
            <div class="expense-amount">\${{expense.amount.toFixed(2)}}</div>
            <div class="expense-details">
              <div class="expense-description">{{expense.description}}</div>
              <div class="expense-category">{{expense.category}}</div>
              <div class="expense-date">{{expense.date | date:'medium'}}</div>
              <div *ngIf="isAdmin" class="expense-user">
                <span class="user-label">User:</span>
                <span class="user-name">{{expense.user?.username || 'Unknown'}}</span>
                <span class="user-email">({{expense.user?.email}})</span>
              </div>
            </div>
          </div>
          <div class="expense-actions">
            <button class="edit-btn" (click)="editExpense(expense)">Edit</button>
            <button class="delete-btn" (click)="deleteExpense(expense)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expense-list {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .expense-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .admin-controls {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .user-filter {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .date-filters {
      display: flex;
      gap: 10px;
    }

    .date-filters input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .expense-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
    }

    .expense-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .expense-item {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .expense-main {
      display: flex;
      gap: 20px;
      flex: 1;
    }

    .expense-amount {
      font-size: 1.2em;
      font-weight: bold;
      color: #007bff;
      min-width: 100px;
    }

    .expense-details {
      flex: 1;
    }

    .expense-description {
      font-weight: 500;
      margin-bottom: 5px;
    }

    .expense-category {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 5px;
    }

    .expense-date {
      color: #999;
      font-size: 0.8em;
      margin-bottom: 5px;
    }

    .expense-user {
      font-size: 0.9em;
      margin-top: 5px;
    }

    .user-label {
      color: #666;
    }

    .user-name {
      color: #007bff;
      font-weight: 500;
      margin: 0 5px;
    }

    .user-email {
      color: #999;
    }

    .expense-actions {
      display: flex;
      gap: 10px;
    }

    .edit-btn, .delete-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
    }

    .edit-btn {
      background: #28a745;
      color: white;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
    }

    .edit-btn:hover {
      background: #218838;
    }

    .delete-btn:hover {
      background: #c82333;
    }
  `]
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  isAdmin = false;
  selectedUser = 'all';
  dateFrom: string = '';
  dateTo: string = '';
  uniqueUsers: any[] = [];
  totalExpenses = 0;
  averagePerUser = 0;

  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    this.isAdmin = currentUser && currentUser.role === 'ADMIN';
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses()
      .subscribe(expenses => {
        this.expenses = expenses;
        this.filteredExpenses = [...expenses];
        
        if (this.isAdmin) {
          // Extract unique users
          this.uniqueUsers = Array.from(new Set(expenses.map(e => e.user?.id)))
            .filter(id => id)
            .map(id => expenses.find(e => e.user?.id === id)?.user)
            .filter(user => user);

          // Calculate total expenses
          this.totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
          
          // Calculate average per user
          this.averagePerUser = this.totalExpenses / this.uniqueUsers.length;
        }
      });
  }

  filterExpenses(): void {
    let filtered = [...this.expenses];

    // Filter by user
    if (this.selectedUser !== 'all') {
      filtered = filtered.filter(exp => exp.user?.id === this.selectedUser);
    }

    // Filter by date range
    if (this.dateFrom) {
      filtered = filtered.filter(exp => 
        new Date(exp.date) >= new Date(this.dateFrom)
      );
    }

    if (this.dateTo) {
      filtered = filtered.filter(exp => 
        new Date(exp.date) <= new Date(this.dateTo)
      );
    }

    this.filteredExpenses = filtered;
  }

  editExpense(expense: Expense): void {
    // TODO: Implement edit functionality
    console.log('Edit expense:', expense);
  }

  deleteExpense(expense: Expense): void {
    if (expense.id && confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(expense.id).subscribe({
        next: () => {
          this.loadExpenses();
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
        }
      });
    }
  }
} 