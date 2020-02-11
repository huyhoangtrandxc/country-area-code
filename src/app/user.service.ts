import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userChanged = new Subject<User[]>();

  private users: User[];

  constructor(private http: HttpClient) { }

  getUsers() {
    this.http.get('https://5e4138942001b900146ba398.mockapi.io/users').subscribe((users: User[]) => {
      this.users = users;
      this.userChanged.next(this.users);
    });

  }

  addUser(user: User) {
    const newId = this.users.length + 1;

    return this.http.post('https://5e4138942001b900146ba398.mockapi.io/users', {
      ...user,
      id: newId
    });
  }
}
