import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../service/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  builder = inject(FormBuilder);
  constructor(private service: AuthserviceService, private router: Router) {}

  formBuilder = this.builder.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    course: [null, Validators.required],
    yearLevel: [null, Validators.required],
    email: [null, [Validators.email, Validators.required]],
    password: [null, Validators.required],
  });

  registerStudent(): void {
    if (this.formBuilder.valid) {
      this.service.registerStudent(this.formBuilder.value).subscribe(
        (res) => {
          this.router.navigate(['login']);
          Swal.fire('Success', 'Registration successful', 'success');
        },
        (error) => {
          Swal.fire('Error', 'Registration failed', 'error');
        }
      );
    } else {
      console.log('Form is invalid. Form control errors:');
      Object.keys(this.formBuilder.controls).forEach((key) => {
        Swal.fire('Form is Invalid', 'Please try again', 'warning');
      });
    }
  }
}
