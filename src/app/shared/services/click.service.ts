import { Injectable } from '@angular/core';
import { fromEvent, share } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClickService {
  public keyEvent$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(share());
  public mouseEvent$ = fromEvent<MouseEvent>(document, 'click').pipe(share());
}
