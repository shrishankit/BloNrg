import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DashboardComponent
  ]
})
export class DashboardModule { } 