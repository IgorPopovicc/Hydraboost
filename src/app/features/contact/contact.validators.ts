import { ValidatorFn } from '@angular/forms';

export const textLength = (min: number, max: number, multiline = false): ValidatorFn => (control) => {
  const value = String(control.value ?? '').trim();
  const forbidden = multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/;
  return value.length < min || value.length > max || forbidden.test(value) ? { text: true } : null;
};

export const phoneNumber: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  const digits = value.replace(/\D/g, '');
  return value.length > 40 || !/^\+?[\d\s()/.-]+$/.test(value) || /[\r\n\t]/.test(value)
    || digits.length < 7 || digits.length > 15 ? { phone: true } : null;
};

export const optionalEmail: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  const [local, domain, extra] = value.split('@');
  return value.length > 254 || !local || local.length > 64 || !domain || extra !== undefined
    || !/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(local)
    || !/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(domain)
    ? { email: true } : null;
};
