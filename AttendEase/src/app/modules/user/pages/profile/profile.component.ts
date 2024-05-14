import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  studentProfile: any[] = [];
  userId = this.service.getCurrentUserId();
  avatarUrl?: SafeUrl;
  file: any;

  constructor(
    private service: AuthserviceService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadInfo();
    this.loadAvatar();
  }

  loadInfo() {
    if (this.userId) {
      this.service.getStudentProfile(this.userId).subscribe((res) => {
        this.studentProfile = res.payload;
      });
    }
  }

  onFileChange(event: any) {
    if (this.userId) {
      const files = event.target.files as FileList;
      if (files.length > 0) {
        this.file = files[0];
        console.log(this.file);
        this.service
          .uploadAvatar(this.userId, this.file)
          .subscribe((data: any) => {
            Swal.fire('Success', 'Successfully uploaded photo', 'success');
            this.loadAvatar();
            this.resetInput();
          });
      }
    }
  }

  resetInput() {
    const input = document.getElementById(
      'avatar-input-file'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  loadAvatar() {
    if (this.userId) {
      this.service.getAvatar(this.userId).subscribe(
        (blob) => {
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
          } else {
            console.log('User has not uploaded an avatar yet.');
            this.avatarUrl = undefined;
          }
        },
        (error) => {
          if (error.status === 404) {
            console.log('No avatar found for the user.');
            this.avatarUrl = undefined;
          } else {
            console.error('Failed to load avatar:', error);
          }
        }
      );
    }
  }

  openEditInfo() {
    const modal = this.dialog.open(EditComponent);
    modal.afterClosed().subscribe((res) => {
      this.loadInfo();
    });
  }

  extractStudentId(email: string): string {
    if (email && email.indexOf('@') !== -1) {
      const indexOf = email.indexOf('@');
      return email.substring(0, indexOf);
    }
    return email;
  }
}
