import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SITE_INFO } from '../../core/data/site.data';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-contact-page',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  protected readonly site = SITE_INFO;
  protected readonly submitted = signal(false);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly contactForm = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+\d][\d\s/()-]{6,}$/)]],
    email: ['', [Validators.email]],
    location: ['', [Validators.required, Validators.minLength(2)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected prepareEmail(): void {
    this.submitted.set(true);
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const value = this.contactForm.getRawValue();
    const subject = encodeURIComponent(`Upit za termin — ${value.fullName}`);
    const body = encodeURIComponent([
      `Ime i prezime: ${value.fullName}`,
      `Telefon: ${value.phone}`,
      `E-pošta: ${value.email || 'Nije navedena'}`,
      `Lokacija: ${value.location}`,
      '',
      'Poruka:',
      value.message,
    ].join('\n'));
    const mailto = `${this.site.emailHref}?subject=${subject}&body=${body}`;

    if (isPlatformBrowser(this.platformId)) {
      this.document.defaultView?.location.assign(mailto);
    }
  }
}
