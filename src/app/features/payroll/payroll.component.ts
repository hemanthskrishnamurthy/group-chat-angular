import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  template: `
    <section class="page-header">
      <div>
        <h1>Payroll</h1>
        <p>Salary processing, bonuses, deductions, tax calculation, history, and PDF payslips.</p>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="process()">Process payroll</button>
    </section>

    <section class="metric-grid">
      <mat-card><span>Gross Payroll</span><strong>₹4.2Cr</strong></mat-card>
      <mat-card><span>Tax Withheld</span><strong>₹62L</strong></mat-card>
      <mat-card><span>Deductions</span><strong>₹18L</strong></mat-card>
      <mat-card><span>Payslips</span><strong>{{ payslips() }}</strong></mat-card>
    </section>

    <mat-card class="action-panel">
      <h2>PDF Generation</h2>
      <p role="status">{{ status() }}</p>
      <a mat-stroked-button href="/api/payroll/payslip/demo" target="_blank" rel="noreferrer">Download sample payslip</a>
    </mat-card>
  `,
})
export class PayrollComponent {
  readonly status = signal('Ready to process the current payroll cycle.');
  readonly payslips = signal(0);

  process(): void {
    this.status.set('Payroll processed and payslip notifications queued.');
    this.payslips.set(248);
  }
}
