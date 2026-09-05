import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { NAVIGATION, SITE_INFO } from '../../core/data/site.data';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;

  protected readonly navigation = NAVIGATION;
  protected readonly site = SITE_INFO;
  protected readonly menuOpen = signal(false);
  protected readonly compact = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.closeMenu());
    this.destroyRef.onDestroy(() => this.setScrollLock(false));
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.compact.set((this.document.defaultView?.scrollY ?? 0) > 18);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu(true);
  }

  @HostListener('document:keydown.tab', ['$event'])
  protected onTab(event: Event): void {
    if (!this.menuOpen()) return;
    const keyboardEvent = event as KeyboardEvent;
    const focusable = [
      this.menuButton?.nativeElement,
      ...this.document.querySelectorAll<HTMLElement>('#mobile-navigation a:not([tabindex="-1"])'),
    ].filter((element): element is HTMLElement => element !== undefined);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (keyboardEvent.shiftKey && this.document.activeElement === first) {
      keyboardEvent.preventDefault();
      last.focus();
    } else if (!keyboardEvent.shiftKey && this.document.activeElement === last) {
      keyboardEvent.preventDefault();
      first.focus();
    }
  }

  protected toggleMenu(): void {
    const nextState = !this.menuOpen();
    this.menuOpen.set(nextState);
    this.setScrollLock(nextState);
  }

  protected closeMenu(restoreFocus = false): void {
    const wasOpen = this.menuOpen();
    this.menuOpen.set(false);
    this.setScrollLock(false);
    if (wasOpen && restoreFocus) this.menuButton?.nativeElement.focus({ preventScroll: true });
  }

  private setScrollLock(locked: boolean): void {
    this.document.documentElement.classList.toggle('menu-locked', locked);
    this.document.body.classList.toggle('menu-locked', locked);
  }
}
