import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  ...['', 'usluge', 'cenovnik', 'o-nama', 'faq', 'kontakt'].map((path): ServerRoute => ({
    path,
    renderMode: RenderMode.Prerender,
  })),
  ...['cjenovnik', 'our-services', 'about-us', 'contact'].map((path): ServerRoute => ({
    path,
    renderMode: RenderMode.Server,
  })),
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404,
  },
];
