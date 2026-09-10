import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STEFAN_PROFILE } from '../../core/data/about.data';
import { IconComponent } from '../../shared/icon/icon.component';
import { AppointmentCtaComponent } from '../../shared/appointment-cta/appointment-cta.component';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, AppointmentCtaComponent, IconComponent],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly profile = STEFAN_PROFILE;
}
