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
          Swal.fire('Success', 'Login Success', 'success');
          this.router.navigate(['student']);
        }
      },
      (error) => {
        Swal.fire('Incorrect Credentials', 'Please try again', 'warning');
      }
    );
  }
}
