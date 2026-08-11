import { ApplicationRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export function ViewTransition() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const document = (this as any).document || inject(DOCUMENT);
      const appRef = (this as any).appRef || inject(ApplicationRef);

      if (document && 'startViewTransition' in document) {
        return document.startViewTransition(() => {
          const result = originalMethod.apply(this, args);
          appRef.tick();
          return result;
        });
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
