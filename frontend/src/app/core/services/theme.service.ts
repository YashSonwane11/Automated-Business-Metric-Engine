import { Injectable, signal, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _currentTheme = signal<Theme>('light');
  readonly theme = this._currentTheme.asReadonly();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const savedTheme = localStorage.getItem('metric-engine-theme') as Theme | null;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('system');
    }
  }

  setTheme(theme: Theme) {
    this._currentTheme.set(theme);
    localStorage.setItem('metric-engine-theme', theme);
    
    if (theme === 'dark') {
      this.document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      this.document.body.classList.remove('dark-theme');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.document.body.classList.add('dark-theme');
      } else {
        this.document.body.classList.remove('dark-theme');
      }
    }
  }
}
