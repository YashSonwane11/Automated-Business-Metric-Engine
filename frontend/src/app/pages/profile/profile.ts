import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user = signal<User | null>(null);
  isSaving = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.user.set(this.auth.currentUser());

    this.profileForm = this.fb.group({
      name: [this.user()?.name || '', Validators.required],
      email: [this.user()?.email || '', [Validators.required, Validators.email]],
      title: ['Senior Data Analyst']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);
      setTimeout(() => {
        this.isSaving.set(false);
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
      }, 800);
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      this.snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
      this.passwordForm.reset();
    }
  }
}
