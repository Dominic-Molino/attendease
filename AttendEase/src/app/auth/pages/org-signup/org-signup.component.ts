import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../core/service/authservice.service';

@Component({
  selector: 'app-org-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './org-signup.component.html',
  styleUrl: './org-signup.component.css',
})
export class OrgSignupComponent implements OnInit {
  emailInvalid: boolean = false;
  step: number = 1;

  constructor(
    private builder: FormBuilder,
    private service: AuthserviceService,
    private router: Router
  ) {}

  registerForm = this.builder.group({
    first_name: this.builder.control('', Validators.required),
    last_name: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required])),
    password: this.builder.control('', Validators.required),
    course: this.builder.control(''),
    year_level: this.builder.control(''),
    block: this.builder.control(''),
    role_id: this.builder.control(''),
  });

  ngOnInit(): void {
    this.registerForm.patchValue({
      course: null,
      block: null,
      year_level: null,
      role_id: '2',
    });
  }

  registerStudent(): void {
    if (this.registerForm.valid) {
      this.service.registerStudent(this.registerForm.value).subscribe(
        (result) => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });
          Toast.fire({
            icon: 'success',
            title: 'Registered in successfully',
          });
          Swal.fire(
            'Information',
            "We'll send you an email after your account has been activated.",
            'info'
          );
          this.router.navigate(['login']);
        },
        (error) => {
          Swal.fire('Warning', `${error.error.status.message}`, 'warning');
        }
      );
    } else {
      Swal.fire('Incomplete Data', 'Please fill in all fields', 'warning');
    }
  }
}
