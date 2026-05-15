import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DashboardStore } from '../../core/state/dashboard.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <section class="page-header">
      <div>
        <h1>Analytics Dashboard</h1>
        <p>Workforce, attendance, leave, payroll, and attrition signals.</p>
      </div>
    </section>

    <section class="metric-grid" aria-label="HR analytics metrics">
      <mat-card><span>Total Employees</span><strong>{{ store.metrics().employees }}</strong></mat-card>
      <mat-card><span>Present Today</span><strong>{{ store.metrics().presentToday }}</strong></mat-card>
      <mat-card><span>Pending Leaves</span><strong>{{ store.metrics().pendingLeaves }}</strong></mat-card>
      <mat-card><span>Payroll Processed</span><strong>{{ store.metrics().payrollProcessed }}%</strong></mat-card>
      <mat-card><span>Attrition</span><strong>{{ store.metrics().attritionRate }}%</strong></mat-card>
    </section>

    <section class="analytics-grid">
      <mat-card>
        <h2>Attendance Trend</h2>
        <div class="bar-chart" aria-label="Weekly attendance trend">
          @for (value of store.attendanceTrend(); track $index) {
            <span [style.height.%]="value"></span>
          }
        </div>
      </mat-card>
      <mat-card>
        <h2>Department Performance</h2>
        <ul class="clean-list">
          <li><span>Engineering</span><strong>94%</strong></li>
          <li><span>Operations</span><strong>89%</strong></li>
          <li><span>Sales</span><strong>87%</strong></li>
          <li><span>Finance</span><strong>91%</strong></li>
        </ul>
      </mat-card>
    </section>
  `,
})
export class DashboardComponent {
  readonly store = inject(DashboardStore);
}
