import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { UploadPage } from './pages/upload/upload.page';
import { JobLogsPage } from './pages/job-logs/job-logs.page';
import { NotFoundPage } from './pages/not-found/not-found.page';
import { ShellComponent } from './core/components/shell/shell.component';
import { Analytics } from './pages/analytics/analytics';
import { Scheduler } from './pages/scheduler/scheduler';
import { Reports } from './pages/reports/reports';
import { Users } from './pages/users/users';
import { Settings } from './pages/settings/settings';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    title: 'Login | Metric Engine'
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardPage,
        title: 'Dashboard | Metric Engine'
      },
      {
        path: 'upload',
        component: UploadPage,
        title: 'Upload CSV | Metric Engine'
      },
      {
        path: 'analytics',
        component: Analytics,
        title: 'Analytics | Metric Engine'
      },
      {
        path: 'scheduler',
        component: Scheduler,
        title: 'Scheduler | Metric Engine'
      },
      {
        path: 'reports',
        component: Reports,
        title: 'Reports | Metric Engine'
      },
      {
        path: 'users',
        component: Users,
        title: 'User Management | Metric Engine'
      },
      {
        path: 'settings',
        component: Settings,
        title: 'Settings | Metric Engine'
      },
      {
        path: 'profile',
        component: Profile,
        title: 'Profile | Metric Engine'
      },
      {
        path: 'job-logs',
        component: JobLogsPage,
        title: 'Job Logs | Metric Engine'
      }
    ]
  },
  {
    path: '**',
    component: NotFoundPage,
    title: 'Page Not Found | Metric Engine'
  }
];
