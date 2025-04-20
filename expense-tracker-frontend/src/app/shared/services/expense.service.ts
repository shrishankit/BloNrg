import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';

export interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getExpenses(): Observable<Expense[]> {
    const currentUser = this.authService.currentUserValue;
    
    // If user is admin, get all expenses
    if (currentUser && currentUser.role === 'ADMIN') {
      return this.http.get<Expense[]>(`${this.apiUrl}/all`);
    }
    
    // Otherwise, get only the user's expenses
    return this.http.get<Expense[]>(`${this.apiUrl}/user/${currentUser.id}`);
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: Expense): Observable<Expense> {
    const currentUser = this.authService.currentUserValue;
    // Ensure the date is properly formatted and add user information
    const expenseData = {
      ...expense,
      date: expense.date.toISOString(),
      user: {
        id: currentUser.id
      }
    };
    return this.http.post<Expense>(this.apiUrl, expenseData);
  }

  updateExpense(id: string, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 