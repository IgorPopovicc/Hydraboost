import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the main Serbian navigation and developer credit', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const navigation = root.querySelector('.desktop-nav')?.textContent ?? '';

    expect(navigation).toContain('Početna');
    expect(navigation).toContain('Cenovnik');
    expect(root.textContent).toContain('Dizajn i razvoj: Igor Popović');
  });
});
