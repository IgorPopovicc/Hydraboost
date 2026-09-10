import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FaqItem } from '../../core/models/content.models';

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqListComponent {
  readonly items = input.required<readonly FaqItem[]>();
}
