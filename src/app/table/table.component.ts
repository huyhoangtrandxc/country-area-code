import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './../user.service';
import { User } from './../user.model';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  users: User[];
  user: User;
  displayedColumns: string[] = ['name', 'phone', 'gender', '#'];

  constructor(
    private userService: UserService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.userService.getUsers();
    this.subscription = this.userService.userChanged.subscribe((users: User[]) => {
      this.users = users;
    });
  }

  openDialog(id: string): void {
    this.userService.getUser(id).subscribe((user: User) => {
      this.user = user;

      const dialogRef = this.dialog.open(DialogComponent, {
        width: '750px',
        data: {
          user: this.user
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.user = result;
      });
    });
  }

  onDelete(id: string) {
    this.userService.deleteUser(id).subscribe((user: any) => {
      alert(`Deleted user ${user.fullName}`);
      console.log(`Deleted user ${user.fullName}`);
      this.userService.getUsers();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
