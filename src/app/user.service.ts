import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userChanged = new Subject<User[]>();

  constructor() { }

  addUser(user: User) {
    // const newId = this.users.length + 1;

    // this.users.push({ ...user, id: newId });
    // const blob = new Blob([JSON.stringify({ ...user, id: newId })], { type: 'application/json' });

    // this.userChanged.next(this.users.slice());
  }

}
