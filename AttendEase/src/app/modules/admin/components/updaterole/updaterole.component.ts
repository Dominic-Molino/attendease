import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updaterole',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './updaterole.component.html',
  styleUrl: './updaterole.component.css',
})
export class UpdateroleComponent implements OnInit {
  constructor(
    private builder: FormBuilder,
    private service: AuthserviceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<UpdateroleComponent>
  ) {}

  rolelist: any;
  existingdata: any;

  ngOnInit(): void {
    this.service.getRoles().subscribe((res: any) => {
      this.rolelist = res.payload;
      console.log(this.rolelist);
    });
    console.log(this.data.user_id);
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getUsers(this.data.user_id).subscribe((res: any) => {
        console.log(this.data.user_id);
        this.existingdata = res.payload[0];
        console.log(this.existingdata);
        this.updateform.setValue({
          role_id: this.existingdata.role_id,
        });
      });
    }
  }

  updateform = this.builder.group({
    role_id: this.builder.control(''),
  });

  proceedUpdate() {
    console.log(this.updateform.value);
    console.log(this.data.user_id);
    if (this.updateform.valid) {
      this.service
        .editUserRole(this.data.user_id, this.updateform.value)
        .subscribe((res) => {
          Swal.fire({
            icon: 'success',
            title: 'User successfully updated',
            showConfirmButton: true,
          });
        });
    }
  }
}
