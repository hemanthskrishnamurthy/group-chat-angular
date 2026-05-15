import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <section class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>
    </section>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nothing here yet');
  readonly message = input('New activity will appear here.');
}
