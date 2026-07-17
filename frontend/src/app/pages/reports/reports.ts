import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Report {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  status: 'Ready' | 'Generating' | 'Failed';
  size: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
})
export class Reports {
  displayedColumns = ['name', 'type', 'generatedDate', 'status', 'size', 'actions'];
  reports = signal<Report[]>([
    { id: '1', name: 'Q3 Financial Summary', type: 'Financial', generatedDate: '2023-10-01 08:00 AM', status: 'Ready', size: '2.4 MB' },
    { id: '2', name: 'Monthly Sales Volume', type: 'Sales', generatedDate: '2023-09-30 09:30 PM', status: 'Ready', size: '1.1 MB' },
    { id: '3', name: 'Inventory Deficits', type: 'Inventory', generatedDate: '2023-10-02 11:15 AM', status: 'Generating', size: '--' },
    { id: '4', name: 'Customer Churn Risk', type: 'Analytics', generatedDate: '2023-09-28 02:45 PM', status: 'Failed', size: '--' },
  ]);

  constructor(private snackBar: MatSnackBar) {}

  downloadReport(report: Report) {
    if (report.status === 'Ready') {
      this.snackBar.open(`Downloading: ${report.name}`, 'Close', { duration: 3000 });
    }
  }

  generateNew() {
    this.snackBar.open('Generate report feature coming soon', 'Close', { duration: 3000 });
  }

  exportPdf() {
    const data = this.reports().filter(r => r.status === 'Ready');
    if (data.length === 0) {
      this.snackBar.open('No reports available to export', 'Close', { duration: 3000 });
      return;
    }

    // Generate a simple printable HTML document for PDF export
    const rows = data.map(r =>
      `<tr><td>${r.name}</td><td>${r.type}</td><td>${r.generatedDate}</td><td>${r.status}</td><td>${r.size}</td></tr>`
    ).join('');

    const html = `
      <html><head><title>Reports Export</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { color: #1d4ed8; font-size: 22px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; font-size: 13px; }
        th { background: #f1f5f9; font-weight: 600; }
        .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; }
      </style></head>
      <body>
        <h1>Business Metric Engine — Reports</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table><thead><tr><th>Name</th><th>Type</th><th>Generated</th><th>Status</th><th>Size</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="footer">Metric Engine • Automated Business Intelligence</p>
      </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    this.snackBar.open('PDF export opened in print dialog', 'Close', { duration: 3000 });
  }

  exportExcel() {
    this.exportDelimited('\t', 'reports_export.xls', 'Excel');
  }

  exportCsv() {
    this.exportDelimited(',', 'reports_export.csv', 'CSV');
  }

  private exportDelimited(delimiter: string, filename: string, label: string) {
    const data = this.reports();
    const header = ['Name', 'Type', 'Generated Date', 'Status', 'Size'].join(delimiter);
    const rows = data.map(r =>
      [r.name, r.type, r.generatedDate, r.status, r.size].join(delimiter)
    );
    const content = [header, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open(`${label} exported successfully`, 'Close', { duration: 3000 });
  }
}
