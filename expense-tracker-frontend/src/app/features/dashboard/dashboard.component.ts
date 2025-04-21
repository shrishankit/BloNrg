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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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