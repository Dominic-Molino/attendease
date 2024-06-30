import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  RouterLink,
  RouterOutlet,
  RouterLinkActive,
  Router,
} from '@angular/router';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MessageComponent } from '../message/message.component';
import { UserComponent } from '../../../modules/user/user.component';

@Component({
  selector: 'app-org-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, RouterLinkActive],
  templateUrl: './org-sidebar.component.html',
  styleUrl: './org-sidebar.component.css',
})
export class OrgSidebarComponent implements OnInit {
  userId = this.service.getCurrentUserId();
  studentProfile: any;

  constructor(
    private service: AuthserviceService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.userId = this.service.getCurrentUserId();
    console.log(this.userId);
  }

  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo() {
    if (this.userId) {
      this.service.getStudentProfile(this.userId).subscribe((res) => {
        this.studentProfile = res.payload[0];
      });
    }
  }

  logout(): void {
    Swal.fire({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
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
          title: 'Logout successfully',
        });
        sessionStorage.removeItem('token');
        this.router.navigate(['login']);
      }
    });
  }

  openChat() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      bottom: '75px',
      right: '95px',
    };

    dialogConfig.width = '30%';

    const openDia = this.dialog.open(MessageComponent, {
      data: {
        currentUser: this.userId,
        otherUser: 11,
      },
    });
  }
}
