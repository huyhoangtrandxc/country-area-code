import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @Input() value = 100;
  @Input() diameter = 20;
  @Input() mode = 'indeterminate';
  @Input() strokeWidth = 3;
  @Input() overlay = false;
  @Input() color = 'primary';

  constructor() { }

  ngOnInit() {
  }

}
