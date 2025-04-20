import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService, Expense } from '../../shared/services/expense.service';
import { AuthService } from '../../core/auth.service';
import { SocketService } from '../../shared/services/socket.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { Subscription } from 'rxjs';

interface DashboardStats {
  totalExpenses: number;
  averagePerTransaction: number;
  transactionCount: number;
  latestExpense: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="user-profile">
          <span>{{ currentUser?.username }}</span>
          <span class="user-type">{{ currentUser?.role === 'ADMIN' ? 'Admin' : 'Premium User' }}</span>
          <div class="avatar">
            <!-- You can add user avatar here -->
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Expenses</h3>
          <div class="stat-value">\${{ stats.totalExpenses.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <h3>Average per Transaction</h3>
          <div class="stat-value">\${{ stats.averagePerTransaction.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <h3>Transactions</h3>
          <div class="stat-value">{{ stats.transactionCount }}</div>
        </div>
        <div class="stat-card">
          <h3>Latest Expense</h3>
          <div class="stat-value">\${{ stats.latestExpense.toFixed(2) }}</div>
        </div>
      </div>

      <!-- Expense Trend -->
      <div class="trend-section">
        <div class="section-header">
          <h2>Expense Trend</h2>
          <select [(ngModel)]="selectedTrendPeriod" (change)="updateChart()" class="period-select">
            <option value="all">All</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
        <div class="trend-chart">
          <canvas #chartCanvas></canvas>
        </div>
      </div>

      <!-- Add New Expense -->
      <div class="add-expense-section">
        <h2>Add New Expense</h2>
        <div class="add-expense-form">
          <input 
            type="number" 
            [(ngModel)]="newExpense.amount" 
            placeholder="Amount" 
            class="amount-input"
          >
          <select [(ngModel)]="newExpense.category" class="category-select">
            <option value="">Select Category</option>
            <option *ngFor="let category of categories" [value]="category">
              {{ category }}
            </option>
          </select>
          <button (click)="addExpense()" class="add-button">Add Expense</button>
        </div>
      </div>

      <!-- Recent Expenses -->
      <div class="recent-expenses-section">
        <div class="section-header">
          <h2>Recent Expenses</h2>
          <div class="date-filters">
            <input type="date" [(ngModel)]="dateFrom" (change)="filterExpenses()">
            <span>to</span>
            <input type="date" [(ngModel)]="dateTo" (change)="filterExpenses()">
            <select [(ngModel)]="selectedCategory" (change)="filterExpenses()" class="category-filter">
              <option value="all">All</option>
              <option *ngFor="let category of categories" [value]="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
        <table class="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th *ngIf="currentUser?.role === 'ADMIN'">User</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let expense of filteredExpenses">
              <td>{{ expense.date | date }}</td>
              <td>{{ expense.category }}</td>
              <td>\${{ expense.amount.toFixed(2) }}</td>
              <td *ngIf="currentUser?.role === 'ADMIN'" class="user-cell">
                <span class="user-name">{{ expense.user?.username || 'Unknown' }}</span>
                <span *ngIf="expense.user?.id" class="status-indicator" [class.online]="isUserOnline(expense.user.id)"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-type {
      color: #666;
      font-size: 0.9rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }

    .trend-section {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .trend-chart {
      height: 300px;
      position: relative;
    }

    .add-expense-section {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .add-expense-form {
      display: flex;
      gap: 1rem;
    }

    .amount-input,
    .category-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .add-button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
    }

    .add-button:hover {
      background: #0056b3;
    }

    .recent-expenses-section {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .date-filters {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .expenses-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .expenses-table th,
    .expenses-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .expenses-table th {
      color: #666;
      font-weight: 600;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-name {
      color: #007bff;
      font-weight: 500;
    }

    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #ccc;
    }

    .status-indicator.online {
      background-color: #28a745;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  
  currentUser: any;
  stats: DashboardStats = {
    totalExpenses: 0,
    averagePerTransaction: 0,
    transactionCount: 0,
    latestExpense: 0
  };
  selectedTrendPeriod = 'all';
  newExpense = {
    amount: null as number | null,
    category: '',
    description: ''
  };
  categories = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Others'
  ];
  dateFrom: string = '';
  dateTo: string = '';
  selectedCategory = 'all';
  recentExpenses: any[] = [];
  filteredExpenses: any[] = [];
  private chart: Chart | null = null;
  private socketSubscription: Subscription | null = null;

  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService,
    private socketService: SocketService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.loadDashboardData();
    
    // Subscribe to online users updates
    if (this.currentUser?.role === 'ADMIN') {
      this.socketSubscription = this.socketService.onlineUsers$.subscribe(onlineUsers => {
        // Force change detection to update the UI
        this.filteredExpenses = [...this.filteredExpenses];
      });
    }
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  // Check if a user is online
  isUserOnline(userId: number): boolean {
    try {
      return this.socketService.isUserOnline(userId);
    } catch (error) {
      console.error('Error checking user online status:', error);
      return false; // Default to offline if there's an error
    }
  }

  loadDashboardData() {
    this.expenseService.getExpenses().subscribe(expenses => {
      if (expenses.length > 0) {
        this.recentExpenses = expenses;
        this.filteredExpenses = [...expenses];
        this.stats = {
          totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
          transactionCount: expenses.length,
          averagePerTransaction: expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length,
          latestExpense: expenses[0].amount
        };
        this.updateChart();
      }
    });
  }

  initChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Expenses',
          data: [],
          borderColor: '#007bff',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '\$' + value
            }
          }
        }
      }
    });
  }

  updateChart() {
    if (!this.chart || !this.recentExpenses.length) return;

    const now = new Date();
    let filteredData = [...this.recentExpenses];

    if (this.selectedTrendPeriod === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredData = filteredData.filter(exp => new Date(exp.date) >= monthStart);
    } else if (this.selectedTrendPeriod === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      filteredData = filteredData.filter(exp => new Date(exp.date) >= weekStart);
    }

    // Group by date and calculate daily totals
    const dailyTotals = filteredData.reduce((acc, exp) => {
      const date = new Date(exp.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {} as { [key: string]: number });

    const sortedDates = Object.keys(dailyTotals).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    this.chart.data.labels = sortedDates;
    this.chart.data.datasets[0].data = sortedDates.map(date => dailyTotals[date]);
    this.chart.update();
  }

  addExpense() {
    if (this.newExpense.amount && this.newExpense.category) {
      const expense: Expense = {
        amount: this.newExpense.amount,
        category: this.newExpense.category,
        description: this.newExpense.description || this.newExpense.category,
        date: new Date()
      };

      this.expenseService.createExpense(expense).subscribe({
        next: () => {
          this.loadDashboardData();
          this.newExpense = {
            amount: null,
            category: '',
            description: ''
          };
        },
        error: (error) => {
          console.error('Error creating expense:', error);
          // You could add error handling UI here
        }
      });
    }
  }

  filterExpenses() {
    let filtered = [...this.recentExpenses];

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

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(exp => 
        exp.category === this.selectedCategory
      );
    }

    this.filteredExpenses = filtered;
  }
} 