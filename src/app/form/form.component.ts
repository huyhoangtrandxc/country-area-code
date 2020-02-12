import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import * as areaCode from '../../data/areaCode.json';
import * as countryCode from '../../data/countryCode.json';
import * as info from '../../data/info.json';
import { UserService } from './../user.service';
import { User } from '../user.model';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  @Output() selectionChange: EventEmitter<MatSelectChange>;
  @Input() isEdit: boolean;
  areaCodeData: any;
  countryCodeData: any;
  info: any;

  regForm: FormGroup;
  filteredArea = [];
  submitted = false;

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
    // data get from JSON
    this.areaCodeData = (areaCode as any).default;
    this.countryCodeData = (countryCode as any).default;
    this.info = (info as any).default;

    this.regForm = new FormGroup({
      lastName: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[^*|:<>[\]{}.,?/`~¥£€\\';@&$!#%^*+=()”]+$/),
        this.forbiddenNotAllowedNumber
      ]),
      middleName: new FormControl('', [Validators.pattern(/^[^*|:<>[\]{}.,?/`~¥£€\\';@&$!#%^*+=()”]+$/)]),
      firstName: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[^*|:<>[\]{}.,?/`~¥£€\\';@&$!#%^*+=()”]+$/),
        this.forbiddenNotAllowedNumber
      ]),

      country: new FormControl(null),
      area: new FormControl(null),
      numberPhone: new FormControl('', [Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/)]),
      gender: new FormControl('U', [this.forbiddenGender])
    });
  }

  changeCountry(e) {
    const id = e.value;
    this.filteredArea = this.areaCodeData.find(el => el.id === id);
    console.log(this.filteredArea);
  }

  onSubmit() {
    this.submitted = true;

    let fullName: string;
    const { lastName, middleName, firstName, area, numberPhone, gender } = this.regForm.value;
    const nbPhone: string = area + numberPhone;
    if (lastName && firstName) {
      fullName = `${lastName.trim()} ${middleName.trim()} ${firstName.trim()}`;
    }
    const user = {
      fullName,
      nbPhone,
      gender
    };

    if (this.regForm.valid) {
      this.userService.addUser(user).subscribe((userRes: User) => {
        console.log(`Added user ${userRes.fullName}!`);
        this.userService.getUsers();
      });
    }
  }

  forbiddenGender(control: FormControl) {
    if (control.value === 'U') {
      return { genderEqual: true };
    }
    return null;
  }

  forbiddenNotAllowedNumber(control: FormControl) {
    const myPatternNotAllowedNumber = /^([^0-9]*)$/;

    if (!myPatternNotAllowedNumber.test(control.value)) {
      return { hasNumber: true };
    }
    return null;
  }

  setInfo() {
    const { fullName, lastName, middleName, phoneNumber, gender } = this.info;

    const firstName = fullName.split(' ').reverse()[0];
    const country = this.countryCodeData.find(el => phoneNumber.includes(el.value));
    const bnPhoneWithoutCoutry = phoneNumber.slice(country.value.length);
    const ftAreaThreeNb = this.areaCodeData.find(el => el.id === country.id).value
      .find(el => el.slice(1) === bnPhoneWithoutCoutry.slice(0, 2));
    const ftAreaFourNb = this.areaCodeData.find(el => el.id === country.id).value
      .find(el => el.slice(1) === bnPhoneWithoutCoutry.slice(0, 3));

    let bnPhoneWithoutCAndA: string;
    if (ftAreaThreeNb) {
      bnPhoneWithoutCAndA = bnPhoneWithoutCoutry.slice(2);
    } else if (ftAreaFourNb) {
      bnPhoneWithoutCAndA = bnPhoneWithoutCoutry.slice(3);
    }

    this.filteredArea = this.areaCodeData.find(el => el.id === country.id);
    this.regForm.patchValue({
      lastName,
      middleName,
      firstName,
      country: country.id,
      area: ftAreaThreeNb || ftAreaFourNb,
      numberPhone: bnPhoneWithoutCAndA,
      gender
    });
  }

  // onEdit(){

  // }
}
