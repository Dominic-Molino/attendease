import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  constructor(
    private builder: FormBuilder,
    private service: AuthserviceService,
    private router: Router
  ) {}

  formBuilder = this.builder.group({
    first_name: this.builder.control('', Validators.required),
    last_name: this.builder.control('', Validators.required),
    year_level: this.builder.control('', Validators.required),
    student_block: this.builder.control('', Validators.required),
    course: this.builder.control('', Validators.required),
    email: this.builder.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    pwd: this.builder.control('', Validators.required),
  });

  registerStudent(): void {
    if (this.formBuilder.valid) {
      this.service.registerStudent(this.formBuilder.value).subscribe(
        (res) => {
          Swal.fire('Success', 'Registration Success', 'success');
          this.router.navigate(['login']);
        },
        (error) => {
          console.error('Registration failed:', error);
          Swal.fire('Error', 'Registration Failed', 'error');
        }
      );
    } else {
      Swal.fire('Form is Invalid', 'Please try again', 'warning');
    }
  }
}