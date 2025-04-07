import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  messages = new BehaviorSubject<string | null>(null);
  public messages$ = this.messages.asObservable();

  push(message: string) {
    this.messages.next(message);
  }
}
