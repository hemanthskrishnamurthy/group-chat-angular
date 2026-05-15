import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  template: `
    <section class="page-header">
      <div>
        <h1>Attendance</h1>
        <p>Daily check-in, check-out, biometric sync simulation, and work-hour analytics.</p>
      </div>
    </section>

    <section class="metric-grid">
      <mat-card><span>Today</span><strong>{{ checkedIn() ? 'Checked in' : 'Pending' }}</strong></mat-card>
      <mat-card><span>Work Hours</span><strong>{{ hours() }}</strong></mat-card>
      <mat-card><span>Late Entries</span><strong>7</strong></mat-card>
      <mat-card><span>Monthly Avg</span><strong>8.2h</strong></mat-card>
    </section>

    <mat-card class="action-panel">
      <h2>Live Attendance Actions</h2>
      <div class="button-row">
        <button mat-flat-button color="primary" type="button" (click)="checkIn()" [disabled]="checkedIn()">Check in</button>
        <button mat-stroked-button type="button" (click)="checkOut()" [disabled]="!checkedIn()">Check out</button>
        <button mat-stroked-button type="button" (click)="sync()">Sync biometric logs</button>
      </div>
      <p role="status">{{ activity() }}</p>
    </mat-card>
  `,
})
export class AttendanceComponent {
  readonly checkedIn = signal(false);
  readonly hours = signal('0.0h');
  readonly activity = signal('Socket.IO will broadcast attendance updates from the API.');

  checkIn(): void {
    this.checkedIn.set(true);
    this.activity.set(`Checked in at ${new Date().toLocaleTimeString()}`);
  }

  checkOut(): void {
    this.checkedIn.set(false);
    this.hours.set('8.1h');
    this.activity.set(`Checked out at ${new Date().toLocaleTimeString()}`);
  }

  sync(): void {
    this.activity.set('Biometric sync simulation completed.');
  }
}
