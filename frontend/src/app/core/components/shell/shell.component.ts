import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgForOf
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  menuItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'analytics', label: 'Analytics', icon: 'analytics' },
    { path: 'upload', label: 'Upload CSV', icon: 'file_upload' },
    { path: 'reports', label: 'Reports', icon: 'article' },
    { path: 'scheduler', label: 'Scheduler', icon: 'schedule' },
    { path: 'job-logs', label: 'Job Logs', icon: 'inventory_2' },
    { path: 'settings', label: 'Settings', icon: 'settings' },
    { path: 'profile', label: 'Profile', icon: 'person' }
  ];
}
