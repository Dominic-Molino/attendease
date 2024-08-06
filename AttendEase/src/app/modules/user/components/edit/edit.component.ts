import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class EditComponent implements OnInit {
  constructor(
    private service: AuthserviceService,
    private builder: FormBuilder,
    private dialog: MatDialogRef<EditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  user_id = this.service.getCurrentUserId();
  studentInfo: any = '';

  editForm = this.builder.group({
    first_name: this.builder.control(''),
    last_name: this.builder.control(''),
    year_level: this.builder.control(''),
    course: this.builder.control(''),
    block: this.builder.control(''),
    email: this.builder.control(''),
  });

  ngOnInit(): void {
    console.log(this.data);
    if (this.user_id) {
      this.service.getStudentProfile(this.user_id).subscribe((res) => {
        for (const student of res.payload) {
          if (this.user_id === student.user_id) {
            this.studentInfo = student;
            this.editForm.patchValue({
              first_name: this.studentInfo.first_name,
              last_name: this.studentInfo.last_name,
              year_level: this.studentInfo.year_level,
              course: this.studentInfo.course,
              block: this.studentInfo.block,
              email: this.studentInfo.email,
            });
            break;
          }
        }
      });
    }
  }

  updateInfo() {
    Swal.fire({
      text: 'Save profile?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.editForm.valid) {
          this.service
            .updateStudent(this.editForm.value, this.user_id)
            .subscribe(
              (res) => {
                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 1500,
                  timerProgressBar: true,
                });
                Toast.fire({
                  icon: 'success',
                  title: 'Profile updated',
                });
                this.dialog.close();
              },
              (error) => {}
            );
        } else {
          Swal.fire(
            'Incomplete User Data',
            'Please fill in all fields',
            'warning'
          );
        }
      }
    });
  }

  closeDialog() {
    this.dialog.close();
  }
}
