import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseListComponent } from './expense-list/expense-list.component';

const routes: Routes = [
  { path: '', component: ExpenseListComponent },
  // Add more routes as needed
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ExpenseListComponent
  ]
})
export class ExpensesModule { } 