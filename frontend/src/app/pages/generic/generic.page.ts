import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-generic-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './generic.page.html',
  styleUrls: ['./generic.page.scss']
})
export class GenericPage {
  constructor(private readonly route: ActivatedRoute) {}

  get title(): string {
    return this.route.snapshot.data['title'] || 'Page';
  }

  get subtitle(): string {
    return this.route.snapshot.data['subtitle'] || 'Content coming soon.';
  }
}
