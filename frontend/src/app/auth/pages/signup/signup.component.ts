import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthserviceService } from '../../../shared/service/authservice.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signupForm!: FormGroup;

  constructor(
    private builder: FormBuilder,
    private auth: AuthserviceService,
    private router: Router,
    private toast: ToastrService
  ) {
    // this.signupForm = this.builder.group({
    //   firstName: new FormControl('', Validators.required),
    //   lastName: new FormControl('', Validators.required),
    //   course: new FormControl('', Validators.required),
    //   yearLevel: new FormControl('', Validators.required),
    //   email: new FormControl('', [Validators.email, Validators.required]),
    //   password: new FormControl('', [
    //     Validators.maxLength(8),
    //     Validators.pattern(
    //       '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}'
    //     ),
    //     Validators.required,
    //   ]),
    // });
    // this.signupForm = this.builder.group({
    //   firstName: this.builder.control(Validators.required),
    //   lastName: this.builder.control(Validators.required),
    //   course: this.builder.control(Validators.required),
    //   yearLevel: this.builder.control(Validators.required),
    //   email: this.builder.control(
    //     Validators.compose([Validators.required, Validators.email])
    //   ),
    //   password: this.builder.control(
    //     Validators.compose([
    //       Validators.required,
    //       Validators.maxLength(8),
    //       Validators.pattern(
    //         '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}'
    //       ),
    //     ])
    //   ),
    //   confirmPassword: this.builder.control(Validators.required),
    // });
  }

  register() {
    if (this.signupForm.valid) {
      this.auth.registerStudent(this.signupForm.value).subscribe((res) => {
        this.toast.success('Registration Success!');
        this.router.navigate(['login']);
      });
    } else {
      this.toast.warning('Please enter valid data');
    }
  }
}
