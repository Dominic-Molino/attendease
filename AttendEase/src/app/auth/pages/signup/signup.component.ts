import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  emailInvalid: boolean = false;

  constructor(
    private builder: FormBuilder,
    private service: AuthserviceService,
    private router: Router
  ) {}

  registerForm = this.builder.group({
    first_name: this.builder.control('', Validators.required),
    last_name: this.builder.control('', Validators.required),
    email: this.builder.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    password: this.builder.control('', Validators.required),
  });

  registerStudent(): void {
    if (this.registerForm.valid) {
      this.service.registerStudent(this.registerForm.value).subscribe(
        (result) => {
          Swal.fire('Success', 'Registration Success', 'success');
          this.router.navigate(['login']);
        },
        (error) => {
          Swal.fire('', 'Email is already registered', 'warning');
        }
      );
    } else {
      if (this.registerForm.get('email')?.invalid) {
        Swal.fire('Email is invalid', 'Please enter a valid email', 'warning');
      } else {
        Swal.fire('Incomplete Form', 'Please fill in all fields', 'warning');
      }
    }
  }
}
