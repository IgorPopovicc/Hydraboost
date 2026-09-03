import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../core/data/site.data';

@Component({
  selector: 'app-appointment-cta',
  imports: [RouterLink],
  templateUrl: './appointment-cta.component.html',
  styleUrl: './appointment-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentCtaComponent {
  protected readonly site = SITE_INFO;
}
