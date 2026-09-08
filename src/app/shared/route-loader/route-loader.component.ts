import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-route-loader',
  templateUrl: './route-loader.component.html',
  styleUrl: './route-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteLoaderComponent {
  protected readonly loading = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private initialNavigationComplete = this.router.navigated;
  private activeNavigationId: number | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this.initialNavigationComplete && this.router.navigated) this.initialNavigationComplete = true;
        this.activeNavigationId = event.id;
        if (this.initialNavigationComplete) this.loading.set(true);
        return;
      }

      if (!(event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError || event instanceof NavigationSkipped)) return;

      if (!this.initialNavigationComplete) {
        this.initialNavigationComplete = true;
        this.activeNavigationId = null;
        this.loading.set(false);
        return;
      }

      if (event.id !== this.activeNavigationId) return;
      this.activeNavigationId = null;
      this.loading.set(false);
    });
  }
}
