import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Pipe({
  name: 'keyvaluePrevNext',
  standalone: true,
})
export class KeyvaluePrevNextPipe implements PipeTransform {
  transform(
    value: Record<any, any> | Map<any, any>,
    compareFn?: (a: KeyValue<any, any>, b: KeyValue<any, any>) => number,
  ): Array<KeyValue<any, any> & { prev: any | null; next: any | null }> {
    if (!value) return [];

    const entries: Array<KeyValue<any, any>> =
      value instanceof Map
        ? Array.from(value.entries()).map(([key, val]) => ({ key, value: val }))
        : Object.entries(value).map(([key, val]) => ({ key, value: val }));

    if (compareFn) {
      entries.sort(compareFn);
    }

    return entries.map((item, index, arr) => {
      const prev = index > 0 ? arr[index - 1].value : null;
      const next = index < arr.length - 1 ? arr[index + 1].value : null;
      return { ...item, prev, next };
    });
  }
}
