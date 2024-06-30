import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { RegisterRouteComponent } from '../register-route/register-route.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    RegisterRouteComponent,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  showPopup = false;

  constructor(
    private builder: FormBuilder,
    private service: AuthserviceService,
    private router: Router,
    private diloag: MatDialog
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
          if (error.status == 401) {
            Swal.fire({
              title: 'Error',
              text: 'Invalid Credentials. Please try again.',
              icon: 'error',
            });
          }
          if (error.status == 404) {
            Swal.fire({
              title: 'User does not exist!',
              text: 'Please double check your entered email.',
              icon: 'error',
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Missing login credentials.',
      });
    }
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
