import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class Users {
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];
  users = signal<User[]>([
    { id: 1, name: 'Enterprise Admin', email: 'admin@metricengine.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@metricengine.com', role: 'Analyst', status: 'Active' },
    { id: 3, name: 'Michael Chen', email: 'm.chen@metricengine.com', role: 'Viewer', status: 'Inactive' },
    { id: 4, name: 'Jessica Alba', email: 'jessica@metricengine.com', role: 'Manager', status: 'Active' },
  ]);

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    this.users.update(users => users.filter(u => u.id !== user.id));
  }
}
