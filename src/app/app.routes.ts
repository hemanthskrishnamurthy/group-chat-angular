import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { EnterpriseShellComponent } from './layout/enterprise-shell.component';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: EnterpriseShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'employees',
        canActivate: [roleGuard(['Super Admin', 'HR', 'Manager'])],
        loadComponent: () => import('./features/employees/employees.component').then((m) => m.EmployeesComponent),
      },
      {
        path: 'leave',
        loadComponent: () => import('./features/leave/leave.component').then((m) => m.LeaveComponent),
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance.component').then((m) => m.AttendanceComponent),
      },
      {
        path: 'payroll',
        canActivate: [roleGuard(['Super Admin', 'HR'])],
        loadComponent: () => import('./features/payroll/payroll.component').then((m) => m.PayrollComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
