import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CONTACT_CONFIG, ContactPayload } from '../config/contact.config';
import { ContactService } from './contact.service';

const payload: ContactPayload = { fullName: 'Ana Anić', phone: '+381 65 369 8376', email: 'ana@example.com', location: 'Vračar', message: 'Zanima me termin sutra.', website: '' };

describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: CONTACT_CONFIG, useValue: { endpoint: '/api/contact', timeoutMs: 30 } }] });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('only accepts the explicit email acceptance response', () => {
    let accepted = false;
    service.send(payload).subscribe(() => accepted = true);
    const request = http.expectOne('/api/contact');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(accepted).toBe(false);
    request.flush({ ok: true, status: 'accepted' });
    expect(accepted).toBe(true);
  });

  for (const response of [null, {}, { ok: true }, { ok: false, status: 'accepted' }, '<html>OK</html>']) {
    it(`rejects malformed success ${JSON.stringify(response)}`, () => {
      let failed = false;
      service.send(payload).subscribe({ error: () => failed = true });
      http.expectOne('/api/contact').flush(response);
      expect(failed).toBe(true);
    });
  }

  it('reuses the idempotency key on network failure and changes it after editing', () => {
    service.send(payload).subscribe({ error: () => undefined });
    const first = http.expectOne('/api/contact');
    const key = first.request.headers.get('Idempotency-Key');
    first.error(new ProgressEvent('error'));
    service.send(payload).subscribe({ error: () => undefined });
    const retry = http.expectOne('/api/contact');
    expect(retry.request.headers.get('Idempotency-Key')).toBe(key);
    retry.flush({}, { status: 502, statusText: 'Bad Gateway' });
    service.send({ ...payload, message: 'Drugi željeni termin.' }).subscribe();
    const edited = http.expectOne('/api/contact');
    expect(edited.request.headers.get('Idempotency-Key')).not.toBe(key);
    edited.flush({ ok: true, status: 'accepted' });
  });

  it('times out and cancels an unanswered request', async () => {
    const failure = new Promise<string>((resolve) => service.send(payload).subscribe({ error: (error) => resolve(error.name) }));
    const request = http.expectOne('/api/contact');
    expect(await failure).toBe('TimeoutError');
    expect(request.cancelled).toBe(true);
  });
});
