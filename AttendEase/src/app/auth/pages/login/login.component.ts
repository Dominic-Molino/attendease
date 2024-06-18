import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    private builder: FormBuilder,
    private service: AuthserviceService,
    private router: Router
  ) {
    sessionStorage.clear();
  }

  loginForm = this.builder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  passwordFieldType: string = 'password';

  ngOnInit(): void {}

  loginStudent() {
    if (this.loginForm.valid) {
      this.service.loginStudent(this.loginForm.value).subscribe(
        (res: any) => {
          if (res.token) {
            sessionStorage.setItem('token', res.token);
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
              title: 'Signed in successfully',
            });
            this.service.getCurrentUserRole();
            switch (this.service.getCurrentUserRole()) {
              case 1:
                this.router.navigate(['admin']);
                break;
              case 2:
                this.router.navigate(['organizer']);
                break;
              case 3:
                this.router.navigate(['student']);
                break;
              default:
                Swal.fire(
                  "User's role is unassigned",
                  'Please contact admin for support.',
                  'warning'
                );
                break;
            }
          }
        },
        (error) => {
          let errorMessage = 'An error occurred';
          if (error && error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: errorMessage,
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Missing login credentials.',
      });
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
