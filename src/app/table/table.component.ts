import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './../user.service';
import { User } from './../user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  users: User[];
  displayedColumns: string[] = ['name', 'phone', 'gender'];

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.subscription = this.userService.userChanged.subscribe((users: User[]) => {
      this.users = users;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
