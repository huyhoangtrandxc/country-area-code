import { UserService } from './../user.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as areaCode from '../../data/areaCode.json';
import * as countryCode from '../../data/countryCode.json';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Observable } from 'rxjs';
import { User } from '../user.model';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  @Output() selectionChange: EventEmitter<MatSelectChange>;
  regForm: FormGroup;
  areaCodeData: any;
  countryCodeData: any;
  filteredArea: Observable<any>;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.areaCodeData = (areaCode as any).default;
    this.countryCodeData = (countryCode as any).default;

    const defaultId = 1;
    this.filteredArea = this.areaCodeData.filter(el => el.id === defaultId);

    this.regForm = new FormGroup({
      lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
      middleName: new FormControl('', Validators.pattern('[a-zA-Z ]*')),
      firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
      country: new FormControl(''),
      area: new FormControl(''),
      numberPhone: new FormControl(''),
      gender: new FormControl('U')
    });
  }

  changeCountry(e) {
    const id = e.value;
    this.filteredArea = this.areaCodeData.filter(el => el.id === id);
    console.log(this.filteredArea);
  }

  onSubmit() {
    const { lastName, middleName, firstName, area, numberPhone, gender } = this.regForm.value;
    const fullName = `${lastName.trim()} ${middleName.trim()} ${firstName.trim()}`;
    const nbPhone: string = area + numberPhone;
    const user = {
      fullName,
      nbPhone,
      gender
    };

    this.userService.addUser(user).subscribe((userRes: User) => {
      console.log(`Added user ${userRes.fullName}!`);
      this.userService.getUsers();
    });
  }

  forbiddenEmails(control: FormControl) {
    if (control.value) {

    }
  }
}
