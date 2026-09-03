import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQS } from '../../core/data/faq.data';
import { PRICING } from '../../core/data/pricing.data';
import { PROCESS_STEPS, SITE_INFO } from '../../core/data/site.data';
import { SERVICES } from '../../core/data/services.data';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';
import { FaqListComponent } from '../../shared/faq-list/faq-list.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AppointmentCtaComponent, FaqListComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly services = SERVICES;
  protected readonly pricing = PRICING;
  protected readonly steps = PROCESS_STEPS;
  protected readonly faqs = FAQS.slice(0, 5);
  protected readonly site = SITE_INFO;
}
