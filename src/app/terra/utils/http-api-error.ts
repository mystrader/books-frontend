import { HttpErrorResponse } from '@angular/common/http';

export function mensagemApiErro(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse) || err.error == null || typeof err.error !== 'object') {
    return fallback;
  }
  const e = err.error as Record<string, unknown>;
  const errors = e['errors'];
  if (errors && typeof errors === 'object') {
    const msgs = Object.values(errors as Record<string, string[]>).flat();
    if (msgs.length) {
      return msgs.join(' ');
    }
  }
  if (typeof e['message'] === 'string' && e['message'].length > 0) {
    return e['message'];
  }
  return fallback;
}
