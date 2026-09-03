import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRICING } from '../../core/data/pricing.data';
import { SITE_INFO } from '../../core/data/site.data';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';

@Component({
  selector: 'app-pricing-page',
  imports: [RouterLink, AppointmentCtaComponent],
  templateUrl: './pricing.page.html',
  styleUrl: './pricing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingPage {
  protected readonly pricing = PRICING;
  protected readonly site = SITE_INFO;
}
