import { UserService } from './../user.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as areaCode from '../../data/areaCode.json';
import * as countryCode from '../../data/countryCode.json';
import * as info from '../../data/info.json';

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
  areaCodeData: any;
  countryCodeData: any;
  info: any;

  regForm: FormGroup;
  filteredArea = [];
  submitted = false;

  // arrayCountryCode: string[];

  constructor(private userService: UserService) { }

  ngOnInit() {
    // data get from JSON
    this.areaCodeData = (areaCode as any).default;
    this.countryCodeData = (countryCode as any).default;
    this.info = (info as any).default;

    // const defaultId = 1;
    // this.filteredArea = this.areaCodeData.find(el => el.id === defaultId);

    // map array code
    // this.arrayCountryCode = this.countryCodeData.map(el => el.value);

    this.regForm = new FormGroup({
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[^*|:<>[\]{}.,?/`~¥£€\\';@&$!#%^*+=()”]+$/),
        this.forbiddenNotAllowedNumber
      ]),
      middleName: new FormControl('', [Validators.pattern(/^[^*|:<>[\]{}.,?/`~¥£€\\';@&$!#%^*+=()”]+$/)]),
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[^*|:<>[\]{}.,?/`~¥£€\\';@&$!#%^*+=()”]+$/),
        this.forbiddenNotAllowedNumber
      ]),

      country: new FormControl(''),
      area: new FormControl(''),
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
}
