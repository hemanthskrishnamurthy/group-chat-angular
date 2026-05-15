import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthStore } from '../core/state/auth.store';

@Component({
  selector: 'app-enterprise-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav class="sidebar" mode="side" opened>
        <a class="brand" routerLink="/dashboard" aria-label="Enterprise HRMS dashboard">
          <span>HR</span>
          <strong>Enterprise HRMS</strong>
        </a>
        <nav aria-label="Primary navigation">
          @for (item of navItems(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="topbar">
          <button mat-icon-button type="button" (click)="darkMode.update((v) => !v)" [attr.aria-label]="darkMode() ? 'Use light theme' : 'Use dark theme'">
            <mat-icon>{{ darkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <span class="spacer"></span>
          <span class="user-chip">{{ auth.session()?.name }} · {{ auth.session()?.role }}</span>
          <button mat-button type="button" (click)="logout()">Logout</button>
        </mat-toolbar>

        <main class="content" [class.dark]="darkMode()">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class EnterpriseShellComponent {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  readonly darkMode = signal(false);

  readonly navItems = computed(() => [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/employees', label: 'Employees', icon: 'groups' },
    { path: '/leave', label: 'Leave', icon: 'event_available' },
    { path: '/attendance', label: 'Attendance', icon: 'schedule' },
    ...(this.auth.hasAnyRole(['Super Admin', 'HR']) ? [{ path: '/payroll', label: 'Payroll', icon: 'payments' }] : []),
    { path: '/notifications', label: 'Notifications', icon: 'notifications' },
  ]);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
