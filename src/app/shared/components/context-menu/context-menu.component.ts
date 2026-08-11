import {
  signal,
  inject,
  Component,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'context-menu',
  template: `
    @if (isOpen()) {
      <div class="anchor" [style.left.px]="x()" [style.top.px]="y()"></div>
      <div class="menu"><ng-content /></div>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
      }
      .anchor {
        position: fixed;
        width: 1px;
        height: 1px;
        z-index: 1001;
        anchor-name: --ctx-anchor;
      }
      .menu {
        position: fixed;
        position-anchor: --ctx-anchor;
        position-try-fallbacks: flip-block, flip-inline;
        top: anchor(top);
        left: anchor(left);
        z-index: 1002;
      }
    `,
  ],
  host: {
    '(window:wheel)': 'close()',
    '(document:click)': 'onDocumentClick($event)',
    '(document:contextmenu)': 'onRightClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent {
  public readonly x = signal(0);
  public readonly y = signal(0);
  public readonly rect = signal<DOMRect | null>(null);
  public readonly isOpen = signal(false);

  private readonly elementRef = inject(ElementRef);

  open(event: MouseEvent) {
    event.preventDefault();
    this.rect.set((event.target as HTMLElement).getBoundingClientRect());
    this.x.set(event.clientX);
    this.y.set(event.clientY);
    this.isOpen.set(true);
  }

  onRightClick(event: MouseEvent) {
    if (this.isInTarget(event)) {
      this.open(event);
    } else {
      this.close();
    }
  }

  private isInTarget(event: MouseEvent): boolean {
    const rect = this.rect();
    return rect
      ? event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
      : false;
  }

  close() {
    this.isOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('window:keydown.escape')
  onEsc() {
    this.close();
  }
}
