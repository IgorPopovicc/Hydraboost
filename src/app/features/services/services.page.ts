import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROCESS_STEPS } from '../../core/data/site.data';
import { SERVICES } from '../../core/data/services.data';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink, AppointmentCtaComponent],
  templateUrl: './services.page.html',
  styleUrl: './services.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {
  protected readonly services = SERVICES;
  protected readonly steps = PROCESS_STEPS;
}
