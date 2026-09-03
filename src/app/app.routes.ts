import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.page').then((module) => module.HomePage) },
  { path: 'usluge', loadComponent: () => import('./features/services/services.page').then((module) => module.ServicesPage) },
  { path: 'cenovnik', loadComponent: () => import('./features/pricing/pricing.page').then((module) => module.PricingPage) },
  { path: 'cjenovnik', redirectTo: 'cenovnik', pathMatch: 'full' },
  { path: 'o-nama', loadComponent: () => import('./features/about/about.page').then((module) => module.AboutPage) },
  { path: 'faq', loadComponent: () => import('./features/faq/faq.page').then((module) => module.FaqPage) },
  { path: 'kontakt', loadComponent: () => import('./features/contact/contact.page').then((module) => module.ContactPage) },
  { path: 'our-services', redirectTo: 'usluge', pathMatch: 'full' },
  { path: 'about-us', redirectTo: 'o-nama', pathMatch: 'full' },
  { path: 'contact', redirectTo: 'kontakt', pathMatch: 'full' },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.page').then((module) => module.NotFoundPage) },
];
