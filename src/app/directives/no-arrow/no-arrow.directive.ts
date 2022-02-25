import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNoArrow]'
})
export class NoArrowDirective {

  private observer: MutationObserver;

  constructor(private el: ElementRef) {

    const node = this.el.nativeElement;

    this.observer = new MutationObserver((mutations) => {
      // Mutations arrived, try to remove arrow
      this.removeArrow();
    });

    this.observer.observe(node, {
      childList: true,
    });

  }

  private removeArrow() {
    // Check if the arrow element is already here
    if (this.el.nativeElement.shadowRoot.querySelector('.select-icon') === null) {
      // Note yet, ignore this mutation
      return;
    }
    // This mutation has added the arrow. Remove it.
    this.el.nativeElement.shadowRoot.querySelector('.select-icon').setAttribute('style', 'display: none !important');
    // Also set the placeholder text to the same color as other placeholders
    // If a default value was selected, no placeholder element will be present, so check for null on this one again
    if (this.el.nativeElement.shadowRoot.querySelector('.select-placeholder') !== null) {
      // this.el.nativeElement.shadowRoot.querySelector('.select-placeholder').setAttribute('style', 'opacity: 1;');
    }
    // Stop listening for mutations
    this.observer.disconnect();
  }

}
