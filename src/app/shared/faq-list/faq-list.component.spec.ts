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

  it('prerenders every answer and opens the first native disclosure', () => {
    const root = fixture.nativeElement as HTMLElement;
    const disclosures = root.querySelectorAll<HTMLDetailsElement>('details');
    expect(disclosures[0].open).toBe(true);
    expect(disclosures[1].open).toBe(false);
    expect(disclosures[1].querySelector('summary')?.textContent).toContain(FAQS[1].question);
    expect(disclosures[1].textContent).toContain(FAQS[1].answer);
  });
});
