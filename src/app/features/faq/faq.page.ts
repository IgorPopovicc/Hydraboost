import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQS } from '../../core/data/faq.data';
import { SITE_INFO } from '../../core/data/site.data';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';
import { FaqListComponent } from '../../shared/faq-list/faq-list.component';

@Component({
  selector: 'app-faq-page',
  imports: [RouterLink, AppointmentCtaComponent, FaqListComponent],
  templateUrl: './faq.page.html',
  styleUrl: './faq.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPage {
  protected readonly faqs = FAQS;
  protected readonly site = SITE_INFO;
}
