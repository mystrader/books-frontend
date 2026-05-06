import { Directive, ElementRef, HostListener, inject } from '@angular/core';

import { CAPA_PLACEHOLDER_URI } from '../utils/capa-placeholder';

@Directive({
  selector: 'img[terraCapaFallback]',
  standalone: true,
})
export class TerraCapaFallbackDirective {
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private done = false;

  @HostListener('error') onError(): void {
    if (this.done) return;
    this.done = true;
    const img = this.el.nativeElement;
    img.src = CAPA_PLACEHOLDER_URI;
    img.removeAttribute('srcset');
  }
}
