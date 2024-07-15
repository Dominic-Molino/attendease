import { Component, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideProtractorTestingSupport } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profilecompletion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: './profilecompletion.component.html',
  styleUrl: './profilecompletion.component.css',
})
export class ProfilecompletionComponent {
  profileForm: FormGroup;

  constructor(
    private builder: FormBuilder,
    private dialogRef: MatDialogRef<ProfilecompletionComponent>,
    private authService: AuthserviceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.profileForm = this.builder.group({
      organization: this.builder.control('', Validators.required),
    });
  }

  onSubmit() {
    Swal.fire({
      text: 'Save profile?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.profileForm.valid) {
          this.authService
            .updateOrganizer(this.profileForm.value, this.data.id)
            .subscribe((res) => {
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
                title: 'Profile updated',
              });
              this.dialogRef.close(false);
            });
        } else {
          Swal.fire('Incomplete Data', 'Please fill in the field', 'warning');
        }
      }
    });

    console.log(this.profileForm.value);
    console.log(this.data.id);
  }
}
