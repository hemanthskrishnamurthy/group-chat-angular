import { computed, Injectable, signal } from '@angular/core';
import { Role, UserSession } from '../../models/hrms.models';

const storageKey = 'hrms.session';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly sessionSignal = signal<UserSession | null>(this.loadSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()?.accessToken));
  readonly role = computed<Role | null>(() => this.sessionSignal()?.role ?? null);

  setSession(session: UserSession): void {
    this.sessionSignal.set(session);
    localStorage.setItem(storageKey, JSON.stringify(session));
  }

  logout(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(storageKey);
  }

  hasAnyRole(roles: Role[]): boolean {
    const role = this.role();
    return role ? roles.includes(role) : false;
  }

  private loadSession(): UserSession | null {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }
}
