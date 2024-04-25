import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../../service/authservice.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  studentData: any[] = [];
  constructor(private dialog: MatDialog, private service: AuthserviceService) {}

  ngOnInit(): void {
    // this.getUserData();
    // const token = this.service.getToken();
    // if (token) {
    //   console.log('Token:', token);
    // } else {
    //   console.log('No token found.');
    // }
  }

  token: any = this.service.getToken;

  displayData() {
    if (this.token) {
      this.service.getStudentData(this.token).subscribe((result) => {
        this.studentData = result;
        console.log(this.studentData);
      });
    }
  }
  // getUserData(): void {
  //   this.token = this.service.getToken();
  //   console.log(this.token);
  //   if (this.token) {
  //     this.service.getbyCode(this.token).subscribe(
  //       (res) => {
  //         this.studentData = res;
  //         console.log(this.studentData);
  //       },
  //       (error) => {
  //         console.error('Error fetching user data:', error);
  //       }
  //     );
  //   }
  // }

  openEditInfo() {
    this.dialog.open(EditComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '500ms',
      width: '50%',
    });
  }
}
