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
  ) {}

  ngOnInit(): void {}

  formBuilder = this.builder.group({
    email: this.builder.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    pwd: this.builder.control('', Validators.required),
  });

  loginStudent(): void {
    if (this.formBuilder.valid) {
      this.service.loginStudent(this.formBuilder.value).subscribe(
        (res) => {
          Swal.fire('Success', 'Login Success', 'success');
          const token = this.service.setToken();
          console.log(token);
          this.router.navigate(['student']);
        },
        (error) => {
          Swal.fire('Login Failed', 'Incorrect Credentials', 'error');
        }
      );
    } else {
      Swal.fire('Form is Invalid', 'Please try again', 'warning');
    }
  }
}
