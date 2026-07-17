import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UploadService } from '../../core/services/upload.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatInputModule,
    MatDividerModule,
    MatFormFieldModule
  ],
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss']
})
export class UploadPage {
  readonly uploading = signal(false);
  readonly progress = signal(0);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly uploadHistory = signal<any[]>([]);

  readonly displayedColumns = ['fileName', 'status', 'uploadedAt', 'rowCount'];

  constructor(
    private readonly uploadService: UploadService,
    private readonly notifications: NotificationService
  ) {
    this.loadHistory();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.error.set(null);
    this.success.set(null);
  }

  startUpload(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Select a valid CSV file before uploading.');
      return;
    }

    this.uploading.set(true);
    this.progress.set(0);
    this.error.set(null);
    this.success.set(null);

    this.uploadService.uploadCsv(file).subscribe({
      next: (progress) => this.progress.set(progress),
      error: (err) => {
        this.error.set(err?.message || 'Upload failed. Please try again.');
        this.uploading.set(false);
        this.notifications.error(err?.message || 'Upload failed');
      },
      complete: () => {
        this.uploading.set(false);
        this.success.set('File uploaded and metrics recalculated successfully!');
        this.notifications.success('CSV uploaded successfully! Dashboard metrics updated.');
        this.loadHistory();
      }
    });
  }

  private loadHistory(): void {
    this.uploadService.getUploadHistory().subscribe({
      next: (history) => this.uploadHistory.set(history),
      error: () => this.uploadHistory.set([])
    });
  }
}
