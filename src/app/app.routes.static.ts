import { RenderMode, ServerRoute } from '@angular/ssr';

const prerenderedPaths = [
  '',
  'usluge',
  'cenovnik',
  'o-nama',
  'faq',
  'kontakt',
  'cjenovnik',
  'our-services',
  'about-us',
  'contact',
  '404',
];

export const serverRoutes: ServerRoute[] = [
  ...prerenderedPaths.map((path): ServerRoute => ({
    path,
    renderMode: RenderMode.Prerender,
  })),
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
