import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactPage } from './contact.page';

describe('ContactPage', () => {
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
      providers: [provideRouter([]), { provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactPage);
    fixture.detectChanges();
  });

  it('shows localized errors and does not prepare an empty request', () => {
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const messages = Array.from(root.querySelectorAll<HTMLElement>('.error')).map((element) => element.textContent?.trim());
    expect(messages).toContain('Unesite ime i prezime.');
    expect(messages).toContain('Unesite ispravan broj telefona.');
    expect(messages).toContain('Unesite lokaciju dolaska.');
    expect(messages).toContain('Poruka treba da sadrži najmanje 10 znakova.');
  });
});
