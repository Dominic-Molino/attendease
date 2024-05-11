import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../../components/edit/edit.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { MatIconAnchor } from '@angular/material/button';

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
  file: any;
  avatarUrl?: SafeUrl;

  constructor(
    private service: AuthserviceService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo() {
    if (this.userId) {
      console.log(this.userId);
      this.service.getStudentProfile(this.userId).subscribe((res) => {
        this.studentProfile = res;
      });
    }
  }

  // onFileChange(event: any) {
  //   if (this.userId) {
  //     const files = event.target.files as FileList;

  //     if (files.length > 0) {
  //       this.file = files[0];
  //       console.log(this.file);
  //       this.service
  //         .uploadAvatar(this.userId, this.file)
  //         .subscribe((data: any) => {
  //           console.log('File Uploaded Successfully');
  //           this.loadAvatar();
  //           this.resetInput();
  //         });
  //     }
  //   }
  // }

  // loadAvatar() {
  //   if (this.userId) {
  //     this.service.getAvatar(this.userId).subscribe(
  //       (blob) => {
  //         if (blob.size > 0) {
  //           const url = URL.createObjectURL(blob);
  //           this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  //         } else {
  //           console.log('User has not uploaded an avatar yet.');
  //           this.avatarUrl = undefined;
  //         }
  //       },
  //       (error) => {
  //         if (error.status === 404) {
  //           console.log('No avatar found for the user.');
  //           this.avatarUrl = undefined;
  //         } else {
  //           console.error('Failed to load avatar:', error);
  //         }
  //       }
  //     );
  //   }
  // }

  resetInput() {
    const input = document.getElementById(
      'avatar-input-file'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
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
