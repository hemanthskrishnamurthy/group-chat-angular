import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../models/hrms.models';
import { AuthStore } from '../state/auth.store';

export const roleGuard = (roles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return auth.hasAnyRole(roles) || router.createUrlTree(['/dashboard']);
};
