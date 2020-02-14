import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './../user.service';
import { User } from './../user.model';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  user: User;
  users: User[];
  displayedColumns: string[] = ['name', 'phone', 'gender', '#'];

  constructor(
    private userService: UserService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
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
      // alert(`Deleted user ${user.fullName}`);
      this.openSnackBar(`Deleted user ${user.fullName}`);
      this.userService.getUsers();
    });
  }

  openSnackBar(message: string) {
    this.snackBar.openFromComponent(SnackBarComponent);

    this.snackBar.open(message, 'Done', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['green-snackbar']
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
