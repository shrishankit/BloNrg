import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <nav *ngIf="isLoggedIn" class="navbar">
        <div class="navbar-brand">Expense Tracker</div>
        <div class="navbar-menu">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/expenses" routerLinkActive="active">Expenses</a>
          <a href="#" (click)="logout($event)">Logout</a>
        </div>
      </nav>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #8c6aac;
    color: white;
    border-radius: 10px;
    }
    
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .navbar-menu {
      display: flex;
      gap: 20px;
    }
    
    .navbar-menu a {
      color: white;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
    }
    
    .navbar-menu a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .navbar-menu a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    main {
      flex: 1;
      background-color: #f5f5f5;
    }
  `]
})
export class AppComponent {
  title = 'expense-tracker-frontend';
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
