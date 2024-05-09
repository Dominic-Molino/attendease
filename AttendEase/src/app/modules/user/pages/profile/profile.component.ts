import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { EmailValidator } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  studentProfile: any;
  userId = this.service.getCurrentUserId();
  studentInfo: any = '';

  constructor(private service: AuthserviceService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo() {
    this.service.getStudentProfile(this.userId).subscribe((res) => {
      this.studentProfile = res;
      for (const student of this.studentProfile) {
        if (this.userId === student.user_id) {
          this.studentInfo = student;
          break;
        }
      }
    });
  }

  openEditInfo() {
    const modal = this.dialog.open(EditComponent);
    modal.afterClosed().subscribe((res) => {
      this.loadInfo();
    });
  }

  uploadImage(event: any) {}

  extractStudentId(email: string): string {
    if (email && email.indexOf('@') !== -1) {
      const indexOf = email.indexOf('@');
      return email.substring(0, indexOf);
    }
    return email;
  }
}
