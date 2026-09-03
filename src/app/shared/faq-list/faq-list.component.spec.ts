import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FAQS } from '../../core/data/faq.data';
import { FaqListComponent } from './faq-list.component';

describe('FaqListComponent', () => {
  let fixture: ComponentFixture<FaqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FaqListComponent] }).compileComponents();
    fixture = TestBed.createComponent(FaqListComponent);
    fixture.componentRef.setInput('items', FAQS.slice(0, 2));
    fixture.detectChanges();
  });

  it('updates accessible expanded state when another question is opened', () => {
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>('button');
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('false');

    buttons[1].click();
    fixture.detectChanges();

    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
  });
});
