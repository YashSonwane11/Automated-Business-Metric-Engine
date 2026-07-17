import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobService } from '../../core/services/job.service';

interface JobSchedule {
  id: string;
  name: string;
  cronExpression: string;
  nextRun: string;
  status: 'Active' | 'Paused';
}

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './scheduler.html',
  styleUrls: ['./scheduler.scss'],
})
export class Scheduler {
  displayedColumns = ['name', 'cronExpression', 'nextRun', 'status', 'actions'];
  isRunning = signal(false);

  schedules = signal<JobSchedule[]>([
    { id: '1', name: 'Daily Data Aggregation', cronExpression: '0 0 * * *', nextRun: 'Tomorrow at 00:00 AM', status: 'Active' },
    { id: '2', name: 'Weekly Metric Export', cronExpression: '0 0 * * 0', nextRun: 'Sunday at 00:00 AM', status: 'Active' },
    { id: '3', name: 'Monthly Clean-up', cronExpression: '0 0 1 * *', nextRun: 'Nov 1 at 00:00 AM', status: 'Paused' },
  ]);

  constructor(
    private jobService: JobService,
    private snackBar: MatSnackBar
  ) {}

  toggleStatus(job: JobSchedule) {
    const newStatus = job.status === 'Active' ? 'Paused' : 'Active';
    this.schedules.update(jobs => 
      jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j)
    );
    this.snackBar.open(`${job.name} ${newStatus === 'Active' ? 'activated' : 'paused'}`, 'Close', { duration: 3000 });
  }

  editJob(job: JobSchedule) {
    this.snackBar.open(`Edit job: ${job.name} — coming soon`, 'Close', { duration: 3000 });
  }

  deleteJob(job: JobSchedule) {
    this.schedules.update(jobs => jobs.filter(j => j.id !== job.id));
    this.snackBar.open(`${job.name} deleted`, 'Undo', { duration: 4000 });
  }

  createSchedule() {
    this.snackBar.open('Create schedule feature coming soon', 'Close', { duration: 3000 });
  }

  runNow() {
    this.isRunning.set(true);
    this.snackBar.open('Starting batch job...', 'Close', { duration: 2000 });

    this.jobService.runBatchJob().subscribe({
      next: () => {
        this.isRunning.set(false);
        this.snackBar.open('Batch job completed successfully!', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.isRunning.set(false);
        this.snackBar.open(`Batch job failed: ${err?.message || 'Unknown error'}`, 'Dismiss', { duration: 5000 });
      }
    });
  }
}
