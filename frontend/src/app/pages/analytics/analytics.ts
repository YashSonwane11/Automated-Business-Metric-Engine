import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import { MetricsService } from '../../core/services/metrics.service';
import { finalize } from 'rxjs/operators';
import { MetricSummary } from '../../shared/models/metric-summary.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    BaseChartDirective
  ],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss'],
})
export class Analytics implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  revenueTrend = signal<ChartConfiguration<'line'>>({
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: 'rgba(148, 163, 184, 0.9)' }, grid: { color: 'rgba(148, 163, 184, 0.15)' } },
        y: { ticks: { color: 'rgba(148, 163, 184, 0.9)' }, grid: { color: 'rgba(148, 163, 184, 0.15)' } }
      },
      plugins: {
        legend: { position: 'top', labels: { color: 'rgba(148, 163, 184, 0.9)' } },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });

  ordersBar = signal<ChartConfiguration<'bar'>>({
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: 'rgba(148, 163, 184, 0.9)' }, grid: { display: false } },
        y: { ticks: { color: 'rgba(148, 163, 184, 0.9)' }, grid: { color: 'rgba(148, 163, 184, 0.15)' } }
      },
    }
  });

  constructor(private metricsService: MetricsService) {}

  ngOnInit() {
    this.metricsService.getDailySummary()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.updateCharts(data),
        error: (err) => this.error.set(err.message)
      });
  }

  private updateCharts(data: MetricSummary[]) {
    // Group by date for trends
    const dateGroups = data.reduce((acc, row) => {
      acc[row.metric_date] = (acc[row.metric_date] || { rev: 0, orders: 0 });
      acc[row.metric_date].rev += Number(row.gross_revenue || 0);
      acc[row.metric_date].orders += Number(row.total_orders || 0);
      return acc;
    }, {} as Record<string, { rev: number, orders: number }>);

    const dates = Object.keys(dateGroups).sort();
    const formattedDates = dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }));

    this.revenueTrend.set({
      ...this.revenueTrend(),
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Daily Revenue ($)',
          data: dates.map(d => dateGroups[d].rev),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.4
        }]
      }
    });

    this.ordersBar.set({
      ...this.ordersBar(),
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Total Orders',
          data: dates.map(d => dateGroups[d].orders),
          backgroundColor: dates.map((_, i) => `rgba(${37 + i * 12}, ${99 + i * 8}, 235, 0.72)`),
          borderRadius: 4
        }]
      }
    });
  }
}
