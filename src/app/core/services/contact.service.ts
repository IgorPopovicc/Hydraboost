import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { defer, map, timeout } from 'rxjs';
import { CONTACT_CONFIG, ContactPayload } from '../config/contact.config';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(CONTACT_CONFIG);
  private attempt?: { payload: string; key: string; created: number };

  send(payload: ContactPayload) {
    return defer(() => {
      const serialized = JSON.stringify(payload);
      // Keep the same key on retries after a lost response. Resend retains keys for 24h.
      if (this.attempt?.payload !== serialized || Date.now() - this.attempt.created > 23 * 60 * 60 * 1000) {
        this.attempt = { payload: serialized, key: crypto.randomUUID(), created: Date.now() };
      }
      return this.http.post<unknown>(this.config.endpoint, payload, {
        headers: { 'Idempotency-Key': this.attempt.key },
      });
    }).pipe(
      timeout(this.config.timeoutMs),
      map((response) => {
        if (!response || typeof response !== 'object' || !('ok' in response) || response.ok !== true
          || !('status' in response) || response.status !== 'accepted') {
          throw new Error('Invalid contact response');
        }
        this.attempt = undefined;
      }),
    );
  }
}
