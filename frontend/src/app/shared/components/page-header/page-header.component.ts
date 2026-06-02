import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        @if (icon) {
          <div class="header-icon"><mat-icon>{{ icon }}</mat-icon></div>
        }
        <div>
          <h1>{{ title }}</h1>
          @if (subtitle) {
            <p>{{ subtitle }}</p>
          }
        </div>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
