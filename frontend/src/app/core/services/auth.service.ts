import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);
  readonly user$ = this._currentUser.asReadonly();

  constructor(private readonly router: Router) {
    const stored = localStorage.getItem('metric-engine-user');
    if (stored) {
      this._currentUser.set(JSON.parse(stored) as User);
    }
  }

  /** Public readable signal for components like Profile */
  currentUser = this._currentUser.asReadonly();

  login(email: string, password: string, remember: boolean): Observable<boolean> {
    const user: User = {
      email,
      name: 'Enterprise Admin',
      roles: ['admin']
    };

    this._currentUser.set(user);
    if (remember) {
      localStorage.setItem('metric-engine-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('metric-engine-user');
    }

    return of(true);
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('metric-engine-user');
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return !!this._currentUser();
  }
}
