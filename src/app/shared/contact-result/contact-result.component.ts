import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, ViewChild, inject, input, output } from '@angular/core';
import { SITE_INFO } from '../../core/data/site.data';

@Component({
  selector: 'app-contact-result',
  templateUrl: './contact-result.component.html',
  styleUrl: './contact-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactResultComponent {
  readonly result = input<'success' | 'error'>('success');
  readonly closed = output<void>();
  protected readonly site = SITE_INFO;
  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;
  private readonly document = inject(DOCUMENT);
  private readonly platform = inject(PLATFORM_ID);
  private previousOverflow = '';
  private returnFocus?: HTMLElement;
  private opened = false;

  open(returnFocus: HTMLElement): void {
    if (!isPlatformBrowser(this.platform) || this.opened) return;
    this.returnFocus = returnFocus;
    this.previousOverflow = this.document.body.style.overflow;
    this.dialog.nativeElement.showModal();
    this.document.body.style.overflow = 'hidden';
    this.opened = true;
  }

  protected close(): void {
    this.dialog.nativeElement.close();
  }

  protected keepFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const controls = this.dialog.nativeElement.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
    const first = controls.item(0);
    const last = controls.item(controls.length - 1);
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  protected onClose(): void {
    if (!this.opened) return;
    this.document.body.style.overflow = this.previousOverflow;
    this.opened = false;
    this.closed.emit();
    this.returnFocus?.focus({ preventScroll: true });
  }

  ngOnDestroy(): void {
    if (this.opened) this.document.body.style.overflow = this.previousOverflow;
  }
}
