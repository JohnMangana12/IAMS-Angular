import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Make it a singleton service
})
export class LoadingService {
  private _isLoading = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this._isLoading.asObservable();

  constructor() { }

  startLoading(): void {
    this._isLoading.next(true);
  }

  stopLoading(): void {
    this._isLoading.next(false);
  }

  get isLoading(): boolean {
    return this._isLoading.value;
  }
}
