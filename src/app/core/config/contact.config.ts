import { InjectionToken } from '@angular/core';

// Public configuration only. Credentials belong exclusively to the PHP endpoint.
export const CONTACT_CONFIG = new InjectionToken('CONTACT_CONFIG', {
  providedIn: 'root',
  factory: () => ({ endpoint: '/api/contact.php', timeoutMs: 25_000 }),
});

export interface ContactPayload {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  message: string;
  website: string;
}
