import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthStore } from '../state/auth.store';
import { ApiService } from '../services/api.service';
import { UserSession } from '../../models/hrms.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="login-screen">
      <mat-card class="login-card">
        <h1>Enterprise HRMS</h1>
        <p>Sign in with your enterprise account.</p>

        <form (ngSubmit)="login()" class="stack">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" name="email" autocomplete="email" [ngModel]="email()" (ngModelChange)="email.set($event)" required />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" name="password" autocomplete="current-password" [ngModel]="password()" (ngModelChange)="password.set($event)" required />
          </mat-form-field>

          @if (error()) {
            <p class="form-error" role="alert">{{ error() }}</p>
          }

          <button mat-flat-button color="primary" type="submit" [disabled]="isInvalid() || loading()">
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </mat-card>
    </main>
  `,
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly email = signal('hr@company.com');
  readonly password = signal('Password@123');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly isInvalid = computed(() => !this.email().includes('@') || this.password().length < 8);

  login(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.post<UserSession>('/auth/login', { email: this.email(), password: this.password() }).subscribe({
      next: (session) => {
        this.auth.setSession(session);
        void this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.error.set('Invalid credentials or API unavailable.');
        this.loading.set(false);
      },
    });
  }
}
