import { FormControl } from '@angular/forms';
import { optionalEmail, phoneNumber, textLength } from './contact.validators';

describe('Contact validation', () => {
  it('allows common local/international telephone formatting', () => {
    for (const value of ['065/369-8376', '+381 (65) 369 8376', '0044 20 7946 0958', '+1 (212) 555-0199']) {
      expect(phoneNumber(new FormControl(value))).toBeNull();
    }
    for (const value of ['123', '+1234567890123456', 'abc12345678', '065\r\n3698376']) {
      expect(phoneNumber(new FormControl(value))).not.toBeNull();
    }
  });
  it('allows an omitted or trimmed valid email, rejects unsafe/invalid addresses', () => {
    for (const value of ['', '   ', ' ana+termin@example.co.rs ']) expect(optionalEmail(new FormControl(value))).toBeNull();
    for (const value of ['ana@', 'ana..anic@example.com', 'a@-bad.rs', 'a@example.com\r\nBcc: x@y.rs']) {
      expect(optionalEmail(new FormControl(value))).not.toBeNull();
    }
  });
  it('enforces trimmed text limits and single-line header safety', () => {
    for (const value of ['  ', 'a', 'x'.repeat(101), 'Ana\nBcc: test']) expect(textLength(2, 100)(new FormControl(value))).not.toBeNull();
    expect(textLength(10, 3000, true)(new FormControl('Prvi red\nDrugi red'))).toBeNull();
  });
});
