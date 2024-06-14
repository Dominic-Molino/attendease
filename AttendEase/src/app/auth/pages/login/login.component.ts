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

  userData: any;
  passwordFieldType: string = 'password';

  ngOnInit(): void {}

  loginForm = this.builder.group({
    email: this.builder.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    password: this.builder.control('', Validators.required),
  });

  loginStudent() {
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
        const errorMessage =
          error.error?.status?.message || 'An error occurred';
        Swal.fire('', errorMessage, 'warning');
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
