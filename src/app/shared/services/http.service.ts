import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  public get<T>(data: T): Observable<T> {
    return timer(500).pipe(map(() => data));
  }
}
