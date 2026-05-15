import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  get<T>(url: string, params?: Record<string, string | number | boolean>): Observable<T> {
    const httpParams = new HttpParams({ fromObject: this.toStringParams(params) });
    return this.http.get<T>(`${this.baseUrl}${url}`, { params: httpParams });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`);
  }

  private toStringParams(params?: Record<string, string | number | boolean>): Record<string, string> {
    return Object.fromEntries(Object.entries(params ?? {}).map(([key, value]) => [key, String(value)]));
  }
}
