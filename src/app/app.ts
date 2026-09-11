import { Location, ViewportScroller } from '@angular/common';
import { afterNextRender, ApplicationRef, ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SeoService } from './core/services/seo.service';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { RouteLoaderComponent } from './shared/route-loader/route-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouteLoaderComponent],
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly seo = inject(SeoService);

  constructor() {
    const router = inject(Router);
    const scroller = inject(ViewportScroller);
    const app = inject(ApplicationRef);
    const destroyRef = inject(DestroyRef);
    const initialUrl = router.serializeUrl(router.parseUrl(inject(Location).path(true)));
    const fragment = router.parseUrl(initialUrl).fragment;
    if (!fragment) return;

    // Angular skips its initial Scroll event during hydration. Restore a direct
    // fragment once the prerendered route is ready, including a browser refresh.
    afterNextRender(() => {
      void app.whenStable().then(() => {
        if (!destroyRef.destroyed && router.url === initialUrl) {
          scroller.scrollToAnchor(fragment, { behavior: 'instant' });
        }
      });
    });
  }
}
