import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  studentData: any[] = [];
  token: string | null = null;

  constructor(private dialog: MatDialog, private service: AuthserviceService) {}

  ngOnInit(): void {
    //  this.token = sessionStorage.getItem('token');
    // this.loadProfile();
  }

  // loadProfile() {
  //   if (this.token !== null) {
  //     this.service.getStudentData(this.token).subscribe((res) => {
  //       console.log(res.payload);
  //     });
  //   } else {
  //     console.error('Token is null');
  //   }
  // }

  openEditInfo() {
    this.dialog.open(EditComponent);
  }
}
