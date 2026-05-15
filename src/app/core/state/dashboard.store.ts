import { Injectable, signal } from '@angular/core';
import { DashboardMetrics } from '../../models/hrms.models';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  readonly metrics = signal<DashboardMetrics>({
    employees: 248,
    presentToday: 213,
    pendingLeaves: 18,
    payrollProcessed: 96,
    attritionRate: 4.2,
  });

  readonly attendanceTrend = signal([82, 86, 84, 91, 88, 90, 87]);
}
