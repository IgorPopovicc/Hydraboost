import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SITE_INFO } from '../../core/data/site.data';
import { ContactService } from '../../core/services/contact.service';
import { ContactResultComponent } from '../../shared/contact-result/contact-result.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { optionalEmail, phoneNumber, textLength } from './contact.validators';

@Component({
  selector: 'app-contact-page',
  imports: [RouterLink, ReactiveFormsModule, IconComponent, ContactResultComponent],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  protected readonly site = SITE_INFO;
  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly result = signal<'success' | 'error' | null>(null);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly document = inject(DOCUMENT);
  private readonly contact = inject(ContactService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild(ContactResultComponent) private resultDialog!: ContactResultComponent;
  @ViewChild('submitButton') private submitButton!: ElementRef<HTMLButtonElement>;

  protected readonly contactForm = this.formBuilder.group({
    fullName: ['', textLength(2, 100)],
    phone: ['', phoneNumber],
    email: ['', optionalEmail],
    location: ['', textLength(2, 200)],
    message: ['', textLength(10, 3000, true)],
    website: [''],
  });

  protected sendMessage(): void {
    if (this.sending() || this.result()) return;
    this.submitted.set(true);
    const raw = this.contactForm.getRawValue();
    this.contactForm.setValue({
      fullName: raw.fullName.trim(), phone: raw.phone.trim(), email: raw.email.trim(),
      location: raw.location.trim(), message: raw.message.trim(), website: raw.website.trim(),
    });
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.changeDetector.detectChanges();
      this.document.querySelector<HTMLElement>('app-contact-page form .ng-invalid')?.focus();
      return;
    }
    this.sending.set(true);
    this.contact.send(this.contactForm.getRawValue()).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.sending.set(false)),
    ).subscribe({
      next: () => this.showResult('success'),
      error: () => this.showResult('error'),
    });
  }

  private showResult(result: 'success' | 'error'): void {
    this.result.set(result);
    this.changeDetector.detectChanges();
    this.resultDialog.open(this.submitButton.nativeElement);
  }

  protected onResultClosed(): void {
    if (this.result() === 'success') {
      this.contactForm.reset();
      this.submitted.set(false);
    }
    this.result.set(null);
  }
}
