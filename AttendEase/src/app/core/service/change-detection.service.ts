import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChangeDetectionService {
  private changeDetectedSource = new BehaviorSubject<boolean>(false);
  changeDetected$ = this.changeDetectedSource.asObservable();

  notifyChange(changeDetected: boolean) {
    this.changeDetectedSource.next(changeDetected);
  }
}
