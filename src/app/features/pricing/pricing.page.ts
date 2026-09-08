import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PERSONALIZED_PACKAGE, PRICING_CATEGORIES } from '../../core/data/pricing.data';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';

@Component({
  selector: 'app-pricing-page',
  imports: [RouterLink, AppointmentCtaComponent],
  templateUrl: './pricing.page.html',
  styleUrl: './pricing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingPage {
  protected readonly categories = PRICING_CATEGORIES;
  protected readonly personalizedPackage = PERSONALIZED_PACKAGE;
}
