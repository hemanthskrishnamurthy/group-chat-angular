import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../state/auth.store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthStore).session()?.accessToken;
  const securedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(securedRequest);
};
