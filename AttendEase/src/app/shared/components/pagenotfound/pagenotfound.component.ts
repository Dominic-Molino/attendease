import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pagenotfound',
  standalone: true,
  imports: [],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.css',
})
export class PagenotfoundComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
