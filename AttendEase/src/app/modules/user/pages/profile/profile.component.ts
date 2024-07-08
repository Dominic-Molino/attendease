import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { RequestComponent } from '../../components/request/request.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, RequestComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  studentProfile: any[] = [];
  userId: any;
  avatarUrl?: SafeUrl;
  file: any;

  constructor(
    private service: AuthserviceService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.loadInfo();
    this.loadAvatar();
  }

  loadInfo(): void {
    if (this.userId) {
      this.service.getStudentProfile(this.userId).subscribe((res) => {
        this.studentProfile = res.payload;
      });
    }
  }

  onFileChange(event: any): void {
    if (this.userId) {
      const files = event.target.files as FileList;
      if (files.length > 0) {
        this.file = files[0];

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.avatarUrl = e.target.result;
        };

        this.service.uploadAvatar(this.userId, this.file).subscribe(
          (data: any) => {
            Swal.fire('Success', 'Successfully uploaded photo', 'success');
            this.loadAvatar();
          },
          (error) => {
            const errorMessage =
              error.error?.status?.message || 'An error occurred';
            Swal.fire('', errorMessage, 'warning');
          }
        );
      }
    }
  }

  loadAvatar(): void {
    if (this.userId) {
      this.service.getAvatar(this.userId).subscribe(
        (blob) => {
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
          } else {
            this.avatarUrl = undefined;
          }
        },
        (error) => {
          if (error.status === 404) {
            this.avatarUrl = undefined;
          }
        }
      );
    }
  }

  requestProfileUpdate() {
    const modal = this.dialog.open(RequestComponent, {
      width: '40%',
    });
  }

  openEditInfo(): void {
    const modal = this.dialog.open(EditComponent, {
      data: this.studentProfile,
      width: '35%',
      disableClose: true,
    });
    modal.afterClosed().subscribe(() => {
      this.loadInfo();
    });
  }

  extractStudentId(email: string): string {
    if (email && email.indexOf('@') !== -1) {
      const indexOf = email.indexOf('@');
      return email.substring(0, indexOf);
    }
    return email || '';
  }
}
