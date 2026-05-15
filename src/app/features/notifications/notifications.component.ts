import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NotificationItem } from '../../models/hrms.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <section class="page-header">
      <div>
        <h1>Notifications</h1>
        <p>Real-time leave, payroll, attendance, and announcement events.</p>
      </div>
    </section>

    <section class="notification-list">
      @for (item of notifications(); track item._id) {
        <mat-card>
          <span>{{ item.type }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.message }}</p>
          <small>{{ item.createdAt }}</small>
        </mat-card>
      }
    </section>
  `,
})
export class NotificationsComponent {
  readonly notifications = signal<NotificationItem[]>([
    { _id: 'n1', title: 'Leave approval required', message: 'Kabir Khan has submitted earned leave for approval.', type: 'leave', read: false, createdAt: '2026-05-15 09:30' },
    { _id: 'n2', title: 'Payroll complete', message: 'May payroll cycle is ready for HR review.', type: 'payroll', read: false, createdAt: '2026-05-15 10:15' },
  ]);
}
