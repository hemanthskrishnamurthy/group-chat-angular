import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { LeaveRequest } from '../../models/hrms.models';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, DataTableComponent],
  template: `
    <section class="page-header">
      <div>
        <h1>Leave Management</h1>
        <p>Employee request flow with manager and HR approval stages.</p>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="applyLeave()">Apply leave</button>
    </section>

    <section class="metric-grid">
      <mat-card><span>Sick Leave</span><strong>8</strong></mat-card>
      <mat-card><span>Casual Leave</span><strong>6</strong></mat-card>
      <mat-card><span>Earned Leave</span><strong>18</strong></mat-card>
      <mat-card><span>Maternity Leave</span><strong>Policy</strong></mat-card>
    </section>

    <mat-card>
      <h2>Leave History</h2>
      <app-data-table [rows]="requests()" [columns]="columns" />
    </mat-card>
  `,
})
export class LeaveComponent {
  readonly requests = signal<LeaveRequest[]>([
    { _id: '1', employeeName: 'Aarav Sharma', type: 'Sick Leave', startDate: '2026-05-13', endDate: '2026-05-14', status: 'Pending HR' },
    { _id: '2', employeeName: 'Kabir Khan', type: 'Earned Leave', startDate: '2026-05-20', endDate: '2026-05-24', status: 'Pending Manager' },
  ]);

  readonly columns: TableColumn<LeaveRequest>[] = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'type', label: 'Leave Type' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'status', label: 'Workflow Status' },
  ];

  applyLeave(): void {
    this.requests.update((requests) => [
      { _id: crypto.randomUUID(), employeeName: 'Current Employee', type: 'Casual Leave', startDate: '2026-05-18', endDate: '2026-05-18', status: 'Pending Manager' },
      ...requests,
    ]);
  }
}
