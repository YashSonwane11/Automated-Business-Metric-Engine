import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
})
export class Settings implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isSaving = signal(false);
  private themeSub?: Subscription;

  constructor(
    private fb: FormBuilder, 
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {
    this.settingsForm = this.fb.group({
      // Notifications
      emailNotifications: [true],
      smsAlerts: [false],
      weeklyReports: [true],
      // System Preferences
      theme: [this.themeService.theme()],
      dataRetention: ['90'],
      // Scheduler Configuration
      schedulerTime: ['02:00'],
      schedulerEnabled: [true],
      // Data Pipeline
      csvPath: ['classpath:raw_sales_data.csv'],
      autoRecalculate: [true],
      // API & Logging
      apiLogLevel: ['INFO']
    });
  }

  ngOnInit() {
    this.themeSub = this.settingsForm.get('theme')?.valueChanges.subscribe(value => {
      this.themeService.setTheme(value as Theme);
    });
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
  }

  saveSettings() {
    this.isSaving.set(true);
    // Explicitly set it again on save, just to be sure
    this.themeService.setTheme(this.settingsForm.get('theme')?.value);
    
    setTimeout(() => {
      this.isSaving.set(false);
      this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
    }, 800);
  }

  resetDefaults() {
    this.settingsForm.patchValue({
      emailNotifications: true,
      smsAlerts: false,
      weeklyReports: true,
      theme: 'system',
      dataRetention: '90',
      schedulerTime: '02:00',
      schedulerEnabled: true,
      csvPath: 'classpath:raw_sales_data.csv',
      autoRecalculate: true,
      apiLogLevel: 'INFO'
    });
    this.snackBar.open('Settings reset to defaults', 'Close', { duration: 3000 });
  }
}

