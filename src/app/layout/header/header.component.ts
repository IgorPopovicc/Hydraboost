import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { NAVIGATION, SITE_INFO } from '../../core/data/site.data';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @ViewChild('firstMobileLink') private firstMobileLink?: ElementRef<HTMLAnchorElement>;

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
    this.destroyRef.onDestroy(() => this.document.body.classList.remove('menu-locked'));
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.compact.set((this.document.defaultView?.scrollY ?? 0) > 18);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  protected toggleMenu(): void {
    const nextState = !this.menuOpen();
    this.menuOpen.set(nextState);
    this.document.body.classList.toggle('menu-locked', nextState);
    if (nextState && this.document.defaultView) {
      this.document.defaultView.setTimeout(() => this.firstMobileLink?.nativeElement.focus(), 220);
    }
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.document.body.classList.remove('menu-locked');
  }
}
