import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private readonly http: HttpClient) {}

  uploadCsv(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<HttpEvent<any>>(`${environment.apiBaseUrl}/api/uploads/csv`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          return Math.round((event.loaded / event.total) * 100);
        }
        if (event.type === HttpEventType.Response) {
          return 100;
        }
        return 0;
      }),
      catchError((error) => throwError(() => new Error(this.extractErrorMessage(error))))
    );
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.error) {
      return error.error.error;
    }
    if (typeof error?.error === 'string') {
      return error.error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Upload failed. Please try again.';
  }

  getUploadHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/uploads/history`).pipe(
      catchError((error) => throwError(() => error))
    );
  }
}
