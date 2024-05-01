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
  constructor(private dialog: MatDialog, private service: AuthserviceService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.service.getStudentData(token).subscribe(
        (res) => {
          this.studentData = res.payload;
          console.log(this.studentData);
        },
        (error) => {
          console.error('Failed to fetch student data:', error);
        }
      );
    }
  }

  openEditInfo() {
    this.dialog.open(EditComponent);
  }
}
