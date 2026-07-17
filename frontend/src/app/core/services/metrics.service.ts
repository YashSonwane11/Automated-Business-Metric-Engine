import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { MetricSummary } from '../../shared/models/metric-summary.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  constructor(private readonly http: HttpClient) {}

  getDailySummary(): Observable<MetricSummary[]> {
    return this.http
      .get<MetricSummary[]>(`${environment.apiBaseUrl}/api/metrics/daily-summary`)
      .pipe(
        catchError((error) => {
          console.error('Failed to load daily summary', error);
          return throwError(() => error);
        })
      );
  }
}
