import { Component, inject } from '@angular/core';
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
export class LoginComponent {
  builder = inject(FormBuilder);
  service = inject(AuthserviceService);
  router = inject(Router);

  constructor() {
    sessionStorage.clear();
  }

  formBuilder = this.builder.group({
    email: this.builder.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    pwd: this.builder.control('', Validators.required),
  });

  Toast = Swal.mixin({
    toast: true,
    position: 'center',
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });

  users: any[] = [];

  loginStudent(): void {
    if (this.formBuilder.valid) {
      this.service.loginStudent(this.formBuilder.value).subscribe(
        (res) => {
          sessionStorage.setItem('student_id', res.payload.id);
          Swal.fire('Success', 'Login Success', 'success');
          this.router.navigate(['dashboard']);
        },
        (error) => {
          Swal.fire('Error', 'Login Failed', 'error');
        }
      );
    } else {
      Swal.fire('Form is Invalid', 'Please try again', 'warning');
    }
  }
}
