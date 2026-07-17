import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JobStatus } from '../../shared/models/job-status.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private readonly http: HttpClient) {}

  getRecentJobs(): Observable<JobStatus[]> {
    return this.http.get<JobStatus[]>(`${environment.apiBaseUrl}/api/jobs/recent`).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  runBatchJob(): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/api/jobs/run`, {}).pipe(
      catchError((error) => throwError(() => error))
    );
  }
}
