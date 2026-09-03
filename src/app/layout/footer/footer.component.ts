import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAVIGATION, SITE_INFO } from '../../core/data/site.data';
import { SERVICES } from '../../core/data/services.data';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly navigation = NAVIGATION;
  protected readonly services = SERVICES.slice(0, 3);
  protected readonly site = SITE_INFO;
  protected readonly year = new Date().getFullYear();
}
