import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-markattendancee',
  standalone: true,
  imports: [],
  templateUrl: './markattendancee.component.html',
  styleUrl: './markattendancee.component.css',
})
export class MarkattendanceeComponent {
  hello() {
    Swal.fire('Hello world!');
  }
}
