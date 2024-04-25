import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../service/authservice.service';
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
    email: ['', Validators.compose([Validators.email, Validators.required])],
    password: ['', Validators.required],
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

  onLogin(): void {
    const email = this.formBuilder.value.email;
    const password = this.formBuilder.value.password;

    this.service.getAll().subscribe((users) => {
      const filteredUsers = users.filter((user: any) => user.email === email);
      if (
        filteredUsers.length === 1 &&
        filteredUsers[0].password === password
      ) {
        const token = this.generateToken();
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', filteredUsers.email);
        Swal.fire('Success', 'Login successful', 'success');
        this.router.navigate(['user']);
      } else {
        Swal.fire('Error', 'Invalid Credentials', 'error');
      }
    });
  }

  generateToken(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenLength = 32;
    let token = '';
    for (let i = 0; i < tokenLength; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }
}
