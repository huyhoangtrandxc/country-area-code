import { SnackBarComponent } from './../snack-bar/snack-bar.component';
import { Subscription } from 'rxjs';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  @Input() userEdit: any;
  subscription: Subscription;
  userId: string;
  areaCodeData: any;
  countryCodeData: any;
  info: any;
  regForm: FormGroup;
  filteredArea: any;
  areaEdit: string;
  minLength: number;
  maxLength: number;
  showHint = true;
  submitted = false;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // data get from JSON
    this.areaCodeData = (areaCode as any).default;
    this.countryCodeData = (countryCode as any).default;
    this.info = (info as any).default;
    this.filteredArea = this.areaCodeData.find(el => el.id === 1);

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
      area: new FormControl({ value: null, disabled: true }),
      areaEdit: new FormControl(null),
      numberPhone: new FormControl(null, [Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/)]),
      gender: new FormControl('U', [this.forbiddenGender])
    });

    if (this.userEdit && this.isEdit) {
      this.setInfoEdit(this.userEdit);
    }
    // this.regForm.get('firstName').disable();
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

  changeCountry(e) {
    const id = e.value.id;
    const value = e.value.value;

    this.filteredArea = this.areaCodeData.find(el => el.id === id);
    this.showHint = false;
    this.regForm.get('area').enable();
    if (value === '+84') {
      this.setMinMaxLengthValidator('numberPhone', 10, 10, [Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/)]);
    } else {
      this.setMinMaxLengthValidator('numberPhone', 10, 20, [Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/)]);
    }
  }

  setMinMaxLengthValidator = (fieldName: string, minL: number, maxL: number, anotherValidator: any[] = []) => {
    this.minLength = minL;
    this.maxLength = maxL;
    this.regForm.get(fieldName)
      .setValidators([Validators.minLength(minL), Validators.maxLength(maxL), ...anotherValidator]);
  }

  onSubmit(formDirective: FormGroupDirective) {
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
        this.openSnackBar(`Added User ${userRes.fullName}!`);
        this.userService.getUsers();
        formDirective.resetForm();
        this.regForm.reset();
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
    const { fullName, lastName, phoneNumber, gender } = this.info;

    const country = this.getCountry(phoneNumber);
    const firstName = fullName.split(' ').reverse()[0];
    const areaC = this.getAreaCode(country, phoneNumber);
    const numberPhoneOnly = this.getShortNbPhone(country, areaC, phoneNumber);

    this.showHint = false;
    this.regForm.get('area').enable();
    this.filteredArea = this.areaCodeData.find(el => el.id === country.id);
    this.regForm.patchValue({
      lastName,
      middleName: '',
      firstName,
      country: country.id,
      area: areaC,
      numberPhone: numberPhoneOnly,
      gender
    });
  }

  setInfoEdit(user: any) {
    this.filteredArea = this.areaCodeData.find(el => el.id === 1);

    const { fullName, nbPhone, gender } = user;
    const arrName = fullName.split(' ');
    const areaC = this.filteredArea.value.find(el => nbPhone.indexOf(el) === 0);

    this.regForm.patchValue({
      lastName: arrName[0],
      middleName: arrName[1],
      firstName: arrName[2],
      areaEdit: areaC,
      numberPhone: nbPhone.slice(areaC.length),
      gender
    });
  }

  // return string nb phone without country code (+84)
  getAreaCode(country: any, phoneNumber: string) {
    const bnPhoneWithoutCoutry = phoneNumber.slice(country.value.length);
    const ftAreaThreeNb = this.areaCodeData.find(el => el.id === country.id).value
      .find(el => el.slice(1) === bnPhoneWithoutCoutry.slice(0, 2));
    const ftAreaFourNb = this.areaCodeData.find(el => el.id === country.id).value
      .find(el => el.slice(1) === bnPhoneWithoutCoutry.slice(0, 3));

    return ftAreaThreeNb || ftAreaFourNb;
  }

  getShortNbPhone(country: any, areaC: string, numberPhone: string) {
    return numberPhone.slice((country.value + areaC).length - 1);
  }

  getCountry(phoneNumber: string) {
    return this.countryCodeData.find(el => phoneNumber.includes(el.value));
  }

  onEdit(user: any) {
    const { lastName, middleName, firstName, areaEdit, numberPhone, gender } = user;
    const id = this.userEdit.id;
    const userWillSend = {
      id,
      fullName: `${lastName} ${middleName} ${firstName}`,
      nbPhone: areaEdit + numberPhone,
      gender
    };

    if (this.regForm.valid) {
      this.userService.editUser(id, userWillSend).subscribe((userRes: any) => {
        this.openSnackBar(`Updated ${userRes.fullName}`);
        this.userService.getUsers();
      });
    }
  }
}
