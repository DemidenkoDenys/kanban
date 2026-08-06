import { Injectable } from '@angular/core';
import { filter, fromEvent, Observable, share } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClickService {
  public keyEvent$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(share());
}
