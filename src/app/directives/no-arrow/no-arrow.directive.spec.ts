import { NoArrowDirective } from './no-arrow.directive';
import { ElementRef } from '@angular/core';

describe('NoArrowDirective', () => {
  it('should create an instance', () => {
    const el: any = null;
    const directive = new NoArrowDirective(el);
    expect(directive).toBeTruthy();
  });
});
