import { AfterViewInit, Component, signal, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { MetricsService } from '../../core/services/metrics.service';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { finalize } from 'rxjs/operators';
import { MetricSummary } from '../../shared/models/metric-summary.model';

interface DashboardSummary {
  totalRevenue: number;
  netRevenue: number;
  totalOrders: number;
  distinctDays: number;
  topCategory: string;
  rollingRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    KpiCardComponent,
    BaseChartDirective
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  readonly metrics = signal<MetricSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  dataSource = new MatTableDataSource<MetricSummary>([]);
  displayedColumns = ['metric_date', 'category', 'total_orders', 'gross_revenue', 'net_revenue'];

  readonly summary = signal<DashboardSummary>({
    totalRevenue: 0,
    netRevenue: 0,
    totalOrders: 0,
    distinctDays: 0,
    topCategory: 'N/A',
    rollingRevenue: 0
  });

  readonly revenueTrend = signal<ChartConfiguration<'line'>>({
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
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });

  readonly categoryBar = signal<ChartConfiguration<'bar'>>({
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: 'rgba(148, 163, 184, 0.9)' }, grid: { display: false } },
        y: { ticks: { color: 'rgba(148, 163, 184, 0.9)' }, grid: { color: 'rgba(148, 163, 184, 0.15)' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  readonly revenuePie = signal<ChartConfiguration<'pie'>>({
    type: 'pie',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: 'rgba(148, 163, 184, 0.9)' } } }
    }
  });

  constructor(private readonly metricsService: MetricsService) {
    this.loadMetrics();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    this.dataSource.filterPredicate = (row: MetricSummary, filter: string) => {
      const value = `${row.metric_date} ${row.category}`.toLowerCase();
      return value.includes(filter.trim().toLowerCase());
    };
  }

  applyFilter(value: string): void {
    this.filter.set(value);
    this.dataSource.filter = value.trim().toLowerCase();
  }

  reload(): void {
    this.error.set(null);
    this.loading.set(true);
    this.loadMetrics();
  }

  private loadMetrics(): void {
    this.metricsService
      .getDailySummary()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.metrics.set(data);
          this.dataSource.data = data;
          this.updateSummary(data);
          this.updateCharts(data);
        },
        error: (error) => {
          this.error.set(error?.message || 'Unable to load dashboard metrics.');
        }
      });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private updateSummary(data: MetricSummary[]): void {
    const totalRevenue = data.reduce((acc, row) => acc + Number(row.gross_revenue ?? 0), 0);
    const netRevenue = data.reduce((acc, row) => acc + Number(row.net_revenue ?? 0), 0);
    const totalOrders = data.reduce((acc, row) => acc + Number(row.total_orders ?? 0), 0);
    const distinctDays = new Set(data.map((row) => row.metric_date)).size;

    const categoryRevenue = data.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + Number(row.gross_revenue ?? 0);
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

    const latestRow = [...data].sort((a, b) => a.metric_date.localeCompare(b.metric_date)).pop();
    const rollingRevenue = Number(latestRow?.rolling_7_day_revenue ?? 0);

    this.summary.set({
      totalRevenue,
      netRevenue,
      totalOrders,
      distinctDays,
      topCategory,
      rollingRevenue
    });
  }

  private updateCharts(data: MetricSummary[]): void {
    const dateGroups = data.reduce((acc, row) => {
      acc[row.metric_date] = (acc[row.metric_date] ?? 0) + Number(row.gross_revenue ?? 0);
      return acc;
    }, {} as Record<string, number>);
    const dates = Object.keys(dateGroups).sort();
    const formattedDates = dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }));

    const categoryGroups = data.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + Number(row.gross_revenue ?? 0);
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.keys(categoryGroups);
    const barData: ChartDataset<'bar'> = {
      label: 'Revenue',
      data: categories.map((category) => categoryGroups[category]),
      backgroundColor: categories.map((_, idx) => `rgba(${80 + idx * 20}, 120, 255, 0.72)`),
      borderRadius: 8,
      maxBarThickness: 26
    };

    const pieDataset: ChartDataset<'pie'> = {
      label: 'Revenue Distribution',
      data: categories.map((category) => categoryGroups[category]),
      backgroundColor: categories.map((_, idx) => `rgba(${104 + idx * 18}, ${130 + idx * 8}, 255, 0.72)`)
    };

    this.revenueTrend.set({
      ...this.revenueTrend(),
      data: { labels: formattedDates, datasets: [{
        label: 'Revenue',
        data: dates.map((date) => dateGroups[date]),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4
      }] }
    });

    this.categoryBar.set({
      ...this.categoryBar(),
      data: { labels: categories, datasets: [barData] }
    });

    this.revenuePie.set({
      ...this.revenuePie(),
      data: { labels: categories, datasets: [pieDataset] }
    });
  }
}
