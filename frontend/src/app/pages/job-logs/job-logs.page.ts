import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { JobService } from '../../core/services/job.service';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { JobStatus } from '../../shared/models/job-status.model';

@Component({
  selector: 'app-job-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './job-logs.page.html',
  styleUrls: ['./job-logs.page.scss']
})
export class JobLogsPage implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly displayedColumns = ['id', 'jobName', 'status', 'startedAt', 'completedAt', 'rowsProcessed', 'rowsFailed'];
  dataSource = new MatTableDataSource<JobStatus>([]);

  constructor(private readonly jobService: JobService) {
    this.loadJobs();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadJobs(): void {
    this.jobService.getRecentJobs().subscribe({
      next: (jobs) => {
        this.dataSource.data = jobs;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Unable to load job logs.');
        this.loading.set(false);
      }
    });
  }

  runBatch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.jobService.runBatchJob().subscribe({
      next: () => this.loadJobs(),
      error: (err) => {
        this.error.set(err?.message || 'Batch job failed to start.');
        this.loading.set(false);
      }
    });
  }
}
