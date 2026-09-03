import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, AppointmentCtaComponent],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}
