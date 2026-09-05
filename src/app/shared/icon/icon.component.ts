import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'arrow-right' | 'arrow-up-right' | 'instagram' | 'whatsapp';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
