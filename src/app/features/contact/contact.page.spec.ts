import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ContactPage } from './contact.page';

const values = { fullName: '  Ana Anić  ', phone: '+381 (65) 369-8376', email: ' ana@example.com ', location: ' Vračar ', message: ' Molim Vas za termin sutra. ' };

describe('ContactPage', () => {
  let fixture: ComponentFixture<ContactPage>;
  let http: HttpTestingController;
  let root: HTMLElement;
  const fill = (data = values) => {
    for (const [id, value] of Object.entries(data)) {
      const input = root.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  };
  const submit = () => { root.querySelector('form')!.dispatchEvent(new Event('submit')); fixture.detectChanges(); };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactPage);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });
  afterEach(() => http.verify());

  it('shows localized errors without sending an empty request', () => {
    submit();
    expect(root.querySelectorAll('.error').length).toBe(4);
    http.expectNone('/api/contact');
  });
  it('rejects whitespace-only required fields and invalid email', () => {
    fill({ ...values, fullName: '   ', email: 'bad@', message: '            ' });
    submit();
    expect(root.querySelectorAll('.error').length).toBe(3);
    http.expectNone('/api/contact');
  });
  it('trims data, sends once, and waits for acceptance before success', () => {
    fill(); submit(); submit();
    const request = http.expectOne('/api/contact');
    expect(request.request.body.fullName).toBe('Ana Anić');
    expect(request.request.body.email).toBe('ana@example.com');
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    request.flush({ ok: true, status: 'accepted' });
    fixture.detectChanges();
    expect(root.querySelector('#contact-result-title')!.textContent).toContain('uspešno');
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    // Values remain visible until the visitor acknowledges success (covered in browser tests).
    expect(root.querySelector<HTMLInputElement>('#fullName')!.value).toBe('Ana Anić');
  });
  it('preserves values and restores the button on a server failure', () => {
    fill(); submit();
    http.expectOne('/api/contact').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(root.querySelector('#contact-result-title')!.textContent).toContain('nije poslata');
    expect(root.querySelector<HTMLInputElement>('#message')!.value).toBe('Molim Vas za termin sutra.');
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
  });
});
